import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  TextInput, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { formatBRL } from '@/data/loans';

// Histórico de chaves — persiste na sessão (em produção: AsyncStorage ou API)
const chavesHistorico: { chave: string; tipo: string; label: string }[] = [
  { chave: 'rafael@notha.com.br', tipo: 'Email', label: 'rafael@notha.com.br' },
  { chave: '11999887766',         tipo: 'Celular', label: '+55 (11) 99988-7766' },
  { chave: '123.456.789-00',      tipo: 'CPF', label: '123.456.789-00' },
];

function detectarTipo(chave: string): string {
  if (/^\d{11}$/.test(chave.replace(/\D/g, '')) && chave.includes('.')) return 'CPF';
  if (/^\d{14}$/.test(chave.replace(/\D/g, ''))) return 'CNPJ';
  if (/^\d{10,11}$/.test(chave.replace(/\D/g, ''))) return 'Celular';
  if (chave.includes('@')) return 'Email';
  if (/^[0-9a-f-]{36}$/i.test(chave)) return 'Chave aleatória';
  return 'Chave Pix';
}

export default function SaquePixScreen() {
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === 'web' ? 20 : insets.top;
  const params  = useLocalSearchParams<{ valor: string }>();
  const valorCentavos = Number(params.valor ?? 0);
  const valorReais    = valorCentavos / 100;

  const [chave, setChave]     = useState('');
  const [focado, setFocado]   = useState(false);
  const inputRef              = useRef<TextInput>(null);
  const shakeAnim             = useRef(new Animated.Value(0)).current;

  const podeConfirmar = chave.trim().length >= 5;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirmar = () => {
    if (!podeConfirmar) { shake(); return; }
    // Salva no histórico se ainda não estiver
    const chaveNormalizada = chave.trim();
    const jaExiste = chavesHistorico.some((c) => c.chave === chaveNormalizada);
    if (!jaExiste) {
      chavesHistorico.unshift({
        chave: chaveNormalizada,
        tipo: detectarTipo(chaveNormalizada),
        label: chaveNormalizada,
      });
      if (chavesHistorico.length > 5) chavesHistorico.pop();
    }
    router.push({
      pathname: '/saque-confirmacao',
      params: { valor: String(valorCentavos), chave: chaveNormalizada },
    });
  };

  const selecionarHistorico = (item: typeof chavesHistorico[0]) => {
    setChave(item.chave);
    inputRef.current?.focus();
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Chave Pix</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* Card valor */}
        <View style={s.valorCard}>
          <Text style={s.valorEyebrow}>Valor do saque</Text>
          <Text style={s.valorText}>R$ {formatBRL(valorReais)}</Text>
        </View>

        {/* Input da chave */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Para qual chave Pix?</Text>
          <Animated.View
            style={[
              s.inputCard,
              focado && s.inputCardFocado,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Feather name="key" size={16} color={focado ? C.ink : C.inkFaint} style={{ marginTop: 1 }} />
            <TextInput
              ref={inputRef}
              style={s.input}
              value={chave}
              onChangeText={setChave}
              placeholder="CPF, e-mail, celular ou chave aleatória"
              placeholderTextColor={C.inkFaint}
              onFocus={() => setFocado(true)}
              onBlur={() => setFocado(false)}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={C.ink}
            />
            {chave.length > 0 && (
              <TouchableOpacity onPress={() => setChave('')} activeOpacity={0.7}>
                <Feather name="x-circle" size={16} color={C.inkFaint} />
              </TouchableOpacity>
            )}
          </Animated.View>

          {chave.length >= 5 && (
            <View style={s.tipoRow}>
              <Feather name="check-circle" size={13} color={C.inkSoft} />
              <Text style={s.tipoText}>Tipo detectado: {detectarTipo(chave)}</Text>
            </View>
          )}
        </View>

        {/* Histórico de chaves */}
        {chavesHistorico.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Recentes</Text>
            <View style={s.historicoCard}>
              {chavesHistorico.map((item, idx) => (
                <TouchableOpacity
                  key={item.chave}
                  style={[
                    s.historicoRow,
                    idx === chavesHistorico.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
                  ]}
                  onPress={() => selecionarHistorico(item)}
                  activeOpacity={0.7}
                >
                  <View style={s.historicoIcon}>
                    <Feather
                      name={
                        item.tipo === 'Email' ? 'mail' :
                        item.tipo === 'Celular' ? 'smartphone' :
                        item.tipo === 'CPF' || item.tipo === 'CNPJ' ? 'user' : 'key'
                      }
                      size={15}
                      color={C.ink}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historicoLabel}>{item.label}</Text>
                    <Text style={s.historicoTipo}>{item.tipo}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={C.inkFaint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA fixo */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity
          style={[s.ctaBtn, !podeConfirmar && s.ctaBtnDisabled]}
          onPress={handleConfirmar}
          disabled={!podeConfirmar}
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, !podeConfirmar && s.ctaTextDisabled]}>
            Confirmar saque
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

  valorCard: {
    borderRadius: radii.hero,
    marginHorizontal: spacing[4],
    marginTop: 18,
    marginBottom: 6,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    backgroundColor: C.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valorEyebrow: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.onDarkSoft },
  valorText: {
    fontFamily: fonts.display,
    fontSize: fontSize['4xl'],
    color: '#fff',
    letterSpacing: -0.5,
  },

  section: { marginHorizontal: spacing[4], marginTop: 20 },
  sectionLabel: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: C.ink,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputCardFocado: { borderColor: C.ink },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: C.ink,
  },
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  tipoText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkSoft },

  historicoCard: {
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
  historicoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  historicoIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historicoLabel: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink, marginBottom: 2 },
  historicoTipo:  { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular },

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
