import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { BackButton, StatusBadge, PoolBar, DetailGrid, Chip, ModalSheet, Eyebrow, DetailLabel, ScreenTitle } from '@/components/ds';
import { SearchBar } from '@/components/SearchBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PaymentProgress } from '@/components/PaymentProgress';
import { OfferPaymentHint } from '@/components/OfferPaymentHint';
import type { LoanStatus } from '@/components/ds';

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
  const taxa       = pos.ratePct / 100;
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
      {/* Barra fixa: apenas o botão de voltar */}
      <View style={s.navBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Cabeçalho padronizado */}
        <ScreenHeader title="Ativos" />

        {/* Busca + filtro — rolam com o conteúdo */}
        <View style={s.searchRow}>
          <SearchBar
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por número do contrato"
            style={s.searchField}
          />
          <TouchableOpacity
            style={[s.filterBtn, filtersActive && s.filterBtnActive]}
            onPress={openModal}
            activeOpacity={0.8}
          >
            <Feather name="sliders" size={18} color={filtersActive ? '#fff' : C.ink} />
            {filtersActive && <View style={s.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={s.cardsList}>
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
                <Eyebrow style={{ marginBottom: 0 }}>Rendimento</Eyebrow>
                <StatusBadge
                  status={posStatus as LoanStatus}
                  createdAt={isCaptacao ? pos.loan.fundingStartedAt : undefined}
                />
              </View>

              <Text style={s.heroValue}>
                <Text style={s.heroSign}>+</Text>{taxa}%
              </Text>
              <Text style={s.heroCaption}>
                R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
              </Text>

              <View style={s.divider} />

              <View style={s.metricRow}>
                <View>
                  <DetailLabel style={{ marginBottom: 4 }}>Investimento</DetailLabel>
                  <Text style={s.metricValue}>R$ {formatBRL(investido)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <DetailLabel style={{ marginBottom: 4 }}>Retorno</DetailLabel>
                  <Text style={s.metricValue}>R$ {formatBRL(Math.round(totalComRetorno))}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <DetailLabel style={{ marginBottom: 4 }}>Prazo</DetailLabel>
                  <Text style={s.metricValue}>{prazoDias} dias</Text>
                </View>
              </View>

              {isCaptacao && <View style={s.divider} />}

              {isCaptacao && (
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
              )}

              <View style={s.divider} />

              <DetailLabel>Pagamento</DetailLabel>

              {isCaptacao ? (
                <OfferPaymentHint
                  ciclo={ciclo}
                  parcelasTotal={parcelasTotal}
                />
              ) : (
                <PaymentProgress
                  ciclo={ciclo}
                  parcelasTotal={parcelasTotal}
                  pctPago={pctRecebido}
                  valorPago={recebido}
                  valorTotal={totalComRetorno}
                />
              )}
            </TouchableOpacity>
          );
        })}
        </View>{/* /cardsList */}
      </ScrollView>

      {/* Filter modal */}
      <ModalSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        bgColor={C.bg}
        style={{ padding: 20, paddingTop: 14 }}
      >
        <View style={s.modalHeader}>
          <ScreenTitle style={{ letterSpacing: -0.3 }}>Filtrar posições</ScreenTitle>
          <TouchableOpacity style={s.modalClose} onPress={() => setModalOpen(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <DetailLabel>Status</DetailLabel>
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
  screen:  { flex: 1, backgroundColor: C.bg },
  navBar:  { paddingHorizontal: spacing[5], paddingBottom: spacing[2] },
  cardsList: { paddingHorizontal: spacing[4], gap: 12 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing[4], marginBottom: spacing[4] },
  searchField: { flex: 1 },
  filterBtn:       { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: C.dark },
  filterBadge:     { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink, borderWidth: 2, borderColor: C.card },
  emptyState: { textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontSize: fontSize.md, fontFamily: fonts.regular },
  posCard:         { borderRadius: radii.card, backgroundColor: C.card, padding: 22 },
  metricRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  metricValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink, letterSpacing: -0.3 },
  posCardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  posCardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  posTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  heroValue:  { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:   { fontSize: 24, fontFamily: fonts.display },
  heroCaption:{ fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 14 },
  divider:       { height: 1, backgroundColor: C.line, marginBottom: 18 },
  legend:     { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: fontSize.xs, color: C.inkSoft, fontFamily: fonts.medium },
  // Modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalClose:  { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  pillsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  modalFooter:  { flexDirection: 'row', gap: 10, marginTop: 6 },
  footerBtnGhost:    { flex: 1, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  footerBtnGhostText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: C.ink },
  footerBtnSolid:    { flex: 2, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', backgroundColor: C.dark },
  footerBtnSolidText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: '#fff' },
});
