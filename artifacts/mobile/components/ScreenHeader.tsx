import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
}

/**
 * Bloco de cabeçalho padronizado para telas de lista.
 * Rola junto com o ScrollView — fica logo abaixo da navBar fixa.
 */
export function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View style={s.header}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  header:   { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2, marginBottom: 4 },
  subtitle: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },
});
