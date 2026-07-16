/**
 * DetailGrid — 2-column data grid used on loan and asset cards.
 *
 * Each item has a label (uppercase caption), a value, and an optional sub-line.
 *
 * context="light"  — shown on a white card  (default)
 * context="dark"   — shown on a dark hero card (inverted palette)
 *
 * Usage:
 *   <DetailGrid
 *     items={[
 *       { label: 'Prazo',      value: '90 dias',   sub: 'vence 14 out' },
 *       { label: 'Ciclo',      value: 'Semanal',   sub: 'R$ 277/semana' },
 *       { label: 'Taxa total', value: '12%' },
 *       { label: 'Total',      value: 'R$ 3.584' },
 *     ]}
 *   />
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, fontSize, fonts } from '@/constants/theme';

export type DetailItem = {
  label: string;
  value: string;
  sub?: string;
};

type Props = {
  items: DetailItem[];
  context?: 'light' | 'dark';
  style?: ViewStyle;
};

export function DetailGrid({ items, context = 'light', style }: Props) {
  const dark = context === 'dark';

  const labelColor = dark ? C.onDarkMid  : C.inkFaint;
  const valueColor = dark ? '#fff'        : C.ink;
  const subColor   = dark ? C.onDarkMid  : C.inkFaint;
  const borderColor = dark ? C.onDarkBorder : C.line;

  return (
    <View style={[s.grid, { borderTopColor: borderColor }, style]}>
      {items.map((item, i) => (
        <View key={i} style={s.block}>
          <Text style={[s.label, { color: labelColor }]}>{item.label}</Text>
          <Text style={[s.value, { color: valueColor }]}>{item.value}</Text>
          {item.sub != null && (
            <Text style={[s.sub, { color: subColor }]}>{item.sub}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 18,
    rowGap: 16,
    columnGap: 12,
  },
  block: { width: '46%' },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    letterSpacing: -0.1,
  },
  sub: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});
