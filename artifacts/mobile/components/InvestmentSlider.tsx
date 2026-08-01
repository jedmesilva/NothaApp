/**
 * InvestmentSlider
 *
 * A custom track-and-thumb slider built with PanResponder (no extra deps).
 * Lets the investor pick any amount between `minCents` and `maxCents`,
 * snapping to 100-cent (R$ 1) increments.
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;

interface Props {
  minCents: number;
  maxCents: number;
  valueCents: number;
  onChange: (cents: number) => void;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvestmentSlider({ minCents, maxCents, valueCents, onChange }: Props) {
  const trackWidth = useRef(0);
  const currentCents = useRef(valueCents);

  // Keep ref in sync for use inside PanResponder callbacks
  currentCents.current = valueCents;

  const centsToX = useCallback(
    (cents: number) => {
      if (trackWidth.current === 0) return 0;
      const ratio = (cents - minCents) / (maxCents - minCents);
      return ratio * trackWidth.current;
    },
    [minCents, maxCents],
  );

  const xToCents = useCallback(
    (x: number) => {
      if (trackWidth.current === 0) return minCents;
      const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
      const raw = minCents + ratio * (maxCents - minCents);
      // Snap to R$ 1 increments
      return Math.round(raw / 100) * 100;
    },
    [minCents, maxCents],
  );

  const startX = useRef(0);
  const startCents = useRef(valueCents);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        startX.current = centsToX(currentCents.current);
        startCents.current = currentCents.current;
      },
      onPanResponderMove: (_, gs) => {
        const newX = startX.current + gs.dx;
        const newCents = xToCents(newX);
        if (newCents !== currentCents.current) {
          onChange(newCents);
        }
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const thumbX = trackWidth.current > 0
    ? centsToX(valueCents)
    : 0;

  const fillPct = maxCents > minCents
    ? ((valueCents - minCents) / (maxCents - minCents)) * 100
    : 0;

  const isMin = valueCents <= minCents;
  const isMax = valueCents >= maxCents;

  return (
    <View style={s.wrap}>
      {/* Value label above thumb */}
      <View style={s.labelRow}>
        <Text style={s.valueLabel}>R$ {formatBRL(valueCents)}</Text>
        {isMax && <Text style={s.maxTag}>valor cheio</Text>}
        {isMin && <Text style={s.minTag}>mínimo</Text>}
      </View>

      {/* Track + thumb hit area */}
      <View style={s.trackWrap} onLayout={onLayout} {...panResponder.panHandlers}>
        {/* Track background */}
        <View style={s.track}>
          {/* Filled portion */}
          <View style={[s.fill, { width: `${fillPct}%` as any }]} />
        </View>

        {/* Thumb */}
        <View
          style={[
            s.thumb,
            { left: thumbX - THUMB_SIZE / 2 },
          ]}
        />
      </View>

      {/* Min / Max labels */}
      <View style={s.rangeRow}>
        <Text style={s.rangeLabel}>R$ {formatBRL(minCents)}</Text>
        <Text style={s.rangeLabel}>R$ {formatBRL(maxCents)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingBottom: spacing[2],
  },

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

  // Outer area that captures gestures (tall for easy touch).
  // marginHorizontal: THUMB_SIZE / 2 shrinks the measured width so the thumb
  // never overflows: at min thumbX=0 → left=-14 sits inside the margin;
  // at max thumbX=trackWidth → right edge sits inside the opposite margin.
  trackWrap: {
    marginHorizontal: THUMB_SIZE / 2,
    height: THUMB_SIZE + 16,
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
    // White inner dot
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    top: (THUMB_SIZE + 16 - THUMB_SIZE) / 2,
  },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: C.inkFaint,
  },
});
