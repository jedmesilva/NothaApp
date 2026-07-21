import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { formatBRL } from '@/data/loans';

// Mock — em produção viria do contexto/API
const SALDO_CONTA = 8500;
const SALDO_MIN   = 1;

export default function SaqueValorScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [valorCentavos, setValorCentavos] = useState(0);
  const [inputText, setInputText]         = useState('');

  const valorReais  = valorCentavos / 100;
  const excedeSaldo = valorReais > SALDO_CONTA;
  const podeAvançar = valorCentavos >= SALDO_MIN * 100 && !excedeSaldo;

  const handleChangeText = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const centavos = digits === '' ? 0 : Math.min(parseInt(digits, 10), SALDO_CONTA * 100);
    setValorCentavos(centavos);
    // Formata como BRL enquanto digita (centavos)
    if (digits === '') {
      setInputText('');
    } else {
      const reais = centavos / 100;
      setInputText(
        reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      );
    }
  };

  const handleContinuar = () => {
    if (!podeAvançar) return;
    router.push({ pathname: '/saque-pix', params: { valor: String(valorCentavos) } });
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Sacar</Text>
      </View>

      {/* Hero dark card — valor */}
      <View style={s.heroCard}>
        <Text style={s.eyebrow}>Quanto quer sacar?</Text>

        <View style={s.valueRow}>
          <Text style={[s.prefix, valorCentavos === 0 && s.prefixDim]}>R$</Text>
          <TextInput
            style={s.input}
            value={inputText}
            onChangeText={handleChangeText}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor={C.onDarkFaint}
            selectionColor="rgba(255,255,255,0.5)"
            autoFocus
          />
        </View>

        {/* Linha de saldo disponível */}
        <View style={s.saldoRow}>
          <Feather name="info" size={13} color={excedeSaldo ? '#F87171' : C.onDarkSoft} />
          <Text style={[s.saldoText, excedeSaldo && s.saldoError]}>
            {excedeSaldo
              ? `Saldo insuficiente — disponível R$ ${formatBRL(SALDO_CONTA)}`
              : `Saldo disponível: R$ ${formatBRL(SALDO_CONTA)}`}
          </Text>
        </View>

        {/* Atalhos rápidos */}
        <View style={s.quickRow}>
          {[500, 1000, 2000, SALDO_CONTA].map((v) => (
            <TouchableOpacity
              key={v}
              style={[s.quickBtn, valorReais === v && s.quickBtnActive]}
              onPress={() => handleChangeText(String(v * 100))}
              activeOpacity={0.75}
            >
              <Text style={[s.quickBtnText, valorReais === v && s.quickBtnTextActive]}>
                {v === SALDO_CONTA ? 'Tudo' : `R$ ${formatBRL(v)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* CTA fixo */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity
          style={[s.ctaBtn, !podeAvançar && s.ctaBtnDisabled]}
          onPress={handleContinuar}
          disabled={!podeAvançar}
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, !podeAvançar && s.ctaTextDisabled]}>
            {podeAvançar ? `Sacar R$ ${formatBRL(valorReais)}` : 'Informe um valor'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 18,
    padding: spacing[6],
    backgroundColor: C.dark,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    color: C.onDarkSoft,
    marginBottom: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  prefix: {
    fontFamily: fonts.display,
    fontSize: fontSize['5xl'],
    color: '#fff',
  },
  prefixDim: { color: C.onDarkFaint },
  input: {
    fontFamily: fonts.display,
    fontSize: fontSize['7xl'],
    color: '#fff',
    letterSpacing: -1,
    flex: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.35)',
    paddingBottom: 4,
  },

  saldoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  saldoText: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.regular,
    color: C.onDarkSoft,
  },
  saldoError: { color: '#F87171' },

  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: C.onDarkSubtle,
    borderWidth: 1,
    borderColor: C.onDarkBorder,
  },
  quickBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  quickBtnText: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: 'rgba(255,255,255,0.7)' },
  quickBtnTextActive: { color: C.dark },

  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  ctaBtn: {
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnDisabled: { backgroundColor: C.chipUrgent },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },
  ctaTextDisabled: { color: C.inkFaint },
});
