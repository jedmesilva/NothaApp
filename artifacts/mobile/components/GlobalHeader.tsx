import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useArea } from '@/contexts/AreaContext';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipUrgent: '#ECECEF',
};

const extrato = [
  { id: 1, desc: 'Depósito via Pix', data: '10 de julho', valor: 500, tipo: 'entrada' },
  { id: 2, desc: 'Pagamento de parcela', data: '05 de julho', valor: -331, tipo: 'saida' },
  { id: 3, desc: 'Saque', data: '28 de junho', valor: -300, tipo: 'saida' },
  { id: 4, desc: 'Empréstimo liberado', data: '20 de junho', valor: 3200, tipo: 'entrada' },
];

const saldoConta = 8500;

function formatBRL(v: number) {
  return Math.round(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function GlobalHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { area, setArea } = useArea();
  const [showConta, setShowConta] = useState(false);

  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const switchArea = (tab: 'credito' | 'investir') => {
    setArea(tab);
    // Navigate to index so index.tsx can scroll to the right page
    router.navigate('/');
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: topPad }]}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => setShowConta(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>R</Text>
        </TouchableOpacity>

        {/* Crédito / Investir toggle */}
        <View style={styles.tabWrap}>
          <TouchableOpacity
            style={[styles.tabBtn, area === 'credito' && styles.tabBtnActive]}
            onPress={() => switchArea('credito')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, { color: area === 'credito' ? '#fff' : C.inkSoft }]}>
              Crédito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, area === 'investir' && styles.tabBtnActive]}
            onPress={() => switchArea('investir')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, { color: area === 'investir' ? '#fff' : C.inkSoft }]}>
              Investir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bell */}
        <View style={styles.bellWrap}>
          <Ionicons name="notifications-outline" size={19} color={C.ink} />
          <View style={styles.notifDot} />
        </View>
      </View>

      {/* Conta Modal */}
      <Modal
        visible={showConta}
        animationType="slide"
        onRequestClose={() => setShowConta(false)}
      >
        <View style={[styles.contaScreen, { paddingTop: topPad }]}>
          <View style={styles.contaHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setShowConta(false)}
              activeOpacity={0.8}
            >
              <Feather name="arrow-left" size={18} color={C.ink} />
            </TouchableOpacity>
            <Text style={styles.contaTitle}>Minha Conta</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.primaryCard}>
              <Text style={styles.eyebrow}>Saldo em conta</Text>
              <Text style={[styles.bigValue, { marginBottom: 8 }]}>R$ {formatBRL(saldoConta)}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtnDark} activeOpacity={0.8}>
                  <Feather name="arrow-down" size={16} color="#fff" />
                  <Text style={styles.actionBtnDarkText}>Sacar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnDark} activeOpacity={0.8}>
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={styles.actionBtnDarkText}>Depositar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.secondaryCard, { margin: 16 }]}>
              <Text style={styles.sectionTitle}>Extrato</Text>
              {extrato.map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.extratoRow,
                    idx === extrato.length - 1 && {
                      borderBottomWidth: 0,
                      marginBottom: 0,
                      paddingBottom: 0,
                    },
                  ]}
                >
                  <View style={styles.extratoIcon}>
                    <Feather
                      name={item.tipo === 'entrada' ? 'arrow-down' : 'arrow-up'}
                      size={15}
                      color={C.ink}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.extratoDesc}>{item.desc}</Text>
                    <Text style={styles.extratoData}>{item.data}</Text>
                  </View>
                  <Text
                    style={[
                      styles.extratoValor,
                      { color: item.tipo === 'entrada' ? C.ink : C.inkSoft },
                    ]}
                  >
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: C.bg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16 },
  tabWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 999,
    padding: 4,
    marginHorizontal: 14,
    maxWidth: 240,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  tabBtnActive: { backgroundColor: C.dark },
  tabLabel: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold' },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.ink,
    borderWidth: 1.5,
    borderColor: C.card,
  },
  // Conta modal
  contaScreen: { flex: 1, backgroundColor: C.bg },
  contaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contaTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: C.ink,
    letterSpacing: -0.2,
  },
  primaryCard: {
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 24,
    backgroundColor: C.dark,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 10,
  },
  bigValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 42,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtnDark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  actionBtnDarkText: { fontSize: 14.5, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  secondaryCard: { borderRadius: 24, padding: 22, backgroundColor: C.card },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: C.ink,
    marginBottom: 16,
  },
  extratoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  extratoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extratoDesc: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold', color: C.ink, marginBottom: 2 },
  extratoData: { fontSize: 12, color: C.inkFaint, fontFamily: 'Inter_400Regular' },
  extratoValor: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14.5 },
});
