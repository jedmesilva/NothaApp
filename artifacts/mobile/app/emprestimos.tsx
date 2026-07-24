import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';
import { useLoans } from '@/hooks/useLoans';

export default function EmprestimosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const { data: rawLoans, isLoading } = useLoans();
  const loans = [...(rawLoans ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}
        >
          <Text style={st.subtitle}>
            {loans?.length ?? 0} {loans?.length === 1 ? 'empréstimo' : 'empréstimos'} no total
          </Text>

          {loans?.map((loan) => (
            <LoanCard key={String(loan.id)} loan={loan} />
          ))}

          {loans?.length === 0 && (
            <Text style={st.empty}>Você ainda não tem empréstimos.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  header:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  subtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 4 },
  loading:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:    { fontSize: fontSize.base, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: 40 },
});
