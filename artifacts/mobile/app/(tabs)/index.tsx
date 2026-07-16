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
  PrimaryButton, DarkButton, GhostButton,
  ThinBar, PoolBar,
  SplitRow,
  DetailGrid,
  Eyebrow, BigValue, SectionTitle,
  ContaCard,
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
  const saldoConta        = 8500;
  const depositoRecente   = 8500;   // último empréstimo concedido (null = nenhum recente)
  const rendimentoRecente = 340;    // rendimento creditado recentemente (0 = nenhum)
  const hoje              = new Date();

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

          {/* Account balance / deposit notification card */}
          {depositoRecente > 0 ? (
            <ContaCard
              variant="deposito"
              valor={depositoRecente}
              onPress={() => router.push('/conta' as any)}
            />
          ) : saldoConta > 0 ? (
            <ContaCard
              variant="saldo"
              valor={saldoConta}
              onPress={() => router.push('/conta' as any)}
            />
          ) : null}

          {/* Vencimentos card */}
          <SectionTitle style={s.vencSectionTitle}>Vencimentos</SectionTitle>
          <LightCard>
            {/* Hero: total em aberto */}
            <Eyebrow>Total em aberto</Eyebrow>
            <BigValue context="light" size="display" style={{ lineHeight: 36, marginBottom: 16 }}>
              R$ {formatBRL(Math.round(divida.totalEmAberto))}
            </BigValue>

            {/* Contadores de urgência */}
            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Eyebrow style={{ marginBottom: 4 }}>Em atraso</Eyebrow>
                <Text style={s.statValue}>{proximasParcelas.filter((p) => p.estado === 'vencida').length}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBlock}>
                <Eyebrow style={{ marginBottom: 4 }}>Próximas (5 dias)</Eyebrow>
                <Text style={s.statValue}>{proximasParcelas.filter((p) => p.estado === 'proxima').length}</Text>
              </View>
            </View>

            {/* Lista de parcelas */}
            {proximasParcelas.map((p, idx) => {
              const isVencida   = p.estado === 'vencida';
              const isProxima   = p.estado === 'proxima';
              const accentColor = isVencida ? C.red : isProxima ? C.amber : C.inkFaint;
              const stateLabel  = isVencida ? 'Vencida' : isProxima ? 'Vence em breve' : `Vence ${formatDataBrief(p.data)}`;
              const btnBg       = isVencida ? C.red : C.ink;
              const isLast      = idx === proximasParcelas.length - 1;
              return (
                <TouchableOpacity
                  key={p.loanId}
                  style={[s.parcelaRow, !isLast && !isVencida && s.parcelaRowSep, isVencida && s.parcelaRowVencida]}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/emprestimo-detalhe?id=${p.loanId}` as any)}
                >
                  <View style={[s.parcelaIconBadge, isVencida && s.parcelaIconBadgeVencida, isProxima && s.parcelaIconBadgeProxima]}>
                    <Feather
                      name={isVencida ? 'alert-triangle' : isProxima ? 'clock' : 'calendar'}
                      size={16}
                      color={isVencida ? '#fff' : isProxima ? C.amber : C.inkFaint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.installState, { color: accentColor }]}>{stateLabel}</Text>
                    <Text style={s.installValue}>R$ {formatBRL(Math.round(p.valorParcela))}</Text>
                  </View>
                  <TouchableOpacity style={[s.payBtn, { backgroundColor: btnBg }]} activeOpacity={0.8} onPress={() => {/* TODO: abrir tela de pagamento */}}>
                    <Text style={s.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            <GhostButton
              label="Ver todos os empréstimos"
              onPress={() => router.push('/emprestimos' as any)}
              style={{ marginTop: 8 }}
            />
          </LightCard>
        </ScrollView>

        {/* ── Page 2: Investir ──────────────────────────────────────── */}
        <ScrollView style={{ width: W }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          <View style={s.ofertasHeader}>
            <Text style={s.ofertasTitle}>Oportunidades</Text>
            <Text style={s.ofertasSubtitle}>Empréstimos disponíveis para você investir</Text>
          </View>

          {/* Rendimento credited or available balance card */}
          {rendimentoRecente > 0 ? (
            <ContaCard
              variant="rendimento"
              valor={rendimentoRecente}
              onPress={() => router.push('/carteira' as any)}
              style={{ marginTop: 14 }}
            />
          ) : saldoConta > 0 ? (
            <ContaCard
              variant="saldo"
              valor={saldoConta}
              onPress={() => router.push('/conta' as any)}
              style={{ marginTop: 14 }}
            />
          ) : null}

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
  greeting:     { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4], fontSize: fontSize.lg, color: C.inkSoft, fontFamily: fonts.regular },
  greetingName: { color: C.ink, fontFamily: fonts.bold },
  totalText:    { fontSize: fontSize.md, color: C.onDarkMid, fontFamily: fonts.medium, marginBottom: 16, marginTop: 6 },
  progressCaption:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, marginBottom: 22 },
  progressCaptionText: { fontSize: fontSize['sm+'], color: C.onDarkFaint, fontFamily: fonts.regular },
  vencSectionTitle: { marginHorizontal: spacing[4], marginTop: 14, marginBottom: 10 },
  statsRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statBlock:   { flex: 1 },
  statDivider: { width: 1, height: 34, backgroundColor: C.line, marginHorizontal: 18 },
  statValue:   { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: C.ink, letterSpacing: -0.3 },
  parcelaRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  parcelaIconBadge:         { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
  parcelaIconBadgeVencida:  { backgroundColor: C.red },
  parcelaIconBadgeProxima:  { backgroundColor: C.amberBg },
  parcelaRowSep:   { borderBottomWidth: 1, borderBottomColor: C.line },
  parcelaRowVencida: { backgroundColor: C.redBg, borderRadius: radii.card, paddingHorizontal: 12, marginHorizontal: -12 },
  installState: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, marginBottom: 4 },
  installValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink },
  payBtn:     { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.md },
  payBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
  // Investir page
  ofertasHeader:   { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[2] },
  ofertasTitle:    { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  ofertasSubtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular },
  ofertaEyebrow:     { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  ofertaRetorno:     { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 48, marginBottom: 8 },
  ofertaRetornoSign: { fontSize: 24, fontFamily: fonts.display },
  ofertaCaption:     { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18 },
});
