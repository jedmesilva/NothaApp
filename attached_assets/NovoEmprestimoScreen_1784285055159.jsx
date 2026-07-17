import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

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

  // Valor — hero escuro, mesmo padrão da Home
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
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  heroValueGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    cursor: 'text',
  },
  heroCurrencyPrefix: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.55)',
  },
  heroValueInput: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: -1,
    lineHeight: 1,
    color: '#fff',
    background: 'none',
    border: 'none',
    padding: '0 0 3px',
    width: 168,
  },
  stepperGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
  },
  stepperButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  sliderTrack: {
    position: 'relative',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 14,
  },
  sliderFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#fff',
    transform: 'translate(-50%, -50%) scale(1)',
    transformOrigin: 'center',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.14)',
    pointerEvents: 'none',
  },
  sliderThumbActive: {
    transform: 'translate(-50%, -50%) scale(1.35)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 6px rgba(255,255,255,0.22)',
  },
  sliderInput: {
    position: 'absolute',
    top: -13,
    left: 0,
    width: '100%',
    height: 32,
    margin: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  sliderCaption: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.45)',
  },

  // Seções de escolha (ciclo / prazo)
  section: {
    margin: '0 16px 14px',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.ink,
    padding: '0 4px 10px',
  },
  pillScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
  },
  pill: {
    flexShrink: 0,
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
  pillActive: {
    backgroundColor: colors.dark,
    color: '#fff',
    border: `1px solid ${colors.dark}`,
  },

  // Prazo — card claro com número editável, stepper, slider e atalhos
  prazoCard: {
    borderRadius: 24,
    backgroundColor: colors.card,
    padding: '20px 20px 18px',
  },
  prazoValueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prazoValueGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    cursor: 'text',
  },
  prazoInput: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: -0.5,
    color: colors.ink,
    background: 'none',
    border: 'none',
    padding: '0 0 3px',
    minWidth: '1ch',
  },
  prazoUnit: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.inkSoft,
  },
  prazoStepperButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.chipBg,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.ink,
  },
  planBlockLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: colors.inkFaint,
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  planDivider: {
    height: 1,
    backgroundColor: colors.line,
    margin: '18px 0',
  },
  quickPillRow: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    borderTop: `1px solid ${colors.line}`,
    paddingTop: 14,
  },
  quickPill: {
    flexShrink: 0,
    padding: '7px 13px',
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${colors.line}`,
    backgroundColor: colors.chipBg,
    color: colors.inkSoft,
    whiteSpace: 'nowrap',
  },
  quickPillActive: {
    backgroundColor: colors.dark,
    color: '#fff',
    border: `1px solid ${colors.dark}`,
  },

  // Resumo — segue exatamente a estrutura do heroCard/loanCard das outras telas:
  // eyebrow > valor grande + subvalor > grade de detalhes com label/valor/subvalor.
  // O valor principal aqui é o quanto se paga por ciclo, não o total do empréstimo,
  // já que é essa a informação mais acionável antes de confirmar o pedido.
  summaryCard: {
    borderRadius: 24,
    padding: '20px 20px 18px',
    backgroundColor: colors.card,
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
  // Nível intermediário de hierarquia: menor que o valor principal (por ciclo),
  // maior que a legenda do total — resposta direta a "em quantos ciclos"
  summaryCycles: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: colors.ink,
    marginBottom: 18,
  },
  summaryCaption: {
    fontSize: 12.5,
    color: colors.inkFaint,
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

  // CTA fixo
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
};

// Ciclos de pagamento disponíveis — cada um define sua própria unidade de prazo
// (dias, semanas ou meses), com intervalo e atalhos próprios para essa unidade
const CICLOS = [
  {
    key: 'diario',
    label: 'Diário',
    dias: 1,
    unidade: 'dia',
    unidadePlural: 'dias',
    genero: 'm',
    min: 5,
    max: 360,
    quick: [10, 15, 30, 45, 60, 90, 180, 360],
  },
  {
    key: 'semanal',
    label: 'Semanal',
    dias: 7,
    unidade: 'semana',
    unidadePlural: 'semanas',
    genero: 'f',
    min: 1,
    max: 51,
    quick: [2, 4, 8, 12, 26, 39, 51],
  },
  {
    key: 'mensal',
    label: 'Mensal',
    dias: 30,
    unidade: 'mês',
    unidadePlural: 'meses',
    genero: 'm',
    min: 1,
    max: 12,
    quick: [1, 2, 3, 6, 9, 12],
  },
];

// Rótulo da unidade, respeitando singular/plural (ex.: "1 semana" vs "2 semanas")
const unidadeLabel = (ciclo, n) => (n === 1 ? ciclo.unidade : ciclo.unidadePlural);

// "quantos" (masculino: dia, mês) ou "quantas" (feminino: semana)
const quantosLabel = (ciclo) => (ciclo.genero === 'f' ? 'quantas' : 'quantos');

// Pontos de referência da taxa total por prazo — a taxa reflete o prazo do
// empréstimo (não a quantidade de parcelas) e é interpolada entre esses pontos
// para qualquer prazo digitado.
const TAXA_ANCHORS = [
  { dias: 5, taxa: 4 },
  { dias: 10, taxa: 5 },
  { dias: 15, taxa: 7 },
  { dias: 30, taxa: 10 },
  { dias: 60, taxa: 15 },
  { dias: 90, taxa: 19 },
  { dias: 180, taxa: 27 },
  { dias: 360, taxa: 38 },
];

const taxaPorPrazo = (dias) => {
  if (dias <= TAXA_ANCHORS[0].dias) return TAXA_ANCHORS[0].taxa;
  const last = TAXA_ANCHORS[TAXA_ANCHORS.length - 1];
  if (dias >= last.dias) return last.taxa;
  for (let i = 0; i < TAXA_ANCHORS.length - 1; i++) {
    const a = TAXA_ANCHORS[i];
    const b = TAXA_ANCHORS[i + 1];
    if (dias >= a.dias && dias <= b.dias) {
      const ratio = (dias - a.dias) / (b.dias - a.dias);
      return a.taxa + ratio * (b.taxa - a.taxa);
    }
  }
  return last.taxa;
};

const LIMITE_DISPONIVEL_CENTAVOS = 150000; // R$ 1.500,00
const VALOR_MIN_CENTAVOS = 1000; // R$ 10,00
const VALOR_STEP_CENTAVOS = 500; // R$ 5,00 por clique no stepper

const formatBRL = (valorReais) =>
  valorReais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + Math.round(days));
  return result;
};

const formatData = (date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export default function NovoEmprestimoScreen() {
  const [valorCentavos, setValorCentavos] = useState(50000); // R$ 500,00
  const [isDraggingValor, setIsDraggingValor] = useState(false);
  const [cicloKey, setCicloKey] = useState('semanal');
  // numPeriodos é a quantidade de unidades do ciclo escolhido (dias, semanas ou meses).
  // O prazo em dias corridos é sempre derivado: numPeriodos * ciclo.dias
  const [numPeriodos, setNumPeriodos] = useState(8); // 8 semanas ≈ 60 dias, mesmo padrão anterior
  const [prazoDraft, setPrazoDraft] = useState('8');

  const valorInputRef = useRef(null);

  const ciclo = CICLOS.find((c) => c.key === cicloKey);
  const prazoDias = numPeriodos * ciclo.dias;
  const taxaTotal = taxaPorPrazo(prazoDias);
  const valorReais = valorCentavos / 100;

  // String exibida no campo de valor — sempre formatada como moeda (ex.: "500,00")
  const valorDisplay = formatBRL(valorReais);

  const calc = useMemo(() => {
    // Cada período do ciclo escolhido é uma parcela — não precisa mais arredondar,
    // já que numPeriodos já é a contagem exata digitada/selecionada pelo usuário
    const numParcelas = numPeriodos;
    const hoje = new Date();

    // Se houver mais de 1 parcela, elas se distribuem uniformemente entre hoje e o
    // vencimento final — a 1ª cai perto do próximo ciclo, a última cai exatamente no prazo.
    // Se houver só 1 parcela, o vencimento é a própria data do prazo.
    const datasParcelas =
      numParcelas === 1
        ? [addDays(hoje, prazoDias)]
        : Array.from({ length: numParcelas }, (_, i) =>
            addDays(hoje, ((i + 1) * prazoDias) / numParcelas)
          );

    const totalAPagar = valorReais * (1 + taxaTotal / 100);
    const valorParcela = totalAPagar / numParcelas;

    return {
      numParcelas,
      totalAPagar,
      valorParcela,
      primeiraParcela: datasParcelas[0],
      vencimentoFinal: datasParcelas[datasParcelas.length - 1],
    };
  }, [valorReais, ciclo, prazoDias, numPeriodos, taxaTotal]);

  const percentValor =
    ((valorCentavos - VALOR_MIN_CENTAVOS) / (LIMITE_DISPONIVEL_CENTAVOS - VALOR_MIN_CENTAVOS)) * 100;

  // Máscara de moeda: cada dígito digitado entra pela direita (como nos apps de banco) —
  // os 2 últimos dígitos são sempre os centavos. Isso já garante pontuação e casas decimais
  // corretas sem o usuário precisar digitar vírgula ou ponto.
  const handleValorInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    const centavos = digits === '' ? 0 : parseInt(digits, 10);
    setValorCentavos(Math.min(LIMITE_DISPONIVEL_CENTAVOS, centavos)); // nunca deixa passar do limite, nem digitando
  };

  const handleValorBlur = () => {
    setValorCentavos((prev) => Math.max(VALOR_MIN_CENTAVOS, prev));
  };

  const stepValor = (deltaCentavos) => {
    setValorCentavos((prev) =>
      Math.min(LIMITE_DISPONIVEL_CENTAVOS, Math.max(VALOR_MIN_CENTAVOS, prev + deltaCentavos))
    );
  };

  // Mantém o cursor sempre no fim do campo — como o texto é reformatado a cada tecla,
  // isso evita o cursor "pular" para o meio do valor enquanto o usuário digita
  useEffect(() => {
    const el = valorInputRef.current;
    if (el && document.activeElement === el) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [valorCentavos]);

  // Move o prazo via slider, stepper ou atalho — sempre um valor válido e já formatado no input
  const setPrazo = (novoValor) => {
    const clamped = Math.min(ciclo.max, Math.max(ciclo.min, Math.round(novoValor)));
    setNumPeriodos(clamped);
    setPrazoDraft(String(clamped));
  };

  // Enquanto o usuário digita, aceita qualquer número (mesmo fora do intervalo) para
  // não brigar com o que está sendo teclado — o valor só é limitado ao sair do campo
  const handlePrazoInputChange = (e) => {
    const raw = e.target.value;
    setPrazoDraft(raw);
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setNumPeriodos(Math.min(parsed, 3650)); // teto de segurança enquanto digita; o blur aplica o limite real
    }
  };

  const handlePrazoBlur = () => {
    const parsed = parseInt(prazoDraft, 10);
    setPrazo(Number.isNaN(parsed) ? numPeriodos : parsed);
  };

  // Ao trocar o ciclo (dia/semana/mês), converte o prazo atual (em dias corridos)
  // para a nova unidade, mantendo a duração total do empréstimo o mais próxima possível
  const handleCicloChange = (key) => {
    const novoCiclo = CICLOS.find((c) => c.key === key);
    const convertido = Math.round(prazoDias / novoCiclo.dias);
    const clamped = Math.min(novoCiclo.max, Math.max(novoCiclo.min, convertido));
    setCicloKey(key);
    setNumPeriodos(clamped);
    setPrazoDraft(String(clamped));
  };

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        .editable-dark {
          border-bottom: 1.5px dashed rgba(255,255,255,0.4);
        }
        .editable-dark:focus {
          outline: none;
          border-bottom: 1.5px solid #fff;
        }
        .editable-light {
          border-bottom: 1.5px dashed rgba(21,21,29,0.3);
        }
        .editable-light:focus {
          outline: none;
          border-bottom: 1.5px solid #15151D;
        }
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Novo empréstimo</div>
      </div>

      {/* Valor */}
      <div style={styles.heroCard}>
        <div style={styles.eyebrow}>Quanto você precisa?</div>

        <div style={styles.valueRow}>
          <div style={styles.heroValueGroup}>
            <span style={styles.heroCurrencyPrefix}>R$</span>
            <input
              ref={valorInputRef}
              type="text"
              inputMode="numeric"
              className="editable-dark"
              value={valorDisplay}
              onChange={handleValorInputChange}
              onBlur={handleValorBlur}
              style={styles.heroValueInput}
            />
          </div>
          <div style={styles.stepperGroup}>
            <button
              style={{
                ...styles.stepperButton,
                ...(valorCentavos <= VALOR_MIN_CENTAVOS ? styles.stepperButtonDisabled : {}),
              }}
              onClick={() => stepValor(-VALOR_STEP_CENTAVOS)}
              disabled={valorCentavos <= VALOR_MIN_CENTAVOS}
            >
              <Minus size={16} strokeWidth={2.4} />
            </button>
            <button
              style={{
                ...styles.stepperButton,
                ...(valorCentavos >= LIMITE_DISPONIVEL_CENTAVOS ? styles.stepperButtonDisabled : {}),
              }}
              onClick={() => stepValor(VALOR_STEP_CENTAVOS)}
              disabled={valorCentavos >= LIMITE_DISPONIVEL_CENTAVOS}
            >
              <Plus size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div style={styles.sliderTrack}>
          <div style={{ ...styles.sliderFill, width: `${percentValor}%` }} />
          <div
            style={{
              ...styles.sliderThumb,
              ...(isDraggingValor ? styles.sliderThumbActive : {}),
              left: `${percentValor}%`,
            }}
          />
          <input
            type="range"
            min={VALOR_MIN_CENTAVOS}
            max={LIMITE_DISPONIVEL_CENTAVOS}
            step={100}
            value={Math.min(LIMITE_DISPONIVEL_CENTAVOS, Math.max(VALOR_MIN_CENTAVOS, valorCentavos))}
            onChange={(e) => setValorCentavos(Number(e.target.value))}
            onPointerDown={() => setIsDraggingValor(true)}
            onPointerUp={() => setIsDraggingValor(false)}
            onPointerCancel={() => setIsDraggingValor(false)}
            style={styles.sliderInput}
          />
        </div>
        <div style={styles.sliderCaption}>
          <span>R$ {formatBRL(VALOR_MIN_CENTAVOS / 100)}</span>
          <span>Limite: R$ {formatBRL(LIMITE_DISPONIVEL_CENTAVOS / 100)}</span>
        </div>
      </div>

      {/* Plano de pagamento — frequência e prazo agrupados no mesmo cartão,
          já que uma decisão depende da outra */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Plano de pagamento</div>

        <div style={styles.prazoCard}>
          <div style={styles.planBlockLabel}>Frequência</div>
          <div style={styles.pillScroll}>
            {CICLOS.map((c) => (
              <button
                key={c.key}
                style={{
                  ...styles.pill,
                  ...(cicloKey === c.key ? styles.pillActive : {}),
                }}
                onClick={() => handleCicloChange(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={styles.planDivider} />

          <div style={styles.planBlockLabel}>
            Em {quantosLabel(ciclo)} {ciclo.unidadePlural} quer quitar?
          </div>
          <div style={styles.prazoValueRow}>
            <div style={styles.prazoValueGroup}>
              <input
                key={cicloKey /* remonta o input ao trocar de unidade, evitando estado de digitação preso */}
                type="number"
                inputMode="numeric"
                className="editable-light"
                value={prazoDraft}
                onChange={handlePrazoInputChange}
                onBlur={handlePrazoBlur}
                style={{ ...styles.prazoInput, width: `${Math.max(prazoDraft.length, 1) + 0.5}ch` }}
              />
              <span style={styles.prazoUnit}>{unidadeLabel(ciclo, numPeriodos)}</span>
            </div>
            <div style={styles.stepperGroup}>
              <button
                style={{
                  ...styles.prazoStepperButton,
                  ...(numPeriodos <= ciclo.min ? styles.stepperButtonDisabled : {}),
                }}
                onClick={() => setPrazo(numPeriodos - 1)}
                disabled={numPeriodos <= ciclo.min}
              >
                <Minus size={16} strokeWidth={2.4} />
              </button>
              <button
                style={{
                  ...styles.prazoStepperButton,
                  ...(numPeriodos >= ciclo.max ? styles.stepperButtonDisabled : {}),
                }}
                onClick={() => setPrazo(numPeriodos + 1)}
                disabled={numPeriodos >= ciclo.max}
              >
                <Plus size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div style={styles.quickPillRow}>
            {ciclo.quick.map((n) => (
              <button
                key={n}
                style={{
                  ...styles.quickPill,
                  ...(numPeriodos === n ? styles.quickPillActive : {}),
                }}
                onClick={() => setPrazo(n)}
              >
                {n} {unidadeLabel(ciclo, n)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo — atualiza em tempo real */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Resumo do empréstimo</div>

        <div style={styles.summaryCard}>
          <div style={styles.planBlockLabel}>Você pagará</div>
          <div style={styles.summaryValueRow}>
            <span style={styles.summaryValue}>R$ {formatBRL(calc.valorParcela)}</span>
            <span style={styles.summaryValueUnit}>/{ciclo.unidade}</span>
          </div>
          <div style={styles.summaryCycles}>
            durante {calc.numParcelas} {unidadeLabel(ciclo, calc.numParcelas)}
          </div>

          {/* Mesma grade de 4 detalhes do card de empréstimo em EmprestimosScreen e do
              heroCard em EmprestimoDetalheScreen: Prazo, Ciclo, Taxa total, Total a pagar,
              cada um com valor + subvalor de apoio */}
          <div style={styles.detailsGrid}>
            <div>
              <div style={styles.detailLabel}>Prazo</div>
              <div style={styles.detailValue}>{prazoDias} dias</div>
              <div style={styles.detailSubvalue}>vence {formatData(calc.vencimentoFinal)}</div>
            </div>
            <div>
              <div style={styles.detailLabel}>Ciclo</div>
              <div style={styles.detailValue}>{ciclo.label}</div>
              <div style={styles.detailSubvalue}>
                R$ {formatBRL(calc.valorParcela)}/{ciclo.unidade}
              </div>
            </div>
            <div>
              <div style={styles.detailLabel}>Taxa total</div>
              <div style={styles.detailValue}>{taxaTotal.toFixed(1)}%</div>
            </div>
            <div>
              <div style={styles.detailLabel}>
                {calc.numParcelas === 1 ? 'Vencimento' : '1ª parcela'}
              </div>
              <div style={styles.detailValue}>
                {formatData(calc.numParcelas === 1 ? calc.vencimentoFinal : calc.primeiraParcela)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.ctaBar}>
        <button style={styles.ctaButton}>Solicitar R$ {formatBRL(valorReais)}</button>
      </div>
    </div>
  );
}
