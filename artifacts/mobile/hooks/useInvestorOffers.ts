import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export type OfferAction = 'accepted' | 'rejected' | 'push_dismissed';
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
  /** Valor máximo oferecido pelo engine para este credor */
  maxAmountCents: number;
  /** Valor mínimo aceitável (piso do range) */
  minAmountCents: number;
  /** Preenchido no aceite com o valor escolhido pelo credor dentro de [min, max] */
  acceptedAmountCents: number | null;
  ratePct: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt: string;
  expiresAt: string;
  respondedAt: string | null;
  /** Preenchido quando o push card foi fechado/ignorado. Oferta permanece
   *  pending na lista; overlay não é re-exibido. */
  pushDismissedAt: string | null;
  escalationRound: number;
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
