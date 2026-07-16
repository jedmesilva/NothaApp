import React, { useState } from 'react';
import {
  Home,
  Landmark,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

// Mesma paleta monocromática do resto do app — red/redBg é a única exceção,
// reservada para sinalizar atraso, igual ao padrão de AtivosScreen/Carteira
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
    paddingBottom: 104,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 20px 4px',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.4,
  },
  subtitle: {
    padding: '6px 20px 18px',
    fontSize: 13.5,
    color: colors.inkSoft,
  },

  // Filtro de status — pills roláveis
  filterScroll: {
    display: 'flex',
    gap: 8,
    padding: '0 20px 18px',
    overflowX: 'auto',
  },
  filterPill: {
    flexShrink: 0,
    padding: '9px 16px',
    borderRadius: 999,
    fontSize: 13,
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

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '0 16px',
  },

  // Card de empréstimo
  loanCard: {
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: '20px 20px 18px',
    cursor: 'pointer',
  },
  // Mesmo tratamento de borda usado em AtivosScreen para os mesmos estados
  loanCardAtrasado: {
    border: `1.5px solid ${colors.red}`,
  },
  loanCardCaptacao: {
    border: `1.5px dashed ${colors.inkFaint}`,
  },
  loanTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loanValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.4,
  },
  loanLabel: {
    fontSize: 12.5,
    color: colors.inkFaint,
    marginTop: 2,
  },

  liveTimer: {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  liveTimerSeparator: {
    opacity: 0.45,
    margin: '0 1px',
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
    backgroundColor: colors.chipBg,
    color: colors.inkSoft,
  },
  statusCaptacao: {
    backgroundColor: colors.chipBg,
    color: colors.inkSoft,
  },
  statusAtivo: {
    backgroundColor: colors.dark,
    color: '#fff',
  },
  // Antes era preto sólido; agora usa o mesmo vermelho de AtivosScreen/Carteira
  // para sinalizar atraso de forma consistente em todo o app
  statusAtrasado: {
    backgroundColor: colors.redBg,
    color: colors.red,
  },
  statusQuitado: {
    backgroundColor: 'transparent',
    color: colors.inkFaint,
    border: `1px solid ${colors.line}`,
  },

  // Bloco de progresso — mesma estrutura "pool" de AtivosScreen/OfertaInvestimentoCard:
  // label > linha (percentual + valor "X de Y") > barra > legenda com bolinhas
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
  },
  detailBlock: {
    flex: 1,
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

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: colors.inkFaint,
    fontSize: 14,
  },

  // Bottom nav — igual à Home
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
  navLabel: {
    fontSize: 13,
    fontWeight: 600,
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
  diario: { label: 'Diário', unidade: 'dia', unidadePlural: 'dias' },
  semanal: { label: 'Semanal', unidade: 'semana', unidadePlural: 'semanas' },
  mensal: { label: 'Mensal', unidade: 'mês', unidadePlural: 'meses' },
};

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'ativo', label: 'Ativos' },
  { key: 'atrasado', label: 'Atrasados' },
  { key: 'analise', label: 'Em análise' },
  { key: 'captacao', label: 'Em captação' },
  { key: 'quitado', label: 'Quitados' },
];

const emprestimos = [
  {
    id: 1,
    valor: 8500,
    taxaJurosTotal: 20,
    prazoDias: 60,
    ciclo: 'mensal',
    parcelasTotal: 2,
    parcelasPagas: 0,
    status: 'atrasado',
    diasAtraso: 6,
    diasDesdeConcessao: 36,
  },
  {
    id: 2,
    valor: 3200,
    taxaJurosTotal: 12,
    prazoDias: 90,
    ciclo: 'semanal',
    parcelasTotal: 13,
    parcelasPagas: 6,
    status: 'ativo',
    proximaData: '18 de julho',
    diasDesdeConcessao: 42,
  },
  {
    id: 3,
    valor: 5000,
    taxaJurosTotal: 18,
    prazoDias: 45,
    ciclo: 'semanal',
    parcelasTotal: 6,
    parcelasPagas: 0,
    status: 'captacao',
    valorCaptado: 3100,
    numCredores: 14,
  },
  {
    id: 4,
    valor: 1800,
    taxaJurosTotal: 8,
    prazoDias: 10,
    ciclo: 'diario',
    parcelasTotal: 10,
    parcelasPagas: 0,
    status: 'analise',
  },
  {
    id: 5,
    valor: 4500,
    taxaJurosTotal: 16,
    prazoDias: 60,
    ciclo: 'mensal',
    parcelasTotal: 2,
    parcelasPagas: 2,
    status: 'quitado',
    diasDesdeConcessao: 60,
  },
];

const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatData = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

// Contador ao vivo embutido no badge "Em captação", substituindo o ícone.
// Começa em 0s e vai mudando de formato conforme o tempo passa:
// segundos (0s, 45s) -> minutos (1:30min) -> horas (2:34:32).
function ContadorCaptacaoTexto({ segundosIniciais }) {
  const [segundos, setSegundos] = useState(segundosIniciais);

  React.useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  let texto;
  if (h > 0) {
    texto = `${h}:${pad(m)}:${pad(s)}`;
  } else if (m > 0) {
    texto = `${m}:${pad(s)}min`;
  } else {
    texto = `${s}s`;
  }

  return <span style={styles.liveTimer}>{texto}</span>;
}

export default function EmprestimosScreen() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [activeNav, setActiveNav] = useState('emprestimos');

  const filtered =
    activeFilter === 'todos'
      ? emprestimos
      : emprestimos.filter((e) => e.status === activeFilter);

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <div style={styles.title}>Empréstimos</div>
      </div>

      <div style={styles.subtitle}>
        {emprestimos.length} empréstimos no total
      </div>

      <div style={styles.filterScroll}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            style={{
              ...styles.filterPill,
              ...(activeFilter === f.key ? styles.filterPillActive : {}),
            }}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.emptyState}>Nenhum empréstimo nessa categoria.</div>
        )}

        {filtered.map((loan) => {
          const meta = STATUS_META[loan.status];
          const Icon = meta.icon;
          const percentPago =
            loan.parcelasTotal > 0
              ? Math.round((loan.parcelasPagas / loan.parcelasTotal) * 100)
              : 0;
          const totalAPagar = loan.valor * (1 + loan.taxaJurosTotal / 100);
          const valorParcela = totalAPagar / loan.parcelasTotal;
          const valorPago = valorParcela * loan.parcelasPagas;
          const percentCaptado =
            loan.status === 'captacao' ? Math.round((loan.valorCaptado / loan.valor) * 100) : 0;

          // Vencimento é sempre concessão + prazo. Enquanto o empréstimo ainda não
          // foi concedido (análise/captação), não existe data de concessão real —
          // mostramos uma previsão calculada a partir de hoje.
          const jaConcedido = loan.status !== 'analise' && loan.status !== 'captacao';
          const hoje = new Date();
          const dataConcessao = jaConcedido ? addDays(hoje, -loan.diasDesdeConcessao) : hoje;
          const dataVencimento = addDays(dataConcessao, loan.prazoDias);

          return (
            <div
              key={loan.id}
              style={{
                ...styles.loanCard,
                ...(loan.status === 'atrasado' ? styles.loanCardAtrasado : {}),
                ...(loan.status === 'captacao' ? styles.loanCardCaptacao : {}),
              }}
            >
              <div style={styles.loanTopRow}>
                <div>
                  <div style={styles.loanValue}>R$ {formatBRL(loan.valor)}</div>
                  <div style={styles.loanLabel}>
                    R$ {formatBRL(Math.round(valorParcela))}/{CICLO_META[loan.ciclo].unidade} · {loan.parcelasTotal}{' '}
                    {loan.parcelasTotal === 1 ? CICLO_META[loan.ciclo].unidade : CICLO_META[loan.ciclo].unidadePlural}
                  </div>
                </div>
                <div style={{ ...styles.statusBadge, ...meta.badgeStyle }}>
                  {loan.status === 'captacao' ? (
                    <>
                      <ContadorCaptacaoTexto segundosIniciais={0} />
                      <span style={styles.liveTimerSeparator}>·</span>
                      Em captação
                    </>
                  ) : (
                    <>
                      <Icon size={13} strokeWidth={2.4} />
                      {meta.label}
                    </>
                  )}
                </div>
              </div>

              {loan.status === 'captacao' && (
                <div style={styles.poolBlock}>
                  <div style={styles.poolLabel}>Captação do pedido</div>
                  <div style={styles.poolTopRow}>
                    <span style={styles.poolPercent}>{percentCaptado}% captado</span>
                    <span style={styles.poolValue}>
                      R$ {formatBRL(loan.valorCaptado)} de R$ {formatBRL(loan.valor)}
                    </span>
                  </div>
                  <div style={styles.poolTrack}>
                    <div style={{ ...styles.poolSegCaptado, width: `${percentCaptado}%` }} />
                  </div>
                  <div style={styles.poolCaption}>
                    <span style={styles.poolCaptionItem}>
                      <span style={styles.poolCaptionDotCaptado} />
                      {percentCaptado}% captado
                    </span>
                    <span style={styles.poolCaptionItem}>
                      <span style={styles.poolCaptionDotRestante} />
                      {100 - percentCaptado}% captando
                    </span>
                  </div>
                </div>
              )}

              {(loan.status === 'ativo' || loan.status === 'atrasado') && (
                <div style={styles.poolBlock}>
                  <div style={styles.poolLabel}>Pagamento do empréstimo</div>
                  <div style={styles.poolTopRow}>
                    <span style={styles.poolPercent}>{percentPago}% pago</span>
                    <span style={styles.poolValue}>
                      R$ {formatBRL(Math.round(valorPago))} de R$ {formatBRL(Math.round(totalAPagar))}
                    </span>
                  </div>
                  <div style={styles.poolTrack}>
                    <div style={{ ...styles.poolSegCaptado, width: `${percentPago}%` }} />
                  </div>
                  <div style={styles.poolCaption}>
                    <span style={styles.poolCaptionItem}>
                      <span style={styles.poolCaptionDotCaptado} />
                      pago
                    </span>
                    <span
                      style={{
                        ...styles.poolCaptionItem,
                        ...(loan.status === 'atrasado' ? styles.poolCaptionItemAtrasada : {}),
                      }}
                    >
                      <span style={styles.poolCaptionDotRestante} />
                      {loan.status === 'atrasado'
                        ? `atrasado há ${loan.diasAtraso} dias`
                        : `próxima parcela em ${loan.proximaData}`}
                    </span>
                  </div>
                </div>
              )}

              <div style={styles.detailsGrid}>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Prazo</div>
                  <div style={styles.detailValue}>{loan.prazoDias} dias</div>
                  <div style={styles.detailSubvalue}>
                    vence {formatData(dataVencimento)}
                  </div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Ciclo</div>
                  <div style={styles.detailValue}>{CICLO_META[loan.ciclo].label}</div>
                  <div style={styles.detailSubvalue}>
                    R$ {formatBRL(Math.round(valorParcela))}/{CICLO_META[loan.ciclo].unidade}
                  </div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Taxa total</div>
                  <div style={styles.detailValue}>{loan.taxaJurosTotal}%</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>{loan.status === 'quitado' ? 'Total pago' : 'Total a pagar'}</div>
                  <div style={styles.detailValue}>R$ {formatBRL(Math.round(totalAPagar))}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
