import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, ActionRow, SectionTitle, Eyebrow } from '@/components/ds';
import { formatBRL } from '@/data/loans';

const saldoConta = 8500;

const extrato = [
  { id: 1, desc: 'Depósito via Pix',    data: '10 de julho', valor: 500,  tipo: 'entrada' },
  { id: 2, desc: 'Pagamento de vencimento', data: '05 de julho', valor: -331, tipo: 'saida'  },
  { id: 3, desc: 'Saque',               data: '28 de junho',  valor: -300, tipo: 'saida'  },
  { id: 4, desc: 'Empréstimo liberado',  data: '20 de junho',  valor: 3200, tipo: 'entrada'},
];

export default function ContaScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Minha Conta</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Saldo hero */}
        <View style={s.heroCard}>
          <Eyebrow context="dark">Saldo em conta</Eyebrow>
          <Text style={s.bigValue}>R$ {formatBRL(saldoConta)}</Text>
          <ActionRow
            left={{ icon: 'arrow-down', label: 'Sacar',    context: 'dark' }}
            right={{ icon: 'plus',      label: 'Depositar', context: 'dark' }}
            style={{ marginTop: 20 }}
          />
        </View>

        {/* Extrato */}
        <View style={s.extratoCard}>
          <SectionTitle style={{ marginBottom: spacing[4] }}>Extrato</SectionTitle>
          {extrato.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.extratoRow,
                idx === extrato.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
              ]}
            >
              <View style={s.extratoIcon}>
                <Feather
                  name={item.tipo === 'entrada' ? 'arrow-down' : 'arrow-up'}
                  size={15}
                  color={C.ink}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.extratoDesc}>{item.desc}</Text>
                <Text style={s.extratoData}>{item.data}</Text>
              </View>
              <Text style={[s.extratoValor, { color: item.tipo === 'entrada' ? C.ink : C.inkSoft }]}>
                {item.tipo === 'entrada' ? '+' : '−'} R$ {formatBRL(Math.abs(item.valor))}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  heroCard: {
    borderRadius: radii.hero,
    marginHorizontal: spacing[4],
    marginBottom: 14,
    padding: spacing[6],
    backgroundColor: C.dark,
  },
  bigValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
  },
  extratoCard: {
    borderRadius: radii.cardLg,
    margin: spacing[4],
    padding: 22,
    backgroundColor: C.card,
  },
  extratoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  extratoIcon: {
    width: 36, height: 36,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extratoDesc:  { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink, marginBottom: 2 },
  extratoData:  { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular },
  extratoValor: { fontFamily: fonts.display, fontSize: fontSize['md+'] },
});
