import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { EMPRESTIMOS } from '@/data/loans';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { LoanCard } from '@/components/LoanCard';

export default function EmprestimosScreen() {
  return (
    <View style={st.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
      >
        <View style={st.header}>
          <Text style={st.title}>Empréstimos</Text>
          <Text style={st.subtitle}>{EMPRESTIMOS.length} empréstimos no total</Text>
        </View>

        {EMPRESTIMOS.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  header:   { paddingTop: spacing[4], paddingHorizontal: 4, paddingBottom: spacing[2] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginTop: 2 },
});
