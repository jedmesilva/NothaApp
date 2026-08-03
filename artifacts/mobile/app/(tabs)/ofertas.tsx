import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatBRL } from '@/data/loans';
import type { Oferta } from '@/data/ofertas';
import { useInvestorOffers, useRespondToOffer } from '@/hooks/useInvestorOffers';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PoolBar, PoolLegend, Chip, ModalSheet } from '@/components/ds';
import { useToast } from '@/contexts/ToastContext';
import InvestmentSlider from '@/components/InvestmentSlider';

const CLASSIFICACOES = [
  { key: 'todos', label: 'Todas' },
  { key: 'A', label: 'A' }, { key: 'B', label: 'B' }, { key: 'C', label: 'C' },
  { key: 'D', label: 'D' }, { key: 'E', label: 'E' }, { key: 'F', label: 'F' },
];

const CICLOS_FILTRO = [
  { key: 'todos', label: 'Todos' },
  { key: 'Diário',  label: 'Diário'  },
  { key: 'Semanal', label: 'Semanal' },
  { key: 'Mensal',  label: 'Mensal'  },
];

const CICLO_PLURAL: Record<string, string> = {
  Diário: 'diárias', Semanal: 'semanais', Mensal: 'mensais',
};
const CICLO_SINGULAR: Record<string, string> = {
  Diário: 'diária', Semanal: 'semanal', Mensal: 'mensal',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OfertasScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [classificacaoFilter, setClassificacaoFilter] = useState('todos');
  const [cicloFilter,         setCicloFilter]         = useState('todos');
  const [busca,               setBusca]               = useState('');
  const [modalOpen,           setModalOpen]           = useState(false);
  const [aceitas,             setAceitas]             = useState<string[]>([]);
  const [adjustedCents,       setAdjustedCents]       = useState<Record<string, number>>({});

  const { mutateAsync: respond, isPending: isResponding } = useRespondToOffer();

  const [draftClassificacao, setDraftClassificacao] = useState(classificacaoFilter);
  const [draftCiclo,         setDraftCiclo]         = useState(cicloFilter);

  const { data: offersData, isLoading: offersLoading } = useInvestorOffers();

  const CICLO_API: Record<string, Oferta['ciclo']> = {
    diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal',
  };

  // Mapeia ofertas da API para o formato Oferta usado pela tela
  const apiOfertas: Oferta[] = (offersData?.offers ?? []).map((o) => ({
    id:                    o.id,
    ofertaId:              o.loan.contractId,
    valor:                 o.maxAmountCents / 100,
    taxaRetorno:           o.ratePct / 100,
    prazoDias:             o.loan.termDays,
    parcelasTotal:         o.loan.installmentsTotal,
    ciclo:                 CICLO_API[o.loan.cycle] ?? 'Mensal',
    risco:                 'N/D',
    tomadorScore:          'N/D',
    valorTotalPedido:      o.loan.amountCents / 100,
    jaCaptado:             o.loan.fundedAmountCents / 100,
    emprestimosAnteriores: 0,
    valorTotalTomado:      0,
    cidade:                '—',
    proposito:             '—',
  }));

  const filtersActive = classificacaoFilter !== 'todos' || cicloFilter !== 'todos';

  const filtered = apiOfertas.filter((o) => {
    if (aceitas.includes(o.ofertaId)) return false;
    const classificacaoOk = classificacaoFilter === 'todos' || o.tomadorScore === classificacaoFilter;
    const cicloOk         = cicloFilter === 'todos'         || o.ciclo === cicloFilter;
    const buscaOk         = busca.trim() === ''             || o.ofertaId.toLowerCase().includes(busca.trim().toLowerCase());
    return classificacaoOk && cicloOk && buscaOk;
  });

  const handleAceitar = async (oferta: Oferta) => {
    const safeCents = adjustedCents[oferta.ofertaId] ?? Math.round(oferta.valor * 100);
    try {
      await respond({ offerId: String(oferta.id), action: 'accepted', amountCents: safeCents });
    } catch (_) { /* continua mesmo com erro de rede */ }
    setAceitas((prev) => prev.includes(oferta.ofertaId) ? prev : [...prev, oferta.ofertaId]);
    showToast({
      title: 'Oferta aceita!',
      subtitle: `R$ ${formatBRL(safeCents / 100)} reservados em ${oferta.ofertaId}`,
      actionLabel: 'Ver meus ativos',
      onAction: () => router.push('/ativos' as any),
      duration: 6000,
    });
  };

  const openModal = () => {
    setDraftClassificacao(classificacaoFilter);
    setDraftCiclo(cicloFilter);
    setModalOpen(true);
  };

  const applyFilters = () => {
    setClassificacaoFilter(draftClassificacao);
    setCicloFilter(draftCiclo);
    setModalOpen(false);
  };

  const clearFilters = () => {
    setDraftClassificacao('todos');
    setDraftCiclo('todos');
  };

  return (
    <View style={s.screen}>
      {/* Lista — header e busca rolam junto com o conteúdo */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Ofertas</Text>
          <Text style={s.subtitle}>{offersLoading ? '…' : `${apiOfertas.length} ofertas disponíveis`}</Text>
        </View>

        {/* Busca + filtro */}
        <View style={s.searchRow}>
          <View style={s.searchWrap}>
            <Feather name="search" size={17} color={C.inkFaint} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar por número da oferta"
              placeholderTextColor={C.inkFaint}
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[s.filterBtn, filtersActive && s.filterBtnActive]}
            onPress={openModal}
            activeOpacity={0.85}
          >
            <Feather name="sliders" size={18} color={filtersActive ? '#fff' : C.ink} />
            {filtersActive && <View style={s.filterBadge} />}
          </TouchableOpacity>
        </View>
        <View style={s.cardsList}>
        {filtered.length === 0 && (
          <Text style={s.emptyState}>Nenhuma oferta encontrada.</Text>
        )}

        {filtered.map((o) => {
          const maxCents         = Math.round(o.valor * 100);
          const minCents         = Math.max(1_000, Math.round(maxCents * 0.25 / 100) * 100);
          const safeCents        = adjustedCents[o.ofertaId] ?? maxCents;
          const valorR$          = safeCents / 100;
          const retornoValor     = Math.round(valorR$ * (o.taxaRetorno / 100));
          // Subtrai a contribuição desta oferta para evitar dupla-contagem
          const jaCaptadoR$      = Math.max(0, o.jaCaptado - o.valor);
          const pctCaptado       = Math.round((jaCaptadoR$ / o.valorTotalPedido) * 100);
          const pctTotal         = Math.round(((jaCaptadoR$ + valorR$) / o.valorTotalPedido) * 100);
          const pctOfertaClamped = Math.max(0, pctTotal - pctCaptado);

          return (
            <TouchableOpacity key={o.id} style={s.card} activeOpacity={0.92} onPress={() => router.push(`/ativo-detalhe?id=${o.id}&source=oferta` as any)}>
              {/* Eyebrow + badge */}
              <View style={s.cardTopRow}>
                <Text style={s.eyebrow}>Retorno oferecido</Text>
                <View style={s.scoreBadge}>
                  <Text style={s.scoreBadgeText}>Classificação {o.tomadorScore}</Text>
                </View>
              </View>

              {/* Hero */}
              <Text style={s.heroValue}><Text style={s.heroSign}>+</Text>{o.taxaRetorno}%</Text>
              <Text style={s.heroCaption}>Rendimento de R$ {formatBRL(retornoValor)} em {o.prazoDias} dias</Text>

              <View style={s.metricDivider} />

              {/* Investimento / Retorno / Prazo */}
              <View style={s.metricRow}>
                <View>
                  <Text style={s.metricLabel}>Investimento</Text>
                  <Text style={s.metricValue}>R$ {formatBRL(valorR$)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={s.metricLabel}>Retorno</Text>
                  <Text style={s.metricValue}>R$ {formatBRL(valorR$ + retornoValor)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.metricLabel}>Prazo</Text>
                  <Text style={s.metricValue}>{o.prazoDias} dias</Text>
                </View>
              </View>

              {/* Slider de valor */}
              <View style={s.sliderSection}>
                <InvestmentSlider
                  minCents={minCents}
                  maxCents={maxCents}
                  valueCents={safeCents}
                  onChange={(v) => setAdjustedCents((prev) => ({ ...prev, [o.ofertaId]: v }))}
                  showValue={false}
                />
              </View>

              <View style={s.metricDivider} />

              {/* Captação */}
              <PoolBar
                label="Captação"
                headLeft={`${pctCaptado}% captado`}
                headRight={`R$ ${formatBRL(jaCaptadoR$)} de R$ ${formatBRL(o.valorTotalPedido)}`}
                segments={[
                  { pct: pctCaptado,       variant: 'primary'   },
                  { pct: pctOfertaClamped, variant: 'secondary' },
                ]}
                style={{ marginBottom: 18 }}
                footer={
                  <PoolLegend items={[
                    { color: C.ink,      label: 'captado'     },
                    { color: C.inkFaint, label: 'esta oferta' },
                    { color: C.line,     label: 'captando'    },
                  ]} />
                }
              />

              <View style={s.metricDivider} />

              {/* Pagamento — só label + parcelas (oferta: nada foi pago ainda) */}
              <View style={s.paymentHint}>
                <Text style={s.paymentHintLabel}>Pagamento</Text>
                <Text style={s.paymentHintValue}>
                  {o.parcelasTotal > 0
                    ? `${o.parcelasTotal} ${o.parcelasTotal === 1 ? 'parcela' : 'parcelas'} ${CICLO_PLURAL[o.ciclo] ?? ''}`
                    : '—'}
                </Text>
              </View>

              {/* Botão */}
              <TouchableOpacity
                style={[s.aceitarBtn, isResponding && { opacity: 0.6 }]}
                onPress={(e) => { e.stopPropagation?.(); handleAceitar(o); }}
                activeOpacity={0.85}
                disabled={isResponding}
              >
                <Feather name="check" size={18} color="#fff" />
                <Text style={s.aceitarBtnText}>Aceitar oferta</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        </View>{/* /cardsList */}
      </ScrollView>

      {/* Modal: Filtros */}
      <ModalSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        bgColor={C.bg}
        style={{ padding: spacing[5], paddingTop: spacing[3] }}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Filtrar ofertas</Text>
          <TouchableOpacity style={s.modalClose} onPress={() => setModalOpen(false)} activeOpacity={0.8}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <Text style={s.modalSectionLabel}>Classificação</Text>
        <View style={s.pillsWrap}>
          {CLASSIFICACOES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              variant="outlined"
              active={draftClassificacao === c.key}
              onPress={() => setDraftClassificacao(c.key)}
            />
          ))}
        </View>

        <Text style={s.modalSectionLabel}>Ciclo</Text>
        <View style={s.pillsWrap}>
          {CICLOS_FILTRO.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              variant="outlined"
              active={draftCiclo === c.key}
              onPress={() => setDraftCiclo(c.key)}
            />
          ))}
        </View>

        <View style={s.modalFooter}>
          <TouchableOpacity style={s.modalBtnGhost} onPress={clearFilters} activeOpacity={0.8}>
            <Text style={s.modalBtnGhostText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.modalBtnSolid} onPress={applyFilters} activeOpacity={0.85}>
            <Text style={s.modalBtnSolidText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </ModalSheet>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: C.bg },

  header:   { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2, marginBottom: 4 },
  subtitle: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },

  // Search + filter
  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing[4], marginBottom: spacing[4] },
  searchWrap:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing[4], paddingVertical: 13, borderRadius: radii.lg, backgroundColor: C.card },
  searchInput:    { flex: 1, fontSize: fontSize.base, color: C.ink, fontFamily: fonts.regular, padding: 0 },
  filterBtn:      { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive:{ backgroundColor: C.dark },
  filterBadge:    { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.card },

  // List
  list:      { paddingHorizontal: spacing[4], paddingBottom: 120 },
  cardsList: { gap: 12 },
  emptyState:{ textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontFamily: fonts.regular, fontSize: fontSize.base },

  // Card
  card:        { borderRadius: radii.hero, backgroundColor: C.card, padding: spacing[6], paddingBottom: spacing[5] },
  cardTopRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  eyebrow:     { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint },
  scoreBadge:  { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radii.full, backgroundColor: C.bg },
  scoreBadgeText: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: C.inkSoft },
  heroValue:   { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:    { fontSize: 24, fontFamily: fonts.display },
  heroCaption:  { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 14 },
  metricDivider:{ height: 1, backgroundColor: C.line, marginBottom: 20 },
  metricRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  metricLabel: { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 },
  metricValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink, letterSpacing: -0.3 },

  // Slider
  sliderSection: { marginBottom: spacing[2] },

  // Bar footer
  paymentHint:       { paddingBottom: spacing[4], gap: 4 },
  paymentHintLabel:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', color: C.inkFaint },
  paymentHintValue:  { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },

  // Buttons
  aceitarBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: radii.lg, backgroundColor: C.dark },
  aceitarBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: '#fff' },

  // Filter modal
  modalHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[5] },
  modalTitle:        { fontFamily: fonts.display, fontSize: fontSize.xl, color: C.ink },
  modalClose:        { width: 32, height: 32, borderRadius: radii.full, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  modalSectionLabel: { fontSize: fontSize.xs, fontFamily: fonts.bold, letterSpacing: 0.3, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 10 },
  pillsWrap:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing[5] },
  modalFooter:       { flexDirection: 'row', gap: 10, marginTop: spacing[1] },
  modalBtnGhost:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: radii.lg, borderWidth: 1, borderColor: C.line },
  modalBtnGhostText: { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: C.ink },
  modalBtnSolid:     { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: radii.lg, backgroundColor: C.dark },
  modalBtnSolidText: { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: '#fff' },
});


