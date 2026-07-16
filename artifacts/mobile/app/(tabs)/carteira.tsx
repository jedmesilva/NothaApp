import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#ECECEF',
  red: '#C0392B',
  redBg: '#FBEAE8',
};

const W = Dimensions.get('window').width;

function formatBRL(value: number) {
  return Math.round(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function seededNoise(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function gerarSerie(n: number, base: number, seed: number) {
  let acc = 0;
  return Array.from({ length: n }, (_, i) => {
    acc += base * (0.55 + seededNoise(i + seed) * 0.9);
    return acc;
  });
}

function buildSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const CHIPS = [
  { key: '7d', label: '7 dias' },
  { key: '1m', label: '1 mês' },
  { key: '1a', label: '1 ano' },
  { key: 'custom', label: 'Personalizado' },
];

function parseDateBR(s: string): Date | null {
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2020 || y > 2100) return null;
  const dt = new Date(y, m - 1, d);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function CarteiraScreen() {
  const [periodo, setPeriodo] = useState('7d');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Mock data
  const investido = 10000;
  const rendimentoPercent = 20;
  const rendimentoValor = 2000;
  const totalAReceber = investido + rendimentoValor;
  const recebido = 3000;
  const aReceber = totalAReceber - recebido;
  const percentRecebido = Math.round((recebido / totalAReceber) * 100);
  const ativosCount = 30;

  const temAtraso = true;
  const valorAtrasado = 245;
  const hoje = new Date();
  const dataAtraso = new Date(hoje);
  dataAtraso.setDate(hoje.getDate() - 5);
  const dataAtrasoLabel = dataAtraso.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  const diasProximo = 4;
  const dataProximo = new Date(hoje);
  dataProximo.setDate(hoje.getDate() + diasProximo);
  const proximoLabel = dataProximo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  const proximoValor = 780;

  const diasUltimo = 154;
  const dataUltimo = new Date(hoje);
  dataUltimo.setDate(hoje.getDate() + diasUltimo);
  const ultimoLabel = `${String(dataUltimo.getDate()).padStart(2, '0')} ${MESES[dataUltimo.getMonth()]} ${dataUltimo.getFullYear()}`;
  const prazoLabel = diasUltimo >= 60 ? `${Math.round(diasUltimo / 30)} meses` : `${diasUltimo} dias`;
  const proximoPercent = Math.min(92, Math.max(8, (diasProximo / diasUltimo) * 100));

  // Chart
  const chartW = W - 72;
  const chartH = 120;
  const padTop = 10;
  const padBot = 6;

  const { labels, valores } = useMemo(() => {
    if (periodo === '7d') {
      const hoje2 = new Date();
      const lbs = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoje2); d.setDate(d.getDate() - (6 - i));
        return DIAS_SEM[d.getDay()];
      });
      return { labels: lbs, valores: gerarSerie(7, 12, 1) };
    }
    if (periodo === '1m') {
      return { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], valores: gerarSerie(4, 45, 2) };
    }
    if (periodo === 'custom') {
      const inicio = parseDateBR(dataInicio);
      const fim = parseDateBR(dataFim);
      if (!inicio || !fim || fim <= inicio) return { labels: [], valores: [] };
      const diffDays = Math.round((fim.getTime() - inicio.getTime()) / 86400000);
      if (diffDays <= 14) {
        const lbs = Array.from({ length: diffDays + 1 }, (_, i) => {
          const d = new Date(inicio); d.setDate(d.getDate() + i);
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        });
        return { labels: lbs, valores: gerarSerie(diffDays + 1, 12, 5) };
      } else if (diffDays <= 60) {
        const weeks = Math.ceil(diffDays / 7);
        const lbs = Array.from({ length: weeks }, (_, i) => `Sem ${i + 1}`);
        return { labels: lbs, valores: gerarSerie(weeks, 45, 6) };
      } else {
        const months = Math.ceil(diffDays / 30);
        const lbs = Array.from({ length: months }, (_, i) => {
          const d = new Date(inicio); d.setMonth(d.getMonth() + i);
          return MESES[d.getMonth()];
        });
        return { labels: lbs, valores: gerarSerie(months, 155, 7) };
      }
    }
    const hoje2 = new Date();
    const lbs = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(hoje2); d.setMonth(d.getMonth() - (11 - i));
      return MESES[d.getMonth()];
    });
    return { labels: lbs, valores: gerarSerie(12, 155, 3) };
  }, [periodo, dataInicio, dataFim]);

  const padH = 8; // horizontal padding so the last point + circle aren't clipped
  const maxVal = Math.max(...valores);
  const points = valores.map((v, i) => ({
    x: valores.length > 1
      ? padH + (i / (valores.length - 1)) * (chartW - padH * 2)
      : chartW / 2,
    y: chartH - padBot - (v / (maxVal || 1)) * (chartH - padTop - padBot),
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`
    : '';

  const retornoValor = valores[valores.length - 1] ?? 0;
  const retornoPercent = (retornoValor / investido) * 100;

  const step = Math.max(1, Math.ceil(labels.length / 6));
  const visLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);

  return (
    <View style={styles.screen}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Investido</Text>
          <Text style={styles.bigValue}>R$ {formatBRL(investido)}</Text>

          <View style={{ marginTop: 14, marginBottom: 20 }}>
            <Text style={styles.eyebrow}>Retorno</Text>
            <Text style={styles.retornoValue}><Text style={styles.retornoSign}>+</Text>{rendimentoPercent}%</Text>
            <Text style={styles.retornoCaption}>R$ {formatBRL(rendimentoValor)} de retorno sobre investimento</Text>
          </View>

          <View style={styles.splitRow}>
            <View>
              <Text style={styles.splitLabel}>Recebido</Text>
              <Text style={styles.splitValue}>R$ {formatBRL(recebido)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.splitLabel}>A receber</Text>
              <Text style={styles.splitValue}>R$ {formatBRL(aReceber)}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentRecebido}%` as any }]} />
          </View>
          <View style={styles.progressCaption}>
            <Text style={styles.progressCaptionText}>{percentRecebido}% recebido</Text>
            <Text style={styles.progressCaptionText}>de R$ {formatBRL(totalAReceber)}</Text>
          </View>
        </View>

        {/* Rentabilidade */}
        <Text style={styles.sectionTitle}>Rentabilidade</Text>
        <View style={styles.whiteCard}>
          <Text style={[styles.statLabel, { marginBottom: 10 }]}>Período</Text>
          <View style={styles.periodChips}>
            {CHIPS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, periodo === c.key && styles.chipActive]}
                onPress={() => setPeriodo(c.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, periodo === c.key && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {periodo === 'custom' && (
            <View style={styles.dateRangeRow}>
              <View style={styles.dateInputWrap}>
                <Text style={styles.dateInputLabel}>Início</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={C.inkFaint}
                  keyboardType="numeric"
                  value={dataInicio}
                  onChangeText={(t) => setDataInicio(formatDateInput(t))}
                  maxLength={10}
                />
              </View>
              <View style={styles.dateRangeSep} />
              <View style={styles.dateInputWrap}>
                <Text style={styles.dateInputLabel}>Fim</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={C.inkFaint}
                  keyboardType="numeric"
                  value={dataFim}
                  onChangeText={(t) => setDataFim(formatDateInput(t))}
                  maxLength={10}
                />
              </View>
            </View>
          )}

          {valores.length > 0 ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.chartReturnValue}>+{retornoPercent.toFixed(1)}%</Text>
                <Text style={styles.chartReturnSub}>R$ {formatBRL(retornoValor)}</Text>
              </View>

              <Svg width={chartW} height={chartH} style={{ display: 'flex' }}>
                <Defs>
                  <SvgLinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={C.dark} stopOpacity="0.16" />
                    <Stop offset="100%" stopColor={C.dark} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path d={areaPath} fill="url(#fill)" />
                <Path d={linePath} fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" />
                {points.length > 0 && (
                  <Circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={4}
                    fill={C.dark}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )}
              </Svg>

              <View style={styles.axisLabels}>
                {visLabels.map((l, i) => (
                  <Text key={i} style={styles.axisLabel}>{l}</Text>
                ))}
              </View>
            </>
          ) : periodo === 'custom' ? (
            <Text style={styles.customEmptyHint}>
              Preencha as duas datas para ver o rendimento do período
            </Text>
          ) : null}
        </View>

        {/* Ativos section */}
        <Text style={styles.sectionTitle}>Ativos</Text>
        <View style={styles.whiteCard}>
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.statLabel}>Quantidade</Text>
            <Text style={styles.ativosCount}>{ativosCount}</Text>
          </View>

          {temAtraso && (
            <View style={styles.atrasoBar}>
              <Feather name="alert-triangle" size={16} color={C.red} />
              <Text style={styles.atrasoText}>
                <Text style={{ fontFamily: 'Inter_700Bold' }}>R$ {formatBRL(valorAtrasado)}</Text>{' '}
                vencido em {dataAtrasoLabel}, aguardando pagamento
              </Text>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.timelineWrap}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineDot, { left: 0 }]} />
              <View style={[styles.timelineDot, styles.timelineDotAccent, { left: `${proximoPercent}%` as any }]} />
              <View style={[styles.timelineDot, { right: 0 }]} />
            </View>
          </View>

          <View style={styles.timelineLabels}>
            <View style={{ maxWidth: '55%' }}>
              <Text style={styles.statLabel}>Próximo vencimento</Text>
              <Text style={styles.statValue}>{proximoLabel}</Text>
              <Text style={styles.statSub}>R$ {formatBRL(proximoValor)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Último vencimento</Text>
              <Text style={styles.statValue}>{ultimoLabel}</Text>
              <Text style={styles.statSub}>em {prazoLabel}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ativosLink}
          onPress={() => router.push('/ativos' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.ativosLinkText}>Ver todos os ativos</Text>
          <Feather name="chevron-right" size={14} color={C.inkSoft} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: C.ink, letterSpacing: -0.2 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: C.ink, marginHorizontal: 16, marginTop: 4, marginBottom: 10 },

  heroCard: {
    borderRadius: 28, marginHorizontal: 16, marginTop: 18, marginBottom: 14,
    padding: 24, backgroundColor: C.dark,
  },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  bigValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 42, color: '#fff', letterSpacing: -1, lineHeight: 48 },
  retornoValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 34, color: '#fff', letterSpacing: -0.8, lineHeight: 38 },
  retornoSign: { fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold' },
  retornoCaption: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'Inter_400Regular' },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  splitLabel: { fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 },
  splitValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff', letterSpacing: -0.3 },
  progressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  progressCaption: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  progressCaptionText: { fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter_400Regular' },

  whiteCard: { borderRadius: 24, marginHorizontal: 16, marginBottom: 14, padding: 22, backgroundColor: C.card },
  statLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: C.ink, letterSpacing: -0.3 },
  statSub: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginTop: 2 },
  ativosCount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 38, color: C.ink, letterSpacing: -0.8, lineHeight: 42 },

  atrasoBar: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9,
    marginBottom: 18, padding: 12, borderRadius: 14, backgroundColor: C.redBg,
  },
  atrasoText: { flex: 1, fontSize: 12.5, color: C.red, fontFamily: 'Inter_400Regular', lineHeight: 18 },

  timelineWrap: { paddingHorizontal: 4, marginBottom: 14 },
  timelineTrack: { position: 'relative', height: 3, backgroundColor: C.line, borderRadius: 999 },
  timelineDot: {
    position: 'absolute', top: -2, width: 7, height: 7,
    borderRadius: 4, backgroundColor: C.inkFaint,
  },
  timelineDotAccent: { width: 11, height: 11, top: -4, backgroundColor: C.dark },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },

  ativosLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 2, marginHorizontal: 16, marginBottom: 14, paddingVertical: 4,
  },
  ativosLinkText: { fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },

  periodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.bg },
  chipActive: { backgroundColor: C.dark },
  chipText: { fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },
  chipTextActive: { color: '#fff' },

  chartReturnValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: C.ink, letterSpacing: -0.6 },
  chartReturnSub: { fontSize: 13, color: C.inkSoft, fontFamily: 'Inter_500Medium', marginTop: 4, marginBottom: 12 },
  axisLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel: { fontSize: 10.5, color: C.inkFaint, fontFamily: 'Inter_500Medium' },

  dateRangeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  dateInputWrap: { flex: 1 },
  dateInputLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: C.inkFaint, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 6 },
  dateInput: {
    height: 44, borderRadius: 12, backgroundColor: C.bg,
    paddingHorizontal: 14, fontSize: 14, fontFamily: 'Inter_500Medium', color: C.ink,
  },
  dateRangeSep: { width: 12, height: 1.5, backgroundColor: C.line, marginTop: 18 },
  customEmptyHint: { fontSize: 13, color: C.inkFaint, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingVertical: 24 },
});
