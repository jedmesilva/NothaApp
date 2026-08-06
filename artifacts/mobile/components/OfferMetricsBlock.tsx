/**
 * OfferMetricsBlock
 *
 * Composição de OfferMetricsRow + OfferSlider condicional.
 * Substitui o bloco inline de "3 colunas + slider" que era duplicado
 * em ofertas.tsx, oferta-detalhe.tsx e GlobalOfertaOverlay.tsx.
 *
 * O slider só aparece quando há faixa ajustável (OfferSlider retorna null
 * automaticamente quando min >= max) e quando showSlider não é false.
 *
 * Uso:
 *   <OfferMetricsBlock
 *     investimento="R$ 1.000,00"
 *     retorno="R$ 1.120,00"
 *     prazo="90 dias"
 *     offerId={id}
 *     maxAmountCents={maxCents}
 *     minAmountCents={minCents}
 *   />
 *   // card de detalhe (dark, slider só antes de aceitar):
 *   <OfferMetricsBlock ... context="dark" showSlider={!aceitou} />
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '@/constants/theme';
import { OfferMetricsRow } from '@/components/OfferMetricsRow';
import { OfferSlider } from '@/components/OfferSlider';

type Props = {
  investimento: string;
  retorno: string;
  prazo: string;
  offerId: string;
  maxAmountCents: number;
  minAmountCents?: number;
  /** Quando false, o slider não é renderizado. Padrão: true. */
  showSlider?: boolean;
  context?: 'light' | 'dark';
  style?: ViewStyle;
};

export function OfferMetricsBlock({
  investimento,
  retorno,
  prazo,
  offerId,
  maxAmountCents,
  minAmountCents = 0,
  showSlider = true,
  context = 'light',
  style,
}: Props) {
  return (
    <View style={style}>
      <OfferMetricsRow
        investimento={investimento}
        retorno={retorno}
        prazo={prazo}
        context={context}
      />
      {showSlider && (
        <View style={s.sliderWrap}>
          <OfferSlider
            offerId={offerId}
            maxAmountCents={maxAmountCents}
            minAmountCents={minAmountCents}
            context={context}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sliderWrap: { marginBottom: spacing[2] },
});
