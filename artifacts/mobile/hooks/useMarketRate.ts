import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type MarketRate = {
  ofertaCentavos: number;
  demandaCentavos: number;
  /** Desequilíbrio normalizado: -1 (só oferta) a +1 (só demanda), 0 = equilíbrio */
  desequilibrio: number;
  /** Ajuste aditivo em pontos percentuais a aplicar sobre a taxa base por prazo */
  ajustePct: number;
  parametros: {
    amplitudePct: number;
  };
};

export function useMarketRate() {
  return useQuery({
    queryKey: ['market-rate'],
    queryFn: () => apiFetch<MarketRate>('/api/market-rate'),
    // Sinal de mercado: revalida a cada 60 s para refletir mudanças de oferta/demanda
    staleTime: 60_000,
    // Fallback silencioso: erro de rede não quebra a tela — usa taxa base sem ajuste
    throwOnError: false,
  });
}
