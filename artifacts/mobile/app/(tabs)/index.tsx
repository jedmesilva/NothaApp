import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useArea } from '@/contexts/AreaContext';
import { formatBRL, addDays } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  DarkCard, LightCard, ListCard,
  PrimaryButton, DarkButton, ActionRow,
  ThinBar, PoolBar,
  SplitRow,
  DetailGrid,
  Eyebrow, BigValue, SectionTitle,
} from '@/components/ds';

const W = Dimensions.get('window').width;

function formatDataBrief(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

const CICLO_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensal: 30 };

const emprestimosAtivos = [
  { id: 1, valor: 8500,  taxaJurosTotal: 20, prazoDias: 60, ciclo: 'mensal',  parcelasTotal: 2,  parcelasPagas: 0, diasDesdeConcessao: 36, status: 'atrasado' },
  { id: 2, valor: 3200,  taxaJurosTotal: 12, prazoDias: 90, ciclo: 'semanal', parcelasTotal: 13, parcelasPagas: 6, diasDesdeConcessao: 42, status: 'ativo' },
];

const ofertas = [
  { id: 3, valorTotalPedido: 5000,  taxaJurosTotal: 18, prazoDias: 45, ciclo: 'semanal', jaCaptado: 3100, valorOferta: 900,  numCredores: 14, risco: 'Médio', tomadorScore: 'B' },
  { id: 6, valorTotalPedido: 12000, taxaJurosTotal: 22, prazoDias: 90, ciclo: 'mensal',  jaCaptado: 4200, valorOferta: 2000, numCredores: 8,  risco: 'Alto',  tomadorScore: 'C' },
  { id: 7, valorTotalPedido: 2500,  taxaJurosTotal: 10, prazoDias: 15, ciclo: 'diario',  jaCaptado: 2100, valorOferta: 300,  numCredores: 22, risco: 'Baixo', tomadorScore: 'A' },
];

export default function HomeScreen() {
  const { area, setArea } = useArea();
  const [activeTab, setActiveTab]                 = useState<'credito' | 'investir'>(area);
  const scrollRef                                 = useRef<ScrollView>(null);
  const scrollTimeoutRef                          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef                              = useRef(false);
  const bottomPad                                 = 100;

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      setActiveTab(area);
      setTimeout(() => scrollRef.current?.scrollTo({ x: area === 'investir' ? W : 0, animated: false }), 50);
      return () => { isFocusedRef.current = false; };
    }, [area])
  );

  useEffect(() => {
    if (!isFocusedRef.current) return;
    setActiveTab(area);
    scrollRef.current?.scrollTo({ x: area === 'investir' ? W : 0, animated: true });
  }, [area]);

  const limiteTotal     = 10000;
  const limiteDisponivel = 1500;
  const limiteUsado     = limiteTotal - limiteDisponivel;
  const percentUsado    = Math.round((limiteUsado / limiteTotal) * 100);
  const saldoConta      = 8500;
  const hoje            = new Date();

  const proximasParcelas = emprestimosAtivos.map((loan) => {
    const cicloDias    = CICLO_DIAS[loan.ciclo];
    const totalAPagar  = loan.valor * (1 + loan.taxaJurosTotal / 100);
    const valorParcela = totalAPagar / loan.parcelasTotal;
    const saldoDevedor = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
    const dataConcessao = addDays(hoje, -loan.diasDesdeConcessao);
    const dataProxima  = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
    const diasParaVencer = Math.round((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const estado = diasParaVencer < 0 ? 'vencida' : diasParaVencer <= 5 ? 'proxima' : 'futura';
    return { loanId: loan.id, loanValor: loan.valor, valorParcela, saldoDevedor, parcelasRestantes: loan.parcelasTotal - loan.parcelasPagas, data: dataProxima, estado };
  }).sort((a, b) => a.data.getTime() - b.data.getTime());

  const divida = {
    totalEmAberto: proximasParcelas.reduce((s, p) => s + p.saldoDevedor, 0),
    parcelasRestantes: proximasParcelas.reduce((s, p) => s + p.parcelasRestantes, 0),
  };

  const hour     = hoje.getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const handleSwipeScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const newArea = Math.round(x / W) === 0 ? 'credito' : 'investir';
      setActiveTab(newArea);
      setArea(newArea);
    }, 100);
  };

  return (
    <View style={s.screen}>
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleSwipeScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: W * 2 }}
      >
        {/* ── Page 1: Crédito ───────────────────────────────────────── */}
        <ScrollView style={{ width: W }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          <Text style={s.greeting}>
            {saudacao}, <Text style={s.greetingName}>Rafael</Text>
          </Text>

          {/* Credit limit card */}
          <DarkCard>
            <Eyebrow context="dark">Limite disponível</Eyebrow>
            <BigValue context="dark">R$ {formatBRL(limiteDisponivel)}</BigValue>
            <Text style={s.totalText}>de R$ {formatBRL(limiteTotal)}</Text>
            <ThinBar pct={percentUsado} context="dark" style={{ marginBottom: 0 }} />
            <View style={s.progressCaption}>
              <Text style={s.progressCaptionText}>R$ {formatBRL(limiteUsado)} utilizados</Text>
              <Text style={s.progressCaptionText}>{percentUsado}%</Text>
            </View>
            <PrimaryButton
              label={limiteDisponivel > 0 ? 'Solicitar empréstimo' : 'Limite esgotado'}
              disabled={limiteDisponivel <= 0}
            />
          </DarkCard>

          {/* Balance card */}
          <LightCard>
            <Eyebrow context="light">Saldo em conta</Eyebrow>
            <Text style={s.secondaryValue}>R$ {formatBRL(saldoConta)}</Text>
            <Text style={s.helperText}>Disponível para usar</Text>
            <ActionRow
              left={{ icon: 'arrow-down', label: 'Sacar',     context: 'light' }}
              right={{ icon: 'plus',      label: 'Depositar',  context: 'light' }}
            />
          </LightCard>

          {/* Vencimentos card */}
          <LightCard style={{ marginTop: 14 }}>
            <SectionTitle style={{ marginBottom: 4 }}>Vencimentos</SectionTitle>
            <Text style={s.vencSummary}>
              R$ {formatBRL(Math.round(divida.totalEmAberto))} em aberto · {divida.parcelasRestantes} parcelas
            </Text>

            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Em atraso</Text>
                <Text style={s.statValue}>{proximasParcelas.filter((p) => p.estado === 'vencida').length}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Próximas (5 dias)</Text>
                <Text style={s.statValue}>{proximasParcelas.filter((p) => p.estado === 'proxima').length}</Text>
              </View>
            </View>

            {proximasParcelas.map((p) => {
              const isVencida = p.estado === 'vencida';
              const isProxima = p.estado === 'proxima';
              return (
                <View
                  key={p.loanId}
                  style={[
                    s.parcelaRow,
                    isVencida && s.parcelaRowVencida,
                    isProxima && s.parcelaRowProxima,
                    !isVencida && !isProxima && s.parcelaRowFutura,
                  ]}
                >
                  <View style={s.installIcon}>
                    <Feather name="calendar" size={16} color={isVencida ? C.red : isProxima ? C.amber : C.inkSoft} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.installLoanTag}>Empréstimo #{p.loanId}</Text>
                    <Text style={[s.installLabel, isVencida && { color: C.red, fontFamily: fonts.bold }, isProxima && { color: C.amber, fontFamily: fonts.bold }]}>
                      {isVencida ? 'Vencida' : isProxima ? 'Vence em breve' : `Vence ${formatDataBrief(p.data)}`}
                    </Text>
                    <Text style={s.installValue}>R$ {formatBRL(Math.round(p.valorParcela))}</Text>
                  </View>
                  <TouchableOpacity style={s.payBtn} activeOpacity={0.8} onPress={() => router.push('/emprestimos' as any)}>
                    <Text style={s.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity style={s.seeAllLink} onPress={() => router.push('/emprestimos' as any)} activeOpacity={0.7}>
              <Text style={s.seeAllText}>Ver todos os empréstimos</Text>
              <Feather name="chevron-right" size={13} color={C.inkSoft} />
            </TouchableOpacity>
          </LightCard>
        </ScrollView>

        {/* ── Page 2: Investir ──────────────────────────────────────── */}
        <ScrollView style={{ width: W }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          <View style={s.ofertasHeader}>
            <Text style={s.ofertasTitle}>Oportunidades</Text>
            <Text style={s.ofertasSubtitle}>Empréstimos disponíveis para você investir</Text>
          </View>

          <View style={s.saldoChip}>
            <Text style={s.saldoChipText}>Saldo disponível · R$ {formatBRL(saldoConta)}</Text>
          </View>

          {ofertas.map((o) => {
            const percentCaptado = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
            const restante = o.valorTotalPedido - o.jaCaptado;
            return (
              <ListCard key={o.id}>
                <Text style={s.ofertaEyebrow}>RETORNO ESTIMADO</Text>
                <Text style={s.ofertaRetorno}>
                  <Text style={s.ofertaRetornoSign}>+</Text>{o.taxaJurosTotal}%
                </Text>
                <Text style={s.ofertaCaption}>em {o.prazoDias} dias · ciclo {o.ciclo}</Text>

                <SplitRow
                  left={{ label: 'VALOR PEDIDO', value: `R$ ${formatBRL(o.valorTotalPedido)}` }}
                  right={{ label: 'DISPONÍVEL',  value: `R$ ${formatBRL(restante)}` }}
                />

                <PoolBar
                  label="CAPTAÇÃO"
                  headLeft={`R$ ${formatBRL(o.jaCaptado)} de R$ ${formatBRL(o.valorTotalPedido)}`}
                  headRight={undefined}
                  segments={[{ pct: percentCaptado, variant: 'primary' }]}
                  style={{ marginBottom: 18 }}
                />

                <DetailGrid
                  items={[
                    { label: 'RISCO',        value: o.risco },
                    { label: 'SCORE TOMADOR', value: o.tomadorScore },
                    { label: 'CREDORES',      value: String(o.numCredores) },
                    { label: 'SUA OFERTA',    value: `R$ ${formatBRL(o.valorOferta)}` },
                  ]}
                />

                <DarkButton
                  label="Investir nessa oferta"
                  icon="arrow-up-right"
                  style={{ marginTop: 18 }}
                />
              </ListCard>
            );
          })}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  greeting:     { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: 18, fontSize: fontSize.lg, color: C.inkSoft, fontFamily: fonts.regular },
  greetingName: { color: C.ink, fontFamily: fonts.bold },
  totalText:    { fontSize: fontSize.md, color: C.onDarkMid, fontFamily: fonts.medium, marginBottom: 16, marginTop: 6 },
  progressCaption:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, marginBottom: 22 },
  progressCaptionText: { fontSize: fontSize['sm+'], color: C.onDarkFaint, fontFamily: fonts.regular },
  secondaryValue: { fontFamily: fonts.display, fontSize: 32, color: C.ink, letterSpacing: -0.5, marginTop: 2 },
  helperText:     { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginTop: 4, marginBottom: 18 },
  vencSummary:    { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 16 },
  statsRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statBlock:   { flex: 1 },
  statDivider: { width: 1, height: 34, backgroundColor: C.line, marginHorizontal: 18 },
  statLabel:   { fontSize: fontSize['2xs'], color: C.inkFaint, fontFamily: fonts.semibold, marginBottom: 4 },
  statValue:   { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: C.ink, letterSpacing: -0.3 },
  parcelaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: spacing[4], marginBottom: 10 },
  parcelaRowVencida: { backgroundColor: C.redBg, borderWidth: 1.5, borderColor: C.red },
  parcelaRowProxima: { backgroundColor: C.amberBg },
  parcelaRowFutura:  { backgroundColor: C.bg },
  installIcon: { width: 38, height: 38, borderRadius: radii.md, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  installLoanTag: { fontSize: fontSize['2xs'], fontFamily: fonts.bold, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 3 },
  installLabel:   { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 2 },
  installValue:   { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink },
  payBtn:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, backgroundColor: C.ink },
  payBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
  seeAllLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 4, paddingBottom: 4 },
  seeAllText: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  // Investir page
  ofertasHeader:   { paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: 6 },
  ofertasTitle:    { fontFamily: fonts.display, fontSize: 22, color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  ofertasSubtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular },
  saldoChip:     { marginHorizontal: spacing[5], marginTop: 14, marginBottom: 4, padding: 10, borderRadius: radii.md, backgroundColor: C.chipUrgent },
  saldoChipText: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.semibold },
  ofertaEyebrow:     { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  ofertaRetorno:     { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 48, marginBottom: 8 },
  ofertaRetornoSign: { fontSize: 24, fontFamily: fonts.display },
  ofertaCaption:     { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18 },
});
