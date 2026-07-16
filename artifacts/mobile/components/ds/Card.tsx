/**
 * Card primitives — three surface levels used throughout the app.
 *
 *  DarkCard  — hero section, dark bg, r28, p24, mx16
 *  LightCard — section card, white bg, r24, p22, mx16
 *  ListCard  — list items,   white bg, r22, p20, mx16
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, radii, spacing } from '@/constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function DarkCard({ children, style }: CardProps) {
  return <View style={[s.dark, style]}>{children}</View>;
}

export function LightCard({ children, style }: CardProps) {
  return <View style={[s.light, style]}>{children}</View>;
}

export function ListCard({ children, style }: CardProps) {
  return <View style={[s.list, style]}>{children}</View>;
}

const s = StyleSheet.create({
  dark: {
    borderRadius: radii.hero,
    marginHorizontal: spacing[4],
    marginBottom: 14,
    padding: spacing[6],
    backgroundColor: C.dark,
  },
  light: {
    borderRadius: radii.cardLg,
    marginHorizontal: spacing[4],
    marginBottom: 14,
    padding: 22,
    backgroundColor: C.card,
  },
  list: {
    borderRadius: radii.card,
    marginHorizontal: spacing[4],
    marginTop: 14,
    padding: spacing[5],
    backgroundColor: C.card,
  },
});
