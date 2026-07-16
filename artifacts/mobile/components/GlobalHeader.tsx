import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useArea } from '@/contexts/AreaContext';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, ActionRow } from '@/components/ds';
import { formatBRL } from '@/data/loans';

const extrato = [
  { id: 1, desc: 'Depósito via Pix',    data: '10 de julho', valor: 500,   tipo: 'entrada' },
  { id: 2, desc: 'Pagamento de parcela', data: '05 de julho', valor: -331,  tipo: 'saida' },
  { id: 3, desc: 'Saque',               data: '28 de junho',  valor: -300,  tipo: 'saida' },
  { id: 4, desc: 'Empréstimo liberado',  data: '20 de junho',  valor: 3200,  tipo: 'entrada' },
];

const saldoConta = 8500;

export default function GlobalHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { area, setArea } = useArea();
  const [showConta, setShowConta] = useState(false);

  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const switchArea = (tab: 'credito' | 'investir') => {
    setArea(tab);
    router.navigate('/');
  };

  return (
    <>
      <View style={[s.header, { paddingTop: topPad }]}>
        {/* Avatar */}
        <TouchableOpacity style={s.avatar} onPress={() => setShowConta(true)} activeOpacity={0.8}>
          <Text style={s.avatarText}>R</Text>
        </TouchableOpacity>

        {/* Crédito / Investir toggle */}
        <View style={s.tabWrap}>
          <TouchableOpacity
            style={[s.tabBtn, area === 'credito' && s.tabBtnActive]}
            onPress={() => switchArea('credito')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabLabel, { color: area === 'credito' ? '#fff' : C.inkSoft }]}>
              Crédito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, area === 'investir' && s.tabBtnActive]}
            onPress={() => switchArea('investir')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabLabel, { color: area === 'investir' ? '#fff' : C.inkSoft }]}>
              Investir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bell */}
        <View style={s.bellWrap}>
          <Ionicons name="notifications-outline" size={19} color={C.ink} />
          <View style={s.notifDot} />
        </View>
      </View>

      {/* Conta Modal */}
      <Modal visible={showConta} animationType="slide" onRequestClose={() => setShowConta(false)}>
        <View style={[s.contaScreen, { paddingTop: topPad }]}>
          {/* Header */}
          <View style={s.contaHeader}>
            <BackButton onPress={() => setShowConta(false)} />
            <Text style={s.contaTitle}>Minha Conta</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Dark hero card */}
            <View style={s.primaryCard}>
              <Text style={s.eyebrow}>Saldo em conta</Text>
              <Text style={s.bigValue}>R$ {formatBRL(saldoConta)}</Text>
              <ActionRow
                left={{ icon: 'arrow-down', label: 'Sacar',    context: 'dark' }}
                right={{ icon: 'plus',      label: 'Depositar', context: 'dark' }}
                style={{ marginTop: 20 }}
              />
            </View>

            {/* Extrato card */}
            <View style={[s.secondaryCard, { margin: spacing[4] }]}>
              <Text style={s.sectionTitle}>Extrato</Text>
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
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
    backgroundColor: C.bg,
  },
  avatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.display, fontSize: fontSize.xl },
  tabWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: radii.full,
    padding: 4,
    marginHorizontal: 14,
    maxWidth: 240,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radii.full },
  tabBtnActive: { backgroundColor: C.dark },
  tabLabel: { fontSize: fontSize['base+'], fontFamily: fonts.semibold },
  bellWrap: {
    width: 40, height: 40,
    borderRadius: radii.xl,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8, right: 9,
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: C.ink,
    borderWidth: 1.5, borderColor: C.card,
  },
  // Conta modal
  contaScreen: { flex: 1, backgroundColor: C.bg },
  contaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: 4,
  },
  contaTitle: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  primaryCard: {
    borderRadius: radii.hero,
    marginHorizontal: spacing[4],
    marginBottom: 14,
    padding: spacing[6],
    backgroundColor: C.dark,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    color: C.onDarkSoft,
    marginBottom: 10,
  },
  bigValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
  },
  secondaryCard: { borderRadius: radii.cardLg, padding: 22, backgroundColor: C.card },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink, marginBottom: spacing[4] },
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
