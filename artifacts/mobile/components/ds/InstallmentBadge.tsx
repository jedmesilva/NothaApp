/**
 * InstallmentBadge — square rounded badge used in installment rows.
 *
 * Variants:
 *  'default'  — muted bg + number label (pending installments)
 *  'paid'     — dark bg + check icon
 *  'overdue'  — red bg + alert-triangle icon (white)
 *  'proxima'  — amber bg + clock icon
 *  'future'   — muted bg + calendar icon
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fonts, fontSize } from '@/constants/theme';

export type InstallmentBadgeVariant = 'default' | 'paid' | 'overdue' | 'proxima' | 'future';

type Props = {
  variant: InstallmentBadgeVariant;
  /** Number shown for 'default' variant */
  label?: string;
};

const CONFIG: Record<InstallmentBadgeVariant, {
  bg: string;
  icon?: string;
  iconColor: string;
}> = {
  default:  { bg: C.chipMuted,  iconColor: C.inkSoft },
  paid:     { bg: C.ink,        icon: 'check',          iconColor: '#fff' },
  overdue:  { bg: C.red,        icon: 'alert-triangle', iconColor: '#fff' },
  proxima:  { bg: C.amberBg,    icon: 'clock',          iconColor: C.amber },
  future:   { bg: C.chipMuted,  icon: 'calendar',       iconColor: C.inkFaint },
};

export function InstallmentBadge({ variant, label }: Props) {
  const { bg, icon, iconColor } = CONFIG[variant];

  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      {icon ? (
        <Feather name={icon as any} size={16} color={iconColor} />
      ) : (
        <Text style={[s.label, { color: iconColor }]}>{label}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: fontSize.base,
  },
});
