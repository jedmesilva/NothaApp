import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useInvestorOffers() {
  return useQuery({
    queryKey: ['investor-offers'],
    queryFn: () => apiFetch<InvestorOffersData>('/api/investor/offers'),
  });
}
