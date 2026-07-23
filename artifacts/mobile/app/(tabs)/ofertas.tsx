import React, { useState, useEffect, useRef } from 'react';
// useRef still needed by OfertaSheet's intervalRef
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatBRL } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PoolBar, PoolLegend, SplitRow, DetailGrid, Chip, ModalSheet } from '@/components/ds';
import { useToast } from '@/contexts/ToastContext';

// ─── Dados mock ───────────────────────────────────────────────────────────────

type Oferta = {
  id: number;
  ofertaId: string;
  valor: number;
  taxaRetorno: number;
  prazoDias: number;
  ciclo: 'Diário' | 'Semanal' | 'Mensal';
  risco: string;
  tomadorScore: string;
  valorTotalPedido: number;
  jaCaptado: number;
  emprestimosAnteriores: number;
  valorTotalTomado: number;
};

const MOCK_OFERTAS: Oferta[] = [
  { id: 1, ofertaId: 'OFR-2026-40218', valor: 1200, taxaRetorno: 4.8, prazoDias: 45,  ciclo: 'Semanal', risco: 'Baixo', tomadorScore: 'A', valorTotalPedido: 5000, jaCaptado: 3100, emprestimosAnteriores: 3, valorTotalTomado: 12400 },
  { id: 2, ofertaId: 'OFR-2026-40219', valor:  800, taxaRetorno: 7.2, prazoDias: 90,  ciclo: 'Mensal',  risco: 'Alto',  tomadorScore: 'C', valorTotalPedido: 3000, jaCaptado:  900, emprestimosAnteriores: 1, valorTotalTomado:  3000 },
  { id: 3, ofertaId: 'OFR-2026-40220', valor:  500, taxaRetorno: 2.1, prazoDias: 15,  ciclo: 'Diário',  risco: 'Baixo', tomadorScore: 'A', valorTotalPedido: 1800, jaCaptado: 1500, emprestimosAnteriores: 6, valorTotalTomado: 28500 },
  { id: 4, ofertaId: 'OFR-2026-40221', valor: 2000, taxaRetorno: 5.5, prazoDias: 60,  ciclo: 'Semanal', risco: 'Médio', tomadorScore: 'B', valorTotalPedido: 8000, jaCaptado: 2200, emprestimosAnteriores: 2, valorTotalTomado:  4100 },
  { id: 5, ofertaId: 'OFR-2026-40222', valor:  350, taxaRetorno: 3.4, prazoDias: 30,  ciclo: 'Mensal',  risco: 'Médio', tomadorScore: 'B', valorTotalPedido: 2500, jaCaptado: 2100, emprestimosAnteriores: 0, valorTotalTomado:     0 },
];

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
  Diário: 'diários', Semanal: 'semanais', Mensal: 'mensais',
};

// ─── Offer detail sheet (Ver detalhes) ────────────────────────────────────────

const TOTAL_SECONDS = 30;

function OfertaSheet({ oferta, onClose, onAceitar }: {
  oferta: Oferta;
  onClose: () => void;
  onAceitar: (o: Oferta) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | 'expired'>('pending');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSecondsLeft(TOTAL_SECONDS); setStatus('pending'); }, [oferta.id]);

  useEffect(() => {
    if (status !== 'pending') return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(intervalRef.current!); setStatus('expired'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [status]);

  const isUrgent        = secondsLeft <= 10;
  const pctTempo        = (secondsLeft / TOTAL_SECONDS) * 100;
  const pctCaptado      = Math.round((oferta.jaCaptado / oferta.valorTotalPedido) * 100);
  const pctOferta       = Math.round((oferta.valor / oferta.valorTotalPedido) * 100);
  const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);
  const retornoValor    = Math.round(oferta.valor * (oferta.taxaRetorno / 100));

  const handleAccept = () => {
    clearInterval(intervalRef.current!);
    setStatus('accepted');
    onAceitar(oferta);
  };
  const handleDecline = () => { clearInterval(intervalRef.current!); setStatus('declined'); };

  if (status !== 'pending') {
    const resultMap = {
      accepted: { icon: 'check' as const,  bg: C.dark,       iconColor: '#fff',     title: 'Oferta aceita',    sub: `R$ ${formatBRL(oferta.valor)} reservados para esse pedido.\nVocê recebe a confirmação assim que a captação fechar.` },
      declined: { icon: 'x' as const,      bg: C.chipMuted,  iconColor: C.inkSoft,  title: 'Oferta recusada',  sub: 'Sem problema. Vamos te avisar quando surgir outra oportunidade.' },
      expired:  { icon: 'clock' as const,  bg: C.redBg,      iconColor: C.red,      title: 'Tempo esgotado',   sub: 'Essa oferta foi repassada para outro credor.\nFique de olho na próxima.' },
    };
    const r = resultMap[status as keyof typeof resultMap];
    return (
      <View style={bs.resultWrap}>
        <View style={[bs.resultIcon, { backgroundColor: r.bg }]}>
          <Feather name={r.icon} size={26} color={r.iconColor} />
        </View>
        <Text style={bs.resultTitle}>{r.title}</Text>
        <Text style={bs.resultSub}>{r.sub}</Text>
        <TouchableOpacity style={bs.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={bs.closeBtnText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={bs.timerRow}>
        <View style={bs.timerLabel}>
          <Feather name="clock" size={14} color={C.inkSoft} />
          <Text style={bs.timerLabelText}>Nova solicitação de investimento</Text>
        </View>
        <Text style={[bs.timerValue, { color: isUrgent ? C.red : C.ink }]}>{secondsLeft}s</Text>
      </View>
      <View style={bs.timerTrack}>
        <View style={[bs.timerFill, { width: `${pctTempo}%` as any, backgroundColor: isUrgent ? C.red : C.dark }]} />
      </View>

      <Text style={bs.eyebrow}>Retorno oferecido</Text>
      <Text style={bs.heroValue}><Text style={bs.heroSign}>+</Text>{oferta.taxaRetorno}%</Text>
      <Text style={bs.heroCaption}>Rendimento de R$ {formatBRL(retornoValor)} em {oferta.prazoDias} dias</Text>

      <SplitRow
        left={{ label: 'Investimento', value: `R$ ${formatBRL(oferta.valor)}` }}
        right={{ label: 'Retorno', value: `R$ ${formatBRL(oferta.valor + retornoValor)}` }}
      />

      <PoolBar
        label="Captação do pedido"
        headLeft={`${pctCaptado}% captado`}
        headRight={`R$ ${formatBRL(oferta.jaCaptado)} de R$ ${formatBRL(oferta.valorTotalPedido)}`}
        segments={[
          { pct: pctCaptado,        variant: 'primary' },
          { pct: pctOfertaClamped,  variant: 'secondary' },
        ]}
        style={{ marginBottom: 18 }}
        footer={
          <PoolLegend items={[
            { color: C.ink,     label: 'captado'     },
            { color: C.inkFaint, label: 'esta oferta' },
            { color: C.line,    label: 'captando'    },
          ]} />
        }
      />

      <DetailGrid
        items={[
          { label: 'Prazo',      value: `${oferta.prazoDias} dias`, sub: `vencimentos ${CICLO_PLURAL[oferta.ciclo]}` },
          { label: 'Classificação', value: oferta.tomadorScore },
          { label: 'Histórico',  value: oferta.emprestimosAnteriores === 0 ? 'Primeiro' : `${oferta.emprestimosAnteriores + 1}º empréstimo` },
          { label: 'Já tomado', value: oferta.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(oferta.valorTotalTomado)}` },
        ]}
        style={{ marginBottom: 22 }}
      />

      <View style={bs.btnRow}>
        <TouchableOpacity style={bs.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
          <Feather name="x" size={18} color={C.ink} />
          <Text style={bs.declineBtnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bs.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={bs.acceptBtnText}>Aceitar oferta</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OfertasScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [classificacaoFilter, setClassificacaoFilter] = useState('todos');
  const [cicloFilter,         setCicloFilter]         = useState('todos');
  const [busca,               setBusca]               = useState('');
  const [modalOpen,           setModalOpen]           = useState(false);
  const [selectedOferta,      setSelectedOferta]      = useState<Oferta | null>(null);
  const [aceitas,             setAceitas]             = useState<number[]>([]);

  const [draftClassificacao, setDraftClassificacao] = useState(classificacaoFilter);
  const [draftCiclo,         setDraftCiclo]         = useState(cicloFilter);

  const filtersActive = classificacaoFilter !== 'todos' || cicloFilter !== 'todos';

  const filtered = MOCK_OFERTAS.filter((o) => {
    if (aceitas.includes(o.id)) return false;
    const classificacaoOk = classificacaoFilter === 'todos' || o.tomadorScore === classificacaoFilter;
    const cicloOk         = cicloFilter === 'todos'         || o.ciclo === cicloFilter;
    const buscaOk         = busca.trim() === ''             || o.ofertaId.toLowerCase().includes(busca.trim().toLowerCase());
    return classificacaoOk && cicloOk && buscaOk;
  });

  const handleAceitar = (oferta: Oferta) => {
    setAceitas((prev) => prev.includes(oferta.id) ? prev : [...prev, oferta.id]);
    showToast({
      title: 'Oferta aceita',
      subtitle: `R$ ${formatBRL(oferta.valor)} investidos em ${oferta.ofertaId}`,
      actionLabel: 'Acompanhar captação',
      onAction: () => router.push(`/ativo-detalhe?id=${oferta.id}` as any),
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
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Ofertas</Text>
        <Text style={s.subtitle}>{MOCK_OFERTAS.length} ofertas disponíveis</Text>
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

      {/* Lista */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {filtered.length === 0 && (
          <Text style={s.emptyState}>Nenhuma oferta encontrada.</Text>
        )}

        {filtered.map((o) => {
          const retornoValor     = Math.round(o.valor * (o.taxaRetorno / 100));
          const pctCaptado       = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
          const pctOferta        = Math.round((o.valor / o.valorTotalPedido) * 100);
          const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);

          return (
            <TouchableOpacity key={o.id} style={s.card} activeOpacity={0.92} onPress={() => setSelectedOferta(o)}>
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

              {/* Split */}
              <SplitRow
                left={{ label: 'Investimento', value: `R$ ${formatBRL(o.valor)}` }}
                right={{ label: 'Retorno', value: `R$ ${formatBRL(o.valor + retornoValor)}` }}
              />

              {/* Pool */}
              <PoolBar
                label="Captação"
                headLeft={`${pctCaptado}% captado`}
                headRight={`R$ ${formatBRL(o.jaCaptado)} de R$ ${formatBRL(o.valorTotalPedido)}`}
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

              {/* Grid */}
              <DetailGrid
                items={[
                  { label: 'Prazo',         value: `${o.prazoDias} dias`, sub: `vencimentos ${CICLO_PLURAL[o.ciclo]}` },
                  { label: 'Classificação', value: o.tomadorScore },
                  { label: 'Histórico',     value: o.emprestimosAnteriores === 0 ? 'Primeiro' : `${o.emprestimosAnteriores + 1}º empréstimo` },
                  { label: 'Já tomado',     value: o.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(o.valorTotalTomado)}` },
                ]}
                style={{ marginBottom: 14 }}
              />

              {/* Botões */}
              <View style={s.btnRow}>
                <TouchableOpacity
                  style={s.detalhesBtn}
                  onPress={(e) => { e.stopPropagation?.(); setSelectedOferta(o); }}
                  activeOpacity={0.8}
                >
                  <Text style={s.detalhesBtnText}>Ver detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.aceitarBtn}
                  onPress={(e) => { e.stopPropagation?.(); handleAceitar(o); }}
                  activeOpacity={0.85}
                >
                  <Text style={s.aceitarBtnText}>Aceitar oferta</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal: Ver detalhes */}
      <ModalSheet visible={selectedOferta !== null} onClose={() => setSelectedOferta(null)}>
        {selectedOferta && (
          <OfertaSheet
            oferta={selectedOferta}
            onClose={() => setSelectedOferta(null)}
            onAceitar={(o) => { handleAceitar(o); setSelectedOferta(null); }}
          />
        )}
      </ModalSheet>

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

  header:   { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[1] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2, marginBottom: 4 },
  subtitle: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },

  // Search + filter
  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing[4], marginTop: spacing[4], marginBottom: spacing[5] - 2 },
  searchWrap:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing[4], paddingVertical: 13, borderRadius: radii.lg, backgroundColor: C.card },
  searchInput:    { flex: 1, fontSize: fontSize.base, color: C.ink, fontFamily: fonts.regular, padding: 0 },
  filterBtn:      { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive:{ backgroundColor: C.dark },
  filterBadge:    { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.card },

  // List
  list:      { gap: 12, paddingHorizontal: spacing[4], paddingBottom: 120 },
  emptyState:{ textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontFamily: fonts.regular, fontSize: fontSize.base },

  // Card
  card:        { borderRadius: radii.hero, backgroundColor: C.card, padding: spacing[6], paddingBottom: spacing[5] },
  cardTopRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  eyebrow:     { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint },
  scoreBadge:  { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radii.full, backgroundColor: C.bg },
  scoreBadgeText: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: C.inkSoft },
  heroValue:   { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:    { fontSize: 24, fontFamily: fonts.display },
  heroCaption: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 20 },

  // Buttons
  btnRow:         { flexDirection: 'row', gap: 10 },
  detalhesBtn:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: C.bg },
  detalhesBtnText:{ fontSize: fontSize.base, fontFamily: fonts.bold, color: C.ink },
  aceitarBtn:     { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: C.dark },
  aceitarBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },

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

// Offer sheet styles
const bs = StyleSheet.create({
  timerRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  timerLabel:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLabelText: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  timerValue:     { fontFamily: fonts.display, fontSize: fontSize.base },
  timerTrack:     { width: '100%', height: 4, borderRadius: radii.full, backgroundColor: C.line, overflow: 'hidden', marginBottom: 22 },
  timerFill:      { height: '100%', borderRadius: radii.full },
  eyebrow:        { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  heroValue:      { fontFamily: fonts.display, fontSize: 46, color: C.ink, letterSpacing: -1.2, lineHeight: 50 },
  heroSign:       { fontSize: 26, fontFamily: fonts.display },
  heroCaption:    { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18, marginTop: 4 },
  btnRow:         { flexDirection: 'row', gap: 10 },
  declineBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: spacing[4], backgroundColor: C.chipMuted },
  declineBtnText: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: C.ink },
  acceptBtn:      { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: spacing[4], backgroundColor: C.dark },
  acceptBtnText:  { fontSize: fontSize.lg, fontFamily: fonts.bold, color: '#fff' },
  resultWrap:     { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 10 },
  resultIcon:     { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultTitle:    { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: C.ink, marginBottom: 8 },
  resultSub:      { fontSize: fontSize.md, color: C.inkSoft, fontFamily: fonts.regular, textAlign: 'center', lineHeight: 20 },
  closeBtn:       { marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: C.chipMuted },
  closeBtnText:   { fontSize: fontSize.lg, fontFamily: fonts.bold, color: C.ink },
});

