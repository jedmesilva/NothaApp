/**
 * Posicoes — dados de investimento do credor (lado do ativo).
 * Fonte de verdade compartilhada entre ativos.tsx e ativo-detalhe.tsx.
 */

export type PosicaoStatus = 'captacao' | 'ativo' | 'atrasado' | 'quitado';

export interface Posicao {
  id:               number;
  contratoId:       string;
  valorInvestido:   number;
  taxaJurosTotal:   number;
  prazoDias:        number;
  ciclo:            'diario' | 'semanal' | 'mensal';
  status:           PosicaoStatus;
  parcelasTotal:    number;
  parcelasRecebidas: number;
  // Captação
  jaCaptado:        number;
  valorTotalPedido: number;
  numCredores:      number;
  // Pós-concessão
  diasDesdeConcessao?: number;
  diasAtraso?:         number;
  proximaData?:        string;
  // Tomador
  risco:                  string;
  tomadorScore:           string;
  emprestimosAnteriores:  number;
  valorTotalTomado:       number;
  cidade:                 string;
  proposito:              string;
}

export const POSICOES: Posicao[] = [
  {
    id: 1, contratoId: 'EMP-2026-30291',
    valorInvestido: 900, taxaJurosTotal: 18, prazoDias: 45, ciclo: 'semanal', status: 'captacao',
    jaCaptado: 3100, valorTotalPedido: 5000, numCredores: 14,
    parcelasTotal: 0, parcelasRecebidas: 0,
    risco: 'Médio', tomadorScore: 'B', emprestimosAnteriores: 3, valorTotalTomado: 12400,
    cidade: 'Belo Horizonte, MG', proposito: 'Reforma do estabelecimento comercial',
  },
  {
    id: 2, contratoId: 'EMP-2026-90214',
    valorInvestido: 2000, taxaJurosTotal: 22, prazoDias: 90, ciclo: 'mensal', status: 'ativo',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 3, parcelasRecebidas: 1, diasDesdeConcessao: 35, proximaData: '4 de agosto',
    risco: 'Alto', tomadorScore: 'C', emprestimosAnteriores: 1, valorTotalTomado: 3000,
    cidade: 'São Paulo, SP', proposito: 'Capital de giro para o negócio',
  },
  {
    id: 3, contratoId: 'EMP-2026-11875',
    valorInvestido: 1200, taxaJurosTotal: 15, prazoDias: 30, ciclo: 'mensal', status: 'atrasado',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 1, parcelasRecebidas: 0, diasDesdeConcessao: 35, diasAtraso: 5,
    risco: 'Médio', tomadorScore: 'B', emprestimosAnteriores: 2, valorTotalTomado: 4100,
    cidade: 'Rio de Janeiro, RJ', proposito: 'Estoque para a temporada de verão',
  },
  {
    id: 4, contratoId: 'EMP-2026-56002',
    valorInvestido: 500, taxaJurosTotal: 10, prazoDias: 15, ciclo: 'diario', status: 'quitado',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 15, parcelasRecebidas: 15, diasDesdeConcessao: 20,
    risco: 'Baixo', tomadorScore: 'A', emprestimosAnteriores: 6, valorTotalTomado: 28500,
    cidade: 'Curitiba, PR', proposito: 'Pagamento de fornecedor urgente',
  },
];
