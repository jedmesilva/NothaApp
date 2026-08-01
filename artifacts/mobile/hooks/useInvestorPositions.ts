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
  /** Soma de principalBalanceCents de todos os investidores desse empréstimo */
  fundedAmountCents: number;
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
  /** Todas as parcelas do empréstimo, ordenadas por número */
  installments: InstallmentSummary[];
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

/** Deriva o status de exibição a partir dos dados de posição + empréstimo */
export function getPosStatus(pos: InvestorPosition): 'captacao' | 'ativo' | 'atrasado' | 'quitado' {
  const ls = pos.loan.status;
  if (ls === 'captacao' || ls === 'analise') return 'captacao';
  if (pos.status === 'settled' || ls === 'quitado') return 'quitado';
  if (pos.hasOverdue) return 'atrasado';
  return 'ativo';
}
