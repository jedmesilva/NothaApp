import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { formatBRL } from '@/data/loans';
import { useInvestorPositions, getPosStatus } from '@/hooks/useInvestorPositions';
import type { InvestorPosition } from '@/hooks/useInvestorPositions';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, StatusBadge, PoolBar, DetailGrid, SplitRow, Chip, ModalSheet } from '@/components/ds';
import type { LoanStatus } from '@/components/ds';

const CICLO_META: Record<string, { pagamentosLabel: string }> = {
  diario:  { pagamentosLabel: 'diários' },
  semanal: { pagamentosLabel: 'semanais' },
  mensal:  { pagamentosLabel: 'mensais' },
};

const FILTERS = [
  { key: 'todas',    label: 'Todos' },
  { key: 'ativo',    label: 'Ativos' },
  { key: 'atrasado', label: 'Atrasados' },
  { key: 'captacao', label: 'Em captação' },
  { key: 'quitado',  label: 'Quitados' },
];

function buildCardData(pos: InvestorPosition) {
  const posStatus  = getPosStatus(pos);
  const original   = pos.originalPrincipalCents / 100;
  const investido  = pos.principalBalanceCents / 100;
  const taxa       = pos.ratePct;
  const totalComRetorno = original * (1 + taxa / 100);
  const retornoTotal    = totalComRetorno - original;
  const prazoDias  = pos.loan.termDays;
  const ciclo      = pos.loan.cycle;
  const isCaptacao = posStatus === 'captacao';

  const parcelasTotal  = pos.loan.installmentsTotal;
  const parcelasPagas  = pos.installments.filter((i) => i.status === 'paid').length;
  const recebido       = pos.totalReturnedCents / 100;
  const pctRecebido    = parcelasTotal > 0
    ? Math.round((parcelasPagas / parcelasTotal) * 100)
    : 0;

  const valorTotalPedido = pos.loan.amountCents / 100;
  const fundedOutros     = Math.max(0, pos.loan.fundedAmountCents - pos.principalBalanceCents) / 100;
  const pctCaptado       = valorTotalPedido > 0
    ? Math.round((fundedOutros / valorTotalPedido) * 100)
    : 0;
  const pctPos           = valorTotalPedido > 0
    ? Math.round((investido / valorTotalPedido) * 100)
    : 0;
  const pctPosClamped    = Math.min(pctPos, Math.max(0, 100 - pctCaptado));

  return {
    posStatus, taxa, original, investido, totalComRetorno, retornoTotal,
    prazoDias, ciclo, isCaptacao,
    parcelasTotal, parcelasPagas, recebido, pctRecebido,
    valorTotalPedido, fundedOutros, pctCaptado, pctPosClamped,
  };
}

export default function AtivosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [activeFilter, setActiveFilter]   = useState('todas');
  const [busca, setBusca]                 = useState('');
  const [modalOpen, setModalOpen]         = useState(false);
  const [draftFilter, setDraftFilter]     = useState('todas');

  const { data: posData, isLoading } = useInvestorPositions();
  const positions = posData?.positions ?? [];

  const filtered = positions.filter((p) => {
    const statusOk = activeFilter === 'todas' || getPosStatus(p) === activeFilter;
    const buscaOk  = busca.trim() === ''
      || p.loan.contractId.toLowerCase().includes(busca.trim().toLowerCase());
    return statusOk && buscaOk;
  });

  const filtersActive = activeFilter !== 'todas';
  const openModal = () => { setDraftFilter(activeFilter); setModalOpen(true); };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Ativos</Text>
      </View>

      {/* Search + filter */}
      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <Feather name="search" size={17} color={C.inkFaint} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar por número do contrato"
            placeholderTextColor={C.inkFaint}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <TouchableOpacity
          style={[s.filterBtn, filtersActive && s.filterBtnActive]}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={18} color={filtersActive ? '#fff' : C.ink} />
          {filtersActive && <View style={s.filterBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing[4], gap: 12, paddingBottom: 40 }}
      >
        {isLoading && (
          <ActivityIndicator
            color={C.ink}
            style={{ paddingVertical: 60 }}
          />
        )}

        {!isLoading && filtered.length === 0 && (
          <Text style={s.emptyState}>
            {positions.length === 0
              ? 'Você ainda não tem ativos.'
              : 'Nenhuma posição nessa categoria.'}
          </Text>
        )}

        {filtered.map((pos) => {
          const {
            posStatus, taxa, original, investido, totalComRetorno, retornoTotal,
            prazoDias, ciclo, isCaptacao,
            parcelasTotal, pctRecebido, recebido,
            valorTotalPedido, fundedOutros, pctCaptado, pctPosClamped,
          } = buildCardData(pos);

          const isAtrasado = posStatus === 'atrasado';
          const cicloDisplay = CICLO_META[ciclo];

          return (
            <TouchableOpacity
              key={pos.id}
              style={[
                s.posCard,
                isAtrasado && s.posCardAtrasado,
                isCaptacao && s.posCardCaptacao,
              ]}
              activeOpacity={0.85}
              onPress={() => router.push(`/ativo-detalhe?id=${pos.id}` as any)}
            >
              <View style={s.posTopRow}>
                <Text style={s.eyebrow}>Retorno do contrato</Text>
                <StatusBadge status={posStatus as LoanStatus} />
              </View>

              <Text style={s.heroValue}>
                <Text style={s.heroSign}>+</Text>{taxa}%
              </Text>
              <Text style={s.heroCaption}>
                Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
              </Text>

              <SplitRow
                left={{ label: 'Valor investido', value: `R$ ${formatBRL(investido)}` }}
                right={{ label: 'Retorno estimado', value: `R$ ${formatBRL(Math.round(totalComRetorno))}` }}
              />

              {isCaptacao ? (
                <PoolBar
                  label="Captação"
                  headLeft={`${pctCaptado + (valorTotalPedido > 0 ? Math.round((investido / valorTotalPedido) * 100) : 0)}% captado`}
                  headRight={`R$ ${formatBRL(Math.round(fundedOutros + investido))} de R$ ${formatBRL(valorTotalPedido)}`}
                  segments={[
                    { pct: pctCaptado,    variant: 'primary' },
                    { pct: pctPosClamped, variant: 'secondary' },
                  ]}
                  style={{ marginBottom: 18 }}
                  footer={
                    <View style={s.legend}>
                      <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.ink }]}     /><Text style={s.legendText}>outros credores</Text></View>
                      <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.inkFaint }]} /><Text style={s.legendText}>Minha participação</Text></View>
                    </View>
                  }
                />
              ) : (
                <PoolBar
                  label="Pagamento"
                  headLeft={`${pctRecebido}% pago`}
                  headRight={`R$ ${formatBRL(Math.round(recebido))} de R$ ${formatBRL(Math.round(totalComRetorno))}`}
                  segments={[{ pct: pctRecebido, variant: 'primary' }]}
                  style={{ marginBottom: 18 }}
                />
              )}

              <DetailGrid
                items={[
                  { label: 'Prazo',    value: `${prazoDias} dias`, sub: `pagamentos ${cicloDisplay?.pagamentosLabel ?? ''}` },
                  { label: 'Parcelas', value: parcelasTotal > 0 ? `${parcelasTotal}x` : '—' },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter modal */}
      <ModalSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        bgColor={C.bg}
        style={{ padding: 20, paddingTop: 14 }}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Filtrar posições</Text>
          <TouchableOpacity style={s.modalClose} onPress={() => setModalOpen(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <Text style={s.modalSectionLabel}>Status</Text>
        <View style={s.pillsWrap}>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              variant="outlined"
              active={draftFilter === f.key}
              onPress={() => setDraftFilter(f.key)}
            />
          ))}
        </View>

        <View style={s.modalFooter}>
          <TouchableOpacity
            style={s.footerBtnGhost}
            onPress={() => setDraftFilter('todas')}
            activeOpacity={0.8}
          >
            <Text style={s.footerBtnGhostText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.footerBtnSolid}
            onPress={() => { setActiveFilter(draftFilter); setModalOpen(false); }}
            activeOpacity={0.85}
          >
            <Text style={s.footerBtnSolidText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </ModalSheet>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: spacing[4], marginTop: spacing[4], marginBottom: 4 },
  searchWrap:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: radii.lg, backgroundColor: C.card },
  searchInput:  { flex: 1, fontSize: fontSize['md+'], color: C.ink, fontFamily: fonts.regular, padding: 0 },
  filterBtn:       { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: C.dark },
  filterBadge:     { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink, borderWidth: 2, borderColor: C.card },
  emptyState: { textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontSize: fontSize.md, fontFamily: fonts.regular },
  posCard:         { borderRadius: radii.card, backgroundColor: C.card, padding: 22 },
  posCardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  posCardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  posTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  eyebrow:    { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint },
  heroValue:  { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:   { fontSize: 24, fontFamily: fonts.display },
  heroCaption:{ fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18 },
  legend:     { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: fontSize.xs, color: C.inkSoft, fontFamily: fonts.medium },
  // Modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.3 },
  modalClose:  { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  modalSectionLabel: { fontSize: fontSize.sm, fontFamily: fonts.bold, letterSpacing: 0.3, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 10 },
  pillsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  modalFooter:  { flexDirection: 'row', gap: 10, marginTop: 6 },
  footerBtnGhost:    { flex: 1, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  footerBtnGhostText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: C.ink },
  footerBtnSolid:    { flex: 2, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', backgroundColor: C.dark },
  footerBtnSolidText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: '#fff' },
});
