import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';
import { useLoans } from '@/hooks/useLoans';
import type { LoanAPI } from '@/hooks/useLoans';

// ─── helpers ────────────────────────────────────────────────────────────────

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function groupLabel(isoDate: string): string {
  const d     = new Date(isoDate);
  const now   = new Date();
  const dY    = d.getFullYear();
  const dM    = d.getMonth();
  const nowY  = now.getFullYear();
  const nowM  = now.getMonth();

  if (dY === nowY && dM === nowM) return 'Este mês';
  if (dY === nowY && dM === nowM - 1) return 'Mês passado';
  if (dY === nowY - 1 && dM === 11 && nowM === 0) return 'Mês passado';
  return `${MESES[dM]} de ${dY}`;
}

type Group = { label: string; loans: LoanAPI[] };

function groupByMonth(loans: LoanAPI[]): Group[] {
  const sorted = [...loans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const map = new Map<string, LoanAPI[]>();
  for (const loan of sorted) {
    const key = groupLabel(loan.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(loan);
  }

  return Array.from(map.entries()).map(([label, loans]) => ({ label, loans }));
}

// ─── tela ────────────────────────────────────────────────────────────────────

export default function EmprestimosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { data: rawLoans, isLoading } = useLoans();
  const groups = useMemo(() => groupByMonth(rawLoans ?? []), [rawLoans]);
  const total  = rawLoans?.length ?? 0;

  return (
    <View style={[st.screen, { paddingTop: topPad }]}>
      <View style={st.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={st.title}>Empréstimos</Text>
      </View>

      {isLoading ? (
        <View style={st.loading}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : total === 0 ? (
        <View style={st.loading}>
          <Text style={st.empty}>Você ainda não tem empréstimos.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.scroll}
        >
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
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:   { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:   { fontSize: fontSize.base, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center' },

  scroll:  { paddingHorizontal: spacing[4], paddingBottom: 48 },
  subtitle:{ fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: spacing[5] },

  group:      { marginBottom: spacing[5] },
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
