import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type Cashflow = {
  date: string;          // YYYY-MM-DD
  amountCents: number;
  interestCents?: number;
  principalCents?: number;
  kind: 'aporte' | 'parcela' | 'residual';
  positionId: string;
};

export type CashflowsData = {
  cashflows: Cashflow[];
};

/**
 * Busca os fluxos de caixa do investidor no período [start, end].
 * Ambos no formato YYYY-MM-DD.
 */
export function useInvestorCashflows(start: string | null, end: string | null) {
  return useQuery({
    queryKey: ['investor-cashflows', start, end],
    queryFn: () =>
      apiFetch<CashflowsData>(`/api/investor/cashflows?start=${start}&end=${end}`),
    enabled: !!start && !!end,
    staleTime: 60_000,
  });
}
