import React, { useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, Chip, ModalSheet } from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';
import { SearchBar } from '@/components/SearchBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useLoans } from '@/hooks/useLoans';
import type { Emprestimo } from '@/data/loans';

// ─── filtros ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'todos',    label: 'Todos' },
  { key: 'ativo',    label: 'Ativos' },
  { key: 'atrasado', label: 'Atrasados' },
  { key: 'captacao', label: 'Em captação' },
  { key: 'analise',  label: 'Em análise' },
  { key: 'quitado',  label: 'Quitados' },
];

// ─── helpers de agrupamento por data ─────────────────────────────────────────

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function dayKey(isoDate: string) { return isoDate.slice(0, 10); }

function dayLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

type Group = { key: string; label: string; loans: Emprestimo[] };

function groupByDay(loans: Emprestimo[]): Group[] {
  const sorted = [...loans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const map = new Map<string, Emprestimo[]>();
  for (const loan of sorted) {
    const k = dayKey(loan.createdAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(loan);
  }
  return Array.from(map.entries()).map(([key, loans]) => ({ key, label: dayLabel(key), loans }));
}

// ─── tela ────────────────────────────────────────────────────────────────────

export default function EmprestimosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [busca, setBusca]               = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [draftFilter, setDraftFilter]   = useState('todos');
  const [modalOpen, setModalOpen]       = useState(false);

  const { data: rawLoans, isLoading } = useLoans();
  const total = rawLoans?.length ?? 0;

  const filtered = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return (rawLoans ?? []).filter((l) => {
      const statusOk = activeFilter === 'todos' || l.status === activeFilter;
      const buscaOk  = term === '' || (l.contratoId ?? '').toLowerCase().includes(term);
      return statusOk && buscaOk;
    });
  }, [rawLoans, busca, activeFilter]);

  const groups       = useMemo(() => groupByDay(filtered), [filtered]);
  const filtersActive = activeFilter !== 'todos';
  const openModal    = () => { setDraftFilter(activeFilter); setModalOpen(true); };

  return (
    <View style={[st.screen, { paddingTop: topPad }]}>
      {/* Barra fixa: apenas o botão de voltar */}
      <View style={st.navBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Cabeçalho padronizado */}
        <ScreenHeader
          title="Empréstimos"
          subtitle={isLoading ? '…' : `${total} ${total === 1 ? 'empréstimo' : 'empréstimos'} no total`}
        />

        {/* Busca + filtro */}
        <View style={st.searchRow}>
          <SearchBar
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por número do contrato"
            style={st.searchField}
          />
          <TouchableOpacity
            style={[st.filterBtn, filtersActive && st.filterBtnActive]}
            onPress={openModal}
            activeOpacity={0.8}
          >
            <Feather name="sliders" size={18} color={filtersActive ? '#fff' : C.ink} />
            {filtersActive && <View style={st.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={st.cardsList}>
          {isLoading && (
            <ActivityIndicator color={C.ink} style={{ paddingVertical: 60 }} />
          )}

          {!isLoading && filtered.length === 0 && (
            <Text style={st.emptyState}>
              {total === 0
                ? 'Você ainda não tem empréstimos.'
                : 'Nenhum empréstimo encontrado.'}
            </Text>
          )}

          {!isLoading && groups.map((group) => (
            <View key={group.key} style={st.group}>
              <View style={st.sectionRow}>
                <Text style={st.sectionLabel}>{group.label}</Text>
                <View style={st.sectionLine} />
              </View>
              <View style={st.groupCards}>
                {group.loans.map((loan) => (
                  <LoanCard key={String(loan.id)} loan={loan} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal de filtros */}
      <ModalSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        bgColor={C.bg}
        style={{ padding: 20, paddingTop: 14 }}
      >
        <View style={st.modalHeader}>
          <Text style={st.modalTitle}>Filtrar empréstimos</Text>
          <TouchableOpacity style={st.modalClose} onPress={() => setModalOpen(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <Text style={st.modalSectionLabel}>Status</Text>
        <View style={st.pillsWrap}>
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

        <View style={st.modalFooter}>
          <TouchableOpacity
            style={st.footerBtnGhost}
            onPress={() => setDraftFilter('todos')}
            activeOpacity={0.8}
          >
            <Text style={st.footerBtnGhostText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={st.footerBtnSolid}
            onPress={() => { setActiveFilter(draftFilter); setModalOpen(false); }}
            activeOpacity={0.85}
          >
            <Text style={st.footerBtnSolidText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </ModalSheet>
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  navBar:   { paddingHorizontal: spacing[5], paddingBottom: spacing[2] },
  scroll:   { paddingBottom: 40 },

  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing[4], marginBottom: spacing[4] },
  searchField:    { flex: 1 },
  filterBtn:      { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive:{ backgroundColor: C.dark },
  filterBadge:    { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink, borderWidth: 2, borderColor: C.card },

  cardsList:    { paddingHorizontal: spacing[4], gap: 12 },
  emptyState:   { textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontSize: fontSize.md, fontFamily: fonts.regular },

  group:        { gap: spacing[3] },
  sectionRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  sectionLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: C.line },
  groupCards:   { gap: spacing[3] },

  // Modal
  modalHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle:        { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.3 },
  modalClose:        { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  modalSectionLabel: { fontSize: fontSize.sm, fontFamily: fonts.bold, letterSpacing: 0.3, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 10 },
  pillsWrap:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  modalFooter:       { flexDirection: 'row', gap: 10, marginTop: 6 },
  footerBtnGhost:    { flex: 1, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  footerBtnGhostText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: C.ink },
  footerBtnSolid:    { flex: 2, paddingVertical: 15, borderRadius: radii.lg, alignItems: 'center', backgroundColor: C.dark },
  footerBtnSolidText:{ fontSize: fontSize['md+'], fontFamily: fonts.bold, color: '#fff' },
});
