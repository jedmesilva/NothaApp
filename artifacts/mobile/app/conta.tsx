import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, ActionRow, SectionTitle, Eyebrow } from '@/components/ds';
import { useWallet, TRANSACTION_LABELS, type WalletTransaction } from '@/hooks/useWallet';

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function txLabel(tx: WalletTransaction): string {
  return tx.description ?? TRANSACTION_LABELS[tx.type] ?? tx.type;
}

export default function ContaScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const { data, isLoading, isError } = useWallet();

  const balanceCents   = data?.wallet.balanceCents ?? 0;
  const transactions   = data?.transactions ?? [];

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Minha Conta</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Saldo hero */}
        <View style={s.heroCard}>
          <Eyebrow context="dark">Saldo em conta</Eyebrow>
          {isLoading
            ? <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} />
            : <Text style={s.bigValue}>R$ {formatBRL(balanceCents)}</Text>
          }
          <ActionRow
            left={{  icon: 'arrow-down', label: 'Sacar',     context: 'dark', onPress: () => router.push('/saque-valor' as any) }}
            right={{ icon: 'plus',       label: 'Depositar', context: 'dark', onPress: () => router.push('/depositar' as any) }}
            style={{ marginTop: 20 }}
          />
        </View>

        {/* Extrato */}
        <View style={s.extratoCard}>
          <SectionTitle style={{ marginBottom: spacing[4] }}>Extrato</SectionTitle>

          {isLoading && (
            <ActivityIndicator color={C.inkFaint} style={{ paddingVertical: 24 }} />
          )}

          {isError && (
            <Text style={s.emptyText}>Não foi possível carregar o extrato.</Text>
          )}

          {!isLoading && !isError && transactions.length === 0 && (
            <Text style={s.emptyText}>Nenhuma movimentação ainda.</Text>
          )}

          {transactions.map((tx, idx) => (
            <View
              key={tx.id}
              style={[
                s.extratoRow,
                idx === transactions.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
              ]}
            >
              <View style={s.extratoIcon}>
                <Feather
                  name={tx.direction === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={15}
                  color={C.ink}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.extratoDesc}>{txLabel(tx)}</Text>
                <Text style={s.extratoData}>{formatDate(tx.createdAt)}</Text>
              </View>
              <Text style={[s.extratoValor, { color: tx.direction === 'credit' ? C.ink : C.inkSoft }]}>
                {tx.direction === 'credit' ? '+' : '−'} R$ {formatBRL(tx.amountCents)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingBottom: spacing[3],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  heroCard: {
    borderRadius: radii.hero, marginHorizontal: spacing[4], marginBottom: 14,
    padding: spacing[6], backgroundColor: C.dark,
  },
  bigValue: {
    fontFamily: fonts.display, fontSize: fontSize.hero,
    color: '#fff', letterSpacing: -1, lineHeight: 48,
  },

  extratoCard: {
    borderRadius: radii.cardLg, margin: spacing[4],
    padding: 22, backgroundColor: C.card,
  },
  extratoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingBottom: 14, marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  extratoIcon: {
    width: 36, height: 36, borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center', justifyContent: 'center',
  },
  extratoDesc:  { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink, marginBottom: 2 },
  extratoData:  { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular },
  extratoValor: { fontFamily: fonts.display, fontSize: fontSize['md+'] },
  emptyText:    { fontFamily: fonts.regular, fontSize: fontSize['sm+'], color: C.inkFaint, textAlign: 'center', paddingVertical: 24 },
});
