import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type WalletTransaction = {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_payment' | 'investment_out' | 'investment_return';
  direction: 'credit' | 'debit';
  amountCents: number;
  status: 'pending' | 'completed' | 'failed';
  pixKey?: string | null;
  description?: string | null;
  referenceId?: string | null;
  createdAt: string;
};

export type WalletData = {
  wallet: { id: string; userId: string; balanceCents: number; updatedAt: string };
  transactions: WalletTransaction[];
};

export const TRANSACTION_LABELS: Record<WalletTransaction['type'], string> = {
  deposit:           'Depósito',
  withdrawal:        'Saque via Pix',
  loan_disbursement: 'Empréstimo liberado',
  loan_payment:      'Pagamento de parcela',
  investment_out:    'Investimento realizado',
  investment_return: 'Retorno de investimento',
};

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiFetch<WalletData>('/api/wallet'),
  });
}
