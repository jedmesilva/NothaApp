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
  /** Preenchido quando nasceu de captação primária (oferta aceita) */
  fundingOrderOfferId: string | null;
  /** Preenchido quando nasceu de cessão no secundário */
  parentPositionId: string | null;
  loanId: string;
  investorId: string;
  principalBalanceCents: number;
  originalPrincipalCents: number;
  totalReturnedCents: number;
  ratePct: number;
  /**
   * reserved     — oferta aceita, captação ainda aberta (saldo bloqueado na wallet)
   * active       — captação fechou, capital desembolsado ao tomador
   * transferred_out — vendida por inteiro no secundário
   * settled      — amortização completa
   * cancelled    — captação não fechou (expirou/cancelada), saldo liberado
   */
  status: 'reserved' | 'active' | 'transferred_out' | 'settled' | 'cancelled';
  walletTransactionId: string | null;
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
  // Captação ainda aberta (posição reservada) ou empréstimo em análise
  if (pos.status === 'reserved' || ls === 'captacao' || ls === 'analise') return 'captacao';
  // Encerrada: amortização completa, venda integral, ou captação cancelada
  if (pos.status === 'settled' || pos.status === 'transferred_out' || pos.status === 'cancelled' || ls === 'quitado') return 'quitado';
  if (pos.hasOverdue) return 'atrasado';
  return 'ativo';
}
