import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, X, Check } from 'lucide-react';

// Mesma paleta monocromática do resto do app — red/redBg reservado pra atraso,
// não é usado nessa tela (ofertas ainda não têm posição em atraso)
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
  subtitle: {
    padding: '14px 20px 4px',
    fontSize: 13.5,
    color: colors.inkSoft,
  },

  // Busca + filtro — mesmo padrão de AtivosScreen
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '14px 16px 18px',
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

  // Card de oferta — mesma estrutura do posicaoCard de AtivosScreen
  ofertaCard: {
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: '22px 20px 18px',
  },
  ofertaTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: colors.inkFaint,
    marginBottom: 6,
  },
  riscoBadge: {
    padding: '6px 11px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: colors.chipBg,
    color: colors.inkSoft,
    flexShrink: 0,
  },

  heroValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: -1,
    lineHeight: 1,
    marginBottom: 8,
  },
  heroValueSign: {
    fontSize: 22,
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
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.3,
  },

  poolBlock: {
    marginBottom: 18,
  },
  poolLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  poolTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
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

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    borderTop: `1px solid ${colors.line}`,
    paddingTop: 18,
    marginBottom: 14,
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

  buttonRow: {
    display: 'flex',
    gap: 10,
  },
  detalhesButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 0',
    borderRadius: 14,
    backgroundColor: colors.chipBg,
    border: 'none',
    fontSize: 14,
    fontWeight: 700,
    color: colors.ink,
    cursor: 'pointer',
  },
  aceitarButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 0',
    borderRadius: 14,
    backgroundColor: colors.dark,
    border: 'none',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
  },

  // Toast flutuante — aparece ao aceitar uma oferta
  toastWrap: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 388,
    backgroundColor: colors.dark,
    borderRadius: 18,
    padding: '16px 16px 14px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
    zIndex: 60,
  },
  toastTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  toastIconWrap: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toastTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14.5,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 2,
  },
  toastSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
  },
  toastCloseButton: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  toastActionButton: {
    width: '100%',
    padding: '11px 0',
    borderRadius: 12,
    backgroundColor: '#fff',
    border: 'none',
    color: colors.dark,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 10,
  },
  toastProgressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  toastProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 999,
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: colors.inkFaint,
    fontSize: 14,
  },

  // Modal de filtros — mesmo padrão de AtivosScreen
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

const CLASSIFICACOES = [
  { key: 'todos', label: 'Todas' },
  { key: 'A', label: 'A' },
  { key: 'B', label: 'B' },
  { key: 'C', label: 'C' },
  { key: 'D', label: 'D' },
  { key: 'E', label: 'E' },
  { key: 'F', label: 'F' },
];

const CICLOS_FILTRO = [
  { key: 'todos', label: 'Todos' },
  { key: 'Diário', label: 'Diário' },
  { key: 'Semanal', label: 'Semanal' },
  { key: 'Mensal', label: 'Mensal' },
];

// Ofertas de exemplo — mesmo formato de dado usado por OfertaInvestimentoCard,
// para que cada card aqui possa futuramente abrir o mesmo componente de decisão
const ofertas = [
  {
    id: 1,
    ofertaId: 'OFR-2026-40218',
    valor: 1200,
    taxaRetorno: 4.8,
    prazoDias: 45,
    ciclo: 'Semanal',
    risco: 'Baixo',
    tomadorScore: 'A',
    valorTotalPedido: 5000,
    jaCaptado: 3100,
    numCredores: 14,
    emprestimosAnteriores: 3,
    valorTotalTomado: 12400,
  },
  {
    id: 2,
    ofertaId: 'OFR-2026-40219',
    valor: 800,
    taxaRetorno: 7.2,
    prazoDias: 90,
    ciclo: 'Mensal',
    risco: 'Alto',
    tomadorScore: 'C',
    valorTotalPedido: 3000,
    jaCaptado: 900,
    numCredores: 6,
    emprestimosAnteriores: 1,
    valorTotalTomado: 3000,
  },
  {
    id: 3,
    ofertaId: 'OFR-2026-40220',
    valor: 500,
    taxaRetorno: 2.1,
    prazoDias: 15,
    ciclo: 'Diário',
    risco: 'Baixo',
    tomadorScore: 'A',
    valorTotalPedido: 1800,
    jaCaptado: 1500,
    numCredores: 22,
    emprestimosAnteriores: 6,
    valorTotalTomado: 28500,
  },
  {
    id: 4,
    ofertaId: 'OFR-2026-40221',
    valor: 2000,
    taxaRetorno: 5.5,
    prazoDias: 60,
    ciclo: 'Semanal',
    risco: 'Médio',
    tomadorScore: 'B',
    valorTotalPedido: 8000,
    jaCaptado: 2200,
    numCredores: 9,
    emprestimosAnteriores: 2,
    valorTotalTomado: 4100,
  },
  {
    id: 5,
    ofertaId: 'OFR-2026-40222',
    valor: 350,
    taxaRetorno: 3.4,
    prazoDias: 30,
    ciclo: 'Mensal',
    risco: 'Médio',
    tomadorScore: 'B',
    valorTotalPedido: 2500,
    jaCaptado: 2100,
    numCredores: 11,
    emprestimosAnteriores: 0,
    valorTotalTomado: 0,
  },
];

const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const TOAST_SEGUNDOS = 6;

// Toast de confirmação — some sozinho após TOAST_SEGUNDOS, mas pode ser fechado
// a qualquer momento ou usado para ir direto ao acompanhamento da captação
function ToastOfertaAceita({ oferta, onClose, onAcompanhar }) {
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    // Começa a barra em 100% e só no próximo frame anima até 0% — precisa desse
    // atraso mínimo pra transição de CSS realmente disparar em vez de "pular" direto
    const raf = requestAnimationFrame(() => setAnimar(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={styles.toastWrap}>
      <div style={styles.toastTopRow}>
        <div style={styles.toastIconWrap}>
          <Check size={16} color="#fff" strokeWidth={2.6} />
        </div>
        <div style={styles.toastTextBlock}>
          <div style={styles.toastTitle}>Oferta aceita</div>
          <div style={styles.toastSubtitle}>
            R$ {formatBRL(oferta.valor)} investidos em {oferta.ofertaId}
          </div>
        </div>
        <button style={styles.toastCloseButton} onClick={onClose}>
          <X size={14} color="#fff" strokeWidth={2.4} />
        </button>
      </div>

      <button style={styles.toastActionButton} onClick={onAcompanhar}>
        Acompanhar captação
      </button>

      <div style={styles.toastProgressTrack}>
        <div
          style={{
            ...styles.toastProgressFill,
            width: animar ? '0%' : '100%',
            transition: animar ? `width ${TOAST_SEGUNDOS}s linear` : 'none',
          }}
        />
      </div>
    </div>
  );
}

export default function OfertasScreen() {
  const [classificacaoFilter, setClassificacaoFilter] = useState('todos');
  const [cicloFilter, setCicloFilter] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [aceitas, setAceitas] = useState([]);
  const [toast, setToast] = useState(null); // guarda a oferta aceita em exibição, ou null
  const toastTimeoutRef = useRef(null);

  const closeToast = () => {
    clearTimeout(toastTimeoutRef.current);
    setToast(null);
  };

  const handleAceitar = (oferta) => {
    setAceitas((prev) => (prev.includes(oferta.id) ? prev : [...prev, oferta.id]));

    clearTimeout(toastTimeoutRef.current);
    setToast(oferta);
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_SEGUNDOS * 1000);
  };

  // TODO: no app real, deve navegar para a tela de detalhes do ativo (AtivoDetalheScreen)
  const handleAcompanhar = (oferta) => {
    closeToast();
    console.log('Ir para detalhes do ativo', oferta.ofertaId);
  };

  useEffect(() => () => clearTimeout(toastTimeoutRef.current), []);

  // TODO: no app real, deve navegar para o sheet de decisão completo (OfertaInvestimentoCard),
  // que já traz "sobre o tomador", propósito declarado e o contador de expiração da oferta.
  const handleVerDetalhes = (oferta) => {
    console.log('Abrir detalhes da oferta', oferta.ofertaId);
  };

  // Estado provisório dentro do modal — só aplica ao confirmar
  const [draftClassificacao, setDraftClassificacao] = useState(classificacaoFilter);
  const [draftCiclo, setDraftCiclo] = useState(cicloFilter);

  const openModal = () => {
    setDraftClassificacao(classificacaoFilter);
    setDraftCiclo(cicloFilter);
    setModalOpen(true);
  };

  const applyFilters = () => {
    setClassificacaoFilter(draftClassificacao);
    setCicloFilter(draftCiclo);
    setModalOpen(false);
  };

  const clearFilters = () => {
    setDraftClassificacao('todos');
    setDraftCiclo('todos');
  };

  const filtersActive = classificacaoFilter !== 'todos' || cicloFilter !== 'todos';

  const filtered = ofertas.filter((o) => {
    if (aceitas.includes(o.id)) return false;
    const classificacaoOk = classificacaoFilter === 'todos' || o.tomadorScore === classificacaoFilter;
    const cicloOk = cicloFilter === 'todos' || o.ciclo === cicloFilter;
    const buscaOk =
      busca.trim() === '' || o.ofertaId.toLowerCase().includes(busca.trim().toLowerCase());
    return classificacaoOk && cicloOk && buscaOk;
  });

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Ofertas</div>
      </div>

      <div style={styles.subtitle}>{ofertas.length} ofertas disponíveis</div>

      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <Search size={17} color={colors.inkFaint} strokeWidth={2} />
          <input
            style={styles.searchInput}
            placeholder="Buscar por número da oferta"
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
          <div style={styles.emptyState}>Nenhuma oferta encontrada.</div>
        )}

        {filtered.map((o) => {
          const retornoValor = Math.round(o.valor * (o.taxaRetorno / 100));
          const pctCaptado = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
          const pctOferta = Math.round((o.valor / o.valorTotalPedido) * 100);
          const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);

          return (
            <div key={o.id} style={styles.ofertaCard}>
              <div style={styles.ofertaTopRow}>
                <div style={styles.eyebrow}>Retorno oferecido</div>
                <div style={styles.riscoBadge}>Classificação {o.tomadorScore}</div>
              </div>

              <div style={styles.heroValue}>
                <span style={styles.heroValueSign}>+</span>
                {o.taxaRetorno}%
              </div>
              <div style={styles.heroCaption}>
                Rendimento de R$ {formatBRL(retornoValor)} em {o.prazoDias} dias
              </div>

              <div style={styles.splitRow}>
                <div style={styles.splitBlock}>
                  <div style={styles.splitLabel}>Investimento</div>
                  <div style={styles.splitValue}>R$ {formatBRL(o.valor)}</div>
                </div>
                <div style={{ ...styles.splitBlock, ...styles.splitBlockRight }}>
                  <div style={styles.splitLabel}>Retorno</div>
                  <div style={styles.splitValue}>R$ {formatBRL(o.valor + retornoValor)}</div>
                </div>
              </div>

              <div style={styles.poolBlock}>
                <div style={styles.poolLabel}>Captação do pedido</div>
                <div style={styles.poolTopRow}>
                  <span style={styles.poolPercent}>{pctCaptado}% captado</span>
                  <span style={styles.poolValue}>
                    R$ {formatBRL(o.jaCaptado)} de R$ {formatBRL(o.valorTotalPedido)}
                  </span>
                </div>
                <div style={styles.poolTrack}>
                  <div style={{ ...styles.poolSegCaptado, width: `${pctCaptado}%` }} />
                  <div style={{ ...styles.poolSegOferta, width: `${pctOfertaClamped}%` }} />
                </div>
                <div style={styles.poolCaption}>
                  <span style={styles.poolCaptionItem}>
                    <span style={styles.poolCaptionDotCaptado} />
                    captado
                  </span>
                  <span style={styles.poolCaptionItem}>
                    <span style={styles.poolCaptionDotOferta} />
                    esta oferta
                  </span>
                  <span style={styles.poolCaptionItem}>
                    <span style={styles.poolCaptionDotRestante} />
                    captando
                  </span>
                </div>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Prazo</div>
                  <div style={styles.detailValue}>{o.prazoDias} dias</div>
                  <div style={styles.detailSubvalue}>parcelas {o.ciclo.toLowerCase()}s</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Classificação</div>
                  <div style={styles.detailValue}>{o.tomadorScore}</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Histórico</div>
                  <div style={styles.detailValue}>{o.emprestimosAnteriores + 1}º empréstimo</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Já tomado</div>
                  <div style={styles.detailValue}>
                    {o.emprestimosAnteriores === 0 ? 'R$ 0' : `R$ ${formatBRL(o.valorTotalTomado)}`}
                  </div>
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button style={styles.detalhesButton} onClick={() => handleVerDetalhes(o)}>
                  Ver detalhes
                </button>
                <button style={styles.aceitarButton} onClick={() => handleAceitar(o)}>
                  Aceitar oferta
                </button>
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
              <div style={styles.modalTitle}>Filtrar ofertas</div>
              <button style={styles.modalClose} onClick={() => setModalOpen(false)}>
                <X size={16} color={colors.ink} strokeWidth={2.2} />
              </button>
            </div>

            <div style={styles.modalSectionLabel}>Classificação</div>
            <div style={styles.modalPillsWrap}>
              {CLASSIFICACOES.map((c) => (
                <button
                  key={c.key}
                  style={{
                    ...styles.filterPill,
                    ...(draftClassificacao === c.key ? styles.filterPillActive : {}),
                  }}
                  onClick={() => setDraftClassificacao(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div style={styles.modalSectionLabel}>Ciclo</div>
            <div style={styles.modalPillsWrap}>
              {CICLOS_FILTRO.map((c) => (
                <button
                  key={c.key}
                  style={{
                    ...styles.filterPill,
                    ...(draftCiclo === c.key ? styles.filterPillActive : {}),
                  }}
                  onClick={() => setDraftCiclo(c.key)}
                >
                  {c.label}
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

      {toast && (
        <ToastOfertaAceita
          key={toast.id}
          oferta={toast}
          onClose={closeToast}
          onAcompanhar={() => handleAcompanhar(toast)}
        />
      )}
    </div>
  );
}
