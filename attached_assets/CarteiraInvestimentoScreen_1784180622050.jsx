import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronRight, Home, Tag, Wallet, AlertTriangle } from 'lucide-react';

// Mesma paleta monocromática do restante do app — só preto, cinza e branco
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
    paddingBottom: 104,
    overflowX: 'hidden',
    boxSizing: 'border-box',
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
  headerTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: -0.2,
    color: colors.ink,
    margin: '4px 16px 10px',
  },

  heroCard: {
    borderRadius: 28,
    margin: '18px 16px 14px',
    padding: '26px 24px 24px',
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
  rendimentoBlock: {
    marginTop: 14,
    marginBottom: 20,
  },
  rendimentoPercentValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: -0.8,
    lineHeight: 1,
    color: '#fff',
  },
  rendimentoPercentSign: {
    fontSize: 20,
    fontWeight: 700,
    marginRight: 1,
  },
  rendimentoCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
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
  progressCaptionEnd: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 9,
  },
  splitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    color: 'rgba(255,255,255,0.45)',
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
    color: '#fff',
  },

  ativosCard: {
    borderRadius: 24,
    margin: '0 16px 14px',
    padding: '22px 20px 20px',
    backgroundColor: colors.card,
  },
  ativosHeaderRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  ativosCount: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: -0.8,
    lineHeight: 1,
    color: colors.ink,
  },
  timelineTrackWrap: {
    padding: '0 4px',
    marginBottom: 14,
  },
  timelineTrack: {
    position: 'relative',
    height: 3,
    backgroundColor: colors.line,
    borderRadius: 999,
  },
  timelineDot: {
    position: 'absolute',
    top: '50%',
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: colors.inkFaint,
    transform: 'translate(-50%, -50%)',
  },
  timelineDotAccent: {
    width: 11,
    height: 11,
    backgroundColor: colors.dark,
    boxShadow: `0 0 0 4px ${colors.chipUrgent}`,
  },
  timelineLabelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineLabelBlock: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '60%',
  },
  timelineLabelBlockRight: {
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  statLabel: {
    fontSize: 11.5,
    color: colors.inkFaint,
    fontWeight: 600,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: -0.3,
  },
  statSub: {
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  atrasoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
    padding: '12px 14px',
    borderRadius: 14,
    backgroundColor: colors.redBg,
  },
  atrasoIcon: {
    flexShrink: 0,
  },
  atrasoText: {
    fontSize: 12.5,
    color: colors.red,
    lineHeight: 1.35,
  },
  atrasoTextBold: {
    fontWeight: 700,
  },

  chartCard: {
    borderRadius: 24,
    margin: '0 16px 14px',
    padding: '22px 20px 18px',
    backgroundColor: colors.card,
  },
  chartHeaderRow: {
    display: 'flex',
    marginBottom: 20,
  },
  chartReturnValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: -0.6,
  },
  chartReturnSub: {
    fontSize: 13,
    color: colors.inkSoft,
    fontWeight: 500,
    marginTop: 4,
  },
  periodChips: {
    display: 'flex',
    gap: 8,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  periodChip: {
    padding: '8px 14px',
    borderRadius: 999,
    backgroundColor: colors.chipMuted,
    border: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.inkSoft,
    cursor: 'pointer',
  },
  periodChipActive: {
    backgroundColor: colors.dark,
    color: '#fff',
  },
  customDateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
    marginTop: -6,
  },
  dateInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 12,
    backgroundColor: colors.chipMuted,
    border: 'none',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: colors.ink,
    colorScheme: 'light',
  },
  dateSeparator: {
    fontSize: 12.5,
    color: colors.inkFaint,
    fontWeight: 600,
    flexShrink: 0,
  },
  chartEmptyState: {
    padding: '30px 0 8px',
    textAlign: 'center',
    fontSize: 13,
    color: colors.inkFaint,
  },
  axisLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10.5,
    color: colors.inkFaint,
    fontWeight: 500,
  },
  ativosLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 'calc(100% - 32px)',
    margin: '0 16px 14px',
    background: 'none',
    border: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.inkSoft,
    cursor: 'pointer',
    padding: '4px 0',
  },

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
  navLabelCompact: {
    fontSize: 12,
    fontWeight: 600,
  },
};

const formatBRL = (value) =>
  Math.round(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const seededNoise = (i) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function gerarSerie(numPontos, incrementoBase, seedOffset) {
  let acumulado = 0;
  const pontos = [];
  for (let i = 0; i < numPontos; i++) {
    const variacao = 0.55 + seededNoise(i + seedOffset) * 0.9;
    acumulado += incrementoBase * variacao;
    pontos.push(acumulado);
  }
  return pontos;
}

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function buildSmoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function CarteiraInvestimentoScreen() {
  const [periodo, setPeriodo] = useState('7d');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const investido = 10000;
  const rendimentoTotalPercent = 20;
  const rendimentoTotalValor = 2000;
  const totalAReceber = investido + rendimentoTotalValor;
  const recebido = 3000;
  const aReceber = totalAReceber - recebido;
  const ativosInvestimento = 30;

  const hoje = new Date();

  // Atraso e "próximo vencimento" são independentes: mesmo com um pagamento
  // vencido, sempre existe um próximo vencimento futuro de verdade. Um não
  // substitui o outro na tela.
  const temAtraso = true;
  const diasDeAtraso = 5;
  const valorAtrasado = 245;
  const dataAtrasoLabel = (() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - diasDeAtraso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  })();

  const diasAteProximoVencimento = 4; // sempre no futuro — é literalmente "o próximo"
  const proximoVencimentoData = new Date(hoje);
  proximoVencimentoData.setDate(hoje.getDate() + diasAteProximoVencimento);
  const proximoVencimentoLabel = proximoVencimentoData.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
  const proximoVencimentoValor = 780;

  const diasAteUltimoVencimento = 154;
  const ultimoVencimentoData = new Date(hoje);
  ultimoVencimentoData.setDate(hoje.getDate() + diasAteUltimoVencimento);
  const ultimoVencimentoLabel = `${String(ultimoVencimentoData.getDate()).padStart(2, '0')} ${
    MESES_ABREV[ultimoVencimentoData.getMonth()]
  } ${ultimoVencimentoData.getFullYear()}`;
  const prazoRestanteLabel =
    diasAteUltimoVencimento >= 60
      ? `${Math.round(diasAteUltimoVencimento / 30)} meses`
      : `${diasAteUltimoVencimento} dias`;

  const proximoPercent = Math.min(92, Math.max(8, (diasAteProximoVencimento / diasAteUltimoVencimento) * 100));


  const percentRecebido = Math.round((recebido / totalAReceber) * 100);

  const { labels, valores, temDados } = useMemo(() => {
    if (periodo === '7d') {
      const hoje = new Date();
      const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoje);
        d.setDate(d.getDate() - (6 - i));
        return DIAS_SEMANA_ABREV[d.getDay()];
      });
      return { labels, valores: gerarSerie(7, 12, 1), temDados: true };
    }
    if (periodo === '1m') {
      const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      return { labels, valores: gerarSerie(4, 45, 2), temDados: true };
    }
    if (periodo === '1a') {
      const hoje = new Date();
      const labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(hoje);
        d.setMonth(d.getMonth() - (11 - i));
        return MESES_ABREV[d.getMonth()];
      });
      return { labels, valores: gerarSerie(12, 155, 3), temDados: true };
    }
    if (!dataInicio || !dataFim) return { labels: [], valores: [], temDados: false };
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
    if (diffDias <= 0) return { labels: [], valores: [], temDados: false };

    if (diffDias <= 14) {
      const labels = Array.from({ length: diffDias + 1 }, (_, i) => {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      });
      return { labels, valores: gerarSerie(labels.length, 12, 4), temDados: true };
    }
    if (diffDias <= 120) {
      const numSemanas = Math.max(2, Math.round(diffDias / 7));
      const labels = Array.from({ length: numSemanas }, (_, i) => {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i * 7);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      });
      return { labels, valores: gerarSerie(labels.length, 45, 5), temDados: true };
    }
    const numMeses = Math.max(2, Math.round(diffDias / 30));
    const labels = Array.from({ length: numMeses }, (_, i) => {
      const d = new Date(inicio);
      d.setMonth(d.getMonth() + i);
      return MESES_ABREV[d.getMonth()];
    });
    return { labels, valores: gerarSerie(labels.length, 150, 6), temDados: true };
  }, [periodo, dataInicio, dataFim]);

  const chartWidth = 296;
  const chartHeight = 120;
  const padTop = 10;
  const padBottom = 6;

  const maxValor = temDados ? Math.max(...valores) : 0;
  const points =
    temDados && valores.length > 1
      ? valores.map((v, i) => ({
          x: (i / (valores.length - 1)) * chartWidth,
          y: chartHeight - padBottom - (v / (maxValor || 1)) * (chartHeight - padTop - padBottom),
        }))
      : [];

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
      : '';

  const retornoPeriodoValor = temDados ? valores[valores.length - 1] : 0;
  const retornoPeriodoPercent = temDados ? (retornoPeriodoValor / investido) * 100 : 0;

  const maxLabelsVisiveis = 6;
  const step = Math.max(1, Math.ceil(labels.length / maxLabelsVisiveis));
  const visibleLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);

  const chips = [
    { key: '7d', label: '7 dias' },
    { key: '1m', label: '1 mês' },
    { key: '1a', label: '1 ano' },
    { key: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="carteira-investimento-screen" style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .carteira-investimento-screen, .carteira-investimento-screen *, .carteira-investimento-screen *::before, .carteira-investimento-screen *::after {
          box-sizing: border-box;
        }
        .carteira-investimento-screen input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
        }
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.headerTitle}>Carteira</div>
      </div>

      <div style={styles.heroCard}>
        <div style={styles.eyebrow}>Investido</div>
        <div style={styles.bigValue}>R$ {formatBRL(investido)}</div>

        <div style={styles.rendimentoBlock}>
          <div style={styles.eyebrow}>Retorno</div>
          <div style={styles.rendimentoPercentValue}>
            <span style={styles.rendimentoPercentSign}>+</span>
            {rendimentoTotalPercent}%
          </div>
          <div style={styles.rendimentoCaption}>
            R$ {formatBRL(rendimentoTotalValor)} de retorno sobre investimento
          </div>
        </div>

        <div style={styles.splitRow}>
          <div style={styles.splitBlock}>
            <div style={styles.splitLabel}>Recebido</div>
            <div style={styles.splitValue}>R$ {formatBRL(recebido)}</div>
          </div>
          <div style={{ ...styles.splitBlock, ...styles.splitBlockRight }}>
            <div style={styles.splitLabel}>A receber</div>
            <div style={styles.splitValue}>R$ {formatBRL(aReceber)}</div>
          </div>
        </div>

        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${percentRecebido}%` }} />
        </div>
        <div style={styles.progressCaptionEnd}>
          <span>{percentRecebido}% já recebido</span>
          <span>de R$ {formatBRL(totalAReceber)}</span>
        </div>
      </div>

      <div style={styles.sectionTitle}>Ativos</div>
      <div style={styles.ativosCard}>
        <div style={styles.ativosHeaderRow}>
          <div style={styles.statLabel}>Quantidade</div>
          <div style={styles.ativosCount}>{ativosInvestimento}</div>
        </div>

        {temAtraso && (
          <div style={styles.atrasoBar}>
            <AlertTriangle size={16} color={colors.red} strokeWidth={2.2} style={styles.atrasoIcon} />
            <div style={styles.atrasoText}>
              <span style={styles.atrasoTextBold}>R$ {formatBRL(valorAtrasado)}</span> vencido em{' '}
              {dataAtrasoLabel}, aguardando pagamento
            </div>
          </div>
        )}

        <div style={styles.timelineTrackWrap}>
          <div style={styles.timelineTrack}>
            <div style={{ ...styles.timelineDot, left: '0%' }} />
            <div style={{ ...styles.timelineDot, ...styles.timelineDotAccent, left: `${proximoPercent}%` }} />
            <div style={{ ...styles.timelineDot, left: '100%' }} />
          </div>
        </div>

        <div style={styles.timelineLabelsRow}>
          <div style={styles.timelineLabelBlock}>
            <div style={styles.statLabel}>Próximo vencimento</div>
            <div style={styles.statValue}>{proximoVencimentoLabel}</div>
            <div style={styles.statSub}>R$ {formatBRL(proximoVencimentoValor)}</div>
          </div>
          <div style={{ ...styles.timelineLabelBlock, ...styles.timelineLabelBlockRight }}>
            <div style={styles.statLabel}>Último vencimento</div>
            <div style={styles.statValue}>{ultimoVencimentoLabel}</div>
            <div style={styles.statSub}>em {prazoRestanteLabel}</div>
          </div>
        </div>
      </div>

      <button style={styles.ativosLink}>
        Ver todos os ativos
        <ChevronRight size={14} strokeWidth={2} />
      </button>

      <div style={styles.sectionTitle}>Rentabilidade</div>
      <div style={styles.chartCard}>
        <div style={{ ...styles.statLabel, marginBottom: 10 }}>Período</div>
        <div style={styles.periodChips}>
          {chips.map((chip) => (
            <button
              key={chip.key}
              style={{
                ...styles.periodChip,
                ...(periodo === chip.key ? styles.periodChipActive : {}),
              }}
              onClick={() => setPeriodo(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {periodo === 'custom' && (
          <div style={styles.customDateRow}>
            <input
              type="date"
              style={styles.dateInput}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <span style={styles.dateSeparator}>até</span>
            <input
              type="date"
              style={styles.dateInput}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        )}

        <div style={styles.chartHeaderRow}>
          {temDados && (
            <div>
              <div style={styles.chartReturnValue}>
                +{retornoPeriodoPercent.toFixed(1)}%
              </div>
              <div style={styles.chartReturnSub}>R$ {formatBRL(retornoPeriodoValor)}</div>
            </div>
          )}
        </div>

        {temDados ? (
          <>
            <svg
              width="100%"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="carteiraAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.dark} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={colors.dark} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#carteiraAreaFill)" />
              <path d={linePath} fill="none" stroke={colors.dark} strokeWidth="2.5" strokeLinecap="round" />
              {points.length > 0 && (
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="4"
                  fill={colors.dark}
                  stroke="#fff"
                  strokeWidth="2"
                />
              )}
            </svg>
            <div style={styles.axisLabels}>
              {visibleLabels.map((label, i) => (
                <span key={i} style={styles.axisLabel}>{label}</span>
              ))}
            </div>
          </>
        ) : (
          <div style={styles.chartEmptyState}>Selecione as duas datas pra ver o retorno do período</div>
        )}
      </div>

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
              backgroundColor: key === 'carteira' ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
          >
            <Icon size={18} color={key === 'carteira' ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
            <span
              style={{
                ...styles.navLabelCompact,
                color: key === 'carteira' ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
