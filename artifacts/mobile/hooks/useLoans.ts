import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import type { Emprestimo } from '@/data/loans';

// ─── Tipos retornados pela API ────────────────────────────────────────────────

export type LoanAPI = {
  id: string;
  borrowerId: string;
  amountCents: number;
  interestRatePct: number; // taxa × 100 (ex: 20% = 2000)
  termDays: number;
  cycle: 'diario' | 'semanal' | 'mensal';
  installmentsTotal: number;
  installmentsPaid: number;
  status: 'pending_review' | 'funding' | 'active' | 'overdue' | 'settled';
  contractId: string;
  grantedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fundedAmountCents: number;
  lendersCount: number;
};

export type InstallmentAPI = {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  amountCents: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt: string | null;
  createdAt: string;
};

// ─── Mapeamento status API → status do app (usado nos componentes) ────────────

const STATUS_MAP: Record<LoanAPI['status'], string> = {
  pending_review: 'analise',
  funding:        'captacao',
  active:         'ativo',
  overdue:        'atrasado',
  settled:        'quitado',
};

// ─── Converte LoanAPI → Emprestimo (compatível com LoanCard e telas) ──────────

export function mapLoan(loan: LoanAPI): Emprestimo {
  const hoje = new Date();
  const diasDesdeConcessao = loan.grantedAt
    ? Math.round(
        (hoje.getTime() - new Date(loan.grantedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : undefined;

  return {
    id: loan.id as unknown as number, // LoanCard usa String(id), cast seguro
    valor: loan.amountCents / 100,
    taxaJurosTotal: loan.interestRatePct / 100,
    prazoDias: loan.termDays,
    ciclo: loan.cycle,
    parcelasTotal: loan.installmentsTotal,
    parcelasPagas: loan.installmentsPaid,
    status: STATUS_MAP[loan.status] ?? loan.status,
    diasDesdeConcessao,
    valorCaptado: loan.fundedAmountCents / 100,
    numCredores: loan.lendersCount,
    contratoId: loan.contractId,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: () => apiFetch<{ loans: LoanAPI[] }>('/api/loans'),
    select: (data) => data.loans.map(mapLoan),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () =>
      apiFetch<{ loan: LoanAPI; installments: InstallmentAPI[] }>(
        `/api/loans/${id}`,
      ),
    enabled: !!id,
  });
}
