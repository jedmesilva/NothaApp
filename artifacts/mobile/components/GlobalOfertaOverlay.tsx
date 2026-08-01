/**
 * GlobalOfertaOverlay
 *
 * Uber-style full-screen overlay that appears when a new funding offer
 * arrives for the authenticated investor. Slides up over whatever screen
 * is currently active, with a 30-second countdown to accept or decline.
 * On accept/decline/expire the overlay animates out and fires the
 * GlobalToast — same feedback element used everywhere else in the app.
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOfertaOverlay } from '@/contexts/OfertaOverlayContext';
import { useRespondToOffer } from '@/hooks/useInvestorOffers';
import { useToast } from '@/contexts/ToastContext';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import InvestmentSlider from '@/components/InvestmentSlider';

const COUNTDOWN = 30;

export default function GlobalOfertaOverlay() {
  const { activeOffer, dismiss } = useOfertaOverlay();
  const { mutateAsync: respond }  = useRespondToOffer();
  const { showToast }             = useToast();
  const insets = useSafeAreaInsets();

  // ── Animation refs ──────────────────────────────────────────────────────
  const scrimOpacity  = useRef(new Animated.Value(0)).current;
  const sheetY        = useRef(new Animated.Value(600)).current;

  // ── Slider state ─────────────────────────────────────────────────────────
  const [adjustedCents, setAdjustedCents] = useState(0);

  // ── Timer ────────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset & animate in whenever a new offer appears
  useEffect(() => {
    if (!activeOffer) return;

    setSecondsLeft(COUNTDOWN);
    setAdjustedCents(activeOffer.amountCents);

    Animated.parallel([
      Animated.timing(scrimOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(sheetY, {
        toValue: 0,
        damping: 26,
        stiffness: 300,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          handleExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [activeOffer?.id]);

  const animateOut = useCallback((onDone?: () => void) => {
    Animated.parallel([
      Animated.timing(scrimOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 600, duration: 280, useNativeDriver: true }),
    ]).start(() => { dismiss(); onDone?.(); });
  }, [dismiss]);

  const handleAccept = async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    const safeCents = adjustedCents > 0 ? adjustedCents : activeOffer.amountCents;
    const adjR$ = safeCents / 100;
    const formatBRL = (v: number) =>
      v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    try {
      await respond({ offerId: activeOffer.id, action: 'accepted', amountCents: safeCents });
    } catch (_) {}

    animateOut(() => {
      showToast({
        title: 'Oferta aceita!',
        subtitle: `R$ ${formatBRL(adjR$)} reservados em ${activeOffer.loan.contractId}`,
        actionLabel: 'Ver meus ativos',
        onAction: () => router.push('/ativos' as any),
        duration: 5000,
      });
    });
  };

  const handleDecline = async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    try {
      await respond({ offerId: activeOffer.id, action: 'rejected' });
    } catch (_) {}
    animateOut();
  };

  const handleExpire = useCallback(() => {
    animateOut();
  }, [animateOut]);

  if (!activeOffer) return null;

  const ratePct    = activeOffer.ratePct / 100;
  const maxCents   = activeOffer.amountCents;
  const minCents   = Math.max(1_000, Math.round(maxCents * 0.25 / 100) * 100);
  const safeCents  = adjustedCents > 0 ? adjustedCents : maxCents;

  const adjR$      = safeCents / 100;
  const retornoR$  = Math.round(adjR$ * (ratePct / 100));
  const totalR$    = adjR$ + retornoR$;
  const termDays   = activeOffer.loan.termDays;
  const isUrgent   = secondsLeft <= 10;

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, s.scrim, { opacity: scrimOpacity }]}
      pointerEvents="box-none"
    >
      {/* Tap scrim to decline */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDecline} />

      {/* Close = recusar — outside the card, top-right */}
      <TouchableOpacity
        style={s.dismissBtn}
        onPress={handleDecline}
        activeOpacity={0.8}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="x" size={18} color="#fff" />
      </TouchableOpacity>

      <Animated.View
        style={[
          s.sheet,
          { paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + spacing[5] },
          { transform: [{ translateY: sheetY }] },
        ]}
      >
        {/* Tappable area — navigates to detail screen */}
        <TouchableOpacity
          style={{ width: '100%', alignItems: 'center' }}
          activeOpacity={0.88}
          onPress={() => { animateOut(); router.push(`/ativo-detalhe?id=${activeOffer.id}&source=oferta` as any); }}
        >
          {/* Grabber */}
          <View style={s.grabber} />

          {/* Header row */}
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Feather name="clock" size={14} color={C.inkSoft} />
              <Text style={s.headerLabel}>Nova solicitação de investimento</Text>
            </View>
            <Text style={[s.countdown, { color: isUrgent ? C.red : C.ink }]}>
              {secondsLeft}s
            </Text>
          </View>

          {/* Hero */}
          <Text style={s.eyebrow}>Retorno oferecido</Text>
          <Text style={s.heroValue}>
            <Text style={s.heroSign}>+</Text>{ratePct}%
          </Text>
          <Text style={s.heroCaption}>
            Rendimento de R$ {formatBRL(retornoR$)} em {termDays} dias
          </Text>

          {/* Retorno total */}
          <View style={s.retornoRow}>
            <Text style={s.retornoLabel}>Retorno total</Text>
            <Text style={s.retornoValue}>R$ {formatBRL(totalR$)}</Text>
          </View>
        </TouchableOpacity>

        {/* Investment slider — separate from nav area to preserve drag */}
        <View style={s.sliderWrap}>
          <Text style={s.sliderEyebrow}>Valor a investir</Text>
          <InvestmentSlider
            minCents={minCents}
            maxCents={maxCents}
            valueCents={safeCents}
            onChange={setAdjustedCents}
          />
        </View>

        {/* Accept button */}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    alignItems: 'center',
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
    marginBottom: spacing[4],
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLabel: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  countdown: { fontFamily: fonts.display, fontSize: fontSize.base },

  // Hero
  eyebrow: {
    alignSelf: 'flex-start',
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    color: C.inkFaint,
    marginBottom: 4,
  },
  heroValue: {
    alignSelf: 'flex-start',
    fontFamily: fonts.display,
    fontSize: 52,
    color: C.ink,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  heroSign: { fontSize: 28, fontFamily: fonts.display },
  heroCaption: {
    alignSelf: 'flex-start',
    fontSize: fontSize['base+'],
    color: C.inkSoft,
    fontFamily: fonts.regular,
    marginBottom: spacing[5],
    marginTop: 4,
  },

  // Retorno total summary row
  retornoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: C.bg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },
  retornoLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  retornoValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: C.ink,
    letterSpacing: -0.3,
  },

  // Slider section
  sliderWrap: {
    width: '100%',
    backgroundColor: C.bg,
    borderRadius: radii.lg,
    padding: spacing[4],
    paddingBottom: spacing[3],
    marginBottom: spacing[5],
  },
  sliderEyebrow: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: spacing[3],
  },

  // Dismiss button (outside the card, top-right of overlay)
  dismissBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 38,
    height: 38,
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
    width: '100%',
    paddingVertical: 18,
    borderRadius: radii.lg,
    backgroundColor: C.dark,
  },
  acceptBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: '#fff' },
});
