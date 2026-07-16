/**
 * BackButton — 38×38 icon touch target used as a page back control.
 * Defaults to routing back via expo-router; pass onPress to override.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as C, radii } from '@/constants/theme';

type Props = {
  onPress?: () => void;
  color?: string;
  bgColor?: string;
  size?: number;
  style?: ViewStyle;
};

export function BackButton({
  onPress,
  color = C.ink,
  bgColor = C.card,
  size = 18,
  style,
}: Props) {
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bgColor }, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.8}
    >
      <Feather name="arrow-left" size={size} color={color} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
