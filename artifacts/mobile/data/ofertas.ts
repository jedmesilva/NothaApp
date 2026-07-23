/**
 * Ofertas disponíveis para investimento.
 * Fonte de verdade compartilhada entre ofertas.tsx e ativo-detalhe.tsx.
 */

export type OfertaCiclo = 'Diário' | 'Semanal' | 'Mensal';

export interface Oferta {
  id:                    number;
  ofertaId:              string;
  valor:                 number;   // quanto o investidor colocaria nessa oferta
  taxaRetorno:           number;
  prazoDias:             number;
  ciclo:                 OfertaCiclo;
  risco:                 string;
  tomadorScore:          string;
  valorTotalPedido:      number;
  jaCaptado:             number;
  emprestimosAnteriores: number;
  valorTotalTomado:      number;
  cidade:                string;
  proposito:             string;
}

export const MOCK_OFERTAS: Oferta[] = [
  {
    id: 1, ofertaId: 'OFR-2026-40218',
    valor: 1200, taxaRetorno: 4.8, prazoDias: 45, ciclo: 'Semanal',
    risco: 'Baixo', tomadorScore: 'A',
    valorTotalPedido: 5000, jaCaptado: 3100,
    emprestimosAnteriores: 3, valorTotalTomado: 12400,
    cidade: 'Curitiba, PR', proposito: 'Expansão do estoque para nova temporada',
  },
  {
    id: 2, ofertaId: 'OFR-2026-40219',
    valor: 800, taxaRetorno: 7.2, prazoDias: 90, ciclo: 'Mensal',
    risco: 'Alto', tomadorScore: 'C',
    valorTotalPedido: 3000, jaCaptado: 900,
    emprestimosAnteriores: 1, valorTotalTomado: 3000,
    cidade: 'Salvador, BA', proposito: 'Capital de giro para o negócio',
  },
  {
    id: 3, ofertaId: 'OFR-2026-40220',
    valor: 500, taxaRetorno: 2.1, prazoDias: 15, ciclo: 'Diário',
    risco: 'Baixo', tomadorScore: 'A',
    valorTotalPedido: 1800, jaCaptado: 1200,
    emprestimosAnteriores: 6, valorTotalTomado: 28500,
    cidade: 'Porto Alegre, RS', proposito: 'Pagamento de fornecedor urgente',
  },
  {
    id: 4, ofertaId: 'OFR-2026-40221',
    valor: 2000, taxaRetorno: 5.5, prazoDias: 60, ciclo: 'Semanal',
    risco: 'Médio', tomadorScore: 'B',
    valorTotalPedido: 8000, jaCaptado: 2200,
    emprestimosAnteriores: 2, valorTotalTomado: 4100,
    cidade: 'Belo Horizonte, MG', proposito: 'Reforma do estabelecimento comercial',
  },
  {
    id: 5, ofertaId: 'OFR-2026-40222',
    valor: 350, taxaRetorno: 3.4, prazoDias: 30, ciclo: 'Mensal',
    risco: 'Médio', tomadorScore: 'B',
    valorTotalPedido: 2500, jaCaptado: 2100,
    emprestimosAnteriores: 0, valorTotalTomado: 0,
    cidade: 'Fortaleza, CE', proposito: 'Compra de equipamentos para produção',
  },
];
