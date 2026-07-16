/**
 * Typography primitives — encode the recurring text patterns so each
 * screen doesn't redeclare them.
 *
 *  Eyebrow      — 12 / semibold / letterSpacing 0.3 (dark or light surface)
 *  BigValue     — SpaceGrotesk hero number (42 default, white on dark)
 *  SectionTitle — SpaceGrotesk 15 section header (used inside cards)
 *  PageTitle    — SpaceGrotesk 22-24 screen/tab header
 *  ScreenTitle  — SpaceGrotesk 18 back-button page header
 *  BodyText     — regular body copy with color variant
 *  DetailLabel  — 11.5 uppercase caption used in DetailGrid (standalone)
 */
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { palette as C, fontSize, fonts } from '@/constants/theme';

type TextProps = {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
};

// ---------------------------------------------------------------------------
// Eyebrow — tiny uppercase descriptor above a value
// ---------------------------------------------------------------------------
export function Eyebrow({
  children,
  context = 'light',
  style,
}: TextProps & { context?: 'light' | 'dark' }) {
  const color = context === 'dark' ? C.onDarkSoft : C.inkFaint;
  return <Text style={[t.eyebrow, { color }, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// BigValue — large SpaceGrotesk number (hero)
// ---------------------------------------------------------------------------
export function BigValue({
  children,
  context = 'dark',
  size = 'hero',
  style,
}: TextProps & { context?: 'light' | 'dark'; size?: 'hero' | 'display' | 'mega' }) {
  const color = context === 'dark' ? '#fff' : C.ink;
  const fs = size === 'hero' ? fontSize.hero : size === 'display' ? fontSize.display : fontSize.mega;
  return <Text style={[t.bigValue, { color, fontSize: fs }, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// SectionTitle — SpaceGrotesk card/section header
// ---------------------------------------------------------------------------
export function SectionTitle({ children, style }: TextProps) {
  return <Text style={[t.sectionTitle, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// PageTitle — screen-level tab header (larger)
// ---------------------------------------------------------------------------
export function PageTitle({
  children,
  size = 22,
  style,
}: TextProps & { size?: number }) {
  return <Text style={[t.pageTitle, { fontSize: size }, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// ScreenTitle — used next to BackButton in sub-screens
// ---------------------------------------------------------------------------
export function ScreenTitle({ children, style }: TextProps) {
  return <Text style={[t.screenTitle, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// BodyText — body copy with optional color
// ---------------------------------------------------------------------------
export function BodyText({
  children,
  color = C.inkSoft,
  size,
  style,
}: TextProps & { color?: string; size?: number }) {
  return (
    <Text style={[t.body, { color, fontSize: size ?? fontSize['base+'] }, style]}>
      {children}
    </Text>
  );
}

const t = StyleSheet.create({
  eyebrow: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  bigValue: {
    fontFamily: fonts.display,
    letterSpacing: -1,
    lineHeight: 48,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: C.ink,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: fonts.display,
    color: C.ink,
    letterSpacing: -0.4,
  },
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.regular,
  },
});
