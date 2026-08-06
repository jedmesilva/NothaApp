/**
 * OfferSlider
 *
 * Slider de ajuste de valor para ofertas de investimento.
 *
 * - Retorna null automaticamente quando min >= max (valor fixo, sem faixa
 *   ajustável), evitando o bug do thumb travado à esquerda.
 * - Lê e escreve o valor ajustado via AdjustedAmountsContext — sem estado local.
 * - Encapsula o fallback de mínimo: se minAmountCents não vier da API (0),
 *   usa 25% do máximo como mínimo operacional.
 *
 * Uso:
 *   <OfferSlider offerId={id} maxAmountCents={max} minAmountCents={min} />
 *   <OfferSlider offerId={id} maxAmountCents={max} context="dark" />
 */
import React from 'react';
import { useAdjustedAmounts } from '@/contexts/AdjustedAmountsContext';
import ValueSlider from '@/components/ValueSlider';

/** Calcula o mínimo efetivo: usa o valor da API se disponível, senão 25% do máximo. */
export function effectiveMinCents(minAmountCents: number, maxAmountCents: number): number {
  return minAmountCents > 0
    ? minAmountCents
    : Math.max(1_000, Math.round(maxAmountCents * 0.25 / 100) * 100);
}

type Props = {
  offerId: string;
  maxAmountCents: number;
  /** 0 ou ausente → aplica fallback de 25% do máximo como mínimo. */
  minAmountCents?: number;
  context?: 'light' | 'dark';
};

export function OfferSlider({ offerId, maxAmountCents, minAmountCents = 0, context }: Props) {
  const { getAmount, setAmount } = useAdjustedAmounts();

  const minCents   = effectiveMinCents(minAmountCents, maxAmountCents);
  const valueCents = getAmount(offerId) || maxAmountCents;

  if (minCents >= maxAmountCents) return null;

  return (
    <ValueSlider
      minCents={minCents}
      maxCents={maxAmountCents}
      valueCents={valueCents}
      onChange={(cents) => setAmount(offerId, cents)}
      showValue={false}
      context={context}
    />
  );
}
