/**
 * Chip / FilterChip — pill-shaped toggle used for:
 *   - Period selector in carteira (7d, 1m, 1a, Personalizado)
 *   - Filter pills in ativos bottom-sheet
 *
 * Two visual variants:
 *  'default'  — inactive: light bg; active: dark bg + white text
 *  'outlined' — inactive: white bg + border; active: dark bg + white text
 */
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, radii, fontSize, fonts } from '@/constants/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'outlined';
  style?: ViewStyle;
};

export function Chip({ label, active = false, onPress, variant = 'default', style }: Props) {
  const isOutlined = variant === 'outlined';
  return (
    <TouchableOpacity
      style={[
        s.chip,
        isOutlined ? s.outlined : s.plain,
        active && s.active,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.label, active ? s.labelActive : isOutlined ? s.labelOutlined : s.labelPlain]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  plain:    { backgroundColor: C.bg },
  outlined: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  active:   { backgroundColor: C.dark, borderColor: C.dark },
  label:    { fontSize: fontSize['sm+'], fontFamily: fonts.semibold },
  labelPlain:    { color: C.inkSoft },
  labelOutlined: { color: C.inkSoft },
  labelActive:   { color: '#fff' },
});
