/**
 * GlobalOfertaOverlay
 *
 * Uber-style full-screen overlay that appears when a new funding offer
 * arrives for the authenticated investor. Slides up over whatever screen
 * is currently active, with a 30-second countdown to accept or decline.
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
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import InvestmentSlider from '@/components/InvestmentSlider';

const COUNTDOWN = 30;

type ResultState = 'accepted' | 'rejected' | 'expired';

export default function GlobalOfertaOverlay() {
  const { activeOffer, dismiss } = useOfertaOverlay();
  const { mutateAsync: respond }  = useRespondToOffer();
  const insets = useSafeAreaInsets();

  // ── Animation refs ──────────────────────────────────────────────────────
  const scrimOpacity  = useRef(new Animated.Value(0)).current;
  const sheetY        = useRef(new Animated.Value(600)).current;

  // ── Slider state ─────────────────────────────────────────────────────────
  const [adjustedCents, setAdjustedCents] = useState(0);

  // ── Timer ────────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const [result,      setResult]      = useState<ResultState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset & animate in whenever a new offer appears
  useEffect(() => {
    if (!activeOffer) return;

    setSecondsLeft(COUNTDOWN);
    setResult(null);
    setAdjustedCents(activeOffer.amountCents); // start at full offered amount

    // Fade scrim + slide sheet up
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

    // Countdown
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setResult('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [activeOffer?.id]);

  // Animate out after result shown, then dismiss
  const animateOut = () => {
    Animated.parallel([
      Animated.timing(scrimOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 600, duration: 280, useNativeDriver: true }),
    ]).start(() => dismiss());
  };

  const handleAccept = async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    try {
      await respond({ offerId: activeOffer.id, action: 'accepted', amountCents: adjustedCents });
    } catch (_) { /* silently continue — show result regardless */ }
    setResult('accepted');
  };

  const handleDecline = async () => {
    if (!activeOffer) return;
    clearInterval(intervalRef.current!);
    try {
      await respond({ offerId: activeOffer.id, action: 'rejected' });
    } catch (_) {}
    setResult('rejected');
  };

  if (!activeOffer) return null;

  const ratePct    = activeOffer.ratePct / 100;
  const maxCents   = activeOffer.amountCents;
  // Minimum: 25 % of the offered amount, floor at R$ 10 (1 000 cents), rounded to R$ 1
  const minCents   = Math.max(1_000, Math.round(maxCents * 0.25 / 100) * 100);
  const safeCents  = adjustedCents > 0 ? adjustedCents : maxCents;

  const adjR$      = safeCents / 100;
  const retornoR$  = Math.round(adjR$ * (ratePct / 100));
  const totalR$    = adjR$ + retornoR$;
  const termDays   = activeOffer.loan.termDays;
  const isUrgent   = secondsLeft <= 10;

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Result card ──────────────────────────────────────────────────────────
  const resultConfig: Record<ResultState, {
    icon: 'check' | 'x' | 'clock';
    bg: string; iconColor: string;
    title: string; sub: string;
  }> = {
    accepted: {
      icon: 'check', bg: C.dark, iconColor: '#fff',
      title: 'Oferta aceita!',
      sub: `R$ ${formatBRL(adjR$)} reservados.\nVocê será notificado quando a captação fechar.`,
    },
    rejected: {
      icon: 'x', bg: C.chipMuted, iconColor: C.inkSoft,
      title: 'Oferta recusada',
      sub: 'Sem problema. Vamos te avisar quando surgir outra oportunidade.',
    },
    expired: {
      icon: 'clock', bg: C.redBg, iconColor: C.red,
      title: 'Tempo esgotado',
      sub: 'Essa oferta foi repassada para outro credor.\nFique de olho na próxima.',
    },
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, s.scrim, { opacity: scrimOpacity }]}
      pointerEvents="box-none"
    >
      {/* Tap scrim only dismisses after result */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={result ? animateOut : undefined}
      />

      {/* Close = recusar — outside the card, top-right */}
      {!result && (
        <TouchableOpacity
          style={s.dismissBtn}
          onPress={handleDecline}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="x" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          s.sheet,
          { paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + spacing[5] },
          { transform: [{ translateY: sheetY }] },
        ]}
      >
        {result ? (
          /* ── Result state ── */
          <>
            <View style={[s.resultIcon, { backgroundColor: resultConfig[result].bg }]}>
              <Feather name={resultConfig[result].icon} size={28} color={resultConfig[result].iconColor} />
            </View>
            <Text style={s.resultTitle}>{resultConfig[result].title}</Text>
            <Text style={s.resultSub}>{resultConfig[result].sub}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={animateOut} activeOpacity={0.8}>
              <Text style={s.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── Active offer ── */
          <>
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

            {/* Investment slider */}
            <View style={s.sliderWrap}>
              <Text style={s.sliderEyebrow}>Valor a investir</Text>
              <InvestmentSlider
                minCents={minCents}
                maxCents={maxCents}
                valueCents={safeCents}
                onChange={setAdjustedCents}
              />
            </View>

            {/* Buttons */}
            <View style={s.btnRow}>
              <TouchableOpacity
                style={s.detalhesBtn}
                onPress={() => { animateOut(); router.push(`/ativo-detalhe?id=${activeOffer.id}&source=oferta` as any); }}
                activeOpacity={0.8}
              >
                <Text style={s.detalhesBtnText}>Ver detalhes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                <Feather name="check" size={18} color="#fff" />
                <Text style={s.acceptBtnText}>Aceitar oferta</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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

  // Buttons
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  detalhesBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: radii.lg, backgroundColor: C.chipMuted,
  },
  detalhesBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: C.ink },
  acceptBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 18, borderRadius: radii.lg, backgroundColor: C.dark,
  },
  acceptBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: '#fff' },

  // Result
  resultIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[4], marginTop: spacing[3],
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  resultSub: {
    fontSize: fontSize.md,
    color: C.inkSoft,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing[6],
  },
  closeBtn: {
    width: '100%', paddingVertical: 17,
    borderRadius: radii.lg, backgroundColor: C.chipMuted,
    alignItems: 'center',
  },
  closeBtnText: { fontSize: fontSize.md, fontFamily: fonts.bold, color: C.ink },
});
