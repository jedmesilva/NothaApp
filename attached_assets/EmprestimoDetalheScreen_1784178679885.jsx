import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Check,
  ChevronRight,
  X,
  HelpCircle,
} from 'lucide-react';

// Mesma paleta monocromática das outras telas — preto, cinza e branco, sem cor de destaque
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

  // Hero — visão geral do empréstimo
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
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
  },
  heroValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: -1,
    lineHeight: 1.05,
    marginBottom: 6,
  },
  heroSubvalue: {
    fontSize: 13,
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
  statusAnalise: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
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
    color: colors.dark,
    border: '1.5px solid #fff',
  },
  statusQuitado: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.3)',
  },

  poolBlock: {
    marginBottom: 22,
  },
  poolLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 8,
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
    color: 'rgba(255,255,255,0.6)',
  },
  poolTrack: {
    display: 'flex',
    width: '100%',
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    marginBottom: 9,
  },
  poolSegPago: {
    height: '100%',
    backgroundColor: '#fff',
  },
  poolCaption: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
  },
  poolCaptionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  poolCaptionItemAtrasada: {
    color: '#FF9285',
    fontWeight: 700,
  },
  poolCaptionDotPago: {
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
    backgroundColor: 'rgba(255,255,255,0.14)',
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

  // Row de datas — obtenção/vencimento, tocável, abre o log de timestamps
  datesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '0 16px 14px',
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
    fontSize: 14.5,
    fontWeight: 600,
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
    gap: 10,
    padding: '0 16px',
  },

  parcelaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: '14px 16px',
    backgroundColor: colors.card,
  },
  parcelaCardAtrasada: {
    border: `1.5px solid ${colors.ink}`,
  },
  parcelaCardPaga: {
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
  indexBadgePaga: {
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
    color: colors.ink,
    fontWeight: 700,
  },
  parcelaValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 700,
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
    whiteSpace: 'nowrap',
  },
  pagoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12.5,
    fontWeight: 700,
    color: colors.inkSoft,
    flexShrink: 0,
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
};

const STATUS_META = {
  analise: { label: 'Em análise', icon: Clock, badgeStyle: styles.statusAnalise },
  captacao: { label: 'Em captação', icon: Users, badgeStyle: styles.statusCaptacao },
  ativo: { label: 'Ativo', icon: Zap, badgeStyle: styles.statusAtivo },
  atrasado: { label: 'Atrasado', icon: AlertTriangle, badgeStyle: styles.statusAtrasado },
  quitado: { label: 'Quitado', icon: CheckCircle2, badgeStyle: styles.statusQuitado },
};

const CICLO_META = {
  diario: { label: 'Diário', dias: 1, unidade: 'dia', unidadePlural: 'dias' },
  semanal: { label: 'Semanal', dias: 7, unidade: 'semana', unidadePlural: 'semanas' },
  mensal: { label: 'Mensal', dias: 30, unidade: 'mês', unidadePlural: 'meses' },
};

// Empréstimo de exemplo — ativo, com parcelas já pagas, uma próxima e futuras
const emprestimo = {
  contratoId: 'EMP-2026-90214',
  valor: 3200,
  taxaJurosTotal: 12,
  prazoDias: 90,
  ciclo: 'semanal',
  parcelasTotal: 13,
  parcelasPagas: 6,
  status: 'ativo',
};

const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatData = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const formatDataHora = (date) =>
  `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

export default function EmprestimoDetalheScreen() {
  const [pagas, setPagas] = useState(emprestimo.parcelasPagas);
  const [showTimeline, setShowTimeline] = useState(false);

  const { valor, taxaJurosTotal, prazoDias, ciclo, parcelasTotal, status } = emprestimo;
  const totalAPagar = valor * (1 + taxaJurosTotal / 100);
  const valorParcela = totalAPagar / parcelasTotal;
  const percentPago = Math.round((pagas / parcelasTotal) * 100);
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const cicloDias = CICLO_META[ciclo].dias;

  // Ancora as datas de forma que a última parcela paga fique próxima de hoje
  const hoje = new Date();
  const dataBase = addDays(hoje, -pagas * cicloDias);
  const valorPago = pagas * valorParcela;
  const proximaData = formatData(addDays(dataBase, (pagas + 1) * cicloDias));

  // Ciclo de vida do empréstimo: solicitação → análise/captação → concessão → vencimento final
  const jaConcedido = status !== 'analise' && status !== 'captacao';
  const dataConcessao = dataBase; // quando o empréstimo foi de fato liberado ao usuário
  const dataSolicitacao = addDays(dataConcessao, -3);
  const dataAprovacao = addDays(dataSolicitacao, 1);
  const dataVencimentoFinal = addDays(dataConcessao, prazoDias);

  const timelineEvents = [
    { label: 'Solicitado', date: dataSolicitacao, done: true },
    { label: 'Aprovado', date: dataAprovacao, done: true },
    { label: 'Concedido', date: dataConcessao, done: jaConcedido },
    status === 'quitado'
      ? { label: 'Quitado', date: dataVencimentoFinal, done: true }
      : { label: 'Vencimento final', date: dataVencimentoFinal, done: false },
  ];

  const parcelas = Array.from({ length: parcelasTotal }, (_, i) => {
    const numero = i + 1;
    const data = addDays(dataBase, numero * cicloDias);
    let parcelaStatus = 'pendente';
    if (numero <= pagas) parcelaStatus = 'paga';
    else if (data < hoje) parcelaStatus = 'atrasada';
    return { numero, data, status: parcelaStatus };
  });

  const handlePagar = (numero) => {
    if (numero === pagas + 1) setPagas(pagas + 1);
  };

  const parcelasRestantes = parcelasTotal - pagas;

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Detalhes do empréstimo</div>
      </div>

      <div style={styles.heroCard}>
        <div style={styles.heroTopRow}>
          <div>
            <div style={styles.eyebrow}>Valor do empréstimo</div>
          </div>
          <div style={{ ...styles.statusBadge, ...meta.badgeStyle }}>
            <Icon size={13} strokeWidth={2.4} />
            {meta.label}
          </div>
        </div>
        <div style={styles.heroValue}>R$ {formatBRL(valor)}</div>
        <div style={styles.heroSubvalue}>
          R$ {formatBRL(Math.round(valorParcela))}/{CICLO_META[ciclo].unidade} · {parcelasTotal}{' '}
          {parcelasTotal === 1 ? CICLO_META[ciclo].unidade : CICLO_META[ciclo].unidadePlural}
        </div>

        <div style={styles.poolBlock}>
          <div style={styles.poolLabel}>Pagamento do empréstimo</div>
          <div style={styles.poolTopRow}>
            <span style={styles.poolPercent}>{percentPago}% pago</span>
            <span style={styles.poolValue}>
              R$ {formatBRL(Math.round(valorPago))} de R$ {formatBRL(Math.round(totalAPagar))}
            </span>
          </div>
          <div style={styles.poolTrack}>
            <div style={{ ...styles.poolSegPago, width: `${percentPago}%` }} />
          </div>
          <div style={styles.poolCaption}>
            <span style={styles.poolCaptionItem}>
              <span style={styles.poolCaptionDotPago} />
              pago
            </span>
            <span
              style={{
                ...styles.poolCaptionItem,
                ...(status === 'atrasado' ? styles.poolCaptionItemAtrasada : {}),
              }}
            >
              <span style={styles.poolCaptionDotRestante} />
              {status === 'atrasado' ? 'parcela em atraso' : `próxima parcela em ${proximaData}`}
            </span>
          </div>
        </div>

        <div style={styles.heroGrid}>
          <div>
            <div style={styles.heroDetailLabel}>Prazo</div>
            <div style={styles.heroDetailValue}>{prazoDias} dias</div>
            <div style={styles.heroDetailSubvalue}>vence {formatData(dataVencimentoFinal)}</div>
          </div>
          <div>
            <div style={styles.heroDetailLabel}>Ciclo</div>
            <div style={styles.heroDetailValue}>{CICLO_META[ciclo].label}</div>
            <div style={styles.heroDetailSubvalue}>
              R$ {formatBRL(Math.round(valorParcela))}/{CICLO_META[ciclo].unidade}
            </div>
          </div>
          <div>
            <div style={styles.heroDetailLabel}>Taxa total</div>
            <div style={styles.heroDetailValue}>{taxaJurosTotal}%</div>
          </div>
          <div>
            <div style={styles.heroDetailLabel}>{status === 'quitado' ? 'Total pago' : 'Total a pagar'}</div>
            <div style={styles.heroDetailValue}>R$ {formatBRL(Math.round(totalAPagar))}</div>
          </div>
        </div>
      </div>

      <button style={styles.datesRow} onClick={() => setShowTimeline(true)}>
        <div style={styles.datesBlock}>
          <div style={styles.dateLabel}>{jaConcedido ? 'Concedido em' : 'Solicitado em'}</div>
          <div style={styles.dateValue}>
            {formatData(jaConcedido ? dataConcessao : dataSolicitacao)}
          </div>
        </div>
        <div style={styles.datesDivider} />
        <div style={styles.datesBlock}>
          <div style={styles.dateLabel}>{jaConcedido ? 'Vencimento' : 'Previsão de vencimento'}</div>
          <div style={styles.dateValue}>{formatData(dataVencimentoFinal)}</div>
        </div>
        <ChevronRight size={18} color={colors.inkFaint} strokeWidth={2} />
      </button>

      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>Parcelas</div>
        <div style={styles.sectionCount}>{parcelasRestantes} restantes</div>
      </div>

      <div style={styles.list}>
        {parcelas.map((p) => {
          const isPaga = p.status === 'paga';
          const isAtrasada = p.status === 'atrasada';

          return (
            <div
              key={p.numero}
              style={{
                ...styles.parcelaCard,
                ...(isAtrasada ? styles.parcelaCardAtrasada : {}),
                ...(isPaga ? styles.parcelaCardPaga : {}),
              }}
            >
              <div style={{ ...styles.indexBadge, ...(isPaga ? styles.indexBadgePaga : {}) }}>
                {isPaga ? <Check size={16} strokeWidth={2.6} /> : p.numero}
              </div>

              <div style={styles.parcelaInfo}>
                <div style={{ ...styles.parcelaLabel, ...(isAtrasada ? styles.parcelaLabelAtrasada : {}) }}>
                  {isPaga ? 'Pago em ' : isAtrasada ? 'Venceu em ' : 'Vence em '}
                  {formatData(p.data)}
                </div>
                <div style={styles.parcelaValue}>R$ {formatBRL(Math.round(valorParcela))}</div>
              </div>

              {isPaga ? (
                <div style={styles.pagoLabel}>
                  <Check size={14} strokeWidth={2.6} />
                  Pago
                </div>
              ) : (
                <button style={styles.payButton} onClick={() => handlePagar(p.numero)}>
                  Pagar
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.contratoId}>Contrato Nº {emprestimo.contratoId}</div>

      <button style={styles.helpButton}>
        <HelpCircle size={16} strokeWidth={2} />
        Precisa de ajuda com esse empréstimo?
      </button>

      {showTimeline && (
        <div style={styles.modalOverlay} onClick={() => setShowTimeline(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Histórico do empréstimo</div>
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
