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
import { useArea } from '@/contexts/AreaContext';
import { formatBRL, addDays, formatRelativeDueDate } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  DarkCard, LightCard,
  PrimaryButton, GhostButton,
  ThinBar,
  Eyebrow, BigValue, SectionTitle,
  ContaCard,
  InstallmentBadge,
} from '@/components/ds';

const W = Dimensions.get('window').width;

const CICLO_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensal: 30 };

const emprestimosAtivos = [
  { id: 1, valor: 8500,  taxaJurosTotal: 20, prazoDias: 60, ciclo: 'mensal',  parcelasTotal: 2,  parcelasPagas: 0, diasDesdeConcessao: 36, status: 'atrasado' },
  { id: 2, valor: 3200,  taxaJurosTotal: 12, prazoDias: 90, ciclo: 'semanal', parcelasTotal: 13, parcelasPagas: 6, diasDesdeConcessao: 42, status: 'ativo' },
];

export default function HomeScreen() {
  const { area, setArea } = useArea();
  const [activeTab, setActiveTab]   = useState<'credito' | 'investir'>('credito');
  const scrollRef                   = useRef<ScrollView>(null);
  const scrollTimeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef                = useRef(false);
  const bottomPad                   = 100;

  // When this screen gains focus with area === 'investir', redirect to Carteira.
  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      if (area === 'investir') {
        router.navigate('/carteira' as any);
        return () => { isFocusedRef.current = false; };
      }
      setActiveTab('credito');
      scrollRef.current?.scrollTo({ x: 0, animated: false });
      return () => { isFocusedRef.current = false; };
    }, [area])
  );

  useEffect(() => {
    if (!isFocusedRef.current) return;
    if (area === 'investir') {
      router.navigate('/carteira' as any);
      return;
    }
    setActiveTab('credito');
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [area]);

  const hoje = new Date();

  const limiteTotal      = 10000;
  const limiteDisponivel = 1500;
  const limiteUsado      = limiteTotal - limiteDisponivel;
  const percentUsado     = Math.round((limiteUsado / limiteTotal) * 100);
  const saldoConta       = 8500;
  const depositoRecente  = 8500;

  const proximasParcelas = emprestimosAtivos.map((loan) => {
    const cicloDias     = CICLO_DIAS[loan.ciclo];
    const totalAPagar   = loan.valor * (1 + loan.taxaJurosTotal / 100);
    const valorParcela  = totalAPagar / loan.parcelasTotal;
    const saldoDevedor  = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
    const dataConcessao = addDays(hoje, -loan.diasDesdeConcessao);
    const dataProxima   = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
    const diasParaVencer = Math.round((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const estado = diasParaVencer < 0 ? 'vencida' : diasParaVencer <= 5 ? 'proxima' : 'futura';
    return { loanId: loan.id, valorParcela, saldoDevedor, parcelasRestantes: loan.parcelasTotal - loan.parcelasPagas, data: dataProxima, estado };
  }).sort((a, b) => a.data.getTime() - b.data.getTime());

  const divida = {
    totalEmAberto: proximasParcelas.reduce((s, p) => s + p.saldoDevedor, 0),
  };

  const hour     = hoje.getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // When the user swipes to the Investir side, redirect to Carteira.
  const handleSwipeScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (Math.round(x / W) === 1) {
        // Snap back and navigate to Carteira
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        setArea('investir');
        router.navigate('/carteira' as any);
      } else {
        setActiveTab('credito');
        setArea('credito');
      }
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
            <Eyebrow>Total em aberto</Eyebrow>
            <BigValue context="light" size="display" style={{ lineHeight: 36, marginBottom: 16 }}>
              R$ {formatBRL(Math.round(divida.totalEmAberto))}
            </BigValue>

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

            {proximasParcelas.map((p, idx) => {
              const isVencida   = p.estado === 'vencida';
              const isProxima   = p.estado === 'proxima';
              const accentColor = isVencida ? C.red : isProxima ? C.amber : C.inkFaint;
              const stateLabel  = formatRelativeDueDate(p.data);
              const btnBg       = isVencida ? C.red : C.ink;
              const isLast      = idx === proximasParcelas.length - 1;
              return (
                <TouchableOpacity
                  key={p.loanId}
                  style={[s.parcelaRow, !isLast && !isVencida && s.parcelaRowSep, isVencida && s.parcelaRowVencida]}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/emprestimo-detalhe?id=${p.loanId}` as any)}
                >
                  <InstallmentBadge
                    variant={isVencida ? 'overdue' : isProxima ? 'proxima' : 'future'}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.installState, { color: accentColor }]}>{stateLabel}</Text>
                    <Text style={s.installValue}>R$ {formatBRL(Math.round(p.valorParcela))}</Text>
                  </View>
                  <TouchableOpacity style={[s.payBtn, { backgroundColor: btnBg }]} activeOpacity={0.8} onPress={() => {}}>
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

        {/* ── Page 2: placeholder — swipe redirects to Carteira ─────── */}
        <View style={{ width: W }} />
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
  parcelaRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  parcelaRowSep:     { borderBottomWidth: 1, borderBottomColor: C.line },
  parcelaRowVencida: { backgroundColor: C.redBg, borderRadius: radii.card, paddingHorizontal: 12, marginHorizontal: -12 },
  installState: { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, marginBottom: 4 },
  installValue: { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: C.ink },
  payBtn:     { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.md },
  payBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
});
