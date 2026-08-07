import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { formatBRL } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { DarkCard, LightCard, ThinBar, Chip, SectionTitle, Eyebrow, BigValue, AlertBanner } from '@/components/ds';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestorPositions } from '@/hooks/useInvestorPositions';
import { useInvestorProfile, useActivateInvestorProfile } from '@/hooks/useInvestorProfile';
import { useInvestorCashflows } from '@/hooks/useInvestorCashflows';
import { xirr, totalInterestCents } from '@/lib/xirr';

const W = Dimensions.get('window').width;

const MESES   = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
  const { user } = useAuth();

  // ── Perfil de investidor ────────────────────────────────────────────────────
  const { data: profileData, isLoading: profileLoading } = useInvestorProfile();
  const activateMutation = useActivateInvestorProfile();

  const hoje2 = new Date();
  const hour = hoje2.getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Dados reais — positions do banco conforme o documento
  const { data: posData } = useInvestorPositions();
  const summary   = posData?.summary;
  const positions = posData?.positions ?? [];

  const hoje = new Date();
  const toDate = (s: string) => new Date(s + 'T00:00:00');

  // ── Intervalo do período selecionado ────────────────────────────────────────
  const periodDates = useMemo(() => {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    if (periodo === '7d') {
      const s = new Date(hoje); s.setDate(s.getDate() - 6);
      return { start: fmt(s), end: fmt(hoje) };
    }
    if (periodo === '1m') {
      const s = new Date(hoje); s.setMonth(s.getMonth() - 1);
      return { start: fmt(s), end: fmt(hoje) };
    }
    if (periodo === '1a') {
      const s = new Date(hoje); s.setFullYear(s.getFullYear() - 1);
      return { start: fmt(s), end: fmt(hoje) };
    }
    if (periodo === 'custom') {
      const inicio = parseDateBR(dataInicio); const fim = parseDateBR(dataFim);
      if (!inicio || !fim || fim <= inicio) return null;
      return { start: fmt(inicio), end: fmt(fim) };
    }
    return null;
  }, [periodo, dataInicio, dataFim]);

  // ── Cashflows reais do período ──────────────────────────────────────────────
  const { data: cashflowData, isLoading: cashflowLoading } = useInvestorCashflows(
    periodDates?.start ?? null,
    periodDates?.end ?? null,
  );

  // Métricas do hero card (fontes diretas de positions, como no documento)
  const investido       = (summary?.principalBalanceCents  ?? 0) / 100;
  const recebido        = (summary?.totalReturnedCents     ?? 0) / 100;
  const original        = (summary?.originalPrincipalCents ?? 0) / 100;
  const ativosCount     = summary?.activeCount ?? 0;

  // Retorno realizado: quanto foi recebido sobre o total originalmente investido
  const rendimentoValor   = recebido;
  const rendimentoPercent = original > 0
    ? parseFloat(((recebido / original) * 100).toFixed(1))
    : 0;

  // Estimativa de "a receber": saldo em aberto + projeção de juros a 2%
  const totalAReceber   = investido > 0 ? investido * 1.02 : 0;
  const aReceber        = Math.max(0, totalAReceber - recebido);
  const percentRecebido = totalAReceber > 0
    ? Math.round((recebido / totalAReceber) * 100)
    : 0;

  // Timeline: próxima e última parcela consolidadas entre todas as posições
  const allNext = positions.filter((p) => p.nextInstallment).map((p) => p.nextInstallment!);
  const allLast = positions.filter((p) => p.lastInstallment).map((p) => p.lastInstallment!);
  const nextInst = allNext.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;
  const lastInst = allLast.sort((a, b) => b.dueDate.localeCompare(a.dueDate))[0] ?? null;

  const hasInvestments  = investido > 0 || original > 0;

  const temAtraso     = summary?.hasAnyOverdue ?? false;
  const overduePos    = positions.find((p) => p.hasOverdue && p.earliestOverdue);
  const valorAtrasado = (overduePos?.earliestOverdue?.amountCents ?? 0) / 100;
  const dataAtraso    = overduePos?.earliestOverdue
    ? toDate(overduePos.earliestOverdue.dueDate)
    : hoje;
  const dataAtrasoLabel = dataAtraso.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  const proximoValor = (nextInst?.amountCents ?? 0) / 100;
  const proximoLabel = nextInst
    ? toDate(nextInst.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    : '—';
  const diasProximo  = nextInst
    ? Math.max(0, Math.round((toDate(nextInst.dueDate).getTime() - hoje.getTime()) / 86400000))
    : 0;

  const ultimoDate      = lastInst ? toDate(lastInst.dueDate) : null;
  const hasInstallments = nextInst !== null || ultimoDate !== null;
  const diasUltimo  = ultimoDate
    ? Math.max(0, Math.round((ultimoDate.getTime() - hoje.getTime()) / 86400000))
    : 0;
  const ultimoLabel = ultimoDate
    ? `${String(ultimoDate.getDate()).padStart(2, '0')} ${MESES[ultimoDate.getMonth()]} ${ultimoDate.getFullYear()}`
    : '—';
  const prazoLabel     = diasUltimo >= 60 ? `${Math.round(diasUltimo / 30)} meses` : `${diasUltimo} dias`;
  const proximoPercent = diasUltimo > 0
    ? Math.min(92, Math.max(8, (diasProximo / diasUltimo) * 100))
    : 50;

  // ── XIRR e rendimento em juros do período ──────────────────────────────────
  const xirrRate = useMemo(() => {
    const cfs = cashflowData?.cashflows ?? [];
    if (cfs.length < 2) return null;
    return xirr(
      cfs.map((cf) => ({ date: new Date(cf.date + 'T12:00:00Z'), amountCents: cf.amountCents })),
    );
  }, [cashflowData]);

  const interestInPeriodCents = useMemo(
    () => totalInterestCents(cashflowData?.cashflows ?? []),
    [cashflowData],
  );

  // Chart
  const chartW = W - 72; const chartH = 120; const padTop = 10; const padBot = 6;

  const { labels, valores } = useMemo(() => {
    if (!periodDates) return { labels: [] as string[], valores: [] as number[] };

    // Usa os mesmos cashflows do XIRR — aportes (negativos), parcelas e residual (positivos)
    const allCfs = (cashflowData?.cashflows ?? [])
      .map((cf) => ({ ms: new Date(cf.date + 'T12:00:00Z').getTime(), amountCents: cf.amountCents }))
      .sort((a, b) => a.ms - b.ms);

    if (allCfs.length === 0) return { labels: [] as string[], valores: [] as number[] };

    const inicio = new Date(periodDates.start + 'T00:00:00Z');
    const fim    = new Date(periodDates.end   + 'T00:00:00Z');
    const diffDays = Math.round((fim.getTime() - inicio.getTime()) / 86400000);

    type Bucket = { label: string; startMs: number; endMs: number };
    let buckets: Bucket[] = [];

    if (diffDays <= 14) {
      buckets = Array.from({ length: diffDays + 1 }, (_, i) => {
        const d = new Date(inicio); d.setDate(d.getDate() + i);
        const nx = new Date(d);    nx.setDate(nx.getDate() + 1);
        return { label: `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`, startMs: d.getTime(), endMs: nx.getTime() - 1 };
      });
    } else if (diffDays <= 60) {
      const weeks = Math.ceil(diffDays / 7);
      buckets = Array.from({ length: weeks }, (_, i) => {
        const d = new Date(inicio); d.setDate(d.getDate() + i * 7);
        const nx = new Date(d);    nx.setDate(nx.getDate() + 7);
        return { label: `Sem ${i + 1}`, startMs: d.getTime(), endMs: nx.getTime() - 1 };
      });
    } else {
      const months = Math.ceil(diffDays / 30);
      buckets = Array.from({ length: months }, (_, i) => {
        const d  = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + i, 1));
        const nx = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + i + 1, 1));
        return { label: MESES[d.getUTCMonth()], startMs: d.getTime(), endMs: nx.getTime() - 1 };
      });
    }

    let cumulative = 0;
    const valores = buckets.map((b) => {
      cumulative += allCfs
        .filter((cf) => cf.ms >= b.startMs && cf.ms <= b.endMs)
        .reduce((s, cf) => s + cf.amountCents, 0);
      return cumulative / 100;
    });

    return { labels: buckets.map((b) => b.label), valores };
  }, [cashflowData, periodDates]);

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
  const step     = Math.max(1, Math.ceil(labels.length / 6));
  const visLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);

  // ── Gate de perfil de investidor ───────────────────────────────────────────
  if (profileLoading) {
    return (
      <View style={g.center}>
        <ActivityIndicator size="large" color={C.ink} />
      </View>
    );
  }

  const investorProfile = profileData?.profile;

  if (!investorProfile) {
    return (
      <View style={g.wrap}>
        <View style={g.iconWrap}>
          <Feather name="trending-up" size={28} color={C.ink} />
        </View>
        <Text style={g.title}>Seja um credor</Text>
        <Text style={g.body}>
          Ative seu perfil de credor para receber ofertas de empréstimo e
          investir no retorno de outros usuários da plataforma.
        </Text>
        <TouchableOpacity
          style={[g.btn, activateMutation.isPending && g.btnDisabled]}
          onPress={() => activateMutation.mutate()}
          activeOpacity={0.85}
          disabled={activateMutation.isPending}
        >
          {activateMutation.isPending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={g.btnText}>Ativar perfil de credor</Text>
          }
        </TouchableOpacity>
        {activateMutation.isError && (
          <Text style={g.errorText}>Não foi possível ativar. Tente novamente.</Text>
        )}
      </View>
    );
  }

  if (investorProfile.status === 'pending_review') {
    return (
      <View style={g.wrap}>
        <View style={[g.iconWrap, { backgroundColor: C.chipMuted }]}>
          <Feather name="clock" size={28} color={C.inkSoft} />
        </View>
        <Text style={g.title}>Perfil em análise</Text>
        <Text style={g.body}>
          Seu perfil de credor está sendo analisado. Em breve você receberá
          ofertas de investimento disponíveis na plataforma.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        <Text style={s.greeting}>
          {saudacao}, <Text style={s.greetingName}>{user?.name ?? ''}</Text>
        </Text>

        {/* Hero card */}
        <DarkCard>
          {/* Topo clicável — valor investido + contagem de ativos + chevron */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/ativos' as any)}
            style={s.heroTopRow}
          >
            <View style={{ flex: 1 }}>
              <Eyebrow context="dark">Total investido</Eyebrow>
              <BigValue context="dark">R$ {formatBRL(investido)}</BigValue>
              <Text style={s.ativosInlineLabel}>
                {ativosCount} {ativosCount === 1 ? 'ativo' : 'ativos'}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>

          {hasInvestments && (
            <>
              <View style={s.heroDivider} />

              {/* Acompanhamento do total recebido */}
              <Eyebrow context="dark" style={{ marginBottom: 10 }}>Recebido</Eyebrow>
              <View style={s.capitalPctRow}>
                <Text style={s.capitalPct}>{percentRecebido}</Text>
                <Text style={s.capitalPctSign}>%</Text>
                <Text style={s.capitalPctLabel}>já retornou</Text>
              </View>

              <ThinBar pct={percentRecebido} context="dark" style={{ marginTop: 2, marginBottom: 18 }} />

              <View style={s.receivedValuesRow}>
                <Text style={s.receivedValue}>R$ {formatBRL(recebido)}</Text>
                <Text style={s.receivedValue}>R$ {formatBRL(aReceber)}</Text>
              </View>
            </>
          )}
        </DarkCard>

        {/* Rentabilidade — só exibe quando há posições ativas */}
        {hasInvestments && <SectionTitle style={s.sectionTitle}>Rentabilidade</SectionTitle>}
        {hasInvestments && <LightCard>
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

          {cashflowLoading ? (
            <ActivityIndicator size="small" color={C.ink} style={{ paddingVertical: 32 }} />
          ) : xirrRate !== null || valores.length > 0 ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={s.chartReturnValue}>
                  {xirrRate !== null ? (() => {
                    const pct = xirrRate * 100;
                    const rounded = Math.round(pct * 10) / 10; // 1 casa decimal
                    const sign = rounded > 0 ? '+' : '';
                    return `${sign}${rounded === 0 ? '0.0' : pct.toFixed(1)}% a.a.`;
                  })() : '—'}
                </Text>
                <Text style={s.chartReturnSub}>
                  {interestInPeriodCents > 0
                    ? `R$ ${formatBRL(interestInPeriodCents / 100)} em juros no período`
                    : 'Sem rendimentos no período'}
                </Text>
              </View>
              {valores.length > 1 && (
                <>
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
              )}
            </>
          ) : periodo === 'custom' && !periodDates ? (
            <Text style={s.customEmptyHint}>Preencha as duas datas para ver o rendimento do período</Text>
          ) : (
            <Text style={s.customEmptyHint}>Nenhum rendimento registrado neste período ainda</Text>
          )}
        </LightCard>}

      </ScrollView>
    </View>
  );
}

const g = StyleSheet.create({
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, backgroundColor: C.bg },
  iconWrap:   { width: 64, height: 64, borderRadius: 32, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] },
  title:      { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2, marginBottom: 10, textAlign: 'center' },
  body:       { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn:        { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, borderRadius: radii.lg, backgroundColor: C.dark, minHeight: 54 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { fontSize: fontSize.lg, fontFamily: fonts.bold, color: '#fff' },
  errorText:  { marginTop: spacing[3], fontSize: fontSize.sm, color: C.red, fontFamily: fonts.regular, textAlign: 'center' },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  greeting:     { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4], fontSize: fontSize.lg, color: C.inkSoft, fontFamily: fonts.regular },
  greetingName: { color: C.ink, fontFamily: fonts.bold },
  sectionTitle: { marginHorizontal: spacing[4], marginTop: 4, marginBottom: 10 },
  capitalPctRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  capitalPct:     { fontFamily: fonts.display, fontSize: 52, color: '#fff', letterSpacing: -1.5, lineHeight: 48 },
  capitalPctSign: { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: 'rgba(255,255,255,0.55)', lineHeight: 48 },
  capitalPctLabel:{ fontFamily: fonts.medium, fontSize: fontSize.md, color: 'rgba(255,255,255,0.40)', marginLeft: 4 },
  statLabel:   { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 5 },
  statValue:   { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink, letterSpacing: -0.3 },
  statSub:     { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular, marginTop: 2 },
  heroTopRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  ativosInlineLabel:{ fontSize: fontSize['sm+'], color: 'rgba(255,255,255,0.5)', fontFamily: fonts.medium, marginTop: 6 },
  heroDivider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 20 },
  receivedValuesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receivedValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: '#fff', letterSpacing: -0.3 },
  periodChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chartReturnValue: { fontFamily: fonts.display, fontSize: fontSize['7xl'], color: C.ink, letterSpacing: -0.6 },
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
