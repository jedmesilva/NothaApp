import React, { useState, useRef } from 'react';
import { Bell, ArrowDown, Plus, Calendar, ChevronRight, Home, Landmark, AlertTriangle, TrendingUp, Wallet, Tag, ArrowLeft, ArrowUpRight, Check } from 'lucide-react';

// Paleta monocromática: só tons de preto, cinza e branco — sem cor de destaque
const colors = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipUrgent: '#ECECEF',
  chipMuted: '#F4F5F7',
  // Únicas cores fora do monocromático — reservadas só pra sinalizar urgência real
  // de vencimento (vencida/próxima). Não usadas em mais nada na tela.
  red: '#C0392B',
  redBg: '#FBEAE8',
  amber: '#A6690A',
  amberBg: '#FCF1DC',
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
    paddingBottom: 104,
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 20px 8px',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors.dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
    border: 'none',
    cursor: 'pointer',
  },
  tabWrap: {
    display: 'flex',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    flex: 1,
    margin: '0 14px',
    maxWidth: 240,
  },
  tabBase: {
    flex: 1,
    textAlign: 'center',
    padding: '9px 0',
    borderRadius: 999,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    transition: 'all 0.15s ease',
  },
  bellWrap: {
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: colors.ink,
    border: `1.5px solid ${colors.card}`,
  },
  // Container de swipe — Crédito e Investir são duas páginas lado a lado,
  // sincronizadas com o toggle do header (arrastar o conteúdo move o toggle,
  // tocar no toggle rola o conteúdo)
  swipeContainer: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    width: '100%',
    boxSizing: 'border-box',
  },
  swipePage: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },

  greeting: {
    padding: '16px 20px 18px',
    fontSize: 15,
    color: colors.inkSoft,
  },
  greetingName: {
    color: colors.ink,
    fontWeight: 700,
  },

  // Hero — limite, cartão escuro com gradiente, o elemento de assinatura da tela
  primaryCard: {
    borderRadius: 28,
    margin: '0 16px 14px',
    padding: '28px 24px 26px',
    background: `linear-gradient(150deg, ${colors.dark} 0%, ${colors.darkSoft} 100%)`,
    color: '#fff',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 10,
  },
  eyebrowLight: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: colors.inkFaint,
    marginBottom: 10,
  },
  bigValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: -1,
    lineHeight: 1.05,
    color: '#fff',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 18,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 999,
  },
  progressCaption: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 9,
    marginBottom: 22,
  },
  primaryButton: {
    width: '100%',
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: '#fff',
    color: colors.dark,
    fontSize: 15.5,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 0.1,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.35)',
    cursor: 'not-allowed',
  },

  // Saldo em conta
  secondaryCard: {
    borderRadius: 24,
    margin: '0 16px 14px',
    padding: '22px 22px 20px',
    backgroundColor: colors.card,
  },
  secondaryValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  helperText: {
    fontSize: 13.5,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: 18,
  },
  actionButtonRow: {
    display: 'flex',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 0',
    borderRadius: 14,
    backgroundColor: '#F4F5F7',
    border: 'none',
    fontSize: 14.5,
    fontWeight: 600,
    color: colors.ink,
    cursor: 'pointer',
  },

  // Vencimentos
  vencimentosCard: {
    borderRadius: 24,
    margin: '0 16px',
    padding: '22px 20px 14px',
    backgroundColor: colors.card,
  },
  vencimentosSummary: {
    fontSize: 13.5,
    color: colors.inkSoft,
    marginTop: -2,
    marginBottom: 16,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 18,
  },
  alertBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 14,
    backgroundColor: colors.redBg,
    border: `1px solid ${colors.red}`,
    marginBottom: 14,
  },
  alertText: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.red,
  },
  statBlock: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.line,
    margin: '0 18px',
  },
  statValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: -0.3,
  },
  parcelaRowVencida: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 12px',
    borderRadius: 16,
    backgroundColor: colors.redBg,
    border: `1.5px solid ${colors.red}`,
    marginBottom: 10,
  },
  parcelaRowProxima: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 12px',
    borderRadius: 16,
    backgroundColor: colors.amberBg,
    marginBottom: 10,
  },
  parcelaRowFutura: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 12px',
    borderRadius: 16,
    backgroundColor: '#F4F5F7',
    marginBottom: 10,
  },
  installmentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  installmentIconMuted: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loanTag: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  installmentLabel: {
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: 2,
  },
  installmentLabelVencida: {
    color: colors.red,
    fontWeight: 700,
  },
  installmentLabelProxima: {
    color: colors.amber,
    fontWeight: 700,
  },
  installmentValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 17,
    fontWeight: 700,
  },
  installmentValueMuted: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    color: colors.inkSoft,
  },
  payButton: {
    padding: '10px 16px',
    borderRadius: 12,
    backgroundColor: colors.ink,
    border: 'none',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  seeAllLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
    background: 'none',
    border: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.inkSoft,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    padding: '4px 0 0',
  },

  // Tela de Conta — overlay em tela cheia, aberto ao tocar no avatar
  contaOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colors.bg,
    zIndex: 60,
    overflowY: 'auto',
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
  },
  contaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '22px 20px 4px',
  },
  contaBackButton: {
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
  contaTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: -0.2,
  },
  contaHero: {
    borderRadius: 28,
    margin: '18px 16px 14px',
    padding: '26px 24px 24px',
    background: `linear-gradient(150deg, ${colors.dark} 0%, ${colors.darkSoft} 100%)`,
    color: '#fff',
  },
  contaSaldoValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: -1,
    marginBottom: 20,
  },
  extratoSection: {
    margin: '0 16px 14px',
    padding: '20px 20px 8px',
    borderRadius: 22,
    backgroundColor: colors.card,
  },
  extratoTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 14,
  },
  extratoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottom: `1px solid ${colors.line}`,
  },
  extratoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.chipUrgent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  extratoDesc: {
    fontSize: 13.5,
    fontWeight: 600,
    marginBottom: 2,
  },
  extratoData: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  extratoValor: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14.5,
    fontWeight: 700,
    flexShrink: 0,
  },

  // Ofertas — lista de empréstimos em captação disponíveis pra investir
  ofertasHeader: {
    padding: '20px 20px 6px',
  },
  ofertasTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  ofertasSubtitle: {
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  saldoChip: {
    margin: '14px 20px 4px',
    padding: '10px 14px',
    borderRadius: 12,
    backgroundColor: colors.chipUrgent,
    fontSize: 12.5,
    color: colors.inkSoft,
    fontWeight: 600,
  },
  ofertaCard: {
    borderRadius: 22,
    margin: '14px 16px 0',
    padding: '24px 20px 22px',
    backgroundColor: colors.card,
  },
  ofertaEyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: colors.inkFaint,
    marginBottom: 6,
  },
  ofertaRetornoValor: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: -1.1,
    lineHeight: 1,
    marginBottom: 8,
  },
  ofertaRetornoSign: {
    fontSize: 24,
    fontWeight: 700,
    marginRight: 2,
  },
  ofertaCaption: {
    fontSize: 13.5,
    color: colors.inkSoft,
    marginBottom: 18,
  },
  ofertaSplitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  ofertaSplitBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  ofertaSplitBlockRight: {
    alignItems: 'flex-end',
  },
  ofertaSplitLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginBottom: 4,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  ofertaSplitValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: -0.3,
  },
  ofertaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    borderTop: `1px solid ${colors.line}`,
    borderBottom: `1px solid ${colors.line}`,
    padding: '18px 0',
    marginBottom: 18,
  },
  ofertaButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: colors.dark,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
  poolBlock: {},
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

  // Investir — placeholder simples, mesma linguagem visual
  investirEmpty: {
    margin: '60px 16px 0',
    padding: '40px 24px',
    borderRadius: 28,
    backgroundColor: colors.card,
    textAlign: 'center',
  },
  investirIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.chipUrgent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
  },
  investirTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  investirCaption: {
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 1.5,
  },

  // Bottom nav — flutuante, estilo pill
  bottomNav: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 388,
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: colors.dark,
    borderRadius: 20,
    padding: '10px 8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px 16px',
    borderRadius: 999,
  },
  navItemCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px 10px',
    borderRadius: 999,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: 600,
  },
  navLabelCompact: {
    fontSize: 12,
    fontWeight: 600,
  },
};

export default function CreditoHomeScreen() {
  const [activeTab, setActiveTab] = useState('credito');
  const [showConta, setShowConta] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [activeInvestNav, setActiveInvestNav] = useState('inicio');
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Tocar no toggle rola o conteúdo até a página correspondente
  const goToTab = (tab) => {
    setActiveTab(tab);
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: tab === 'credito' ? 0 : container.clientWidth, behavior: 'smooth' });
  };

  // Arrastar o conteúdo atualiza o toggle — mas só quando a rolagem sossega,
  // não a cada frame do gesto/animação (senão o toggle pisca entre estados
  // intermediários até a rolagem terminar)
  const handleSwipeScroll = (e) => {
    const container = e.target;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveTab(index === 0 ? 'credito' : 'investir');
    }, 100);
  };

  const limiteTotal = 10000;
  const limiteDisponivel = 1500;
  const limiteUsado = limiteTotal - limiteDisponivel;
  const percentUsado = Math.round((limiteUsado / limiteTotal) * 100);

  const saldoConta = 8500;

  const extrato = [
    { id: 1, desc: 'Depósito via Pix', data: '10 de julho', valor: 500, tipo: 'entrada' },
    { id: 2, desc: 'Pagamento de parcela', data: '05 de julho', valor: -331, tipo: 'saida' },
    { id: 3, desc: 'Saque', data: '28 de junho', valor: -300, tipo: 'saida' },
    { id: 4, desc: 'Empréstimo liberado', data: '20 de junho', valor: 3200, tipo: 'entrada' },
  ];

  // Ofertas — os mesmos empréstimos em captação que aparecem em "Empréstimos"
  // do lado do tomador, aqui do lado do investidor (credor em potencial)
  const CICLO_LABEL = { diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal' };
  const ofertas = [
    {
      id: 3,
      valorTotalPedido: 5000,
      taxaJurosTotal: 18,
      prazoDias: 45,
      ciclo: 'semanal',
      jaCaptado: 3100,
      valorOferta: 900,
      numCredores: 14,
      risco: 'Médio',
      tomadorScore: 'B',
      emprestimosAnteriores: 3,
      valorTotalTomado: 12400,
    },
    {
      id: 6,
      valorTotalPedido: 12000,
      taxaJurosTotal: 22,
      prazoDias: 90,
      ciclo: 'mensal',
      jaCaptado: 4200,
      valorOferta: 2000,
      numCredores: 8,
      risco: 'Alto',
      tomadorScore: 'C',
      emprestimosAnteriores: 1,
      valorTotalTomado: 3000,
    },
    {
      id: 7,
      valorTotalPedido: 2500,
      taxaJurosTotal: 10,
      prazoDias: 15,
      ciclo: 'diario',
      jaCaptado: 2100,
      valorOferta: 300,
      numCredores: 22,
      risco: 'Baixo',
      tomadorScore: 'A',
      emprestimosAnteriores: 6,
      valorTotalTomado: 28500,
    },
  ];

  const formatBRL = (value) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatData = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  // Mesmos empréstimos (e mesma lógica de datas) da tela de Empréstimos — os
  // números de "Vencimentos" abaixo vêm de agregar os empréstimos ativos/atrasados,
  // não de um valor solto e desconectado
  const CICLO_DIAS = { diario: 1, semanal: 7, mensal: 30 };
  const emprestimosAtivos = [
    {
      id: 1,
      valor: 8500,
      taxaJurosTotal: 20,
      prazoDias: 60,
      ciclo: 'mensal',
      parcelasTotal: 2,
      parcelasPagas: 0,
      diasDesdeConcessao: 36,
      status: 'atrasado',
    },
    {
      id: 2,
      valor: 3200,
      taxaJurosTotal: 12,
      prazoDias: 90,
      ciclo: 'semanal',
      parcelasTotal: 13,
      parcelasPagas: 6,
      diasDesdeConcessao: 42,
      status: 'ativo',
    },
  ];

  const hoje = new Date();

  // Conta quantas parcelas não pagas de cada empréstimo já venceram — olhando
  // todas as parcelas restantes, não só a próxima, já que o usuário pode ter
  // acumulado mais de uma em atraso
  const totalParcelasAtrasadas = emprestimosAtivos.reduce((soma, loan) => {
    const cicloDias = CICLO_DIAS[loan.ciclo];
    const dataConcessao = addDays(hoje, -loan.diasDesdeConcessao);
    let atrasadasDoEmprestimo = 0;
    for (let i = loan.parcelasPagas + 1; i <= loan.parcelasTotal; i++) {
      const dataParcela = addDays(dataConcessao, i * cicloDias);
      if (dataParcela < hoje) atrasadasDoEmprestimo++;
    }
    return soma + atrasadasDoEmprestimo;
  }, 0);

  const proximasParcelas = emprestimosAtivos
    .map((loan) => {
      const cicloDias = CICLO_DIAS[loan.ciclo];
      const totalAPagar = loan.valor * (1 + loan.taxaJurosTotal / 100);
      const valorParcela = totalAPagar / loan.parcelasTotal;
      const saldoDevedor = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
      const dataConcessao = addDays(hoje, -loan.diasDesdeConcessao);
      const dataProximaParcela = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
      const diasParaVencer = Math.round((dataProximaParcela - hoje) / (1000 * 60 * 60 * 24));
      const estado = diasParaVencer < 0 ? 'vencida' : diasParaVencer <= 5 ? 'proxima' : 'futura';
      return {
        loanId: loan.id,
        loanValor: loan.valor,
        valorParcela,
        saldoDevedor,
        parcelasRestantes: loan.parcelasTotal - loan.parcelasPagas,
        data: dataProximaParcela,
        estado,
      };
    })
    .sort((a, b) => a.data - b.data);

  const divida = {
    totalEmAberto: proximasParcelas.reduce((soma, p) => soma + p.saldoDevedor, 0),
    parcelasRestantes: proximasParcelas.reduce((soma, p) => soma + p.parcelasRestantes, 0),
  };

  const hour = new Date().getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="credito-home-screen" style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .credito-home-screen, .credito-home-screen *, .credito-home-screen *::before, .credito-home-screen *::after {
          box-sizing: border-box;
        }
        .swipe-container::-webkit-scrollbar { display: none; }
        .swipe-container { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div style={styles.header}>
        <button style={styles.avatar} onClick={() => setShowConta(true)}>R</button>

        <div style={styles.tabWrap}>
          <button
            style={{
              ...styles.tabBase,
              backgroundColor: activeTab === 'credito' ? colors.dark : 'transparent',
              color: activeTab === 'credito' ? '#fff' : colors.inkSoft,
            }}
            onClick={() => goToTab('credito')}
          >
            Crédito
          </button>
          <button
            style={{
              ...styles.tabBase,
              backgroundColor: activeTab === 'investir' ? colors.dark : 'transparent',
              color: activeTab === 'investir' ? '#fff' : colors.inkSoft,
            }}
            onClick={() => goToTab('investir')}
          >
            Investir
          </button>
        </div>

        <div style={styles.bellWrap}>
          <Bell size={19} color={colors.ink} strokeWidth={1.8} />
          <div style={styles.notifDot} />
        </div>
      </div>

      <div className="swipe-container" style={styles.swipeContainer} ref={scrollRef} onScroll={handleSwipeScroll}>
        <div style={styles.swipePage}>
          <div style={styles.greeting}>
            {saudacao}, <span style={styles.greetingName}>Rafael</span>
          </div>

      <div style={styles.primaryCard}>
        <div style={styles.eyebrow}>Limite disponível</div>
        <div style={styles.bigValue}>R$ {formatBRL(limiteDisponivel)}</div>

        <div style={styles.totalRow}>
          <span style={styles.totalText}>de R$ {formatBRL(limiteTotal)}</span>
        </div>

        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${percentUsado}%` }} />
        </div>
        <div style={styles.progressCaption}>
          <span>R$ {formatBRL(limiteUsado)} utilizados</span>
          <span>{percentUsado}%</span>
        </div>

        <button
          style={{
            ...styles.primaryButton,
            ...(limiteDisponivel <= 0 ? styles.primaryButtonDisabled : {}),
          }}
          disabled={limiteDisponivel <= 0}
        >
          {limiteDisponivel > 0 ? 'Solicitar empréstimo' : 'Limite esgotado'}
        </button>
      </div>

      <div style={styles.secondaryCard}>
        <div style={styles.eyebrowLight}>Saldo em conta</div>
        <div style={styles.secondaryValue}>R$ {formatBRL(saldoConta)}</div>
        <div style={styles.helperText}>Disponível para usar</div>

        <div style={styles.actionButtonRow}>
          <button style={styles.actionButton}>
            <ArrowDown size={17} strokeWidth={2} />
            Sacar
          </button>
          <button style={styles.actionButton}>
            <Plus size={17} strokeWidth={2} />
            Depositar
          </button>
        </div>
      </div>

      <div style={styles.vencimentosCard}>
        <div style={styles.eyebrowLight}>Vencimentos</div>

        <div style={styles.statsRow}>
          <div style={styles.statBlock}>
            <div style={{ ...styles.installmentLabel, marginBottom: 4 }}>Total em aberto</div>
            <div style={styles.statValue}>R$ {formatBRL(divida.totalEmAberto)}</div>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBlock}>
            <div style={{ ...styles.installmentLabel, marginBottom: 4 }}>Parcelas restantes</div>
            <div style={styles.statValue}>{divida.parcelasRestantes}</div>
          </div>
        </div>

        {totalParcelasAtrasadas > 0 && (
          <div style={styles.alertBar}>
            <AlertTriangle size={16} color={colors.red} strokeWidth={2.2} />
            <div style={styles.alertText}>
              Você tem {totalParcelasAtrasadas} {totalParcelasAtrasadas === 1 ? 'parcela em atraso' : 'parcelas em atraso'}
            </div>
          </div>
        )}

        {proximasParcelas.slice(0, 2).map((p) => {
          const rowStyle =
            p.estado === 'vencida'
              ? styles.parcelaRowVencida
              : p.estado === 'proxima'
              ? styles.parcelaRowProxima
              : styles.parcelaRowFutura;
          const iconStyle = p.estado === 'futura' ? styles.installmentIconMuted : styles.installmentIcon;
          const iconColor =
            p.estado === 'vencida' ? colors.red : p.estado === 'proxima' ? colors.amber : colors.inkFaint;
          const labelStyle =
            p.estado === 'vencida'
              ? styles.installmentLabelVencida
              : p.estado === 'proxima'
              ? styles.installmentLabelProxima
              : {};
          const valueStyle = p.estado === 'futura' ? styles.installmentValueMuted : styles.installmentValue;

          return (
            <div key={p.loanId} style={rowStyle}>
              <div style={iconStyle}>
                <Calendar size={p.estado === 'futura' ? 16 : 17} color={iconColor} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.loanTag}>Empréstimo de R$ {formatBRL(p.loanValor)}</div>
                <div style={{ ...styles.installmentLabel, ...labelStyle }}>
                  {p.estado === 'vencida' ? 'Venceu em ' : 'Vence em '}
                  {formatData(p.data)}
                </div>
                <div style={valueStyle}>R$ {formatBRL(Math.round(p.valorParcela))}</div>
              </div>
              <button style={styles.payButton}>Pagar</button>
            </div>
          );
        })}

        <button style={styles.seeAllLink}>
          Ver todas as parcelas
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
        </div>

        <div style={styles.swipePage}>
          {activeInvestNav === 'ofertas' ? (
            <>
              <div style={styles.ofertasHeader}>
                <div style={styles.ofertasTitle}>Ofertas</div>
                <div style={styles.ofertasSubtitle}>{ofertas.length} empréstimos disponíveis pra investir</div>
              </div>

              <div style={styles.saldoChip}>Seu saldo disponível: R$ {formatBRL(saldoConta)}</div>

              {ofertas.map((oferta) => {
                const percentCaptado = Math.round((oferta.jaCaptado / oferta.valorTotalPedido) * 100);
                const percentOferta = Math.round((oferta.valorOferta / oferta.valorTotalPedido) * 100);
                const percentOfertaClamped = Math.min(percentOferta, 100 - percentCaptado);
                const percentRestante = Math.max(0, 100 - percentCaptado - percentOferta);
                const retornoValor = Math.round(oferta.valorOferta * (oferta.taxaJurosTotal / 100));
                return (
                  <div key={oferta.id} style={styles.ofertaCard}>
                    <div style={styles.ofertaEyebrow}>Retorno oferecido</div>
                    <div style={styles.ofertaRetornoValor}>
                      <span style={styles.ofertaRetornoSign}>+</span>
                      {oferta.taxaJurosTotal}%
                    </div>
                    <div style={styles.ofertaCaption}>
                      Rendimento de R$ {formatBRL(retornoValor)} em {oferta.prazoDias} dias
                    </div>

                    <div style={styles.ofertaSplitRow}>
                      <div style={styles.ofertaSplitBlock}>
                        <div style={styles.ofertaSplitLabel}>Valor a investir</div>
                        <div style={styles.ofertaSplitValue}>R$ {formatBRL(oferta.valorOferta)}</div>
                      </div>
                      <div style={{ ...styles.ofertaSplitBlock, ...styles.ofertaSplitBlockRight }}>
                        <div style={styles.ofertaSplitLabel}>Retorno</div>
                        <div style={styles.ofertaSplitValue}>R$ {formatBRL(retornoValor)}</div>
                      </div>
                    </div>

                    <div style={styles.ofertaGrid}>
                      <div>
                        <div style={styles.detailLabel}>Prazo</div>
                        <div style={styles.detailValue}>{oferta.prazoDias} dias</div>
                        <div style={styles.detailSubvalue}>parcelas {CICLO_LABEL[oferta.ciclo].toLowerCase()}s</div>
                      </div>
                      <div>
                        <div style={styles.detailLabel}>Risco</div>
                        <div style={styles.detailValue}>{oferta.risco}</div>
                        <div style={styles.detailSubvalue}>score {oferta.tomadorScore}</div>
                      </div>
                      <div>
                        <div style={styles.detailLabel}>Histórico</div>
                        <div style={styles.detailValue}>
                          {oferta.emprestimosAnteriores === 0
                            ? 'Primeiro empréstimo'
                            : `${oferta.emprestimosAnteriores}º empréstimo`}
                        </div>
                      </div>
                      <div>
                        <div style={styles.detailLabel}>Já tomado</div>
                        <div style={styles.detailValue}>
                          {oferta.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(oferta.valorTotalTomado)}`}
                        </div>
                      </div>
                    </div>

                    <div style={styles.poolBlock}>
                      <div style={styles.poolTopRow}>
                        <span style={styles.poolLabel}>Captação do pedido</span>
                        <span style={styles.poolValue}>
                          R$ {formatBRL(oferta.jaCaptado)} de R$ {formatBRL(oferta.valorTotalPedido)}
                        </span>
                      </div>
                      <div style={styles.poolTrack}>
                        <div style={{ ...styles.poolSegCaptado, width: `${percentCaptado}%` }} />
                        <div style={{ ...styles.poolSegOferta, width: `${percentOfertaClamped}%` }} />
                      </div>
                      <div style={styles.poolCaption}>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotCaptado} />
                          {percentCaptado}% já captado
                        </span>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotOferta} />
                          {percentOferta}% esta oferta
                        </span>
                        <span style={styles.poolCaptionItem}>
                          <span style={styles.poolCaptionDotRestante} />
                          {percentRestante}% captando
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <button style={styles.ofertaButton}>
                        <Check size={17} strokeWidth={2.4} />
                        Investir
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={styles.investirEmpty}>
              <div style={styles.investirIcon}>
                <TrendingUp size={24} color={colors.ink} strokeWidth={1.8} />
              </div>
              <div style={styles.investirTitle}>
                {activeInvestNav === 'carteira' ? 'Carteira em breve' : 'Início em breve'}
              </div>
              <div style={styles.investirCaption}>
                Estamos preparando essa área. Em breve você vai ver isso por aqui.
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'credito' ? (
        <div style={styles.bottomNav}>
          <button
            style={{
              ...styles.navItem,
              backgroundColor: activeNav === 'inicio' ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
            onClick={() => setActiveNav('inicio')}
          >
            <Home
              size={19}
              color={activeNav === 'inicio' ? '#fff' : 'rgba(255,255,255,0.5)'}
              strokeWidth={2}
            />
            <span style={{ ...styles.navLabel, color: activeNav === 'inicio' ? '#fff' : 'rgba(255,255,255,0.5)' }}>
              Início
            </span>
          </button>
          <button
            style={{
              ...styles.navItem,
              backgroundColor: activeNav === 'emprestimos' ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
            onClick={() => setActiveNav('emprestimos')}
          >
            <Landmark
              size={19}
              color={activeNav === 'emprestimos' ? '#fff' : 'rgba(255,255,255,0.5)'}
              strokeWidth={2}
            />
            <span style={{ ...styles.navLabel, color: activeNav === 'emprestimos' ? '#fff' : 'rgba(255,255,255,0.5)' }}>
              Empréstimos
            </span>
          </button>
        </div>
      ) : (
        <div style={styles.bottomNav}>
          {[
            { key: 'inicio', label: 'Início', Icon: Home },
            { key: 'ofertas', label: 'Ofertas', Icon: Tag },
            { key: 'carteira', label: 'Carteira', Icon: Wallet },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              style={{
                ...styles.navItemCompact,
                backgroundColor: activeInvestNav === key ? 'rgba(255,255,255,0.12)' : 'transparent',
              }}
              onClick={() => setActiveInvestNav(key)}
            >
              <Icon
                size={18}
                color={activeInvestNav === key ? '#fff' : 'rgba(255,255,255,0.5)'}
                strokeWidth={2}
              />
              <span
                style={{
                  ...styles.navLabelCompact,
                  color: activeInvestNav === key ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      )}

      {showConta && (
        <div style={styles.contaOverlay}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
          `}</style>

          <div style={styles.contaHeader}>
            <button style={styles.contaBackButton} onClick={() => setShowConta(false)}>
              <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
            </button>
            <div style={styles.contaTitle}>Conta</div>
          </div>

          <div style={styles.contaHero}>
            <div style={styles.eyebrow}>Saldo em conta</div>
            <div style={styles.contaSaldoValue}>R$ {formatBRL(saldoConta)}</div>
            <div style={styles.actionButtonRow}>
              <button style={{ ...styles.actionButton, backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff' }}>
                <ArrowDown size={17} strokeWidth={2} />
                Sacar
              </button>
              <button style={{ ...styles.actionButton, backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff' }}>
                <Plus size={17} strokeWidth={2} />
                Depositar
              </button>
            </div>
          </div>

          <div style={styles.extratoSection}>
            <div style={styles.extratoTitle}>Extrato</div>
            {extrato.map((item) => (
              <div key={item.id} style={styles.extratoRow}>
                <div style={styles.extratoIcon}>
                  {item.tipo === 'entrada' ? (
                    <ArrowDown size={16} color={colors.ink} strokeWidth={2} />
                  ) : (
                    <ArrowUpRight size={16} color={colors.ink} strokeWidth={2} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.extratoDesc}>{item.desc}</div>
                  <div style={styles.extratoData}>{item.data}</div>
                </div>
                <div style={styles.extratoValor}>
                  {item.valor > 0 ? '+' : '-'} R$ {formatBRL(Math.abs(item.valor))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
