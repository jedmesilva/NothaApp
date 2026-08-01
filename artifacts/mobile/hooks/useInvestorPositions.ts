import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type LoanSummary = {
  id: string;
  contractId: string;
  amountCents: number;
  cycle: 'diario' | 'semanal' | 'mensal';
  installmentsTotal: number;
  termDays: number;
  status: string;
  grantedAt: string | null;
};

export type InstallmentSummary = {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  amountCents: number;
  status: 'pending' | 'paid' | 'overdue';
};

export type InvestorPosition = {
  id: string;
  loanId: string;
  investorId: string;
  principalBalanceCents: number;
  originalPrincipalCents: number;
  totalReturnedCents: number;
  ratePct: number;
  status: 'active' | 'transferred_out' | 'settled';
  createdAt: string;
  loan: LoanSummary;
  nextInstallment: InstallmentSummary | null;
  lastInstallment: InstallmentSummary | null;
  hasOverdue: boolean;
  earliestOverdue: InstallmentSummary | null;
};

export type PositionsSummary = {
  principalBalanceCents: number;
  originalPrincipalCents: number;
  totalReturnedCents: number;
  activeCount: number;
  hasAnyOverdue: boolean;
};

export type InvestorPositionsData = {
  summary: PositionsSummary;
  positions: InvestorPosition[];
};

export function useInvestorPositions() {
  return useQuery({
    queryKey: ['investor-positions'],
    queryFn: () => apiFetch<InvestorPositionsData>('/api/investor/positions'),
  });
}
