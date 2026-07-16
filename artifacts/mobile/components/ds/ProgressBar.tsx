/**
 * PoolBar — labelled progress bar used throughout the app for:
 *  - captação progress  (how much of a loan has been funded)
 *  - pagamento progress (how much of a loan has been paid)
 *  - limite utilizado   (credit limit usage)
 *
 * Supports:
 *  - Single segment (simple fill)
 *  - Two segments (captado + minha posição)
 *  - light / dark context (inverts track & fill colors)
 *
 * Usage:
 *   <PoolBar
 *     label="CAPTAÇÃO DO PEDIDO"
 *     headLeft="62% captado"
 *     headRight="R$ 3.100 de R$ 5.000"
 *     segments={[{ pct: 62, variant: 'primary' }, { pct: 10, variant: 'secondary' }]}
 *     context="light"
 *     footer={<PoolLegend items={[...]} />}
 *   />
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, fontSize, fonts, radii } from '@/constants/theme';

export type PoolSegment = {
  pct: number;
  /** primary = solid ink/white; secondary = faint/stripe */
  variant: 'primary' | 'secondary';
};

type Props = {
  label?: string;
  headLeft?: string;
  headRight?: string;
  segments: PoolSegment[];
  context?: 'light' | 'dark';
  footer?: React.ReactNode;
  style?: ViewStyle;
};

export function PoolBar({
  label,
  headLeft,
  headRight,
  segments,
  context = 'light',
  footer,
  style,
}: Props) {
  const dark = context === 'dark';

  const trackBg = dark ? C.onDarkBorder : C.line;
  const primaryFill = dark ? '#fff' : C.ink;
  const secondaryFill = dark ? 'rgba(255,255,255,0.4)' : C.inkFaint;

  const labelColor = dark ? C.onDarkMid : C.inkFaint;
  const leftColor = dark ? '#fff' : C.ink;
  const rightColor = dark ? 'rgba(255,255,255,0.6)' : C.inkSoft;

  return (
    <View style={style}>
      {label != null && (
        <Text style={[s.label, { color: labelColor }]}>{label}</Text>
      )}
      {(headLeft != null || headRight != null) && (
        <View style={s.head}>
          {headLeft != null && (
            <Text style={[s.headLeft, { color: leftColor }]}>{headLeft}</Text>
          )}
          {headRight != null && (
            <Text style={[s.headRight, { color: rightColor }]}>{headRight}</Text>
          )}
        </View>
      )}
      <View style={[s.track, { backgroundColor: trackBg }]}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              height: '100%',
              width: `${Math.min(seg.pct, 100)}%` as any,
              backgroundColor: seg.variant === 'primary' ? primaryFill : secondaryFill,
            }}
          />
        ))}
      </View>
      {footer}
    </View>
  );
}

/** Small dot-legend row shown beneath the progress bar */
export function PoolLegend({
  items,
  context = 'light',
  style,
}: {
  items: Array<{ color?: string; label: string; bold?: boolean }>;
  context?: 'light' | 'dark';
  style?: ViewStyle;
}) {
  const defaultColor = context === 'dark' ? 'rgba(255,255,255,0.6)' : C.inkSoft;
  return (
    <View style={[s.legend, style]}>
      {items.map((item, i) => (
        <View key={i} style={s.legendItem}>
          <View style={[s.dot, { backgroundColor: item.color ?? defaultColor }]} />
          <Text
            style={[
              s.legendText,
              { color: item.bold ? (context === 'dark' ? '#fff' : C.ink) : defaultColor },
              item.bold ? { fontFamily: fonts.bold } : undefined,
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Thin progress track — variant for the credit-limit card (no label/head) */
export function ThinBar({
  pct,
  context = 'dark',
  style,
}: {
  pct: number;
  context?: 'light' | 'dark';
  style?: ViewStyle;
}) {
  const dark = context === 'dark';
  return (
    <View
      style={[
        s.thinTrack,
        { backgroundColor: dark ? C.onDarkSubtle : C.line },
        style,
      ]}
    >
      <View
        style={[
          s.thinFill,
          { width: `${Math.min(pct, 100)}%` as any, backgroundColor: dark ? '#fff' : C.ink },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  headLeft: { fontFamily: fonts.display, fontSize: fontSize.lg },
  headRight: { fontFamily: fonts.display, fontSize: fontSize.base },
  track: {
    height: 14,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: 9,
    flexDirection: 'row',
  },
  thinTrack: {
    width: '100%',
    height: 6,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  thinFill: { height: '100%', borderRadius: radii.full },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: fontSize['sm+'], fontFamily: fonts.regular },
});
