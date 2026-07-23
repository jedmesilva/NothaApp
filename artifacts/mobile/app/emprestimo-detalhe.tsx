import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CICLO_META, formatBRL, addDays, formatData } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, StatusBadge, PoolBar, DetailGrid, InstallmentBadge, AlertBanner, ModalSheet, Timeline } from '@/components/ds';
import type { LoanStatus, TimelineEvent } from '@/components/ds';
import { useLoan, mapLoan } from '@/hooks/useLoans';

export default function EmprestimoDetalheScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const [showTimeline, setShowTimeline] = useState(false);

  const { data, isLoading } = useLoan(id ?? '');

  if (isLoading || !data) {
    return (
      <View style={[s.screen, { paddingTop: topPad, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  const emprestimo = mapLoan(data.loan);
  const { valor, taxaJurosTotal, prazoDias, ciclo, parcelasTotal, status, contratoId, diasDesdeConcessao, valorCaptado } = emprestimo;
  const cicloMeta    = CICLO_META[ciclo];
  const totalAPagar  = valor * (1 + taxaJurosTotal / 100);
  const valorParcela = totalAPagar / parcelasTotal;

  const hoje = new Date();

  // Datas derivadas
  const dataBase = diasDesdeConcessao != null
    ? addDays(hoje, -diasDesdeConcessao)
    : hoje;
  const dataConcessao         = dataBase;
  const dataSolicitacao       = addDays(dataConcessao, -3);
  const dataCaptacaoIniciada  = addDays(dataSolicitacao, 1);
  const dataCaptacaoConcluida = addDays(dataConcessao, -1);
  const dataVencimentoFinal   = addDays(dataConcessao, prazoDias);

  const jaConcedido        = status !== 'analise' && status !== 'captacao';
  const jaCaptacaoIniciada = status !== 'analise';

  // ── Parcelas ──────────────────────────────────────────────────────────────
  // Usa parcelas reais do banco quando disponíveis; caso contrário, calcula.
  const parcelas = data.installments.length > 0
    ? data.installments.map((inst) => ({
        numero:  inst.installmentNumber,
        data:    new Date(inst.dueDate),
        status:  inst.status === 'paid' ? 'paga' : inst.status === 'overdue' ? 'atrasada' : 'pendente',
        paidAt:  inst.paidAt ? new Date(inst.paidAt) : null,
        amountCents: inst.amountCents,
      }))
    : Array.from({ length: parcelasTotal }, (_, i) => {
        const numero = i + 1;
        const data_  = addDays(dataBase, numero * cicloMeta.dias);
        const pagas  = emprestimo.parcelasPagas;
        let pStatus  = 'pendente';
        if (numero <= pagas)  pStatus = 'paga';
        else if (data_ < hoje) pStatus = 'atrasada';
        return { numero, data: data_, status: pStatus, paidAt: null, amountCents: Math.round(valorParcela * 100) };
      });

  const pagas             = parcelas.filter((p) => p.status === 'paga').length;
  const parcelasAtrasadas = parcelas.filter((p) => p.status === 'atrasada');
  const parcelasRestantes = parcelasTotal - pagas;
  const percentPago       = parcelasTotal > 0 ? Math.round((pagas / parcelasTotal) * 100) : 0;
  const valorPago         = pagas * valorParcela;
  const todosPagesPagos   = pagas >= parcelasTotal;

  const maisAntiga = parcelasAtrasadas.length > 0
    ? parcelasAtrasadas.reduce((ant, p) => p.data < ant.data ? p : ant)
    : null;
  const diasEmAtraso = maisAntiga
    ? Math.round((hoje.getTime() - maisAntiga.data.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const percentCaptado = valorCaptado && valor > 0
    ? Math.round((valorCaptado / valor) * 100)
    : 0;

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitado',         date: dataSolicitacao,                              done: true                },
    { label: 'Captação iniciada',  date: jaCaptacaoIniciada ? dataCaptacaoIniciada : undefined,  done: jaCaptacaoIniciada  },
    { label: 'Captação concluída', date: jaConcedido        ? dataCaptacaoConcluida : undefined, done: jaConcedido         },
    { label: 'Concedido',          date: jaConcedido        ? dataConcessao : undefined,         done: jaConcedido         },
    { label: 'Pagamentos',         date: undefined,                                    done: todosPagesPagos,    progress: { value: pagas, total: parcelasTotal } },
    { label: 'Quitado',            date: (status === 'quitado' || todosPagesPagos) ? dataVencimentoFinal : undefined, done: status === 'quitado' || todosPagesPagos },
  ];

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Detalhes do empréstimo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Alerta de atraso */}
        {parcelasAtrasadas.length > 0 && maisAntiga && (
          <AlertBanner
            style={{ marginHorizontal: spacing[4], marginTop: spacing[4], marginBottom: 2 }}
            title={parcelasAtrasadas.length === 1 ? '1 vencimento em atraso' : `${parcelasAtrasadas.length} vencimentos em atraso`}
            message={`${parcelasAtrasadas.length === 1 ? 'Venceu' : 'O mais antigo venceu'} em ${formatData(maisAntiga.data)} · há ${diasEmAtraso} ${diasEmAtraso === 1 ? 'dia' : 'dias'}`}
          />
        )}

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

          {status === 'captacao' && (
            <PoolBar
              label="Captação"
              headLeft={`${percentCaptado}% captado`}
              headRight={`R$ ${formatBRL(Math.round(valorCaptado ?? 0))} de R$ ${formatBRL(valor)}`}
              segments={[{ pct: percentCaptado, variant: 'primary' }]}
              context="dark"
              style={{ marginBottom: 22 }}
            />
          )}

          {(status === 'ativo' || status === 'atrasado' || status === 'quitado') && (
            <PoolBar
              label="Pagamento"
              headLeft={`${percentPago}% pago`}
              headRight={`R$ ${formatBRL(Math.round(valorPago))} de R$ ${formatBRL(Math.round(totalAPagar))}`}
              segments={[{ pct: percentPago, variant: 'primary' }]}
              context="dark"
              style={{ marginBottom: 22 }}
            />
          )}

          <DetailGrid
            context="dark"
            items={[
              { label: 'Prazo',      value: `${prazoDias} dias`,               sub: `vence ${formatData(dataVencimentoFinal)}` },
              { label: 'Ciclo',      value: cicloMeta.label,                   sub: `R$ ${formatBRL(Math.round(valorParcela))}/${cicloMeta.unidade}` },
              { label: 'Taxa total', value: `${taxaJurosTotal}%` },
              { label: status === 'quitado' ? 'Total pago' : 'Total a pagar', value: `R$ ${formatBRL(Math.round(totalAPagar))}` },
            ]}
          />
        </View>

        {/* Parcelas */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Vencimentos</Text>
          <Text style={s.sectionCount}>{parcelasRestantes} restantes</Text>
        </View>

        <View style={s.list}>
          {parcelas.map((p) => {
            const isPaga     = p.status === 'paga';
            const isAtrasada = p.status === 'atrasada';
            const valorParcelaDisplay = p.amountCents
              ? p.amountCents / 100
              : Math.round(valorParcela);
            return (
              <View
                key={p.numero}
                style={[s.parcelaCard, isAtrasada && s.parcelaCardAtrasada, isPaga && { opacity: 0.55 }]}
              >
                <InstallmentBadge
                  variant={isPaga ? 'paid' : isAtrasada ? 'overdue' : 'default'}
                  label={String(p.numero)}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.parcelaLabel, isAtrasada && { color: C.red, fontFamily: fonts.bold }]}>
                    {isPaga
                      ? `Pago em ${formatData(p.paidAt ?? p.data)}`
                      : isAtrasada
                        ? `Venceu em ${formatData(p.data)}`
                        : `Vence em ${formatData(p.data)}`}
                  </Text>
                  <Text style={s.parcelaValue}>R$ {formatBRL(Math.round(valorParcelaDisplay))}</Text>
                </View>
                {isPaga ? (
                  <View style={s.pagoLabel}>
                    <Feather name="check" size={14} color={C.inkSoft} />
                    <Text style={s.pagoText}>Pago</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[s.payBtn, isAtrasada && s.payBtnAtrasado]} activeOpacity={0.85}>
                    <Text style={s.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Dates row */}
        <TouchableOpacity style={[s.datesRow, { marginTop: spacing[4] }]} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>{jaConcedido ? 'Concedido em' : 'Solicitado em'}</Text>
            <Text style={s.dateValue}>{formatData(jaConcedido ? dataConcessao : dataSolicitacao)}</Text>
          </View>
          <View style={s.datesDivider} />
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>Vencimento</Text>
            <Text style={s.dateValue}>{formatData(dataVencimentoFinal)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.inkFaint} />
        </TouchableOpacity>

        <Text style={s.contratoId}>Contrato Nº {contratoId ?? `EMP-${id}`}</Text>

        <TouchableOpacity style={s.helpBtn} activeOpacity={0.7}>
          <Feather name="help-circle" size={16} color={C.inkSoft} />
          <Text style={s.helpText}>Precisa de ajuda com esse empréstimo?</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Timeline Modal */}
      <ModalSheet
        visible={showTimeline}
        onClose={() => setShowTimeline(false)}
        grabber={false}
        style={{ padding: spacing[5], paddingTop: spacing[4] }}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Histórico</Text>
          <TouchableOpacity style={s.modalClose} onPress={() => setShowTimeline(false)} activeOpacity={0.8}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>
        <Timeline events={timelineEvents} />
      </ModalSheet>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  heroCard: { borderRadius: radii.hero, marginHorizontal: spacing[4], marginTop: 18, marginBottom: 14, padding: spacing[6], backgroundColor: C.dark },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  heroEyebrow: { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.onDarkSoft, marginBottom: 10 },
  heroValue: { fontFamily: fonts.display, fontSize: fontSize['7xl'], color: '#fff', letterSpacing: -1, lineHeight: 44, marginBottom: 6 },
  heroSub:   { fontSize: fontSize.base, color: C.onDarkSoft, fontFamily: fonts.regular, marginBottom: 20 },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginHorizontal: spacing[4], marginBottom: 14, padding: 14, borderRadius: radii['2xl'], backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateLabel: { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  dateValue: { fontFamily: fonts.display, fontSize: fontSize['md+'], color: C.ink },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingBottom: 12 },
  sectionTitle:  { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },
  sectionCount:  { fontSize: fontSize.base, color: C.inkSoft, fontFamily: fonts.regular },
  list: { gap: 10, paddingHorizontal: spacing[4] },
  parcelaCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.card, padding: 14, backgroundColor: C.card },
  parcelaCardAtrasada:  { backgroundColor: C.redBg },
  parcelaLabel: { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginBottom: 2 },
  parcelaValue: { fontFamily: fonts.display, fontSize: fontSize.xl },
  payBtn:         { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, backgroundColor: C.ink },
  payBtnAtrasado: { backgroundColor: C.red },
  payBtnText:     { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
  pagoLabel:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pagoText:   { fontSize: fontSize['sm+'], fontFamily: fonts.bold, color: C.inkSoft },
  contratoId: { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: 20, marginHorizontal: spacing[5] },
  helpBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing[4], marginTop: 18, paddingVertical: 15, borderRadius: spacing[4], borderWidth: 1, borderColor: C.line },
  helpText:   { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.inkSoft },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] + 2 },
  modalTitle:   { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink },
  modalClose:   { width: 32, height: 32, borderRadius: 10, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
});
