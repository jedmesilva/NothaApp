import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { EMPRESTIMOS, CICLO_META, STATUS_META, formatBRL, addDays, formatData, formatDataHora } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, StatusBadge, PoolBar, PoolLegend, DetailGrid } from '@/components/ds';
import type { LoanStatus } from '@/components/ds';

export default function EmprestimoDetalheScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const baseEmprestimo = EMPRESTIMOS.find((e) => String(e.id) === id) ?? EMPRESTIMOS[1];
  const [pagas, setPagas] = useState(baseEmprestimo.parcelasPagas);
  const [showTimeline, setShowTimeline] = useState(false);

  const { valor, taxaJurosTotal, prazoDias, ciclo, parcelasTotal, status, contratoId } = baseEmprestimo;
  const cicloMeta       = CICLO_META[ciclo];
  const totalAPagar     = valor * (1 + taxaJurosTotal / 100);
  const valorParcela    = totalAPagar / parcelasTotal;
  const percentPago     = Math.round((pagas / parcelasTotal) * 100);

  const hoje              = new Date();
  const dataBase          = addDays(hoje, -pagas * cicloMeta.dias);
  const valorPago         = pagas * valorParcela;
  const dataConcessao     = dataBase;
  const dataSolicitacao   = addDays(dataConcessao, -3);
  const dataAprovacao     = addDays(dataSolicitacao, 1);
  const dataVencimentoFinal = addDays(dataConcessao, prazoDias);
  const proximaData       = formatData(addDays(dataBase, (pagas + 1) * cicloMeta.dias));
  const jaConcedido       = status !== 'analise' && status !== 'captacao';

  const timelineEvents = [
    { label: 'Solicitado',      date: dataSolicitacao,     done: true },
    { label: 'Aprovado',        date: dataAprovacao,       done: true },
    { label: 'Concedido',       date: dataConcessao,       done: jaConcedido },
    status === 'quitado'
      ? { label: 'Quitado',             date: dataVencimentoFinal, done: true }
      : { label: 'Vencimento final',    date: dataVencimentoFinal, done: false },
  ];

  const parcelas = Array.from({ length: parcelasTotal }, (_, i) => {
    const numero = i + 1;
    const data   = addDays(dataBase, numero * cicloMeta.dias);
    let pStatus  = 'pendente';
    if (numero <= pagas)     pStatus = 'paga';
    else if (data < hoje)    pStatus = 'atrasada';
    return { numero, data, status: pStatus };
  });

  const handlePagar = (numero: number) => {
    if (numero === pagas + 1) setPagas(pagas + 1);
  };

  const parcelasRestantes = parcelasTotal - pagas;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Detalhes do empréstimo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero dark card */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <Text style={s.heroEyebrow}>Valor do empréstimo</Text>
            <StatusBadge status={status as LoanStatus} context="dark" />
          </View>

          <Text style={s.heroValue}>R$ {formatBRL(valor)}</Text>
          <Text style={s.heroSub}>
            R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade} · {parcelasTotal}{' '}
            {parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural}
          </Text>

          {(status === 'ativo' || status === 'atrasado' || status === 'quitado') && (
            <PoolBar
              label="Pagamento do empréstimo"
              headLeft={`${percentPago}% pago`}
              headRight={`R$ ${formatBRL(Math.round(valorPago))} de R$ ${formatBRL(Math.round(totalAPagar))}`}
              segments={[{ pct: percentPago, variant: 'primary' }]}
              context="dark"
              style={{ marginBottom: 22 }}
              footer={
                <PoolLegend
                  context="dark"
                  items={[
                    { color: '#fff', label: 'pago' },
                    {
                      color: C.onDarkBorder,
                      label: status === 'atrasado' ? 'parcela em atraso' : `próxima parcela em ${proximaData}`,
                      bold: status === 'atrasado',
                    },
                  ]}
                />
              }
            />
          )}

          <DetailGrid
            context="dark"
            items={[
              { label: 'Prazo',      value: `${prazoDias} dias`,            sub: `vence ${formatData(dataVencimentoFinal)}` },
              { label: 'Ciclo',      value: cicloMeta.label,                sub: `R$ ${formatBRL(Math.round(valorParcela))}/${cicloMeta.unidade}` },
              { label: 'Taxa total', value: `${taxaJurosTotal}%` },
              { label: status === 'quitado' ? 'Total pago' : 'Total a pagar', value: `R$ ${formatBRL(Math.round(totalAPagar))}` },
            ]}
          />
        </View>

        {/* Dates row */}
        <TouchableOpacity style={s.datesRow} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>{jaConcedido ? 'Concedido em' : 'Solicitado em'}</Text>
            <Text style={s.dateValue}>{formatData(jaConcedido ? dataConcessao : dataSolicitacao)}</Text>
          </View>
          <View style={s.datesDivider} />
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>{jaConcedido ? 'Vencimento' : 'Previsão de vencimento'}</Text>
            <Text style={s.dateValue}>{formatData(dataVencimentoFinal)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.inkFaint} />
        </TouchableOpacity>

        {/* Parcelas */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Parcelas</Text>
          <Text style={s.sectionCount}>{parcelasRestantes} restantes</Text>
        </View>

        <View style={s.list}>
          {parcelas.map((p) => {
            const isPaga     = p.status === 'paga';
            const isAtrasada = p.status === 'atrasada';
            return (
              <View
                key={p.numero}
                style={[s.parcelaCard, isAtrasada && s.parcelaCardAtrasada, isPaga && { opacity: 0.55 }]}
              >
                <View style={[s.indexBadge, isPaga && s.indexBadgePaga]}>
                  {isPaga
                    ? <Feather name="check" size={16} color="#fff" />
                    : <Text style={[s.indexNum, isAtrasada && { color: C.ink }]}>{p.numero}</Text>
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.parcelaLabel, isAtrasada && { color: C.ink, fontFamily: fonts.bold }]}>
                    {isPaga ? 'Pago em ' : isAtrasada ? 'Venceu em ' : 'Vence em '}
                    {formatData(p.data)}
                  </Text>
                  <Text style={s.parcelaValue}>R$ {formatBRL(Math.round(valorParcela))}</Text>
                </View>
                {isPaga ? (
                  <View style={s.pagoLabel}>
                    <Feather name="check" size={14} color={C.inkSoft} />
                    <Text style={s.pagoText}>Pago</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={s.payBtn} onPress={() => handlePagar(p.numero)} activeOpacity={0.85}>
                    <Text style={s.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <Text style={s.contratoId}>Contrato Nº {contratoId ?? `EMP-${id}`}</Text>

        <TouchableOpacity style={s.helpBtn} activeOpacity={0.7}>
          <Feather name="help-circle" size={16} color={C.inkSoft} />
          <Text style={s.helpText}>Precisa de ajuda com esse empréstimo?</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Timeline Modal */}
      <Modal visible={showTimeline} transparent animationType="slide" onRequestClose={() => setShowTimeline(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowTimeline(false)}>
          <View style={[s.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Histórico do empréstimo</Text>
              <TouchableOpacity style={s.modalClose} onPress={() => setShowTimeline(false)} activeOpacity={0.8}>
                <Feather name="x" size={16} color={C.ink} />
              </TouchableOpacity>
            </View>

            {timelineEvents.map((event, i) => (
              <View key={event.label} style={s.timelineRow}>
                {i < timelineEvents.length - 1 && <View style={s.timelineLine} />}
                <View style={[s.timelineDot, !event.done && s.timelineDotPending]} />
                <View>
                  <Text style={[s.timelineLabel, !event.done && s.timelineLabelPending]}>{event.label}</Text>
                  <Text style={s.timelineDate}>
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: 4 },
  title:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  heroCard: { borderRadius: radii.hero, marginHorizontal: spacing[4], marginTop: 18, marginBottom: 14, padding: spacing[6], backgroundColor: C.dark },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  heroEyebrow: { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.onDarkSoft, marginBottom: 10 },
  heroValue: { fontFamily: fonts.display, fontSize: fontSize['7xl'], color: '#fff', letterSpacing: -1, lineHeight: 44, marginBottom: 6 },
  heroSub:   { fontSize: fontSize.base, color: C.onDarkSoft, fontFamily: fonts.regular, marginBottom: 20 },
  // Dates
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginHorizontal: spacing[4], marginBottom: 14, padding: 14, borderRadius: radii['2xl'], backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateLabel: { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  dateValue: { fontFamily: fonts.display, fontSize: fontSize['md+'], color: C.ink },
  // Parcelas
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingBottom: 12 },
  sectionTitle:  { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },
  sectionCount:  { fontSize: fontSize.base, color: C.inkSoft, fontFamily: fonts.regular },
  list: { gap: 10, paddingHorizontal: spacing[4] },
  parcelaCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.card, padding: 14, backgroundColor: C.card },
  parcelaCardAtrasada: { borderWidth: 1.5, borderColor: C.ink },
  indexBadge:     { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
  indexBadgePaga: { backgroundColor: C.ink },
  indexNum:  { fontFamily: fonts.display, fontSize: fontSize.base, color: C.inkSoft },
  parcelaLabel: { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginBottom: 2 },
  parcelaValue: { fontFamily: fonts.display, fontSize: fontSize.xl },
  payBtn:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, backgroundColor: C.ink },
  payBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
  pagoLabel:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pagoText:   { fontSize: fontSize['sm+'], fontFamily: fonts.bold, color: C.inkSoft },
  contratoId: { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: 20, marginHorizontal: spacing[5] },
  helpBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing[4], marginTop: 18, paddingVertical: 15, borderRadius: spacing[4], borderWidth: 1, borderColor: C.line },
  helpText:   { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.inkSoft },
  // Timeline modal
  modalOverlay: { flex: 1, backgroundColor: C.scrimHeavy, justifyContent: 'flex-end', alignItems: 'center' },
  modalSheet:   { width: '100%', maxWidth: 420, backgroundColor: C.card, borderTopLeftRadius: radii.cardLg, borderTopRightRadius: radii.cardLg, padding: spacing[5] },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle:   { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink },
  modalClose:   { width: 32, height: 32, borderRadius: 10, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
  timelineRow:  { flexDirection: 'row', gap: 14, paddingBottom: 18, position: 'relative' },
  timelineDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink, marginTop: 4, zIndex: 1 },
  timelineDotPending: { backgroundColor: C.line },
  timelineLine:       { position: 'absolute', left: 4, top: 14, bottom: -4, width: 2, backgroundColor: C.line },
  timelineLabel:        { fontSize: fontSize.md, fontFamily: fonts.bold, color: C.ink, marginBottom: 2 },
  timelineLabelPending: { color: C.inkFaint, fontFamily: fonts.semibold },
  timelineDate:         { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },
});
