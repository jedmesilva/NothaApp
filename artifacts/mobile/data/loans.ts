export const CICLO_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensal: 30 };

export const CICLO_META: Record<string, { label: string; dias: number; unidade: string; unidadePlural: string }> = {
  diario: { label: 'Diário', dias: 1, unidade: 'dia', unidadePlural: 'dias' },
  semanal: { label: 'Semanal', dias: 7, unidade: 'semana', unidadePlural: 'semanas' },
  mensal: { label: 'Mensal', dias: 30, unidade: 'mês', unidadePlural: 'meses' },
};

export const STATUS_META: Record<string, { label: string; iconName: string; iconSet: string }> = {
  analise: { label: 'Em análise', iconName: 'clock', iconSet: 'Feather' },
  captacao: { label: 'Em captação', iconName: 'users', iconSet: 'Feather' },
  ativo: { label: 'Ativo', iconName: 'zap', iconSet: 'Feather' },
  atrasado: { label: 'Atrasado', iconName: 'alert-triangle', iconSet: 'Feather' },
  quitado: { label: 'Quitado', iconName: 'check-circle', iconSet: 'Feather' },
};

export interface Emprestimo {
  id: number;
  valor: number;
  taxaJurosTotal: number;
  prazoDias: number;
  ciclo: string;
  parcelasTotal: number;
  parcelasPagas: number;
  status: string;
  diasAtraso?: number;
  diasDesdeConcessao?: number;
  proximaData?: string;
  valorCaptado?: number;
  numCredores?: number;
  contratoId?: string;
  createdAt?: string;
}

export const EMPRESTIMOS: Emprestimo[] = [
  {
    id: 1,
    valor: 8500,
    taxaJurosTotal: 20,
    prazoDias: 60,
    ciclo: 'mensal',
    parcelasTotal: 2,
    parcelasPagas: 0,
    status: 'atrasado',
    diasAtraso: 6,
    diasDesdeConcessao: 36,
    contratoId: 'EMP-2026-80121',
  },
  {
    id: 2,
    valor: 3200,
    taxaJurosTotal: 12,
    prazoDias: 90,
    ciclo: 'semanal',
    parcelasTotal: 13,
    parcelasPagas: 6,
    status: 'ativo',
    diasDesdeConcessao: 42,
    contratoId: 'EMP-2026-90214',
  },
  {
    id: 3,
    valor: 5000,
    taxaJurosTotal: 18,
    prazoDias: 45,
    ciclo: 'semanal',
    parcelasTotal: 6,
    parcelasPagas: 0,
    status: 'captacao',
    valorCaptado: 3100,
    numCredores: 14,
    contratoId: 'EMP-2026-70398',
  },
  {
    id: 4,
    valor: 1800,
    taxaJurosTotal: 8,
    prazoDias: 10,
    ciclo: 'diario',
    parcelasTotal: 10,
    parcelasPagas: 0,
    status: 'analise',
    contratoId: 'EMP-2026-70421',
  },
  {
    id: 5,
    valor: 4500,
    taxaJurosTotal: 16,
    prazoDias: 60,
    ciclo: 'mensal',
    parcelasTotal: 2,
    parcelasPagas: 2,
    status: 'quitado',
    diasDesdeConcessao: 60,
    contratoId: 'EMP-2026-50077',
  },
];

export function createEmprestimo(opts: {
  valorCentavos: number;
  cicloKey: string;
  numPeriodos: number;
  prazoDias: number;
  taxaTotal: number;
}): number {
  const newId = Math.max(...EMPRESTIMOS.map((e) => e.id)) + 1;
  EMPRESTIMOS.push({
    id: newId,
    valor: opts.valorCentavos / 100,
    taxaJurosTotal: opts.taxaTotal,
    prazoDias: opts.prazoDias,
    ciclo: opts.cicloKey,
    parcelasTotal: opts.numPeriodos,
    parcelasPagas: 0,
    status: 'analise',
    contratoId: `EMP-${new Date().getFullYear()}-${String(newId).padStart(5, '0')}`,
  });
  return newId;
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatData(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDataShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Formata a data de vencimento de uma parcela de forma relativa ao dia atual.
 * Usado na tela inicial onde o contexto já é claro (lista de vencimentos).
 *
 * Exemplos:
 *   "Venceu hoje"      diff = 0, passado
 *   "Venceu ontem"     diff = -1
 *   "Venceu há 3 dias" diff = -3
 *   "Vence hoje"       diff = 0, futuro (mesmo dia)
 *   "Vence amanhã"     diff = 1
 *   "Vence em 5 dias"  diff = 5
 */
export function formatRelativeDueDate(data: Date): string {
  const hoje = new Date();
  const dataZero = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diffDias = Math.round((dataZero.getTime() - hojeZero.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Vence hoje';
  if (diffDias === 1) return 'Vence amanhã';
  if (diffDias > 1)   return `Vence em ${diffDias} dias`;
  if (diffDias === -1) return 'Venceu ontem';
  return `Venceu há ${Math.abs(diffDias)} dias`;
}

export function formatDataComAno(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDataHora(date: Date): string {
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}
