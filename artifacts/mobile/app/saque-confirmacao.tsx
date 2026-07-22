import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView,
  Animated, Easing, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { formatBRL } from '@/data/loans';

function detectarTipo(chave: string): string {
  const digits = chave.replace(/\D/g, '');
  if (chave.includes('@')) return 'E-mail';
  if (digits.length === 11 && chave.includes('.')) return 'CPF';
  if (digits.length === 14) return 'CNPJ';
  if (digits.length >= 10 && digits.length <= 11) return 'Celular';
  if (/^[0-9a-f-]{36}$/i.test(chave)) return 'Chave aleatória';
  return 'Chave Pix';
}

function iconePorTipo(tipo: string): string {
  if (tipo === 'E-mail') return 'mail';
  if (tipo === 'Celular') return 'smartphone';
  if (tipo === 'CPF' || tipo === 'CNPJ') return 'user';
  return 'key';
}

// Em produção: lookup via API do Banco Central (DICT)
function dadosFicticiosPorChave(chave: string) {
  if (chave.includes('@')) return { nome: 'Rafael Mendes', banco: 'Nubank', agencia: null };
  const digits = chave.replace(/\D/g, '');
  if (digits.length >= 10) return { nome: 'Rafael M.', banco: 'Itaú Unibanco', agencia: '0001' };
  return { nome: 'Destinatário', banco: 'Banco desconhecido', agencia: null };
}

// Duração do estado de processamento antes de navegar (ms)
const PROCESSING_DURATION = 2400;

export default function SaqueConfirmacaoScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const params = useLocalSearchParams<{ valor: string; chave: string }>();

  const valorCentavos = Number(params.valor ?? 0);
  const valorReais    = valorCentavos / 100;
  const chave         = params.chave ?? '';
  const tipo          = detectarTipo(chave);
  const icone         = iconePorTipo(tipo);
  const dados         = dadosFicticiosPorChave(chave);

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const horaFormatada = hoje.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  });

  // --- Loading state ---
  const [loading, setLoading] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale     = useRef(new Animated.Value(1)).current;
  const pulseOpacity   = useRef(new Animated.Value(0.15)).current;

  // Loop de pulso enquanto processa
  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale,   { toValue: 1.18, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0,    duration: 800, easing: Easing.in(Easing.ease),   useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale,   { toValue: 1,    duration: 0,   useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.15, duration: 0,   useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loading]);

  const handleConfirmar = () => {
    if (loading) return;
    setLoading(true);

    // Fade in do overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    // Navega após a duração de processamento
    setTimeout(() => {
      router.push({
        pathname: '/saque-comprovante',
        params: { valor: String(valorCentavos), chave },
      });
    }, PROCESSING_DURATION);
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => !loading && router.back()} />
        <Text style={s.title}>Confirmação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        pointerEvents={loading ? 'none' : 'auto'}
      >
        {/* Valor em destaque */}
        <View style={s.heroCard}>
          <Text style={s.eyebrow}>Você está sacando</Text>
          <Text style={s.heroValor}>R$ {formatBRL(valorReais)}</Text>
          <View style={s.instanteRow}>
            <Feather name="zap" size={13} color={C.onDarkSoft} />
            <Text style={s.instanteText}>Transferência Pix instantânea</Text>
          </View>
        </View>

        {/* Destinatário */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Para</Text>
          <View style={s.destinatarioCard}>
            <View style={s.destinatarioIconWrap}>
              <Feather name={icone as any} size={20} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.destinatarioNome}>{dados.nome}</Text>
              <Text style={s.destinatarioBanco}>{dados.banco}{dados.agencia ? ` · Ag. ${dados.agencia}` : ''}</Text>
              <View style={s.chaveRow}>
                <Text style={s.chaveTipo}>{tipo}</Text>
                <Text style={s.chaveValor} numberOfLines={1} ellipsizeMode="middle">{chave}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resumo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Resumo</Text>
          <View style={s.resumoCard}>
            <ResumoRow label="Valor"  value={`R$ ${formatBRL(valorReais)}`} />
            <ResumoRow label="Tipo"   value="Pix" />
            <ResumoRow label="Data"   value={dataFormatada} />
            <ResumoRow label="Hora prevista" value={horaFormatada} last />
          </View>
        </View>

        {/* Aviso */}
        <View style={s.avisoCard}>
          <Feather name="info" size={14} color={C.inkFaint} style={{ marginTop: 1 }} />
          <Text style={s.avisoText}>
            Verifique os dados antes de confirmar. Transferências Pix não podem ser canceladas após o envio.
          </Text>
        </View>
      </ScrollView>

      {/* CTAs fixos */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={s.ctaDouble}>
          <TouchableOpacity
            style={[s.ctaBtnGhost, loading && s.ctaBtnHidden]}
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.75}
          >
            <Text style={s.ctaGhostText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctaBtn, loading && s.ctaBtnLoading]}
            onPress={handleConfirmar}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="check" size={16} color="#fff" />
            )}
            <Text style={s.ctaText}>
              {loading ? 'Processando...' : 'Confirmar saque'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay de processamento */}
      <Animated.View
        style={[s.overlay, { opacity: overlayOpacity }]}
        pointerEvents={loading ? 'auto' : 'none'}
      >
        {/* Círculo central com spinner */}
        <View style={s.overlayCircle}>
          <ActivityIndicator size="large" color="#fff" />
        </View>

        <Text style={s.overlayTitle}>Processando</Text>
        <Text style={s.overlaySubtitle}>
          Enviando{'\u00A0'}R${'\u00A0'}{formatBRL(valorReais)} via Pix…
        </Text>
      </Animated.View>
    </View>
  );
}

function ResumoRow({
  label, value, last = false,
}: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[rr.row, last && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
      <Text style={rr.label}>{label}</Text>
      <Text style={rr.value}>{value}</Text>
    </View>
  );
}

const rr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: spacing[4],
  },
  label: { fontSize: fontSize['base+'], fontFamily: fonts.regular, color: C.inkSoft },
  value: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink, textAlign: 'right' },
});

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
    marginBottom: 6,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    backgroundColor: C.dark,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    color: C.onDarkSoft,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  heroValor: {
    fontFamily: fonts.display,
    fontSize: fontSize.display,
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 12,
  },
  instanteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  instanteText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.onDarkSoft },

  section: { marginHorizontal: spacing[4], marginTop: 20 },
  sectionLabel: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: C.ink,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  destinatarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    padding: spacing[4],
  },
  destinatarioIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  destinatarioNome:  { fontFamily: fonts.bold, fontSize: fontSize.lg, color: C.ink, marginBottom: 2 },
  destinatarioBanco: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: C.inkSoft, marginBottom: 6 },
  chaveRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chaveTipo: {
    fontSize: fontSize['2xs'],
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  chaveValor: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkSoft, flex: 1 },

  resumoCard: {
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[1],
  },

  avisoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: 16,
    padding: spacing[4],
    backgroundColor: C.chipMuted,
    borderRadius: radii.lg,
  },
  avisoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: C.inkSoft,
    lineHeight: 18,
  },

  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  ctaDouble: { flexDirection: 'row', gap: spacing[3] },
  ctaBtnGhost: {
    flex: 1,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: C.chipUrgent,
  },
  ctaBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
  },
  ctaText:      { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },
  ctaGhostText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: C.ink },
  ctaBtnLoading: { backgroundColor: C.inkSoft },
  ctaBtnHidden:  { opacity: 0 },

  // Overlay de processamento
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  overlayCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overlayTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: '#fff',
    letterSpacing: -0.3,
  },
  overlaySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: C.onDarkSoft,
  },
});
