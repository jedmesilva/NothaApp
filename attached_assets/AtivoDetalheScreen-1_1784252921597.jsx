import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  HelpCircle,
} from 'lucide-react';

// Mesma paleta monocromática do resto do app
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
    paddingBottom: 48,
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
  contratoId: {
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
    margin: '20px 20px 0',
  },

  // Hero — retorno % como valor principal, igual ao card de Ativos
  heroCard: {
    borderRadius: 28,
    margin: '18px 16px 14px',
    padding: '26px 24px 24px',
    background: `linear-gradient(150deg, ${colors.dark} 0%, ${colors.darkSoft} 100%)`,
    color: '#fff',
  },
  heroTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.55)',
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
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 20,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  statusAtivo: {
    backgroundColor: '#fff',
    color: colors.dark,
  },
  statusAtrasado: {
    backgroundColor: '#fff',
    color: colors.red,
  },
  statusQuitado: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.3)',
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
    color: 'rgba(255,255,255,0.5)',
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

  // Barra de pagamento/pool — mesmo componente do card de Ativos, versão clara (dark hero)
  poolLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
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
    color: '#fff',
  },
  poolValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
  },
  poolTrack: {
    display: 'flex',
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    marginBottom: 9,
  },
  poolSeg: {
    height: '100%',
    backgroundColor: '#fff',
  },
  poolCaption: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 20,
  },
  poolCaptionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  poolCaptionDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  poolCaptionDotRestante: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    flexShrink: 0,
  },

  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    borderTop: '1px solid rgba(255,255,255,0.14)',
    paddingTop: 18,
  },
  heroDetailLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 3,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  heroDetailValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 600,
  },
  heroDetailSubvalue: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  // Row de datas — tocável, abre o log de timestamps
  datesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '14px 16px 14px',
    padding: '14px 16px',
    borderRadius: 18,
    backgroundColor: colors.card,
    cursor: 'pointer',
    border: 'none',
    width: 'calc(100% - 32px)',
    textAlign: 'left',
  },
  datesBlock: {
    flex: 1,
  },
  datesDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.line,
  },
  dateLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginBottom: 3,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13.5,
    fontWeight: 600,
    lineHeight: 1.3,
  },

  // Modal — log de timestamps
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(21,21,29,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: '24px 24px 0 0',
    padding: '20px 20px calc(28px + env(safe-area-inset-bottom))',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 17,
    fontWeight: 700,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.chipBg,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  timelineRow: {
    display: 'flex',
    gap: 14,
    paddingBottom: 18,
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: colors.ink,
    flexShrink: 0,
    marginTop: 4,
    position: 'relative',
    zIndex: 1,
  },
  timelineDotPending: {
    backgroundColor: colors.line,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 14,
    bottom: -4,
    width: 2,
    backgroundColor: colors.line,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  timelineLabelPending: {
    color: colors.inkFaint,
    fontWeight: 600,
  },
  timelineDate: {
    fontSize: 12.5,
    color: colors.inkSoft,
  },

  // Seção de parcelas
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: '8px 20px 12px',
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 17,
    fontWeight: 700,
  },
  sectionCount: {
    fontSize: 13,
    color: colors.inkSoft,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
  },

  parcelaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 16px',
    borderTop: `1px solid ${colors.line}`,
  },
  parcelaCardAtrasada: {
    backgroundColor: colors.redBg,
  },
  parcelaCardRecebida: {
    opacity: 0.55,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.chipBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: colors.inkSoft,
  },
  indexBadgeRecebida: {
    backgroundColor: colors.ink,
    color: '#fff',
  },
  parcelaInfo: {
    flex: 1,
    minWidth: 0,
  },
  parcelaLabel: {
    fontSize: 12.5,
    color: colors.inkFaint,
    marginBottom: 2,
  },
  parcelaLabelAtrasada: {
    color: colors.red,
    fontWeight: 700,
  },
  parcelaValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 700,
  },
  statusTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12.5,
    fontWeight: 700,
    color: colors.inkSoft,
    flexShrink: 0,
  },
  statusTagAtrasada: {
    color: colors.red,
  },

  helpButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 'calc(100% - 32px)',
    margin: '18px 16px 0',
    padding: '15px 0',
    borderRadius: 16,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.line}`,
    color: colors.inkSoft,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Seção de vencimentos colapsável
  // Seção de vencimentos colapsável — um único card contendo o toggle + a lista
  vencimentosCard: {
    borderRadius: 22,
    margin: '0 16px',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  sectionToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '18px 18px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  sectionToggleTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  sectionToggleSummary: {
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  chevronRotate: {
    transition: 'transform 0.15s ease',
  },
  chevronRotateOpen: {
    transform: 'rotate(180deg)',
  },

  // Seção "Sobre o tomador"
  tomadorCard: {
    borderRadius: 22,
    margin: '14px 16px 0',
    padding: '20px 20px 18px',
    backgroundColor: colors.card,
  },
  tomadorTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15.5,
    fontWeight: 700,
    marginBottom: 16,
  },
  tomadorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: `1px solid ${colors.line}`,
  },
  tomadorTextRow: {
    marginBottom: 14,
  },
  tomadorTextRowLast: {
    marginBottom: 0,
  },
  tomadorTextLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginBottom: 3,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  tomadorTextValue: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 1.4,
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
    fontSize: 15,
    fontWeight: 600,
  },
  detailSubvalue: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginTop: 2,
  },
};

const STATUS_META = {
  captacao: { label: 'Em captação', icon: Clock, badgeStyle: styles.statusCaptacao },
  ativo: { label: 'Ativo', icon: Zap, badgeStyle: styles.statusAtivo },
  atrasado: { label: 'Atrasado', icon: AlertTriangle, badgeStyle: styles.statusAtrasado },
  quitado: { label: 'Quitado', icon: CheckCircle2, badgeStyle: styles.statusQuitado },
};

const CICLO_META = {
  diario: { label: 'Diário', dias: 1, parcelasLabel: 'diárias' },
  semanal: { label: 'Semanal', dias: 7, parcelasLabel: 'semanais' },
  mensal: { label: 'Mensal', dias: 30, parcelasLabel: 'mensais' },
};

// Posição de exemplo — ativa, com uma parcela já recebida
const posicao = {
  contratoId: 'EMP-2026-90214',
  valorInvestido: 2000,
  taxaJurosTotal: 22,
  prazoDias: 90,
  ciclo: 'mensal',
  status: 'ativo',
  parcelasTotal: 3,
  parcelasRecebidas: 1,
  diasDesdeConcessao: 35,
  jaCaptado: 4200,
  valorTotalPedido: 12000,
  numCredores: 8,
  risco: 'Alto',
  tomadorScore: 'C',
  emprestimosAnteriores: 1,
  valorTotalTomado: 3000,
  cidade: 'São Paulo, SP',
  proposito: 'Capital de giro para o negócio',
};

const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatData = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

const formatDataComAno = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const formatDataHora = (date) =>
  `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

export default function AtivoDetalheScreen() {
  const [recebidas, setRecebidas] = useState(posicao.parcelasRecebidas);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showParcelas, setShowParcelas] = useState(false);

  const {
    valorInvestido,
    taxaJurosTotal,
    prazoDias,
    ciclo,
    status,
    parcelasTotal,
    risco,
    tomadorScore,
    emprestimosAnteriores,
    valorTotalTomado,
    cidade,
    proposito,
  } = posicao;

  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const cicloMeta = CICLO_META[ciclo];
  const totalComRetorno = valorInvestido * (1 + taxaJurosTotal / 100);
  const retornoTotal = totalComRetorno - valorInvestido;

  const jaConcedido = status !== 'captacao';
  const hoje = new Date();
  const dataConcessao = jaConcedido ? addDays(hoje, -posicao.diasDesdeConcessao) : hoje;
  const dataInvestimento = addDays(dataConcessao, -2);
  const dataVencimentoFinal = addDays(dataConcessao, prazoDias);

  const timelineEvents = [
    { label: 'Investido', date: dataInvestimento, done: true },
    { label: 'Captação concluída', date: dataConcessao, done: jaConcedido },
    status === 'quitado'
      ? { label: 'Quitado', date: dataVencimentoFinal, done: true }
      : { label: 'Vencimento final', date: dataVencimentoFinal, done: false },
  ];

  // Parcelas que esse investidor vai receber (não paga — recebe)
  const cicloDias = cicloMeta.dias;
  const valorParcela = parcelasTotal ? totalComRetorno / parcelasTotal : 0;
  const parcelas = jaConcedido
    ? Array.from({ length: parcelasTotal }, (_, i) => {
        const numero = i + 1;
        const data = addDays(dataConcessao, numero * cicloDias);
        let parcelaStatus = 'pendente';
        if (numero <= recebidas) parcelaStatus = 'recebida';
        else if (data < hoje) parcelaStatus = 'atrasada';
        return { numero, data, status: parcelaStatus };
      })
    : [];

  const parcelasRestantes = parcelasTotal - recebidas;
  const saldoRestante = valorParcela * parcelasRestantes;

  // Barra de pagamento/captação — mesma lógica do card de Ativos
  const pctCaptado = !jaConcedido
    ? Math.round((posicao.jaCaptado / posicao.valorTotalPedido) * 100)
    : 0;
  const pctPago = jaConcedido && parcelasTotal ? Math.round((recebidas / parcelasTotal) * 100) : 0;
  const recebidoValor = valorParcela * recebidas;

  return (
    <div className="ativo-detalhe-screen" style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .ativo-detalhe-screen, .ativo-detalhe-screen *, .ativo-detalhe-screen *::before, .ativo-detalhe-screen *::after {
          box-sizing: border-box;
        }
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Detalhes do ativo</div>
      </div>

      <div style={styles.heroCard}>
        <div style={styles.heroTopRow}>
          <div style={styles.eyebrow}>Retorno do contrato</div>
          <div style={{ ...styles.statusBadge, ...meta.badgeStyle }}>
            <Icon size={13} strokeWidth={2.4} />
            {meta.label}
          </div>
        </div>
        <div style={styles.heroValue}>
          <span style={styles.heroValueSign}>+</span>
          {taxaJurosTotal}%
        </div>
        <div style={styles.heroCaption}>
          Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
        </div>

        <div style={styles.splitRow}>
          <div style={styles.splitBlock}>
            <div style={styles.splitLabel}>Valor investido</div>
            <div style={styles.splitValue}>R$ {formatBRL(valorInvestido)}</div>
          </div>
          <div style={{ ...styles.splitBlock, ...styles.splitBlockRight }}>
            <div style={styles.splitLabel}>Retorno</div>
            <div style={styles.splitValue}>R$ {formatBRL(Math.round(totalComRetorno))}</div>
          </div>
        </div>

        {!jaConcedido ? (
          <>
            <div style={styles.poolLabel}>Captação do pedido</div>
            <div style={styles.poolTopRow}>
              <span style={styles.poolPercent}>{pctCaptado}% captado</span>
              <span style={styles.poolValue}>
                R$ {formatBRL(posicao.jaCaptado)} de R$ {formatBRL(posicao.valorTotalPedido)}
              </span>
            </div>
            <div style={styles.poolTrack}>
              <div style={{ ...styles.poolSeg, width: `${pctCaptado}%` }} />
            </div>
            <div style={styles.poolCaption}>
              <span style={styles.poolCaptionItem}>
                <span style={styles.poolCaptionDot} />
                {posicao.numCredores} credores no pool
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={styles.poolLabel}>Pagamento do contrato</div>
            <div style={styles.poolTopRow}>
              <span style={styles.poolPercent}>{pctPago}% pago</span>
              <span style={styles.poolValue}>
                R$ {formatBRL(Math.round(recebidoValor))} de R$ {formatBRL(Math.round(totalComRetorno))}
              </span>
            </div>
            <div style={styles.poolTrack}>
              <div style={{ ...styles.poolSeg, width: `${pctPago}%` }} />
            </div>
            <div style={styles.poolCaption}>
              <span style={styles.poolCaptionItem}>
                <span style={styles.poolCaptionDot} />
                pago
              </span>
              <span style={styles.poolCaptionItem}>
                <span style={styles.poolCaptionDotRestante} />
                {status === 'atrasado' ? 'tomador em atraso' : status === 'quitado' ? 'contrato encerrado' : 'em dia'}
              </span>
            </div>
          </>
        )}

        <div style={styles.heroGrid}>
          <div>
            <div style={styles.heroDetailLabel}>Prazo</div>
            <div style={styles.heroDetailValue}>{prazoDias} dias</div>
          </div>
          <div>
            <div style={styles.heroDetailLabel}>Ciclo</div>
            <div style={styles.heroDetailValue}>{cicloMeta.label}</div>
            <div style={styles.heroDetailSubvalue}>parcelas {cicloMeta.parcelasLabel}</div>
          </div>
        </div>
      </div>

      {jaConcedido && (
        <div style={styles.vencimentosCard}>
          <button style={styles.sectionToggle} onClick={() => setShowParcelas(!showParcelas)}>
            <div>
              <div style={styles.sectionToggleTitle}>Vencimentos</div>
              <div style={styles.sectionToggleSummary}>
                {recebidas}/{parcelasTotal} pagos · R$ {formatBRL(Math.round(saldoRestante))} restantes
              </div>
            </div>
            <ChevronDown
              size={18}
              color={colors.inkFaint}
              strokeWidth={2}
              style={{ ...styles.chevronRotate, ...(showParcelas ? styles.chevronRotateOpen : {}) }}
            />
          </button>

          {showParcelas && (
            <div style={styles.list}>
              {parcelas.map((p) => {
              const isRecebida = p.status === 'recebida';
              const isAtrasada = p.status === 'atrasada';

              return (
                <div
                  key={p.numero}
                  style={{
                    ...styles.parcelaCard,
                    ...(isAtrasada ? styles.parcelaCardAtrasada : {}),
                    ...(isRecebida ? styles.parcelaCardRecebida : {}),
                  }}
                >
                  <div style={{ ...styles.indexBadge, ...(isRecebida ? styles.indexBadgeRecebida : {}) }}>
                    {isRecebida ? <Check size={16} strokeWidth={2.6} /> : p.numero}
                  </div>

                  <div style={styles.parcelaInfo}>
                    <div style={{ ...styles.parcelaLabel, ...(isAtrasada ? styles.parcelaLabelAtrasada : {}) }}>
                      {isRecebida ? 'Pago em ' : isAtrasada ? 'Venceu em ' : 'Vence em '}
                      {formatData(p.data)}
                    </div>
                    <div style={styles.parcelaValue}>R$ {formatBRL(Math.round(valorParcela))}</div>
                  </div>

                  <div style={{ ...styles.statusTag, ...(isAtrasada ? styles.statusTagAtrasada : {}) }}>
                    {isRecebida ? (
                      <>
                        <Check size={14} strokeWidth={2.6} />
                        Paga
                      </>
                    ) : isAtrasada ? (
                      <>
                        <AlertTriangle size={14} strokeWidth={2.4} />
                        Vencida
                      </>
                    ) : (
                      'A vencer'
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      <div style={styles.tomadorCard}>
        <div style={styles.tomadorTitle}>Sobre o tomador</div>

        <div style={styles.tomadorGrid}>
          <div>
            <div style={styles.detailLabel}>Risco</div>
            <div style={styles.detailValue}>{risco}</div>
            <div style={styles.detailSubvalue}>score {tomadorScore}</div>
          </div>
          <div>
            <div style={styles.detailLabel}>Histórico</div>
            <div style={styles.detailValue}>
              {emprestimosAnteriores === 0 ? 'Primeiro empréstimo' : `${emprestimosAnteriores + 1}º empréstimo`}
            </div>
          </div>
          <div>
            <div style={styles.detailLabel}>Já tomado</div>
            <div style={styles.detailValue}>
              {emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(valorTotalTomado)}`}
            </div>
          </div>
          <div>
            <div style={styles.detailLabel}>Cidade</div>
            <div style={styles.detailValue}>{cidade}</div>
          </div>
        </div>

        <div style={styles.tomadorTextRow}>
          <div style={styles.tomadorTextLabel}>Propósito declarado</div>
          <div style={styles.tomadorTextValue}>{proposito}</div>
        </div>
      </div>

      <button style={styles.datesRow} onClick={() => setShowTimeline(true)}>
        <div style={styles.datesBlock}>
          <div style={styles.dateLabel}>Investido em</div>
          <div style={styles.dateValue}>{formatDataComAno(dataInvestimento)}</div>
        </div>
        <div style={styles.datesDivider} />
        <div style={styles.datesBlock}>
          <div style={styles.dateLabel}>{jaConcedido ? 'Vencimento' : 'Previsão de vencimento'}</div>
          <div style={styles.dateValue}>{formatDataComAno(dataVencimentoFinal)}</div>
        </div>
        <ChevronRight size={18} color={colors.inkFaint} strokeWidth={2} />
      </button>

      <div style={styles.contratoId}>Contrato Nº {posicao.contratoId}</div>

      <button style={styles.helpButton}>
        <HelpCircle size={16} strokeWidth={2} />
        Precisa de ajuda com esse ativo?
      </button>

      {showTimeline && (
        <div style={styles.modalOverlay} onClick={() => setShowTimeline(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Histórico do ativo</div>
              <button style={styles.modalClose} onClick={() => setShowTimeline(false)}>
                <X size={16} color={colors.ink} strokeWidth={2.2} />
              </button>
            </div>

            {timelineEvents.map((event, i) => (
              <div key={event.label} style={styles.timelineRow}>
                {i < timelineEvents.length - 1 && <div style={styles.timelineLine} />}
                <div style={{ ...styles.timelineDot, ...(!event.done ? styles.timelineDotPending : {}) }} />
                <div>
                  <div style={{ ...styles.timelineLabel, ...(!event.done ? styles.timelineLabelPending : {}) }}>
                    {event.label}
                  </div>
                  <div style={styles.timelineDate}>
                    {event.done ? formatDataHora(event.date) : `Previsto para ${formatData(event.date)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
