/**
 * OfferMetricsRow
 *
 * Linha de três colunas — Investimento | Retorno | Prazo — usada nos cards
 * de oferta, na tela de detalhe e no overlay global.
 *
 * Recebe os valores já formatados para evitar acoplar lógica de negócio.
 *
 * Uso:
 *   <OfferMetricsRow
 *     investimento="R$ 1.000,00"
 *     retorno="R$ 1.120,00"
 *     prazo="90 dias"
 *   />
 *   <OfferMetricsRow ... context="dark" />
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { palette as C, fonts, fontSize } from '@/constants/theme';
import { DetailLabel } from '@/components/ds';

type Props = {
  investimento: string;
  retorno: string;
  prazo: string;
  context?: 'light' | 'dark';
  style?: ViewStyle;
};

export function OfferMetricsRow({ investimento, retorno, prazo, context = 'light', style }: Props) {
  const isDark     = context === 'dark';
  const labelColor = isDark ? C.onDarkFaint : C.inkFaint;
  const valueColor = isDark ? '#fff'        : C.ink;

  return (
    <View style={[s.row, style]}>
      <View>
        <DetailLabel style={{ color: labelColor, marginBottom: 4 }}>Investimento</DetailLabel>
        <Text style={[s.value, { color: valueColor }]}>{investimento}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <DetailLabel style={{ color: labelColor, marginBottom: 4 }}>Retorno</DetailLabel>
        <Text style={[s.value, { color: valueColor }]}>{retorno}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <DetailLabel style={{ color: labelColor, marginBottom: 4 }}>Prazo</DetailLabel>
        <Text style={[s.value, { color: valueColor }]}>{prazo}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    letterSpacing: -0.3,
  },
});
