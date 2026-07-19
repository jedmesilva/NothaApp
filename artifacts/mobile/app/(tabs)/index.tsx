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
import { EMPRESTIMOS, formatBRL, addDays, formatRelativeDueDate } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  DarkCard, LightCard,
  PrimaryButton,
  ThinBar,
  Eyebrow, BigValue, SectionTitle, BodyText,
  ContaCard,
  AlertBanner,
} from '@/components/ds';
import { LoanCard } from '@/components/LoanCard';
import CarteiraScreen from './carteira';

const W = Dimensions.get('window').width;

const CICLO_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensal: 30 };

export default function HomeScreen() {
  const { area, setArea, registerScrollTo } = useArea();
  const [activeTab, setActiveTab]   = useState<'credito' | 'investir'>('credito');
  const scrollRef                   = useRef<ScrollView>(null);
  const scrollTimeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef                = useRef(false);
  const bottomPad                   = 100;

  useEffect(() => {
    registerScrollTo((a) => {
      setActiveTab(a);
      scrollRef.current?.scrollTo({ x: a === 'investir' ? W : 0, animated: true });
    });
  }, [registerScrollTo]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      setActiveTab(area);
      setTimeout(() => scrollRef.current?.scrollTo({ x: area === 'investir' ? W : 0, animated: false }), 50);
      return () => { isFocusedRef.current = false; };
    }, [area])
  );

  const hoje = new Date();

  const limiteTotal      = 10000;
  const limiteDisponivel = 1500;
  const limiteUsado      = limiteTotal - limiteDisponivel;
  const percentUsado     = Math.round((limiteUsado / limiteTotal) * 100);
  const saldoConta       = 8500;
  const depositoRecente  = 8500;

  // Empréstimos com parcelas em aberto (ativo + atrasado)
  const activeLoans = EMPRESTIMOS.filter(
    (e) => e.status === 'ativo' || e.status === 'atrasado'
  );

  // Próxima parcela de cada empréstimo ativo
  const proximasParcelas = activeLoans.map((loan) => {
    const cicloDias     = CICLO_DIAS[loan.ciclo];
    const totalAPagar   = loan.valor * (1 + loan.taxaJurosTotal / 100);
    const valorParcela  = totalAPagar / loan.parcelasTotal;
    const saldoDevedor  = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
    const dataConcessao = addDays(hoje, -(loan.diasDesdeConcessao ?? 0));
    const dataProxima   = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
    const diasParaVencer = Math.round((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return { loanId: loan.id, valorParcela, saldoDevedor, data: dataProxima, diasParaVencer };
  }).sort((a, b) => a.data.getTime() - b.data.getTime());

  // Contagem de vencimentos já atrasados (passado de hoje)
  const totalVencimentosAtrasados = activeLoans.reduce((soma, loan) => {
    const cicloDias     = CICLO_DIAS[loan.ciclo];
    const dataConcessao = addDays(hoje, -(loan.diasDesdeConcessao ?? 0));
    let atrasados = 0;
    for (let i = loan.parcelasPagas + 1; i <= loan.parcelasTotal; i++) {
      if (addDays(dataConcessao, i * cicloDias) < hoje) atrasados++;
    }
    return soma + atrasados;
  }, 0);

  // Próximo vencimento futuro
  const proximoVencimentoGeral = proximasParcelas.find((p) => p.diasParaVencer >= 0) ?? null;

  const totalEmAberto = proximasParcelas.reduce((s, p) => s + p.saldoDevedor, 0);

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

          {/* Limite disponível */}
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
              onPress={() => router.push('/novo-emprestimo')}
            />
          </DarkCard>

          {/* Saldo / depósito em conta */}
          {depositoRecente > 0 ? (
            <ContaCard variant="deposito" valor={depositoRecente} onPress={() => router.push('/conta' as any)} />
          ) : saldoConta > 0 ? (
            <ContaCard variant="saldo" valor={saldoConta} onPress={() => router.push('/conta' as any)} />
          ) : null}

          {/* ── Meus Empréstimos ──────────────────────────────────── */}
          <SectionTitle style={s.sectionTitle}>Meus Empréstimos</SectionTitle>

          {/* Hero card — card inteiro leva para a tela de empréstimos */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/emprestimos' as any)}>
            <LightCard>
              <View style={s.heroTopRow}>
                <View>
                  <BigValue context="light" size="display" style={{ lineHeight: 38 }}>
                    R$ {formatBRL(Math.round(totalEmAberto))}
                  </BigValue>
                  <BodyText color={C.inkSoft} style={{ marginTop: 4 }}>
                    {activeLoans.length} {activeLoans.length === 1 ? 'empréstimo' : 'empréstimos'} em aberto
                  </BodyText>
                </View>
                <Feather name="chevron-right" size={20} color={C.inkFaint} style={{ marginTop: 4 }} />
              </View>

              {proximoVencimentoGeral && (
                <View style={s.proximoVencRow}>
                  <Feather name="calendar" size={14} color={C.inkFaint} />
                  <BodyText color={C.inkSoft} style={{ flex: 1 }}>
                    Próximo vencimento{' '}
                    <Text style={{ fontFamily: fonts.bold, color: C.ink }}>
                      {formatRelativeDueDate(proximoVencimentoGeral.data)}
                    </Text>
                    {' · '}R$ {formatBRL(Math.round(proximoVencimentoGeral.valorParcela))}
                  </BodyText>
                </View>
              )}

              {totalVencimentosAtrasados > 0 ? (
                <AlertBanner
                  variant="error"
                  message={`${totalVencimentosAtrasados} ${totalVencimentosAtrasados === 1 ? 'vencimento em atraso' : 'vencimentos em atraso'}`}
                  style={{ marginTop: 12 }}
                />
              ) : (
                <View style={s.statusEmDia}>
                  <Feather name="check" size={14} color={C.ink} />
                  <Text style={s.statusEmDiaText}>Em dia</Text>
                </View>
              )}
            </LightCard>
          </TouchableOpacity>

          {/* Lista de empréstimos ativos */}
          <View style={s.loanList}>
            {activeLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </View>
        </ScrollView>

        {/* ── Page 2: Carteira (início da área Investir) ────────────── */}
        <View style={{ width: W, flex: 1 }}>
          <CarteiraScreen />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  greeting:    { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4], fontSize: fontSize.lg, color: C.inkSoft, fontFamily: fonts.regular },
  greetingName: { color: C.ink, fontFamily: fonts.bold },
  totalText:   { fontSize: fontSize.md, color: C.onDarkMid, fontFamily: fonts.medium, marginBottom: 16, marginTop: 6 },
  progressCaption:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, marginBottom: 22 },
  progressCaptionText: { fontSize: fontSize['sm+'], color: C.onDarkFaint, fontFamily: fonts.regular },

  sectionTitle: { marginHorizontal: spacing[4], marginTop: 14, marginBottom: 2 },

  // Hero card
  heroTopRow:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  proximoVencRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.line },

  // Status "Em dia"
  statusEmDia:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: '#ECECEF' },
  statusEmDiaText: { fontSize: fontSize['sm+'], fontFamily: fonts.bold, color: C.ink },

  // Lista de loan cards
  loanList: { paddingHorizontal: spacing[4], gap: 12, marginTop: 4 },
});
