/**
 * AdjustedAmountsContext
 *
 * Estado global para os valores ajustados pelo slider nas ofertas.
 * Compartilhado entre o card da lista de ofertas e a tela de detalhe,
 * de modo que o valor ajustado num local persiste no outro.
 *
 * Chave: String(offerId) — o ID da oferta na API.
 * Valor 0 (ausente) significa "usar o máximo da oferta".
 */
import React, { createContext, useContext, useState } from 'react';

interface AdjustedAmountsContextValue {
  getAmount: (offerId: string) => number;
  setAmount: (offerId: string, cents: number) => void;
}

const AdjustedAmountsContext = createContext<AdjustedAmountsContextValue | null>(null);

export function AdjustedAmountsProvider({ children }: { children: React.ReactNode }) {
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const getAmount = (offerId: string): number => amounts[offerId] ?? 0;

  const setAmount = (offerId: string, cents: number) =>
    setAmounts((prev) => ({ ...prev, [offerId]: cents }));

  return (
    <AdjustedAmountsContext.Provider value={{ getAmount, setAmount }}>
      {children}
    </AdjustedAmountsContext.Provider>
  );
}

export function useAdjustedAmounts() {
  const ctx = useContext(AdjustedAmountsContext);
  if (!ctx) throw new Error('useAdjustedAmounts must be used within AdjustedAmountsProvider');
  return ctx;
}
