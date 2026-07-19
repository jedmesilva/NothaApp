import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EMPRESTIMOS } from '@/data/loans';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';

export default function EmprestimosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  return (
    <View style={[st.screen, { paddingTop: topPad }]}>
      <View style={st.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={st.title}>Empréstimos</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}
      >
        <Text style={st.subtitle}>{EMPRESTIMOS.length} empréstimos no total</Text>

        {EMPRESTIMOS.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  header:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  subtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 4 },
});
