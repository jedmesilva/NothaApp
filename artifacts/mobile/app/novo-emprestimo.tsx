import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, DetailGrid } from '@/components/ds';
import { addDays, formatData } from '@/data/loans';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CICLOS = [
  { key: 'diario',  label: 'Diário',  dias: 1,  unidade: 'dia',    unidadePlural: 'dias',    genero: 'm', min: 5,  max: 360, quick: [10, 15, 30, 45, 60, 90, 180, 360] },
  { key: 'semanal', label: 'Semanal', dias: 7,  unidade: 'semana', unidadePlural: 'semanas', genero: 'f', min: 1,  max: 51,  quick: [2, 4, 8, 12, 26, 39, 51] },
  { key: 'mensal',  label: 'Mensal',  dias: 30, unidade: 'mês',    unidadePlural: 'meses',   genero: 'm', min: 1,  max: 12,  quick: [1, 2, 3, 6, 9, 12] },
] as const;

const TAXA_ANCHORS = [
  { dias: 5, taxa: 4 }, { dias: 10, taxa: 5 }, { dias: 15, taxa: 7 },
  { dias: 30, taxa: 10 }, { dias: 60, taxa: 15 }, { dias: 90, taxa: 19 },
  { dias: 180, taxa: 27 }, { dias: 360, taxa: 38 },
];

const LIMITE_CENTAVOS = 150_000; // R$ 1.500
const VALOR_MIN_CENTAVOS = 1_000;  // R$ 10

const taxaPorPrazo = (dias: number): number => {
  if (dias <= TAXA_ANCHORS[0].dias) return TAXA_ANCHORS[0].taxa;
  const last = TAXA_ANCHORS[TAXA_ANCHORS.length - 1];
  if (dias >= last.dias) return last.taxa;
  for (let i = 0; i < TAXA_ANCHORS.length - 1; i++) {
    const a = TAXA_ANCHORS[i], b = TAXA_ANCHORS[i + 1];
    if (dias >= a.dias && dias <= b.dias) {
      return a.taxa + ((dias - a.dias) / (b.dias - a.dias)) * (b.taxa - a.taxa);
    }
  }
  return last.taxa;
};

const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const unidadeLabel = (ciclo: (typeof CICLOS)[number], n: number) =>
  n === 1 ? ciclo.unidade : ciclo.unidadePlural;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function NovoEmprestimoScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [valorCentavos, setValorCentavos] = useState(50_000); // R$ 500
  const [cicloKey, setCicloKey] = useState<'diario' | 'semanal' | 'mensal'>('semanal');
  const [numPeriodos, setNumPeriodos] = useState(8);
  const [prazoDraft, setPrazoDraft] = useState('8');

  const ciclo = CICLOS.find((c) => c.key === cicloKey)!;
  const prazoDias = numPeriodos * ciclo.dias;
  const taxaTotal = taxaPorPrazo(prazoDias);
  const valorReais = valorCentavos / 100;

  // Slider state
  const valorTrackWidthRef = useRef(1);
  const valorTrackXRef = useRef(0);
  const prazoTrackWidthRef = useRef(1);
  const prazoTrackXRef = useRef(0);

  // Use refs so PanResponder closures always see current values
  const updateValorRef = useRef((_x: number) => {});
  updateValorRef.current = (offsetX: number) => {
    const ratio = Math.max(0, Math.min(1, offsetX / valorTrackWidthRef.current));
    const raw = VALOR_MIN_CENTAVOS + ratio * (LIMITE_CENTAVOS - VALOR_MIN_CENTAVOS);
    const stepped = Math.round(raw / 100) * 100;
    setValorCentavos(Math.max(VALOR_MIN_CENTAVOS, Math.min(LIMITE_CENTAVOS, stepped)));
  };

  const updatePrazoRef = useRef((_x: number) => {});
  updatePrazoRef.current = (offsetX: number) => {
    const ratio = Math.max(0, Math.min(1, offsetX / prazoTrackWidthRef.current));
    const raw = ciclo.min + ratio * (ciclo.max - ciclo.min);
    const stepped = Math.max(ciclo.min, Math.min(ciclo.max, Math.round(raw)));
    setNumPeriodos(stepped);
    setPrazoDraft(String(stepped));
  };

  const valorTrackRef = useRef<View>(null);
  const prazoTrackRef = useRef<View>(null);

  const onValorTrackLayout = useCallback(() => {
    valorTrackRef.current?.measure((_x, _y, w, _h, px) => {
      valorTrackWidthRef.current = w;
      valorTrackXRef.current = px;
    });
  }, []);

  const onPrazoTrackLayout = useCallback(() => {
    prazoTrackRef.current?.measure((_x, _y, w, _h, px) => {
      prazoTrackWidthRef.current = w;
      prazoTrackXRef.current = px;
    });
  }, []);

  const calc = useMemo(() => {
    const numParcelas = numPeriodos;
    const hoje = new Date();
    const totalAPagar = valorReais * (1 + taxaTotal / 100);
    const valorParcela = totalAPagar / numParcelas;
    const datasParcelas =
      numParcelas === 1
        ? [addDays(hoje, prazoDias)]
        : Array.from({ length: numParcelas }, (_, i) =>
            addDays(hoje, ((i + 1) * prazoDias) / numParcelas),
          );
    return {
      numParcelas,
      totalAPagar,
      valorParcela,
      primeiraParcela: datasParcelas[0],
      vencimentoFinal: datasParcelas[datasParcelas.length - 1],
    };
  }, [valorReais, prazoDias, numPeriodos, taxaTotal]);

  const percentValor =
    ((valorCentavos - VALOR_MIN_CENTAVOS) / (LIMITE_CENTAVOS - VALOR_MIN_CENTAVOS)) * 100;
  const percentPrazo =
    ((numPeriodos - ciclo.min) / (ciclo.max - ciclo.min)) * 100;

  // Steppers
  const stepValor = (delta: number) =>
    setValorCentavos((p) =>
      Math.min(LIMITE_CENTAVOS, Math.max(VALOR_MIN_CENTAVOS, p + delta)),
    );

  const setPrazo = (n: number) => {
    const clamped = Math.min(ciclo.max, Math.max(ciclo.min, Math.round(n)));
    setNumPeriodos(clamped);
    setPrazoDraft(String(clamped));
  };

  const handleCicloChange = (key: 'diario' | 'semanal' | 'mensal') => {
    const novo = CICLOS.find((c) => c.key === key)!;
    const converted = Math.max(novo.min, Math.min(novo.max, Math.round(prazoDias / novo.dias)));
    setCicloKey(key);
    setNumPeriodos(converted);
    setPrazoDraft(String(converted));
  };

  const handleSolicitar = () => {
    router.push({
      pathname: '/aceite-contrato',
      params: {
        valorCentavos: String(valorCentavos),
        cicloKey,
        numPeriodos: String(numPeriodos),
        prazoDias: String(prazoDias),
        taxaTotal: String(taxaTotal.toFixed(1)),
        valorParcela: String(calc.valorParcela.toFixed(2)),
        totalAPagar: String(calc.totalAPagar.toFixed(2)),
        primeiraParcela: calc.primeiraParcela.toISOString(),
        vencimentoFinal: calc.vencimentoFinal.toISOString(),
      },
    });
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.title}>Novo empréstimo</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero dark card: valor ── */}
        <View style={s.heroCard}>
          <Text style={s.eyebrow}>Quanto você precisa?</Text>

          <View style={s.valueRow}>
            <View style={s.heroValueGroup}>
              <Text style={s.currencyPrefix}>R$</Text>
              <TextInput
                keyboardType="numeric"
                value={fmtBRL(valorReais)}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '');
                  const c = digits === '' ? 0 : Math.min(LIMITE_CENTAVOS, parseInt(digits, 10));
                  setValorCentavos(c);
                }}
                onBlur={() => setValorCentavos((p) => Math.max(VALOR_MIN_CENTAVOS, p))}
                style={s.heroInput}
                selectionColor="rgba(255,255,255,0.6)"
                placeholderTextColor={C.onDarkFaint}
              />
            </View>
            <View style={s.stepperGroup}>
              <TouchableOpacity
                style={[s.stepperBtn, valorCentavos <= VALOR_MIN_CENTAVOS && s.stepperBtnDisabled]}
                onPress={() => stepValor(-500)}
                disabled={valorCentavos <= VALOR_MIN_CENTAVOS}
                activeOpacity={0.7}
              >
                <Feather name="minus" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.stepperBtn, valorCentavos >= LIMITE_CENTAVOS && s.stepperBtnDisabled]}
                onPress={() => stepValor(500)}
                disabled={valorCentavos >= LIMITE_CENTAVOS}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Slider */}
          <View
            ref={valorTrackRef}
            style={s.sliderTrack}
            onLayout={onValorTrackLayout}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) =>
              updateValorRef.current(e.nativeEvent.pageX - valorTrackXRef.current)
            }
            onResponderMove={(e) =>
              updateValorRef.current(e.nativeEvent.pageX - valorTrackXRef.current)
            }
          >
            <View style={[s.sliderFill, { width: `${percentValor}%` }]} />
            <View style={[s.sliderThumb, { left: `${percentValor}%` as any }]} />
          </View>
          <View style={s.sliderCaption}>
            <Text style={s.sliderCaptionText}>R$ {fmtBRL(VALOR_MIN_CENTAVOS / 100)}</Text>
            <Text style={s.sliderCaptionText}>Limite: R$ {fmtBRL(LIMITE_CENTAVOS / 100)}</Text>
          </View>
        </View>

        {/* ── Plano de pagamento ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Plano de pagamento</Text>

          <View style={s.prazoCard}>
            {/* Frequência */}
            <Text style={s.planBlockLabel}>Frequência</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CICLOS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[s.pill, cicloKey === c.key && s.pillActive]}
                  onPress={() => handleCicloChange(c.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.pillText, cicloKey === c.key && s.pillTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.divider} />

            {/* Prazo */}
            <Text style={s.planBlockLabel}>
              Em {ciclo.genero === 'f' ? 'quantas' : 'quantos'} {ciclo.unidadePlural} quer quitar?
            </Text>
            <View style={s.prazoValueRow}>
              <View style={s.prazoValueGroup}>
                <TextInput
                  key={cicloKey}
                  keyboardType="numeric"
                  value={prazoDraft}
                  onChangeText={(raw) => {
                    setPrazoDraft(raw);
                    const n = parseInt(raw, 10);
                    if (!isNaN(n) && n > 0) setNumPeriodos(Math.min(n, 3650));
                  }}
                  onBlur={() => {
                    const n = parseInt(prazoDraft, 10);
                    setPrazo(isNaN(n) ? numPeriodos : n);
                  }}
                  style={[s.prazoInput, { width: Math.max(prazoDraft.length, 1) * 20 }]}
                  selectionColor={C.ink}
                />
                <Text style={s.prazoUnit}>{unidadeLabel(ciclo, numPeriodos)}</Text>
              </View>
              <View style={s.stepperGroup}>
                <TouchableOpacity
                  style={[s.prazoStepperBtn, numPeriodos <= ciclo.min && s.stepperBtnDisabled]}
                  onPress={() => setPrazo(numPeriodos - 1)}
                  disabled={numPeriodos <= ciclo.min}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={16} color={C.ink} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.prazoStepperBtn, numPeriodos >= ciclo.max && s.stepperBtnDisabled]}
                  onPress={() => setPrazo(numPeriodos + 1)}
                  disabled={numPeriodos >= ciclo.max}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={16} color={C.ink} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Prazo slider */}
            <View
              ref={prazoTrackRef}
              style={[s.sliderTrack, s.sliderTrackLight, { marginBottom: 0, marginTop: 10 }]}
              onLayout={onPrazoTrackLayout}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) =>
                updatePrazoRef.current(e.nativeEvent.pageX - prazoTrackXRef.current)
              }
              onResponderMove={(e) =>
                updatePrazoRef.current(e.nativeEvent.pageX - prazoTrackXRef.current)
              }
            >
              <View style={[s.sliderFill, s.sliderFillLight, { width: `${percentPrazo}%` }]} />
              <View style={[s.sliderThumb, s.sliderThumbLight, { left: `${percentPrazo}%` as any }]} />
            </View>

            {/* Quick pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingTop: 14 }}
              style={s.quickPillRow}
            >
              {ciclo.quick.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[s.quickPill, numPeriodos === n && s.quickPillActive]}
                  onPress={() => setPrazo(n)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.quickPillText, numPeriodos === n && s.quickPillTextActive]}>
                    {n} {unidadeLabel(ciclo, n)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── Resumo ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Resumo do empréstimo</Text>

          <View style={s.summaryCard}>
            <Text style={s.planBlockLabel}>Você pagará</Text>
            <View style={s.summaryValueRow}>
              <Text style={s.summaryValue}>R$ {fmtBRL(calc.valorParcela)}</Text>
              <Text style={s.summaryValueUnit}>/{ciclo.unidade}</Text>
            </View>
            <Text style={s.summaryCycles}>
              durante {calc.numParcelas} {unidadeLabel(ciclo, calc.numParcelas)}
            </Text>

            <DetailGrid
              items={[
                {
                  label: 'Prazo',
                  value: `${prazoDias} dias`,
                  sub: `vence ${formatData(calc.vencimentoFinal)}`,
                },
                {
                  label: 'Ciclo',
                  value: ciclo.label,
                  sub: `R$ ${fmtBRL(calc.valorParcela)}/${ciclo.unidade}`,
                },
                { label: 'Taxa total', value: `${taxaTotal.toFixed(1)}%` },
                {
                  label: calc.numParcelas === 1 ? 'Vencimento' : '1ª parcela',
                  value: formatData(
                    calc.numParcelas === 1 ? calc.vencimentoFinal : calc.primeiraParcela,
                  ),
                },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity style={s.ctaButton} onPress={handleSolicitar} activeOpacity={0.85}>
          <Text style={s.ctaText}>Solicitar R$ {fmtBRL(valorReais)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  // Hero dark card
  heroCard: {
    borderRadius: radii.hero,
    marginHorizontal: spacing[4],
    marginTop: 18,
    marginBottom: 14,
    padding: spacing[6],
    backgroundColor: C.dark,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    letterSpacing: 0.3,
    color: C.onDarkSoft,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  heroValueGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  currencyPrefix: {
    fontFamily: fonts.display,
    fontSize: fontSize['5xl'],
    color: C.onDarkSoft,
  },
  heroInput: {
    fontFamily: fonts.display,
    fontSize: fontSize['7xl'],
    color: '#fff',
    letterSpacing: -1,
    paddingBottom: 3,
    minWidth: 80,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },

  // Steppers
  stepperGroup: { flexDirection: 'row', gap: 8 },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: C.onDarkSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: { opacity: 0.3 },

  // Slider (dark)
  sliderTrack: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: C.onDarkBorder,
    marginBottom: 14,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrackLight: {
    backgroundColor: C.line,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: '#fff',
  },
  sliderFillLight: {
    backgroundColor: C.ink,
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    marginTop: -5,
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderThumbLight: {
    backgroundColor: C.ink,
  },
  sliderCaption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderCaptionText: {
    fontSize: fontSize['sm+'],
    color: C.onDarkFaint,
    fontFamily: fonts.regular,
  },

  // Section
  section: { marginHorizontal: spacing[4], marginBottom: 14 },
  sectionLabel: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: C.ink,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  // Plan card
  prazoCard: {
    borderRadius: radii.cardLg,
    backgroundColor: C.card,
    padding: spacing[5],
  },
  planBlockLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 18 },

  // Ciclo pills
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
  },
  pillActive: { backgroundColor: C.dark, borderColor: C.dark },
  pillText: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.inkSoft },
  pillTextActive: { color: '#fff' },

  // Prazo row
  prazoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  prazoValueGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  prazoInput: {
    fontFamily: fonts.display,
    fontSize: fontSize['7xl'],
    color: C.ink,
    letterSpacing: -0.5,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(21,21,29,0.25)',
    minWidth: 30,
  },
  prazoUnit: { fontSize: fontSize.lg, fontFamily: fonts.semibold, color: C.inkSoft },
  prazoStepperBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick pills
  quickPillRow: { borderTopWidth: 1, borderTopColor: C.line, marginTop: 14 },
  quickPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
  },
  quickPillActive: { backgroundColor: C.dark, borderColor: C.dark },
  quickPillText: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  quickPillTextActive: { color: '#fff' },

  // Summary card
  summaryCard: { borderRadius: radii.cardLg, backgroundColor: C.card, padding: spacing[5] },
  summaryValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 6 },
  summaryValue: { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.5 },
  summaryValueUnit: { fontSize: fontSize.lg, fontFamily: fonts.semibold, color: C.inkFaint },
  summaryCycles: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: C.ink,
    marginBottom: 18,
  },

  // CTA
  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  ctaButton: {
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },
});
