import React from 'react';
import { ArrowLeft, FileText, ChevronRight, Download } from 'lucide-react';

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
    paddingBottom: 110,
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
    padding: '6px 20px 4px',
    fontSize: 13.5,
    color: colors.inkSoft,
  },

  section: {
    margin: '14px 16px 0',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.ink,
    padding: '0 4px 10px',
  },

  // Resumo — mesmo padrão da tela de simulação: eyebrow > valor por ciclo (principal) >
  // "durante N ciclos" (nível intermediário) > grade de detalhes com label/valor/subvalor
  summaryCard: {
    borderRadius: 24,
    padding: '20px 20px 18px',
    backgroundColor: colors.card,
  },
  planBlockLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: colors.inkFaint,
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  summaryValueUnit: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.inkFaint,
  },
  summaryCycles: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: colors.ink,
    marginBottom: 18,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    rowGap: 16,
    columnGap: 12,
    borderTop: `1px solid ${colors.line}`,
    paddingTop: 18,
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

  // Contrato — aqui é só uma prévia + convite para ler; o aceite em si acontece
  // na tela dedicada de leitura (ContratoLeituraScreen), não nesta tela
  contractCard: {
    borderRadius: 24,
    padding: '18px 20px 20px',
    backgroundColor: colors.card,
  },
  contractTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  contractTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
  },
  contractIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.chipBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.ink,
  },
  downloadLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.inkSoft,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  contractTextPreview: {
    fontSize: 13,
    lineHeight: 1.55,
    color: colors.inkSoft,
    marginBottom: 14,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  // Linha de navegação para a tela dedicada de leitura do contrato
  contractNavRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.chipBg,
    padding: '13px 14px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  contractNavText: {
    fontSize: 13.5,
    fontWeight: 700,
    color: colors.ink,
    textAlign: 'left',
  },

  // CTA fixo — leva direto para a tela de leitura do contrato, onde o
  // empréstimo é de fato aceito e confirmado
  ctaBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 420,
    padding: '14px 16px calc(18px + env(safe-area-inset-bottom))',
    backgroundColor: colors.bg,
    borderTop: `1px solid ${colors.line}`,
  },
  ctaButton: {
    width: '100%',
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: colors.dark,
    color: '#fff',
    fontSize: 15.5,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 0.1,
  },
  ctaHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 9,
  },
};

const formatBRL = (valorReais) =>
  valorReais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Mesmo formato de data das outras telas — sempre com o ano, já que o prazo
// pode atravessar a virada do ano
const formatData = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// Termos finais da simulação, vindos da tela anterior (aqui fixos como exemplo standalone)
const RESUMO = {
  valorParcela: 114.33,
  ciclo: { label: 'Semanal', unidade: 'semana' },
  numParcelas: 8,
  prazoDias: 56,
  taxaTotal: 14.3,
  totalAPagar: 914.67,
  primeiraParcela: new Date(2026, 6, 19),
  vencimentoFinal: new Date(2026, 8, 6),
};

// Prévia curta do contrato — o texto completo mora na tela dedicada de leitura
// (ContratoLeituraScreen), não mais embutido aqui
const CONTRATO_PREVIEW =
  'Este instrumento formaliza o empréstimo entre o tomador identificado nesta plataforma e o(s) credor(es) que fizerem o aporte do valor solicitado, nas condições descritas no resumo acima.';

export default function AceiteContratoScreen() {
  // Em produção: navigation.navigate('ContratoLeitura', { resumo: RESUMO })
  // É lá, não aqui, que o empréstimo é de fato aceito e confirmado.
  const irParaContrato = () => {};

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Revisar e confirmar</div>
      </div>
      <div style={styles.subtitle}>Confira os termos antes de ler e aceitar o contrato.</div>

      {/* Resumo — mesmo padrão da tela de simulação */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Resumo do empréstimo</div>

        <div style={styles.summaryCard}>
          <div style={styles.planBlockLabel}>Você pagará</div>
          <div style={styles.summaryValueRow}>
            <span style={styles.summaryValue}>R$ {formatBRL(RESUMO.valorParcela)}</span>
            <span style={styles.summaryValueUnit}>/{RESUMO.ciclo.unidade}</span>
          </div>
          <div style={styles.summaryCycles}>
            durante {RESUMO.numParcelas} {RESUMO.ciclo.unidade === 'mês' ? 'meses' : `${RESUMO.ciclo.unidade}s`}
          </div>

          <div style={styles.detailsGrid}>
            <div>
              <div style={styles.detailLabel}>Prazo</div>
              <div style={styles.detailValue}>{RESUMO.prazoDias} dias</div>
              <div style={styles.detailSubvalue}>vence {formatData(RESUMO.vencimentoFinal)}</div>
            </div>
            <div>
              <div style={styles.detailLabel}>Ciclo</div>
              <div style={styles.detailValue}>{RESUMO.ciclo.label}</div>
              <div style={styles.detailSubvalue}>
                R$ {formatBRL(RESUMO.valorParcela)}/{RESUMO.ciclo.unidade}
              </div>
            </div>
            <div>
              <div style={styles.detailLabel}>Taxa total</div>
              <div style={styles.detailValue}>{RESUMO.taxaTotal.toFixed(1)}%</div>
            </div>
            <div>
              <div style={styles.detailLabel}>
                {RESUMO.numParcelas === 1 ? 'Vencimento' : '1ª parcela'}
              </div>
              <div style={styles.detailValue}>
                {formatData(RESUMO.numParcelas === 1 ? RESUMO.vencimentoFinal : RESUMO.primeiraParcela)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrato — só a prévia; ler e aceitar acontece na tela dedicada */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Contrato de empréstimo</div>

        <div style={styles.contractCard}>
          <div style={styles.contractTopRow}>
            <div style={styles.contractTitleGroup}>
              <div style={styles.contractIconBadge}>
                <FileText size={15} color={colors.ink} strokeWidth={2} />
              </div>
              <div style={styles.contractTitle}>Termos e condições</div>
            </div>
            <button style={styles.downloadLink}>
              <Download size={14} strokeWidth={2.2} />
              PDF
            </button>
          </div>

          <div style={styles.contractTextPreview}>{CONTRATO_PREVIEW}</div>

          <button style={styles.contractNavRow} onClick={irParaContrato}>
            <div style={styles.contractNavText}>Ler contrato completo</div>
            <ChevronRight size={16} color={colors.inkFaint} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div style={styles.ctaBar}>
        <button style={styles.ctaButton} onClick={irParaContrato}>
          Ler e aceitar contrato
        </button>
      </div>
    </div>
  );
}
