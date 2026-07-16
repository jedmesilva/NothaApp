import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Clock } from 'lucide-react';

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
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: '28px 28px 0 0',
    padding: '26px 20px 28px',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
  },

  timerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  timerLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.inkSoft,
  },
  timerValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 700,
  },
  timerTrack: {
    width: '100%',
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: 22,
  },
  timerFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.dark,
    transition: 'width 1s linear',
  },
  timerFillUrgent: {
    backgroundColor: colors.red,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: colors.inkFaint,
    marginBottom: 6,
  },
  heroRow: {
    marginBottom: 8,
  },
  heroValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 46,
    fontWeight: 700,
    letterSpacing: -1.2,
    lineHeight: 1,
  },
  heroValueSign: {
    fontSize: 26,
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
    paddingTop: 18,
    borderTop: `1px solid ${colors.line}`,
    marginBottom: 22,
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
    marginBottom: 4,
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

  buttonRow: {
    display: 'flex',
    gap: 10,
  },
  declineButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: colors.chipBg,
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    color: colors.ink,
    cursor: 'pointer',
  },
  acceptButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: colors.dark,
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
  },

  resultWrap: {
    textAlign: 'center',
    padding: '28px 10px 6px',
  },
  resultIconWrap: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  resultTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 1.4,
  },
};

const TOTAL_SECONDS = 30;

export default function OfertaInvestimentoCard({
  oferta = {
    valor: 1200,
    taxaRetorno: 4.8,
    prazoDias: 45,
    ciclo: 'Semanal',
    risco: 'Baixo',
    tomadorScore: 'A',
    valorTotalPedido: 5000,
    jaCaptado: 3100,
    numCredores: 14,
    // emprestimosAnteriores = quantidade de empréstimos JÁ CONCLUÍDOS antes desta oferta.
    // Não inclui o empréstimo desta própria oferta.
    emprestimosAnteriores: 3,
    valorTotalTomado: 12400,
  },
  onAccept,
  onDecline,
}) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [status, setStatus] = useState('pending'); // pending | accepted | declined | expired
  const intervalRef = useRef(null);

  useEffect(() => {
    if (status !== 'pending') return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setStatus('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const formatBRL = (value) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleAccept = () => {
    clearInterval(intervalRef.current);
    setStatus('accepted');
    onAccept?.(oferta);
  };

  const handleDecline = () => {
    clearInterval(intervalRef.current);
    setStatus('declined');
    onDecline?.(oferta);
  };

  const pctCaptado = Math.round((oferta.jaCaptado / oferta.valorTotalPedido) * 100);
  const pctOferta = Math.round((oferta.valor / oferta.valorTotalPedido) * 100);
  const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);
  const pctTempo = (secondsLeft / TOTAL_SECONDS) * 100;
  const isUrgent = secondsLeft <= 10;

  const retornoValor = Math.round(oferta.valor * (oferta.taxaRetorno / 100));

  // Número ordinal deste empréstimo do ponto de vista do CREDOR
  // (ex.: "é o 1º empréstimo desse tomador?", "o 2º?", "o 5º?").
  // oferta.emprestimosAnteriores = quantos ele JÁ tomou antes desta oferta (não inclui a atual).
  // Por isso somamos +1: N empréstimos anteriores + este = a ordem real deste empréstimo.
  // Ex.: emprestimosAnteriores = 1 (tomou 1 antes) -> este é o 2º -> exibe "2º empréstimo".
  // Se esse número aparecer errado na prática, o mais provável é a origem do dado (backend)
  // já estar enviando a contagem incluindo a oferta atual — vale checar ali, não aqui.
  const numeroDoEmprestimo = oferta.emprestimosAnteriores + 1;

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.sheet}>

        {status === 'pending' && (
          <>
            <div style={styles.timerRow}>
              <div style={styles.timerLabel}>
                <Clock size={14} strokeWidth={2.2} />
                Nova solicitação de investimento
              </div>
              <div style={{ ...styles.timerValue, color: isUrgent ? colors.red : colors.ink }}>
                {secondsLeft}s
              </div>
            </div>
            <div style={styles.timerTrack}>
              <div
                style={{
                  ...styles.timerFill,
                  ...(isUrgent ? styles.timerFillUrgent : {}),
                  width: `${pctTempo}%`,
                }}
              />
            </div>

            <div style={styles.eyebrow}>Retorno oferecido</div>
            <div style={styles.heroRow}>
              <div style={styles.heroValue}>
                <span style={styles.heroValueSign}>+</span>
                {oferta.taxaRetorno}%
              </div>
            </div>
            <div style={styles.heroCaption}>
              Rendimento de R$ {formatBRL(retornoValor)} em {oferta.prazoDias} dias
            </div>

            <div style={styles.splitRow}>
              <div style={styles.splitBlock}>
                <div style={styles.splitLabel}>Investimento</div>
                <div style={styles.splitValue}>R$ {formatBRL(oferta.valor)}</div>
              </div>
              <div style={{ ...styles.splitBlock, ...styles.splitBlockRight }}>
                <div style={styles.splitLabel}>Retorno</div>
                <div style={styles.splitValue}>R$ {formatBRL(oferta.valor + retornoValor)}</div>
              </div>
            </div>

            <div style={styles.poolBlock}>
              <div style={styles.poolLabel}>Captação do pedido</div>
              <div style={styles.poolTopRow}>
                <span style={styles.poolPercent}>{pctCaptado}% captado</span>
                <span style={styles.poolValue}>
                  R$ {formatBRL(oferta.jaCaptado)} de R$ {formatBRL(oferta.valorTotalPedido)}
                </span>
              </div>
              <div style={styles.poolTrack}>
                <div style={{ ...styles.poolSegCaptado, width: `${pctCaptado}%` }} />
                <div style={{ ...styles.poolSegOferta, width: `${pctOfertaClamped}%` }} />
              </div>
              <div style={styles.poolCaption}>
                <span style={styles.poolCaptionItem}>
                  <span style={styles.poolCaptionDotCaptado} />
                  {pctCaptado}% captado
                </span>
                <span style={styles.poolCaptionItem}>
                  <span style={styles.poolCaptionDotOferta} />
                  {pctOferta}% esta oferta
                </span>
                <span style={styles.poolCaptionItem}>
                  <span style={styles.poolCaptionDotRestante} />
                  {Math.max(0, 100 - pctCaptado - pctOferta)}% captando
                </span>
              </div>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.detailBlock}>
                <div style={styles.detailLabel}>Prazo</div>
                <div style={styles.detailValue}>{oferta.prazoDias} dias</div>
                <div style={styles.detailSubvalue}>parcelas {oferta.ciclo.toLowerCase()}s</div>
              </div>
              <div style={styles.detailBlock}>
                <div style={styles.detailLabel}>Risco</div>
                <div style={styles.detailValue}>{oferta.risco}</div>
                <div style={styles.detailSubvalue}>score {oferta.tomadorScore}</div>
              </div>
              <div style={styles.detailBlock}>
                <div style={styles.detailLabel}>Histórico</div>
                <div style={styles.detailValue}>
                  {oferta.emprestimosAnteriores === 0
                    ? 'Primeiro empréstimo'
                    : `${numeroDoEmprestimo}º empréstimo`}
                </div>
              </div>
              <div style={styles.detailBlock}>
                <div style={styles.detailLabel}>Já tomado</div>
                <div style={styles.detailValue}>
                  {oferta.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(oferta.valorTotalTomado)}`}
                </div>
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.declineButton} onClick={handleDecline}>
                <X size={18} strokeWidth={2.4} />
                Recusar
              </button>
              <button style={styles.acceptButton} onClick={handleAccept}>
                <Check size={18} strokeWidth={2.4} />
                Aceitar oferta
              </button>
            </div>
          </>
        )}

        {status === 'accepted' && (
          <div style={styles.resultWrap}>
            <div style={{ ...styles.resultIconWrap, backgroundColor: colors.dark }}>
              <Check size={26} color="#fff" strokeWidth={2.6} />
            </div>
            <div style={styles.resultTitle}>Oferta aceita</div>
            <div style={styles.resultSubtitle}>
              R$ {formatBRL(oferta.valor)} reservados para esse pedido.
              <br />
              Você recebe a confirmação assim que a captação fechar.
            </div>
          </div>
        )}

        {status === 'declined' && (
          <div style={styles.resultWrap}>
            <div style={{ ...styles.resultIconWrap, backgroundColor: colors.chipBg }}>
              <X size={26} color={colors.inkSoft} strokeWidth={2.6} />
            </div>
            <div style={styles.resultTitle}>Oferta recusada</div>
            <div style={styles.resultSubtitle}>
              Sem problema. Vamos te avisar quando surgir outra oportunidade.
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div style={styles.resultWrap}>
            <div style={{ ...styles.resultIconWrap, backgroundColor: colors.redBg }}>
              <Clock size={24} color={colors.red} strokeWidth={2.4} />
            </div>
            <div style={styles.resultTitle}>Tempo esgotado</div>
            <div style={styles.resultSubtitle}>
              Essa oferta foi repassada para outro credor.
              <br />
              Fique de olho na próxima.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
