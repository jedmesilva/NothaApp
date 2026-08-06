/**
 * OfferPaymentHint — conteúdo puro.
 *
 * Exibe apenas a descrição das parcelas (ex: "4 parcelas semanais").
 * Não renderiza nenhum título ou cabeçalho — o contexto pai é responsável
 * por exibir o cabeçalho de seção "Pagamento" acima deste componente.
 *
 * Uso:
 *   <Text style={s.sectionTitle}>Pagamento</Text>
 *   <OfferPaymentHint ciclo="semanal" parcelasTotal={4} />
 */
import React from 'react';
import { Text, StyleSheet, type ViewStyle, View } from 'react-native';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { parcelasLabel } from '@/data/loans';

type Props = {
  ciclo: string;
  parcelasTotal: number;
  style?: ViewStyle;
};

export function OfferPaymentHint({ ciclo, parcelasTotal, style }: Props) {
  return (
    <View style={[s.wrap, style]}>
      <Text style={s.value}>
        {parcelasTotal > 0 ? parcelasLabel(ciclo, parcelasTotal) : '—'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingBottom: spacing[4],
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: C.ink,
  },
});
