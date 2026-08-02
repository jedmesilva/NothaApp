import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export type OfferAction = 'accepted' | 'rejected';
import { apiFetch } from '@/lib/apiClient';

export type OfferLoan = {
  id: string;
  contractId: string;
  amountCents: number;
  cycle: 'diario' | 'semanal' | 'mensal';
  installmentsTotal: number;
  termDays: number;
  status: string;
  fundedAmountCents: number;
};

export type InvestorOffer = {
  id: string;
  loanId: string;
  investorId: string;
  amountCents: number;
  minAmountCents: number;
  ratePct: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt: string;
  expiresAt: string;
  respondedAt: string | null;
  escalationRound: number;
  walletTransactionId: string | null;
  loan: OfferLoan;
};

export type InvestorOffersData = {
  offers: InvestorOffer[];
};

export function useInvestorOffers(refetchInterval?: number) {
  return useQuery({
    queryKey: ['investor-offers'],
    queryFn: () => apiFetch<InvestorOffersData>('/api/investor/offers'),
    refetchInterval,
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, action, amountCents }: { offerId: string; action: OfferAction; amountCents?: number }) =>
      apiFetch<{ ok: boolean; status: string }>(`/api/investor/offers/${offerId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action, amountCents }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-offers'] });
    },
  });
}
