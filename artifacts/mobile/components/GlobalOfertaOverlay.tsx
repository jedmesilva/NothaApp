/**
 * GlobalOfertaOverlay
 *
 * Full-screen overlay for incoming funding offers. Slides up as a bottom
 * sheet styled consistently with the offer list cards — same DS components,
 * same visual hierarchy, no coloured section backgrounds.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOfertaOverlay } from '@/contexts/OfertaOverlayContext';
import { useRespondToOffer } from '@/hooks/useInvestorOffers';
import { useToast } from '@/contexts/ToastContext';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PoolBar, PoolLegend } from '@/components/ds';
import InvestmentSlider from '@/components/InvestmentSlider';

const COUNTDOWN = 30;

const CICLO_PLURAL: Record<string, string> = {
  diario: 'diários', semanal: 'semanais', mensal: 'mensais',
};
const CICLO_LABEL: Record<string, string> = {
  diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal',
};

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GlobalOfertaOverlay() {
  const { activeOffer, dismiss } = useOfertaOverlay();
  const { mutateAsync: respond } = useRespondToOffer();
  const { showToast }            = useToast();
  const insets = useSafeAreaInsets();

  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const sheetY       = useRef(new Animated.Value(700)).current;

  const [adjustedCents, setAdjustedCents] = useState(0);
  const [secondsLeft,   setSecondsLeft]   = useState(COUNTDOWN);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeOffer) return;

    setSecondsLeft(COUNTDOWN);
    setAdjustedCents(activeOffer.maxAmountCents);

    Animated.parallel([
      Animated.timing(scrimOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(sheetY, {
        toValue: 0, damping: 26, stiffness: 300, mass: 0.85, useNativeDriver: true,
      }),
    ]).start();

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(intervalRef.current!); handleExpire(); return 0; }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [activeOffer?.id]);

  const animateOut = useCallback((onDone?: () => void) => {
    Animated.parallel([
      Animated.timing(scrimOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 700, duration: 280, useNativeDriver: true }),
    ]).start(() => { dismiss(); onDone?.(); });
  }, [dismiss]);

  const handleAccept = async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    const safeCents = adjustedCents > 0 ? adjustedCents : activeOffer.maxAmountCents;
    try {
      await respond({ offerId: activeOffer.id, action: 'accepted', amountCents: safeCents });
    } catch (_) {}
    animateOut(() => {
      showToast({
        title: 'Oferta aceita!',
        subtitle: `R$ ${formatBRL(safeCents / 100)} reservados em ${activeOffer.loan.contractId}`,
        actionLabel: 'Ver meus ativos',
        onAction: () => router.push('/ativos' as any),
        duration: 5000,
      });
    });
  };

  const handleDecline = useCallback(async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    try { await respond({ offerId: activeOffer.id, action: 'rejected' }); } catch (_) {}
    animateOut();
  }, [activeOffer, animateOut]);

  const handleExpire = useCallback(() => { animateOut(); }, [animateOut]);

  if (!activeOffer) return null;

  // ── Derived values (same formulas as ofertas.tsx) ─────────────────────────
  const ratePct       = activeOffer.ratePct / 100;                        // e.g. 12.50
  const maxCents      = activeOffer.maxAmountCents;
  const minCents      = activeOffer.minAmountCents > 0 ? activeOffer.minAmountCents : Math.max(1_000, Math.round(maxCents * 0.25 / 100) * 100);
  const safeCents     = adjustedCents > 0 ? adjustedCents : maxCents;
  const valorR$       = safeCents / 100;
  const retornoValor  = Math.round(valorR$ * (ratePct / 100));
  const totalPedidoR$ = activeOffer.loan.amountCents / 100;
  // Quanto já foi captado sem contar esta oferta — evita dupla-contagem
  const jaCaptadoR$   = Math.max(0, activeOffer.loan.fundedAmountCents - maxCents) / 100;
  const pctCaptado    = Math.round((jaCaptadoR$ / totalPedidoR$) * 100);
  const pctTotal      = Math.round(((jaCaptadoR$ + valorR$) / totalPedidoR$) * 100);
  const pctOferta     = Math.max(0, pctTotal - pctCaptado);
  const ciclo         = activeOffer.loan.cycle;
  const isUrgent      = secondsLeft <= 10;

  const bottomPad = (Platform.OS === 'ios' ? insets.bottom : 0) + spacing[5];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, s.scrim, { opacity: scrimOpacity }]}
      pointerEvents="box-none"
    >
      {/* Scrim tap = decline */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDecline} />

      {/* Dismiss button — top-right, outside the sheet */}
      <TouchableOpacity
        style={s.dismissBtn}
        onPress={handleDecline}
        activeOpacity={0.8}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="x" size={18} color="#fff" />
      </TouchableOpacity>

      <Animated.View
        style={[s.sheet, { paddingBottom: bottomPad }, { transform: [{ translateY: sheetY }] }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.scrollContent}
        >
          {/* ── Tap area for navigation ── */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => { animateOut(); router.push(`/ativo-detalhe?id=${activeOffer.id}&source=oferta` as any); }}
          >
            {/* Eyebrow + countdown (same layout as eyebrow + score badge) */}
            <View style={s.topRow}>
              <Text style={s.eyebrow}>Retorno oferecido</Text>
              <View style={[s.countdownBadge, isUrgent && s.countdownBadgeUrgent]}>
                <Feather name="clock" size={11} color={isUrgent ? C.red : C.inkFaint} />
                <Text style={[s.countdownText, isUrgent && s.countdownTextUrgent]}>
                  {secondsLeft}s
                </Text>
              </View>
            </View>

            {/* Hero value */}
            <Text style={s.heroValue}>
              <Text style={s.heroSign}>+</Text>{ratePct}%
            </Text>
            <Text style={s.heroCaption}>
              Rendimento de R$ {formatBRL(retornoValor)} em {activeOffer.loan.termDays} dias
            </Text>

          </TouchableOpacity>

          {/* ── Divisor + 3 colunas: Investimento | Retorno | Prazo + Slider ── */}
          <View style={s.divider} />
          <View style={s.metricRow}>
            <View>
              <Text style={s.metricLabel}>Investimento</Text>
              <Text style={s.metricValue}>R$ {formatBRL(valorR$)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.metricLabel}>Retorno</Text>
              <Text style={s.metricValue}>R$ {formatBRL(valorR$ + retornoValor)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.metricLabel}>Prazo</Text>
              <Text style={s.metricValue}>{activeOffer.loan.termDays} dias</Text>
            </View>
          </View>

          {/* ── Slider — mesma seção das métricas ── */}
          <View style={s.sliderSection}>
            <InvestmentSlider
              minCents={minCents}
              maxCents={maxCents}
              valueCents={safeCents}
              onChange={setAdjustedCents}
              showValue={false}
            />
          </View>

          {/* ── Divisor + Captação ── */}
          <View style={s.divider} />
          <PoolBar
            label="Captação"
            headLeft={`${pctCaptado}% captado`}
            headRight={`R$ ${formatBRL(jaCaptadoR$)} de R$ ${formatBRL(totalPedidoR$)}`}
            segments={[
              { pct: pctCaptado, variant: 'primary'   },
              { pct: pctOferta,  variant: 'secondary' },
            ]}
            style={{ marginBottom: 20 }}
            footer={
              <PoolLegend items={[
                { color: C.ink,      label: 'captado'     },
                { color: C.inkFaint, label: 'esta oferta' },
                { color: C.line,     label: 'captando'    },
              ]} />
            }
          />

          {/* ── Divisor + Pagamento — só label + parcelas (oferta: nada pago ainda) ── */}
          <View style={s.divider} />
          <View style={s.paymentHint}>
            <Text style={s.paymentHintLabel}>Pagamento</Text>
            <Text style={s.paymentHintValue}>
              {activeOffer.loan.installmentsTotal > 0
                ? `${activeOffer.loan.installmentsTotal} ${activeOffer.loan.installmentsTotal === 1 ? 'parcela' : 'parcelas'} ${CICLO_PLURAL[ciclo] ?? ''}`
                : '—'}
            </Text>
          </View>
        </ScrollView>

        {/* Accept button — pinned at bottom */}
        <TouchableOpacity style={s.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={s.acceptBtnText}>Aceitar oferta</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  scrim: {
    backgroundColor: C.scrimHeavy,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },

  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 24,
  },

  grabber: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: C.line,
    alignSelf: 'center',
    marginBottom: spacing[5],
  },

  scrollContent: {
    paddingBottom: spacing[5],
  },

  // Eyebrow + countdown row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    color: C.inkFaint,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: C.bg,
  },
  countdownBadgeUrgent: {
    backgroundColor: '#FBEAE8',
  },
  countdownText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: C.inkFaint,
  },
  countdownTextUrgent: {
    color: C.red,
  },

  // Hero
  heroValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.mega,
    color: C.ink,
    letterSpacing: -1.1,
    lineHeight: 50,
    marginBottom: 8,
  },
  heroSign: { fontSize: 24, fontFamily: fonts.display },
  heroCaption: {
    fontSize: fontSize['sm+'],
    color: C.inkSoft,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },

  // Seções — mesma estrutura do card de ativos
  divider:     { height: 1, backgroundColor: C.line, marginBottom: 18 },
  metricRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metricLabel: { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 },
  metricValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink, letterSpacing: -0.3 },
  paymentHint:       { paddingHorizontal: spacing[4], paddingBottom: spacing[6], gap: 4 },
  paymentHintLabel:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', color: C.onDarkMid },
  paymentHintValue:  { fontFamily: fonts.display, fontSize: fontSize.lg, color: '#fff' },

  // Slider
  sliderSection: {
    marginBottom: spacing[2],
  },
  sliderLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
    color: C.inkFaint,
    textTransform: 'uppercase',
    marginBottom: spacing[3],
  },

  // Dismiss (outside sheet, top-right)
  dismissBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  // Accept button
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: radii.lg,
    backgroundColor: C.dark,
    marginTop: spacing[4],
  },
  acceptBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: '#fff' },
});
