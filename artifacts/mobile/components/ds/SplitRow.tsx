/**
 * SplitRow — two-column metric row (label above value, left and right-aligned).
 *
 * Used on offer cards and asset cards to show e.g.:
 *   "VALOR PEDIDO / R$ 5.000"   |   "DISPONÍVEL / R$ 1.900"
 *
 * context="light" (default) — ink palette
 * context="dark"             — on-dark white palette
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, fontSize, fonts } from '@/constants/theme';

export type SplitCol = {
  label: string;
  value: string;
};

type Props = {
  left: SplitCol;
  right: SplitCol;
  context?: 'light' | 'dark';
  style?: ViewStyle;
};

export function SplitRow({ left, right, context = 'light', style }: Props) {
  const dark = context === 'dark';
  const labelColor = dark ? C.onDarkFaint : C.inkFaint;
  const valueColor = dark ? '#fff' : C.ink;

  return (
    <View style={[s.row, style]}>
      <View>
        <Text style={[s.label, { color: labelColor }]}>{left.label}</Text>
        <Text style={[s.value, { color: valueColor }]}>{left.value}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.label, { color: labelColor }]}>{right.label}</Text>
        <Text style={[s.value, { color: valueColor }]}>{right.value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize['5xl'],
    letterSpacing: -0.3,
  },
});
