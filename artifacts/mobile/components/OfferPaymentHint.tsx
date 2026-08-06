/**
 * OfferPaymentHint
 *
 * Versão simplificada do bloco de pagamento para cards de oferta:
 * exibe só o label "Pagamento" e a descrição das parcelas
 * (ex: "1 parcela semanal").
 *
 * Para a versão completa com barra de progresso e valores pago/total,
 * use PaymentProgress.
 *
 * Uso:
 *   <OfferPaymentHint ciclo="semanal" parcelasTotal={4} />
 *   <OfferPaymentHint ciclo="mensal"  parcelasTotal={0} /> → exibe "—"
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
      {/* O título "Pagamento" é renderizado pelo PaymentSectionHeader no pai —
          este componente exibe apenas o valor das parcelas. */}
      <Text style={s.value}>
        {parcelasTotal > 0 ? parcelasLabel(ciclo, parcelasTotal) : '—'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingBottom: spacing[4],
    gap: 4,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: C.ink,
  },
});
