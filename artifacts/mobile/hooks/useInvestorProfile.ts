import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type InvestorProfile = {
  id: string;
  userId: string;
  status: 'pending_review' | 'active' | 'suspended';
  totalInvestedCents: number;
  totalReturnsCents: number;
  createdAt: string;
  updatedAt: string;
};

export function useInvestorProfile() {
  return useQuery({
    queryKey: ['investor-profile'],
    queryFn: () => apiFetch<{ profile: InvestorProfile | null }>('/api/investor-profile'),
  });
}

export function useActivateInvestorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ profile: InvestorProfile }>('/api/investor-profile', { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.setQueryData(['investor-profile'], data);
    },
  });
}
