import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { formatBRL } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { DarkCard, LightCard, ThinBar, SplitRow, Chip, SectionTitle, Eyebrow, BigValue } from '@/components/ds';

const W = Dimensions.get('window').width;

const MESES   = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function seededNoise(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
function gerarSerie(n: number, base: number, seed: number) {
  let acc = 0;
  return Array.from({ length: n }, (_, i) => { acc += base * (0.55 + seededNoise(i + seed) * 0.9); return acc; });
}
function buildSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]; const p1 = pts[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const CHIPS = [
  { key: '7d', label: '7 dias' }, { key: '1m', label: '1 mês' },
  { key: '1a', label: '1 ano' },  { key: 'custom', label: 'Personalizado' },
];

function parseDateBR(s: string): Date | null {
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2020 || y > 2100) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function CarteiraScreen() {
  const [periodo, setPeriodo]       = useState('7d');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim]       = useState('');

  // Mock data
  const investido         = 10000;
  const rendimentoPercent = 20;
  const rendimentoValor   = 2000;
  const totalAReceber     = investido + rendimentoValor;
  const recebido          = 3000;
  const aReceber          = totalAReceber - recebido;
  const percentRecebido   = Math.round((recebido / totalAReceber) * 100);
  const ativosCount       = 30;

  const temAtraso        = true;
  const valorAtrasado    = 245;
  const hoje             = new Date();
  const dataAtraso       = new Date(hoje); dataAtraso.setDate(hoje.getDate() - 5);
  const dataAtrasoLabel  = dataAtraso.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  const diasProximo      = 4;
  const dataProximo      = new Date(hoje); dataProximo.setDate(hoje.getDate() + diasProximo);
  const proximoLabel     = dataProximo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  const proximoValor     = 780;
  const diasUltimo       = 154;
  const dataUltimo       = new Date(hoje); dataUltimo.setDate(hoje.getDate() + diasUltimo);
  const ultimoLabel      = `${String(dataUltimo.getDate()).padStart(2, '0')} ${MESES[dataUltimo.getMonth()]} ${dataUltimo.getFullYear()}`;
  const prazoLabel       = diasUltimo >= 60 ? `${Math.round(diasUltimo / 30)} meses` : `${diasUltimo} dias`;
  const proximoPercent   = Math.min(92, Math.max(8, (diasProximo / diasUltimo) * 100));

  // Chart
  const chartW = W - 72; const chartH = 120; const padTop = 10; const padBot = 6;

  const { labels, valores } = useMemo(() => {
    if (periodo === '7d') {
      const lbs = Array.from({ length: 7 }, (_, i) => { const d = new Date(hoje); d.setDate(d.getDate() - (6 - i)); return DIAS_SEM[d.getDay()]; });
      return { labels: lbs, valores: gerarSerie(7, 12, 1) };
    }
    if (periodo === '1m') return { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], valores: gerarSerie(4, 45, 2) };
    if (periodo === 'custom') {
      const inicio = parseDateBR(dataInicio); const fim = parseDateBR(dataFim);
      if (!inicio || !fim || fim <= inicio) return { labels: [], valores: [] };
      const diffDays = Math.round((fim.getTime() - inicio.getTime()) / 86400000);
      if (diffDays <= 14) {
        const lbs = Array.from({ length: diffDays + 1 }, (_, i) => { const d = new Date(inicio); d.setDate(d.getDate() + i); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; });
        return { labels: lbs, valores: gerarSerie(diffDays + 1, 12, 5) };
      } else if (diffDays <= 60) {
        const weeks = Math.ceil(diffDays / 7);
        return { labels: Array.from({ length: weeks }, (_, i) => `Sem ${i + 1}`), valores: gerarSerie(weeks, 45, 6) };
      } else {
        const months = Math.ceil(diffDays / 30);
        const lbs = Array.from({ length: months }, (_, i) => { const d = new Date(inicio); d.setMonth(d.getMonth() + i); return MESES[d.getMonth()]; });
        return { labels: lbs, valores: gerarSerie(months, 155, 7) };
      }
    }
    const lbs = Array.from({ length: 12 }, (_, i) => { const d = new Date(hoje); d.setMonth(d.getMonth() - (11 - i)); return MESES[d.getMonth()]; });
    return { labels: lbs, valores: gerarSerie(12, 155, 3) };
  }, [periodo, dataInicio, dataFim]);

  const padH    = 8;
  const maxVal  = Math.max(...valores);
  const points  = valores.map((v, i) => ({
    x: valores.length > 1 ? padH + (i / (valores.length - 1)) * (chartW - padH * 2) : chartW / 2,
    y: chartH - padBot - (v / (maxVal || 1)) * (chartH - padTop - padBot),
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`
    : '';
  const retornoValor   = valores[valores.length - 1] ?? 0;
  const retornoPercent = (retornoValor / investido) * 100;
  const step     = Math.max(1, Math.ceil(labels.length / 6));
  const visLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero card */}
        <DarkCard style={{ marginTop: 18 }}>
          <Eyebrow context="dark">Investido</Eyebrow>
          <BigValue context="dark">R$ {formatBRL(investido)}</BigValue>

          <View style={{ marginTop: 14, marginBottom: 20 }}>
            <Eyebrow context="dark">Retorno</Eyebrow>
            <Text style={s.retornoValue}><Text style={s.retornoSign}>+</Text>{rendimentoPercent}%</Text>
            <Text style={s.retornoCaption}>R$ {formatBRL(rendimentoValor)} de retorno sobre investimento</Text>
          </View>

          <SplitRow
            context="dark"
            left={{ label: 'Recebido', value: `R$ ${formatBRL(recebido)}` }}
            right={{ label: 'A receber', value: `R$ ${formatBRL(aReceber)}` }}
            style={{ marginBottom: 16 }}
          />

          <ThinBar pct={percentRecebido} context="dark" />
          <View style={s.progressCaption}>
            <Text style={s.progressCaptionText}>{percentRecebido}% recebido</Text>
            <Text style={s.progressCaptionText}>de R$ {formatBRL(totalAReceber)}</Text>
          </View>
        </DarkCard>

        {/* Rentabilidade */}
        <SectionTitle style={s.sectionTitle}>Rentabilidade</SectionTitle>
        <LightCard>
          <Text style={s.statLabel}>Período</Text>
          <View style={s.periodChips}>
            {CHIPS.map((c) => (
              <Chip key={c.key} label={c.label} active={periodo === c.key} onPress={() => setPeriodo(c.key)} />
            ))}
          </View>

          {periodo === 'custom' && (
            <View style={s.dateRangeRow}>
              <View style={s.dateInputWrap}>
                <Text style={s.dateInputLabel}>Início</Text>
                <TextInput style={s.dateInput} placeholder="DD/MM/AAAA" placeholderTextColor={C.inkFaint} keyboardType="numeric" value={dataInicio} onChangeText={(t) => setDataInicio(formatDateInput(t))} maxLength={10} />
              </View>
              <View style={s.dateRangeSep} />
              <View style={s.dateInputWrap}>
                <Text style={s.dateInputLabel}>Fim</Text>
                <TextInput style={s.dateInput} placeholder="DD/MM/AAAA" placeholderTextColor={C.inkFaint} keyboardType="numeric" value={dataFim} onChangeText={(t) => setDataFim(formatDateInput(t))} maxLength={10} />
              </View>
            </View>
          )}

          {valores.length > 0 ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={s.chartReturnValue}>+{retornoPercent.toFixed(1)}%</Text>
                <Text style={s.chartReturnSub}>R$ {formatBRL(retornoValor)}</Text>
              </View>
              <Svg width={chartW} height={chartH} style={{ display: 'flex' }}>
                <Defs>
                  <SvgLinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%"   stopColor={C.dark} stopOpacity="0.16" />
                    <Stop offset="100%" stopColor={C.dark} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path d={areaPath} fill="url(#fill)" />
                <Path d={linePath} fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" />
                {points.length > 0 && (
                  <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={C.dark} stroke="#fff" strokeWidth={2} />
                )}
              </Svg>
              <View style={s.axisLabels}>
                {visLabels.map((l, i) => <Text key={i} style={s.axisLabel}>{l}</Text>)}
              </View>
            </>
          ) : periodo === 'custom' ? (
            <Text style={s.customEmptyHint}>Preencha as duas datas para ver o rendimento do período</Text>
          ) : null}
        </LightCard>

        {/* Ativos */}
        <SectionTitle style={s.sectionTitle}>Ativos</SectionTitle>
        <LightCard>
          <View style={{ marginBottom: 24 }}>
            <Text style={s.statLabel}>Quantidade</Text>
            <Text style={s.ativosCount}>{ativosCount}</Text>
          </View>

          {temAtraso && (
            <View style={s.atrasoBar}>
              <Feather name="alert-triangle" size={16} color={C.red} />
              <Text style={s.atrasoText}>
                <Text style={{ fontFamily: fonts.bold }}>R$ {formatBRL(valorAtrasado)}</Text>
                {' '}vencido em {dataAtrasoLabel}, aguardando pagamento
              </Text>
            </View>
          )}

          {/* Timeline */}
          <View style={s.timelineWrap}>
            <View style={s.timelineTrack}>
              <View style={[s.timelineDot, { left: 0 }]} />
              <View style={[s.timelineDot, s.timelineDotAccent, { left: `${proximoPercent}%` as any }]} />
              <View style={[s.timelineDot, { right: 0 }]} />
            </View>
          </View>

          <View style={s.timelineLabels}>
            <View style={{ maxWidth: '55%' }}>
              <Text style={s.statLabel}>Próximo vencimento</Text>
              <Text style={s.statValue}>{proximoLabel}</Text>
              <Text style={s.statSub}>R$ {formatBRL(proximoValor)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.statLabel}>Último vencimento</Text>
              <Text style={s.statValue}>{ultimoLabel}</Text>
              <Text style={s.statSub}>em {prazoLabel}</Text>
            </View>
          </View>
        </LightCard>

        <TouchableOpacity style={s.ativosLink} onPress={() => router.push('/ativos' as any)} activeOpacity={0.7}>
          <Text style={s.ativosLinkText}>Ver todos os ativos</Text>
          <Feather name="chevron-right" size={14} color={C.inkSoft} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  sectionTitle: { marginHorizontal: spacing[4], marginTop: 4, marginBottom: 10 },
  retornoValue:   { fontFamily: fonts.display, fontSize: fontSize.display, color: '#fff', letterSpacing: -0.8, lineHeight: 38 },
  retornoSign:    { fontSize: fontSize['4xl'], fontFamily: fonts.display },
  retornoCaption: { fontSize: fontSize.base, color: C.onDarkMid, marginTop: 8, fontFamily: fonts.regular },
  progressCaption:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  progressCaptionText: { fontSize: fontSize['sm+'], color: C.onDarkFaint, fontFamily: fonts.regular },
  statLabel:   { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 5 },
  statValue:   { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink, letterSpacing: -0.3 },
  statSub:     { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular, marginTop: 2 },
  ativosCount: { fontFamily: fonts.display, fontSize: 38, color: C.ink, letterSpacing: -0.8, lineHeight: 42 },
  atrasoBar:   { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 18, padding: 12, borderRadius: radii.lg, backgroundColor: C.redBg },
  atrasoText:  { flex: 1, fontSize: fontSize['sm+'], color: C.red, fontFamily: fonts.regular, lineHeight: 18 },
  timelineWrap:       { paddingHorizontal: 4, marginBottom: 14 },
  timelineTrack:      { position: 'relative', height: 3, backgroundColor: C.line, borderRadius: radii.full },
  timelineDot:        { position: 'absolute', top: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: C.inkFaint },
  timelineDotAccent:  { width: 11, height: 11, top: -4, backgroundColor: C.dark },
  timelineLabels:     { flexDirection: 'row', justifyContent: 'space-between' },
  ativosLink:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginHorizontal: spacing[4], marginBottom: 14, paddingVertical: 4 },
  ativosLinkText: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  periodChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chartReturnValue: { fontFamily: fonts.display, fontSize: 32, color: C.ink, letterSpacing: -0.6 },
  chartReturnSub:   { fontSize: fontSize.base, color: C.inkSoft, fontFamily: fonts.medium, marginTop: 4, marginBottom: 12 },
  axisLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel:  { fontSize: 10.5, color: C.inkFaint, fontFamily: fonts.medium },
  dateRangeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  dateInputWrap:  { flex: 1 },
  dateInputLabel: { fontSize: fontSize['2xs'], fontFamily: fonts.semibold, color: C.inkFaint, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 6 },
  dateInput:      { height: 44, borderRadius: radii.md, backgroundColor: C.bg, paddingHorizontal: 14, fontSize: fontSize.md, fontFamily: fonts.medium, color: C.ink },
  dateRangeSep:   { width: 12, height: 1.5, backgroundColor: C.line, marginTop: 18 },
  customEmptyHint: { fontSize: fontSize.base, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', paddingVertical: 24 },
});
