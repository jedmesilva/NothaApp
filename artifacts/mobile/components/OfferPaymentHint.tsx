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
  /**
   * Exibe o label "Pagamento" acima do valor.
   * Passe `false` quando o contexto pai (ex: PaymentSectionHeader) já provê o título.
   * @default true
   */
  showLabel?: boolean;
  style?: ViewStyle;
};

export function OfferPaymentHint({ ciclo, parcelasTotal, showLabel = true, style }: Props) {
  return (
    <View style={[s.wrap, style]}>
      {showLabel && <Text style={s.label}>Pagamento</Text>}
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
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    color: C.inkFaint,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: C.ink,
  },
});
