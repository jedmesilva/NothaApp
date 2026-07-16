/**
 * Button primitives used throughout the app.
 *
 *  PrimaryButton  — full-width CTA on dark hero cards (white bg / dark text)
 *  DarkButton     — full-width CTA on light cards (dark bg / white text)
 *  GhostButton    — outlined button (border only)
 *  ActionButton   — Sacar / Depositar style (icon + label, flex-1)
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fontSize, fonts, spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// PrimaryButton — white on dark hero card
// ---------------------------------------------------------------------------
type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};
export function PrimaryButton({ label, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[s.primary, disabled && s.primaryDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[s.primaryText, disabled && s.primaryTextDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// DarkButton — dark bg on light card (Investir, Solicitar, etc.)
// ---------------------------------------------------------------------------
type DarkButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: string;
  style?: ViewStyle;
};
export function DarkButton({ label, onPress, icon, style }: DarkButtonProps) {
  return (
    <TouchableOpacity style={[s.dark, style]} onPress={onPress} activeOpacity={0.85}>
      {icon && <Feather name={icon as any} size={16} color="#fff" />}
      <Text style={s.darkText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// GhostButton — bordered outline button
// ---------------------------------------------------------------------------
type GhostButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};
export function GhostButton({ label, onPress, icon, style, textStyle }: GhostButtonProps) {
  return (
    <TouchableOpacity style={[s.ghost, style]} onPress={onPress} activeOpacity={0.7}>
      {icon && <Feather name={icon as any} size={16} color={C.inkSoft} />}
      <Text style={[s.ghostText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// ActionButton — Sacar / Depositar (icon + label, fills available space)
// ---------------------------------------------------------------------------
type ActionButtonProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  /** 'light' = light bg on a white card; 'dark' = semi-transparent on dark card */
  context?: 'light' | 'dark';
  style?: ViewStyle;
};
export function ActionButton({ icon, label, onPress, context = 'light', style }: ActionButtonProps) {
  const dark = context === 'dark';
  return (
    <TouchableOpacity
      style={[s.action, dark ? s.actionDark : s.actionLight, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon as any} size={17} color={dark ? '#fff' : C.ink} />
      <Text style={[s.actionText, { color: dark ? '#fff' : C.ink }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// ActionRow — convenience wrapper for two ActionButtons side by side
// ---------------------------------------------------------------------------
type ActionRowProps = {
  left: Omit<ActionButtonProps, 'style'>;
  right: Omit<ActionButtonProps, 'style'>;
  style?: ViewStyle;
};
export function ActionRow({ left, right, style }: ActionRowProps) {
  return (
    <View style={[s.row, style]}>
      <ActionButton {...left} style={{ flex: 1 }} />
      <ActionButton {...right} style={{ flex: 1 }} />
    </View>
  );
}

const s = StyleSheet.create({
  // PrimaryButton
  primary: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: spacing[4],
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  primaryDisabled: { backgroundColor: 'rgba(255,255,255,0.10)' },
  primaryText: {
    fontSize: fontSize['lg+'],
    fontFamily: fonts.bold,
    color: C.dark,
    letterSpacing: 0.1,
  },
  primaryTextDisabled: { color: 'rgba(255,255,255,0.35)' },

  // DarkButton
  dark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: spacing[4],
    backgroundColor: C.dark,
  },
  darkText: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: '#fff' },

  // GhostButton
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: C.line,
  },
  ghostText: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.inkSoft },

  // ActionButton
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  actionLight: { backgroundColor: C.bg },
  actionDark:  { backgroundColor: C.onDarkSubtle },
  actionText:  { fontSize: fontSize['md+'], fontFamily: fonts.semibold },

  // ActionRow
  row: { flexDirection: 'row', gap: 10 },
});
