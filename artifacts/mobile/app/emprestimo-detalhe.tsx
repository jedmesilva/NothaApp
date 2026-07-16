import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { EMPRESTIMOS, CICLO_META, STATUS_META, formatBRL, addDays, formatData, formatDataHora } from '@/data/loans';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#F4F5F7',
};

export default function EmprestimoDetalheScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const baseEmprestimo = EMPRESTIMOS.find((e) => String(e.id) === id) ?? EMPRESTIMOS[1];
  const [pagas, setPagas] = useState(baseEmprestimo.parcelasPagas);
  const [showTimeline, setShowTimeline] = useState(false);

  const { valor, taxaJurosTotal, prazoDias, ciclo, parcelasTotal, status, contratoId } = baseEmprestimo;
  const cicloMeta = CICLO_META[ciclo];
  const totalAPagar = valor * (1 + taxaJurosTotal / 100);
  const valorParcela = totalAPagar / parcelasTotal;
  const percentPago = Math.round((pagas / parcelasTotal) * 100);

  const hoje = new Date();
  const dataBase = addDays(hoje, -pagas * cicloMeta.dias);
  const valorPago = pagas * valorParcela;
  const dataConcessao = dataBase;
  const dataSolicitacao = addDays(dataConcessao, -3);
  const dataAprovacao = addDays(dataSolicitacao, 1);
  const dataVencimentoFinal = addDays(dataConcessao, prazoDias);
  const proximaData = formatData(addDays(dataBase, (pagas + 1) * cicloMeta.dias));

  const jaConcedido = status !== 'analise' && status !== 'captacao';

  const timelineEvents = [
    { label: 'Solicitado', date: dataSolicitacao, done: true },
    { label: 'Aprovado', date: dataAprovacao, done: true },
    { label: 'Concedido', date: dataConcessao, done: jaConcedido },
    status === 'quitado'
      ? { label: 'Quitado', date: dataVencimentoFinal, done: true }
      : { label: 'Vencimento final', date: dataVencimentoFinal, done: false },
  ];

  const parcelas = Array.from({ length: parcelasTotal }, (_, i) => {
    const numero = i + 1;
    const data = addDays(dataBase, numero * cicloMeta.dias);
    let pStatus = 'pendente';
    if (numero <= pagas) pStatus = 'paga';
    else if (data < hoje) pStatus = 'atrasada';
    return { numero, data, status: pStatus };
  });

  const handlePagar = (numero: number) => {
    if (numero === pagas + 1) setPagas(pagas + 1);
  };

  const parcelasRestantes = parcelasTotal - pagas;

  const badgeColors: Record<string, { bg: string; color: string }> = {
    analise: { bg: 'rgba(255,255,255,0.12)', color: '#fff' },
    captacao: { bg: 'rgba(255,255,255,0.12)', color: '#fff' },
    ativo: { bg: '#fff', color: C.dark },
    atrasado: { bg: '#fff', color: C.dark },
    quitado: { bg: 'transparent', color: 'rgba(255,255,255,0.6)' },
  };
  const badge = badgeColors[status] ?? badgeColors.analise;
  const statusLabel = STATUS_META[status]?.label ?? status;
  const statusIconName = STATUS_META[status]?.iconName ?? 'clock';

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={18} color={C.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do empréstimo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Valor do empréstimo</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badge.bg, borderWidth: status === 'quitado' ? 1 : 0, borderColor: 'rgba(255,255,255,0.3)' }]}>
              <Feather name={statusIconName as any} size={13} color={badge.color} />
              <Text style={[styles.badgeText, { color: badge.color }]}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.heroValue}>R$ {formatBRL(valor)}</Text>
          <Text style={styles.heroSub}>
            R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade} · {parcelasTotal} {parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural}
          </Text>

          {/* Progress */}
          {(status === 'ativo' || status === 'atrasado' || status === 'quitado') && (
            <View style={styles.poolBlock}>
              <Text style={styles.poolLabel}>Pagamento do empréstimo</Text>
              <View style={styles.poolTopRow}>
                <Text style={styles.poolPercent}>{percentPago}% pago</Text>
                <Text style={styles.poolValue}>R$ {formatBRL(Math.round(valorPago))} de R$ {formatBRL(Math.round(totalAPagar))}</Text>
              </View>
              <View style={styles.poolTrack}>
                <View style={[styles.poolFill, { width: `${percentPago}%` as any }]} />
              </View>
              <View style={styles.poolCaption}>
                <View style={styles.dotRow}>
                  <View style={styles.dotPago} />
                  <Text style={styles.captionText}>pago</Text>
                </View>
                <View style={styles.dotRow}>
                  <View style={styles.dotRestante} />
                  <Text style={[styles.captionText, status === 'atrasado' && { color: '#FF9285', fontFamily: 'Inter_700Bold' }]}>
                    {status === 'atrasado' ? 'parcela em atraso' : `próxima parcela em ${proximaData}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.heroGrid}>
            <View style={styles.heroDetailBlock}>
              <Text style={styles.heroDetailLabel}>Prazo</Text>
              <Text style={styles.heroDetailValue}>{prazoDias} dias</Text>
              <Text style={styles.heroDetailSub}>vence {formatData(dataVencimentoFinal)}</Text>
            </View>
            <View style={styles.heroDetailBlock}>
              <Text style={styles.heroDetailLabel}>Ciclo</Text>
              <Text style={styles.heroDetailValue}>{cicloMeta.label}</Text>
              <Text style={styles.heroDetailSub}>R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade}</Text>
            </View>
            <View style={styles.heroDetailBlock}>
              <Text style={styles.heroDetailLabel}>Taxa total</Text>
              <Text style={styles.heroDetailValue}>{taxaJurosTotal}%</Text>
            </View>
            <View style={styles.heroDetailBlock}>
              <Text style={styles.heroDetailLabel}>{status === 'quitado' ? 'Total pago' : 'Total a pagar'}</Text>
              <Text style={styles.heroDetailValue}>R$ {formatBRL(Math.round(totalAPagar))}</Text>
            </View>
          </View>
        </View>

        {/* Dates row */}
        <TouchableOpacity style={styles.datesRow} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{jaConcedido ? 'Concedido em' : 'Solicitado em'}</Text>
            <Text style={styles.dateValue}>{formatData(jaConcedido ? dataConcessao : dataSolicitacao)}</Text>
          </View>
          <View style={styles.datesDivider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{jaConcedido ? 'Vencimento' : 'Previsão de vencimento'}</Text>
            <Text style={styles.dateValue}>{formatData(dataVencimentoFinal)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.inkFaint} />
        </TouchableOpacity>

        {/* Parcelas header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Parcelas</Text>
          <Text style={styles.sectionCount}>{parcelasRestantes} restantes</Text>
        </View>

        {/* Parcelas list */}
        <View style={styles.list}>
          {parcelas.map((p) => {
            const isPaga = p.status === 'paga';
            const isAtrasada = p.status === 'atrasada';
            return (
              <View
                key={p.numero}
                style={[styles.parcelaCard, isAtrasada && styles.parcelaCardAtrasada, isPaga && { opacity: 0.55 }]}
              >
                <View style={[styles.indexBadge, isPaga && styles.indexBadgePaga]}>
                  {isPaga ? <Feather name="check" size={16} color="#fff" /> : <Text style={[styles.indexNum, isAtrasada && { color: C.ink }]}>{p.numero}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.parcelaLabel, isAtrasada && { color: C.ink, fontFamily: 'Inter_700Bold' }]}>
                    {isPaga ? 'Pago em ' : isAtrasada ? 'Venceu em ' : 'Vence em '}
                    {formatData(p.data)}
                  </Text>
                  <Text style={styles.parcelaValue}>R$ {formatBRL(Math.round(valorParcela))}</Text>
                </View>
                {isPaga ? (
                  <View style={styles.pagoLabel}>
                    <Feather name="check" size={14} color={C.inkSoft} />
                    <Text style={styles.pagoText}>Pago</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.payBtn} onPress={() => handlePagar(p.numero)} activeOpacity={0.85}>
                    <Text style={styles.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.contratoId}>Contrato Nº {contratoId ?? `EMP-${id}`}</Text>

        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
          <Feather name="help-circle" size={16} color={C.inkSoft} />
          <Text style={styles.helpText}>Precisa de ajuda com esse empréstimo?</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Timeline Modal */}
      <Modal visible={showTimeline} transparent animationType="slide" onRequestClose={() => setShowTimeline(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeline(false)}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico do empréstimo</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowTimeline(false)} activeOpacity={0.8}>
                <Feather name="x" size={16} color={C.ink} />
              </TouchableOpacity>
            </View>

            {timelineEvents.map((event, i) => (
              <View key={event.label} style={styles.timelineRow}>
                {i < timelineEvents.length - 1 && <View style={styles.timelineLine} />}
                <View style={[styles.timelineDot, !event.done && styles.timelineDotPending]} />
                <View>
                  <Text style={[styles.timelineLabel, !event.done && styles.timelineLabelPending]}>{event.label}</Text>
                  <Text style={styles.timelineDate}>
                    {event.done ? formatDataHora(event.date) : `Previsto para ${formatData(event.date)}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: C.ink, letterSpacing: -0.2 },
  // Hero
  heroCard: { borderRadius: 28, marginHorizontal: 16, marginTop: 18, marginBottom: 14, padding: 24, backgroundColor: C.dark },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  heroEyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: 'rgba(255,255,255,0.55)', marginBottom: 8 },
  heroValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 38, color: '#fff', letterSpacing: -1, lineHeight: 44, marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter_400Regular', marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  poolBlock: { marginBottom: 22 },
  poolLabel: { fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 8 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  poolPercent: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' },
  poolValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden', marginBottom: 9 },
  poolFill: { height: '100%', backgroundColor: '#fff' },
  poolCaption: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotPago: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#fff' },
  dotRestante: { width: 8, height: 8, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  captionText: { fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', paddingTop: 18, rowGap: 16, columnGap: 12 },
  heroDetailBlock: { width: '46%' },
  heroDetailLabel: { fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  heroDetailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#fff' },
  heroDetailSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  // Dates
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  dateValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14.5, color: C.ink },
  // Parcelas
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: C.ink },
  sectionCount: { fontSize: 13, color: C.inkSoft, fontFamily: 'Inter_400Regular' },
  list: { gap: 10, paddingHorizontal: 16 },
  parcelaCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 14, backgroundColor: C.card },
  parcelaCardAtrasada: { borderWidth: 1.5, borderColor: C.ink },
  indexBadge: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.chipBg, alignItems: 'center', justifyContent: 'center' },
  indexBadgePaga: { backgroundColor: C.ink },
  indexNum: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  parcelaLabel: { fontSize: 12.5, color: C.inkFaint, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  parcelaValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  payBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: C.ink },
  payBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#fff', whiteSpace: 'nowrap' as any },
  pagoLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pagoText: { fontSize: 12.5, fontFamily: 'Inter_700Bold', color: C.inkSoft },
  contratoId: { fontSize: 12, color: C.inkFaint, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 20, marginHorizontal: 20 },
  helpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 18, paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: C.line },
  helpText: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(21,21,29,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalSheet: { width: '100%', maxWidth: 420, backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: C.ink },
  modalClose: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.chipBg, alignItems: 'center', justifyContent: 'center' },
  timelineRow: { flexDirection: 'row', gap: 14, paddingBottom: 18, position: 'relative' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink, marginTop: 4, zIndex: 1 },
  timelineDotPending: { backgroundColor: C.line },
  timelineLine: { position: 'absolute', left: 4, top: 14, bottom: -4, width: 2, backgroundColor: C.line },
  timelineLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.ink, marginBottom: 2 },
  timelineLabelPending: { color: C.inkFaint, fontFamily: 'Inter_600SemiBold' },
  timelineDate: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_400Regular' },
});
