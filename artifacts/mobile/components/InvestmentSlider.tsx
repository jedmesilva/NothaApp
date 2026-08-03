/**
 * InvestmentSlider
 *
 * A custom track-and-thumb slider built with PanResponder (no extra deps).
 * Lets the investor pick any amount between `minCents` and `maxCents`,
 * snapping to 100-cent (R$ 1) increments.
 *
 * Uses refs throughout so PanResponder callbacks are never stale, and
 * captures gestures before the parent ScrollView can claim them.
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

const THUMB_SIZE = 32;
const HIT_SLOP   = 20;            // extra touch area above / below the track
const TRACK_HEIGHT = 6;

interface Props {
  minCents: number;
  maxCents: number;
  valueCents: number;
  onChange: (cents: number) => void;
  showValue?: boolean;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvestmentSlider({
  minCents,
  maxCents,
  valueCents,
  onChange,
  showValue = true,
}: Props) {
  // ── Refs (always current — safe to read inside PanResponder closures) ───────
  const trackWidth   = useRef(0);
  const currentCents = useRef(valueCents);
  const minRef       = useRef(minCents);
  const maxRef       = useRef(maxCents);
  const onChangeRef  = useRef(onChange);
  const startX       = useRef(0);

  // Keep refs in sync on every render
  currentCents.current = valueCents;
  minRef.current       = minCents;
  maxRef.current       = maxCents;
  onChangeRef.current  = onChange;

  // ── PanResponder ────────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Capture phase — claim the touch BEFORE the parent ScrollView does
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: () => {
        // Record the pixel position of the thumb at touch start
        const range = maxRef.current - minRef.current;
        startX.current = range > 0
          ? ((currentCents.current - minRef.current) / range) * trackWidth.current
          : 0;
      },

      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        const newX   = startX.current + gs.dx;
        const ratio  = Math.max(0, Math.min(1, newX / trackWidth.current));
        const raw    = minRef.current + ratio * (maxRef.current - minRef.current);
        const snapped = Math.round(raw / 100) * 100;
        if (snapped !== currentCents.current) {
          onChangeRef.current(snapped);
        }
      },

      onPanResponderRelease: () => {},
    }),
  ).current;

  // ── Layout ──────────────────────────────────────────────────────────────────
  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const range   = maxCents - minCents;
  const fillPct = range > 0 ? ((valueCents - minCents) / range) * 100 : 0;
  const thumbX  = trackWidth.current > 0
    ? (range > 0 ? ((valueCents - minCents) / range) * trackWidth.current : 0)
    : 0;

  const isMin = valueCents <= minCents;
  const isMax = valueCents >= maxCents;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.wrap}>
      {/* Value label */}
      {showValue && (
        <View style={s.labelRow}>
          <Text style={s.valueLabel}>R$ {formatBRL(valueCents)}</Text>
          {isMax && <Text style={s.maxTag}>valor cheio</Text>}
          {isMin && <Text style={s.minTag}>mínimo</Text>}
        </View>
      )}

      {/* Gesture-capturing hit area + track */}
      <View
        style={s.trackWrap}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={s.track}>
          <View style={[s.fill, { width: `${fillPct}%` as any }]} />
        </View>
        <View style={[s.thumb, { left: thumbX - THUMB_SIZE / 2 }]} />
      </View>

      {/* Min / Max labels — same side margins as trackWrap so they align */}
      <View style={s.rangeRow}>
        <Text style={s.rangeLabel}>R$ {formatBRL(minCents)}</Text>
        <Text style={s.rangeLabel}>R$ {formatBRL(maxCents)}</Text>
      </View>
    </View>
  );
}

const SIDE = THUMB_SIZE / 2;   // margin that keeps thumb inside parent bounds

const s = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingBottom: spacing[1],
  },

  // ── Value label ─────────────────────────────────────────────────────────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing[3],
  },
  valueLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    color: C.ink,
    letterSpacing: -0.4,
  },
  maxTag: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.inkSoft,
    backgroundColor: C.chipMuted,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  minTag: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.amber,
    backgroundColor: C.amberBg,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // ── Track area ──────────────────────────────────────────────────────────────
  trackWrap: {
    height: THUMB_SIZE + HIT_SLOP * 2,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: C.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: C.dark,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: C.dark,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    top: HIT_SLOP,   // vertically centred within the hit area
  },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: C.inkFaint,
  },
});
