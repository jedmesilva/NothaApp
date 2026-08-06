import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';
import { useLoans } from '@/hooks/useLoans';
import type { Emprestimo } from '@/data/loans';

// ─── helpers ────────────────────────────────────────────────────────────────

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** "YYYY-MM-DD" usado como chave de agrupamento */
function dayKey(isoDate: string): string {
  return isoDate.slice(0, 10); // "2025-09-10"
}

/** Rótulo legível: "10 de setembro de 2025" */
function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

type Group = { label: string; key: string; loans: Emprestimo[] };

function groupByDay(loans: Emprestimo[]): Group[] {
  const sorted = [...loans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const map = new Map<string, Emprestimo[]>();
  for (const loan of sorted) {
    const key = dayKey(loan.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(loan);
  }

  return Array.from(map.entries()).map(([key, loans]) => ({
    key,
    label: dayLabel(key),
    loans,
  }));
}

// ─── tela ────────────────────────────────────────────────────────────────────

export default function EmprestimosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [busca, setBusca] = useState('');

  const { data: rawLoans, isLoading } = useLoans();

  const filtered = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return (rawLoans ?? []).filter((l) =>
      term === '' || l.contractId.toLowerCase().includes(term)
    );
  }, [rawLoans, busca]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const total  = rawLoans?.length ?? 0;

  return (
    <View style={[st.screen, { paddingTop: topPad }]}>
      {/* Barra fixa: apenas o botão de voltar */}
      <View style={st.navBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}
      >
        {/* Título — rola junto com o conteúdo */}
        <Text style={st.title}>Empréstimos</Text>

        {/* Busca */}
        <View style={st.searchWrap}>
          <Feather name="search" size={17} color={C.inkFaint} />
          <TextInput
            style={st.searchInput}
            placeholder="Buscar por número do contrato"
            placeholderTextColor={C.inkFaint}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {isLoading && (
          <ActivityIndicator color={C.ink} style={st.centered} />
        )}

        {!isLoading && total === 0 && (
          <Text style={st.empty}>Você ainda não tem empréstimos.</Text>
        )}

        {!isLoading && total > 0 && filtered.length === 0 && (
          <Text style={st.empty}>Nenhum empréstimo com esse número.</Text>
        )}

        {!isLoading && filtered.length > 0 && (
          <>
            <Text style={st.subtitle}>
              {total} {total === 1 ? 'empréstimo' : 'empréstimos'} no total
            </Text>

            {groups.map((group) => (
              <View key={group.label} style={st.group}>
                {/* Separador de período */}
                <View style={st.sectionRow}>
                  <Text style={st.sectionLabel}>{group.label}</Text>
                  <View style={st.sectionLine} />
                </View>

                {/* Cards do grupo */}
                <View style={st.groupCards}>
                  {group.loans.map((loan) => (
                    <LoanCard key={String(loan.id)} loan={loan} />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  navBar:   { paddingHorizontal: spacing[5], paddingBottom: spacing[2] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2, paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[1] },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing[4], marginBottom: spacing[4], padding: 13, borderRadius: radii.lg, backgroundColor: C.card },
  searchInput: { flex: 1, fontSize: fontSize['md+'], color: C.ink, fontFamily: fonts.regular, padding: 0 },
  centered: { paddingVertical: 60, alignSelf: 'center' },
  empty:    { fontSize: fontSize.base, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', paddingVertical: 60, paddingHorizontal: spacing[5] },

  scroll:   { paddingBottom: 48 },
  subtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, paddingHorizontal: spacing[5], marginBottom: spacing[5] },

  group:      { marginBottom: spacing[5], paddingHorizontal: spacing[4] },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: C.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flexShrink: 0,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.line,
  },

  groupCards: { gap: spacing[3] },
});
