import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type BorrowerProfile = {
  id: string;
  userId: string;
  status: 'pending_review' | 'active' | 'suspended';
  documentStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  documentRejectionReason: string | null;
  // Limite de crédito
  creditLimitCents: number;
  usedCreditCents: number;
  creditScore: number | null;
  riskTier: 'aa' | 'a' | 'b' | 'c' | 'd' | null;
  // Dados financeiros
  monthlyIncomeCents: number | null;
  occupation: string | null;
  // Contadores históricos
  totalLoans: number;
  totalBorrowedCents: number;
  totalDefaulted: number;
  createdAt: string;
  updatedAt: string;
};

export function useBorrowerProfile() {
  return useQuery({
    queryKey: ['borrower-profile'],
    queryFn: () => apiFetch<{ profile: BorrowerProfile | null }>('/api/borrower-profile'),
  });
}

export function useActivateBorrowerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ profile: BorrowerProfile }>('/api/borrower-profile', { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.setQueryData(['borrower-profile'], data);
    },
  });
}
