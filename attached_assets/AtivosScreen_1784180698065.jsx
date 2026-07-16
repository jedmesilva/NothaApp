import React, { useState } from 'react';
import {
  ArrowLeft,
  Tag,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// Mesma paleta monocromática do resto do app — red/redBg é a única exceção,
// reservada para sinalizar atraso, igual ao padrão da Carteira de investimento
const colors = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#F4F5F7',
  overlay: 'rgba(21,21,29,0.44)',
  red: '#C0392B',
  redBg: '#FBEAE8',
};

const styles = {
  screen: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    backgroundColor: colors.bg,
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: colors.ink,
    paddingBottom: 32,
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '22px 20px 4px',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: -0.2,
  },

  // Busca + filtro
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '16px 16px 18px',
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 16px',
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'none',
    fontSize: 14.5,
    color: colors.ink,
    fontFamily: "'Inter', sans-serif",
  },
  filterBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.card,
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  filterBtnActive: {
    backgroundColor: colors.dark,
  },
  filterBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.ink,
    border: `2px solid ${colors.card}`,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '0 16px',
  },

  // Card de posição
  posicaoCard: {
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: '22px 20px 20px',
  },
  posicaoCardAtrasada: {
    border: `1.5px solid ${colors.red}`,
  },
  posicaoCardCaptacao: {
    border: `1.5px dashed ${colors.inkFaint}`,
  },
  posicaoTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 11px 6px 9px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  statusCaptacao: {
    backgroundColor: colors.chipBg,
    color: colors.inkSoft,
  },
  statusAtivo: {
    backgroundColor: colors.dark,
    color: '#fff',
  },
  statusAtrasado: {
    backgroundColor: colors.redBg,
    color: colors.red,
  },
  statusQuitado: {
    backgroundColor: 'transparent',
    color: colors.inkFaint,
    border: `1px solid ${colors.line}`,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: colors.inkFaint,
    marginBottom: 6,
  },
  heroValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: -1.1,
    lineHeight: 1,
    marginBottom: 8,
  },
  heroValueSign: {
    fontSize: 24,
    fontWeight: 700,
    marginRight: 2,
  },
  heroCaption: {
    fontSize: 13.5,
    color: colors.inkSoft,
    marginBottom: 18,
  },

  splitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  splitBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  splitBlockRight: {
    alignItems: 'flex-end',
  },
  splitLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginBottom: 4,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  splitValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: -0.3,
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    borderTop: `1px solid ${colors.line}`,
    paddingTop: 18,
  },
  detailBlock: {},
  detailLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginBottom: 3,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 600,
  },
  detailSubvalue: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginTop: 2,
  },

  poolBlock: {
    marginBottom: 18,
  },
  poolTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  poolLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  poolPercent: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: colors.ink,
  },
  poolValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: colors.inkSoft,
  },
  poolTrack: {
    display: 'flex',
    width: '100%',
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: 9,
  },
  poolSegCaptado: {
    height: '100%',
    backgroundColor: colors.ink,
  },
  poolSegOferta: {
    height: '100%',
    backgroundColor: colors.inkFaint,
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 3px, transparent 3px, transparent 7px)',
  },
  poolCaption: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  poolCaptionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  poolCaptionItemAtrasada: {
    color: colors.red,
    fontWeight: 700,
  },
  poolCaptionDotCaptado: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.ink,
    flexShrink: 0,
  },
  poolCaptionDotOferta: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.inkFaint,
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1.5px, transparent 1.5px, transparent 3.5px)',
    flexShrink: 0,
  },
  poolCaptionDotRestante: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.line,
    border: `1px solid ${colors.inkFaint}`,
    flexShrink: 0,
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: colors.inkFaint,
    fontSize: 14,
  },

  // Modal de filtros
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colors.overlay,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: '14px 20px 28px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalGrabber: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.line,
    margin: '0 auto 18px',
  },
  modalHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: -0.3,
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.card,
    border: 'none',
    cursor: 'pointer',
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 10,
  },
  modalPillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 26,
  },
  filterPill: {
    padding: '10px 16px',
    borderRadius: 999,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${colors.line}`,
    backgroundColor: colors.card,
    color: colors.inkSoft,
    whiteSpace: 'nowrap',
  },
  filterPillActive: {
    backgroundColor: colors.dark,
    color: '#fff',
    border: `1px solid ${colors.dark}`,
  },
  modalFooterRow: {
    display: 'flex',
    gap: 10,
    marginTop: 6,
  },
  modalBtnGhost: {
    flex: 1,
    padding: '15px 0',
    borderRadius: 14,
    fontSize: 14.5,
    fontWeight: 700,
    border: `1px solid ${colors.line}`,
    backgroundColor: 'transparent',
    color: colors.ink,
    cursor: 'pointer',
  },
  modalBtnSolid: {
    flex: 2,
    padding: '15px 0',
    borderRadius: 14,
    fontSize: 14.5,
    fontWeight: 700,
    border: 'none',
    backgroundColor: colors.dark,
    color: '#fff',
    cursor: 'pointer',
  },
};

const STATUS_META = {
  captacao: { label: 'Em captação', icon: Clock, badgeStyle: styles.statusCaptacao },
  ativo: { label: 'Ativo', icon: Zap, badgeStyle: styles.statusAtivo },
  atrasado: { label: 'Atrasado', icon: AlertTriangle, badgeStyle: styles.statusAtrasado },
  quitado: { label: 'Quitado', icon: CheckCircle2, badgeStyle: styles.statusQuitado },
};

const CICLO_META = {
  diario: { label: 'Diário', unidade: 'dia', dias: 1, parcelasLabel: 'diárias' },
  semanal: { label: 'Semanal', unidade: 'semana', dias: 7, parcelasLabel: 'semanais' },
  mensal: { label: 'Mensal', unidade: 'mês', dias: 30, parcelasLabel: 'mensais' },
};

const FILTERS = [
  { key: 'todas', label: 'Todos' },
  { key: 'ativo', label: 'Ativos' },
  { key: 'atrasado', label: 'Atrasados' },
  { key: 'captacao', label: 'Em captação' },
  { key: 'quitado', label: 'Quitados' },
];

const RISCOS = [
  { key: 'todos', label: 'Todos os riscos' },
  { key: 'Baixo', label: 'Baixo' },
  { key: 'Médio', label: 'Médio' },
  { key: 'Alto', label: 'Alto' },
];

const posicoes = [
  {
    id: 1,
    contratoId: 'EMP-2026-30291',
    valorInvestido: 900,
    taxaJurosTotal: 18,
    prazoDias: 45,
    ciclo: 'semanal',
    status: 'captacao',
    jaCaptado: 3100,
    valorTotalPedido: 5000,
    numCredores: 14,
    risco: 'Médio',
    tomadorScore: 'B',
    emprestimosAnteriores: 3,
    valorTotalTomado: 12400,
  },
  {
    id: 2,
    contratoId: 'EMP-2026-90214',
    valorInvestido: 2000,
    taxaJurosTotal: 22,
    prazoDias: 90,
    ciclo: 'mensal',
    status: 'ativo',
    parcelasTotal: 3,
    parcelasRecebidas: 1,
    diasDesdeConcessao: 35,
    proximaData: '4 de agosto',
    risco: 'Alto',
    tomadorScore: 'C',
    emprestimosAnteriores: 1,
    valorTotalTomado: 3000,
  },
  {
    id: 3,
    contratoId: 'EMP-2026-11875',
    valorInvestido: 1200,
    taxaJurosTotal: 15,
    prazoDias: 30,
    ciclo: 'mensal',
    status: 'atrasado',
    parcelasTotal: 1,
    parcelasRecebidas: 0,
    diasDesdeConcessao: 35,
    diasAtraso: 5,
    risco: 'Médio',
    tomadorScore: 'B',
    emprestimosAnteriores: 2,
    valorTotalTomado: 4100,
  },
  {
    id: 4,
    contratoId: 'EMP-2026-56002',
    valorInvestido: 500,
    taxaJurosTotal: 10,
    prazoDias: 15,
    ciclo: 'diario',
    status: 'quitado',
    parcelasTotal: 15,
    parcelasRecebidas: 15,
    diasDesdeConcessao: 15,
    risco: 'Baixo',
    tomadorScore: 'A',
    emprestimosAnteriores: 6,
    valorTotalTomado: 28500,
  },
];

const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function AtivosScreen() {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [riscoFilter, setRiscoFilter] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Estado provisório dentro do modal — só aplica ao confirmar
  const [draftFilter, setDraftFilter] = useState(activeFilter);
  const [draftRisco, setDraftRisco] = useState(riscoFilter);

  const openModal = () => {
    setDraftFilter(activeFilter);
    setDraftRisco(riscoFilter);
    setModalOpen(true);
  };

  const applyFilters = () => {
    setActiveFilter(draftFilter);
    setRiscoFilter(draftRisco);
    setModalOpen(false);
  };

  const clearFilters = () => {
    setDraftFilter('todas');
    setDraftRisco('todos');
  };

  const filtersActive = activeFilter !== 'todas' || riscoFilter !== 'todos';

  const filtered = posicoes.filter((p) => {
    const statusOk = activeFilter === 'todas' || p.status === activeFilter;
    const riscoOk = riscoFilter === 'todos' || p.risco === riscoFilter;
    const buscaOk =
      busca.trim() === '' ||
      p.contratoId.toLowerCase().includes(busca.trim().toLowerCase());
    return statusOk && riscoOk && buscaOk;
  });

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => {}}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Ativos</div>
      </div>

      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <Search size={17} color={colors.inkFaint} strokeWidth={2} />
          <input
            style={styles.searchInput}
            placeholder="Buscar por número do contrato"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button
          style={{
            ...styles.filterBtn,
            ...(filtersActive ? styles.filterBtnActive : {}),
          }}
          onClick={openModal}
        >
          <SlidersHorizontal
            size={18}
            color={filtersActive ? '#fff' : colors.ink}
            strokeWidth={2.2}
          />
          {filtersActive && <span style={styles.filterBadge} />}
        </button>
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.emptyState}>Nenhuma posição nessa categoria.</div>
        )}

        {filtered.map((p) => {
          const meta = STATUS_META[p.status];
          const Icon = meta.icon;
          const cicloMeta = CICLO_META[p.ciclo];
          const totalComRetorno = p.valorInvestido * (1 + p.taxaJurosTotal / 100);
          const retornoTotal = totalComRetorno - p.valorInvestido;

          return (
            <div
              key={p.id}
              style={{
                ...styles.posicaoCard,
                ...(p.status === 'atrasado' ? styles.posicaoCardAtrasada : {}),
                ...(p.status === 'captacao' ? styles.posicaoCardCaptacao : {}),
              }}
            >
              <div style={styles.posicaoTopRow}>
                <div style={styles.eyebrow}>Retorno do contrato</div>
                <div style={{ ...styles.statusBadge, ...meta.badgeStyle }}>
                  <Icon size={13} strokeWidth={2.4} />
                  {meta.label}
                </div>
              </div>

              <div style={styles.heroValue}>
                <span style={styles.heroValueSign}>+</span>
                {p.taxaJurosTotal}%
              </div>
              <div style={styles.heroCaption}>
                Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {p.prazoDias} dias
              </div>

              <div style={styles.splitRow}>
                <div style={styles.splitBlock}>
                  <div style={styles.splitLabel}>Valor investido</div>
                  <div style={styles.splitValue}>R$ {formatBRL(p.valorInvestido)}</div>
                </div>
                <div style={{ ...styles.splitBlock, ...styles.splitBlockRight }}>
                  <div style={styles.splitLabel}>Retorno</div>
                  <div style={styles.splitValue}>R$ {formatBRL(Math.round(retornoTotal))}</div>
                </div>
              </div>

              {p.status === 'captacao' ? (
                (() => {
                  const pctCaptado = Math.round((p.jaCaptado / p.valorTotalPedido) * 100);
                  const pctPosicao = Math.round((p.valorInvestido / p.valorTotalPedido) * 100);
                  const pctPosicaoClamped = Math.min(pctPosicao, 100 - pctCaptado);
                  const pctRestante = Math.max(0, 100 - pctCaptado - pctPosicao);
                  return (
                    <div style={styles.poolBlock}>
                      <div style={styles.poolLabel}>Captação do pedido</div>
                      <div style={styles.poolTopRow}>
                        <span style={styles.poolPercent}>{pctCaptado + pctPosicao}% captado</span>
                        <span style={styles.poolValue}>
                          R$ {formatBRL(p.jaCaptado + p.valorInvestido)} de R$ {formatBRL(p.valorTotalPedido)}
                        </span>
                      </div>
                      <div style={styles.poolTrack}>
                        <div style={{ ...styles.poolSegCaptado, width: `${pctCaptado}%` }} />
                        <div style={{ ...styles.poolSegOferta, width: `${pctPosicaoClamped}%` }} />
                      </div>
                      <div style={styles.poolCaption}>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotCaptado} />
                          {pctCaptado}% outros credores
                        </span>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotOferta} />
                          {pctPosicao}% sua posição
                        </span>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotRestante} />
                          {pctRestante}% captando
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const valorParcelaTotal = totalComRetorno / p.parcelasTotal;
                  const recebido = valorParcelaTotal * p.parcelasRecebidas;
                  const pctRecebido = Math.round((recebido / totalComRetorno) * 100);
                  return (
                    <div style={styles.poolBlock}>
                      <div style={styles.poolLabel}>Pagamento do contrato</div>
                      <div style={styles.poolTopRow}>
                        <span style={styles.poolPercent}>{pctRecebido}% pago</span>
                        <span style={styles.poolValue}>
                          R$ {formatBRL(Math.round(recebido))} de R$ {formatBRL(Math.round(totalComRetorno))}
                        </span>
                      </div>
                      <div style={styles.poolTrack}>
                        <div style={{ ...styles.poolSegCaptado, width: `${pctRecebido}%` }} />
                      </div>
                      <div style={styles.poolCaption}>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotCaptado} />
                          pago
                        </span>
                        <span
                          style={{
                            ...styles.poolCaptionItem,
                            ...(p.status === 'atrasado' ? styles.poolCaptionItemAtrasada : {}),
                          }}
                        >
                          <span style={styles.poolCaptionDotRestante} />
                          {p.status === 'atrasado'
                            ? `atrasado há ${p.diasAtraso} dias`
                            : p.status === 'quitado'
                            ? 'contrato encerrado'
                            : `próximo em ${p.proximaData}`}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}

              <div style={styles.detailsGrid}>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Prazo</div>
                  <div style={styles.detailValue}>{p.prazoDias} dias</div>
                  <div style={styles.detailSubvalue}>parcelas {cicloMeta.parcelasLabel}</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Risco</div>
                  <div style={styles.detailValue}>{p.risco}</div>
                  <div style={styles.detailSubvalue}>score {p.tomadorScore}</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Histórico</div>
                  <div style={styles.detailValue}>
                    {p.emprestimosAnteriores === 0
                      ? 'Primeiro empréstimo'
                      : `${p.emprestimosAnteriores + 1}º empréstimo`}
                  </div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Já tomado</div>
                  <div style={styles.detailValue}>
                    {p.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(p.valorTotalTomado)}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalGrabber} />
            <div style={styles.modalHeaderRow}>
              <div style={styles.modalTitle}>Filtrar posições</div>
              <button style={styles.modalClose} onClick={() => setModalOpen(false)}>
                <X size={16} color={colors.ink} strokeWidth={2.2} />
              </button>
            </div>

            <div style={styles.modalSectionLabel}>Status</div>
            <div style={styles.modalPillsWrap}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  style={{
                    ...styles.filterPill,
                    ...(draftFilter === f.key ? styles.filterPillActive : {}),
                  }}
                  onClick={() => setDraftFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={styles.modalSectionLabel}>Risco</div>
            <div style={styles.modalPillsWrap}>
              {RISCOS.map((r) => (
                <button
                  key={r.key}
                  style={{
                    ...styles.filterPill,
                    ...(draftRisco === r.key ? styles.filterPillActive : {}),
                  }}
                  onClick={() => setDraftRisco(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div style={styles.modalFooterRow}>
              <button style={styles.modalBtnGhost} onClick={clearFilters}>
                Limpar
              </button>
              <button style={styles.modalBtnSolid} onClick={applyFilters}>
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
