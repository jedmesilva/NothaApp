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
import {
  EMPRESTIMOS,
  CICLO_META,
  formatBRL,
  addDays,
  formatRelativeDueDate,
} from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  DarkCard, LightCard,
  PrimaryButton,
  ThinBar, PoolBar,
  Eyebrow, BigValue, SectionTitle,
  ContaCard,
} from '@/components/ds';
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

  // Empréstimos ativos (ativo + atrasado) — base de dados real
  const activeLoans = EMPRESTIMOS.filter(
    (e) => e.status === 'ativo' || e.status === 'atrasado'
  );

  // Próximas parcelas de cada empréstimo ativo
  const proximasParcelas = activeLoans.map((loan) => {
    const cicloDias    = CICLO_DIAS[loan.ciclo];
    const totalAPagar  = loan.valor * (1 + loan.taxaJurosTotal / 100);
    const valorParcela = totalAPagar / loan.parcelasTotal;
    const saldoDevedor = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
    const dataConcessao = addDays(hoje, -(loan.diasDesdeConcessao ?? 0));
    const dataProxima   = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
    const diasParaVencer = Math.round((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const estado = diasParaVencer < 0 ? 'vencida' : diasParaVencer <= 5 ? 'proxima' : 'futura';
    return { loanId: loan.id, valorParcela, saldoDevedor, parcelasRestantes: loan.parcelasTotal - loan.parcelasPagas, data: dataProxima, diasParaVencer, estado };
  }).sort((a, b) => a.data.getTime() - b.data.getTime());

  // Total de vencimentos já atrasados (passado de hoje)
  const totalVencimentosAtrasados = activeLoans.reduce((soma, loan) => {
    const cicloDias     = CICLO_DIAS[loan.ciclo];
    const dataConcessao = addDays(hoje, -(loan.diasDesdeConcessao ?? 0));
    let atrasados = 0;
    for (let i = loan.parcelasPagas + 1; i <= loan.parcelasTotal; i++) {
      const dataVenc = addDays(dataConcessao, i * cicloDias);
      if (dataVenc < hoje) atrasados++;
    }
    return soma + atrasados;
  }, 0);

  // Próximo vencimento futuro (não atrasado)
  const proximoVencimentoGeral = proximasParcelas.find((p) => p.diasParaVencer >= 0) ?? null;

  const divida = {
    totalEmAberto: proximasParcelas.reduce((s, p) => s + p.saldoDevedor, 0),
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
              onPress={() => router.push('/novo-emprestimo')}
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

          {/* ── Meus Empréstimos ──────────────────────────────────── */}
          <SectionTitle style={s.sectionTitle}>Meus Empréstimos</SectionTitle>

          {/* Hero card — tappable, leva para o histórico completo */}
          <TouchableOpacity
            style={s.emprestimosHero}
            activeOpacity={0.85}
            onPress={() => router.push('/emprestimos' as any)}
          >
            <View style={s.heroTopRow}>
              <View>
                <Text style={s.heroValue}>R$ {formatBRL(Math.round(divida.totalEmAberto))}</Text>
                <Text style={s.heroSubtitle}>
                  {activeLoans.length} {activeLoans.length === 1 ? 'empréstimo' : 'empréstimos'} em aberto
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.inkFaint} style={{ marginTop: 4 }} />
            </View>

            {proximoVencimentoGeral && (
              <View style={s.proximoVencRow}>
                <Feather name="calendar" size={14} color={C.inkFaint} />
                <Text style={s.proximoVencText}>
                  Próximo vencimento{' '}
                  <Text style={s.proximoVencStrong}>
                    {formatRelativeDueDate(proximoVencimentoGeral.data)}
                  </Text>
                  {' · '}R$ {formatBRL(Math.round(proximoVencimentoGeral.valorParcela))}
                </Text>
              </View>
            )}

            {totalVencimentosAtrasados > 0 ? (
              <View style={[s.statusStrip, s.statusStripAtrasado]}>
                <Feather name="alert-triangle" size={15} color={C.red} />
                <Text style={[s.statusStripText, { color: C.red }]}>
                  {totalVencimentosAtrasados}{' '}
                  {totalVencimentosAtrasados === 1 ? 'vencimento em atraso' : 'vencimentos em atraso'}
                </Text>
              </View>
            ) : (
              <View style={[s.statusStrip, s.statusStripEmDia]}>
                <Feather name="check" size={15} color={C.ink} />
                <Text style={[s.statusStripText, { color: C.ink }]}>Em dia</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Card individual por empréstimo ativo */}
          {activeLoans.map((loan) => {
            const totalAPagar  = loan.valor * (1 + loan.taxaJurosTotal / 100);
            const valorParcela = totalAPagar / loan.parcelasTotal;
            const saldoDevedor = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
            const percentPago  = loan.parcelasTotal > 0
              ? Math.round((loan.parcelasPagas / loan.parcelasTotal) * 100) : 0;
            const isAtrasado   = loan.status === 'atrasado';
            const cicloLabel   = CICLO_META[loan.ciclo]?.label ?? '';

            const proxInfo = proximasParcelas.find((p) => p.loanId === loan.id);
            const diasDiff = proxInfo
              ? Math.abs(Math.round((proxInfo.data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)))
              : 0;

            return (
              <TouchableOpacity
                key={loan.id}
                style={[s.loanCard, isAtrasado && s.loanCardAtrasado]}
                activeOpacity={0.85}
                onPress={() => router.push(`/emprestimo-detalhe?id=${loan.id}` as any)}
              >
                {/* Valor + badge de status */}
                <View style={s.loanTopRow}>
                  <View>
                    <Text style={s.loanValue}>R$ {formatBRL(loan.valor)}</Text>
                    <Text style={s.loanLabel}>
                      {loan.parcelasTotal}x de R$ {formatBRL(Math.round(valorParcela))} ({cicloLabel})
                    </Text>
                  </View>
                  <View style={[s.loanBadge, isAtrasado ? s.loanBadgeAtrasado : s.loanBadgeAtivo]}>
                    <Feather
                      name={isAtrasado ? 'alert-triangle' : 'check'}
                      size={12}
                      color={isAtrasado ? C.red : C.ink}
                    />
                    <Text style={[s.loanBadgeText, { color: isAtrasado ? C.red : C.ink }]}>
                      {isAtrasado ? 'Atrasado' : 'Ativo'}
                    </Text>
                  </View>
                </View>

                {/* Progresso de parcelas */}
                <View style={s.progressHeaderRow}>
                  <Text style={[s.progressLeft, isAtrasado && { color: C.red }]}>
                    {loan.parcelasPagas}/{loan.parcelasTotal} parcelas
                  </Text>
                  <Text style={[s.progressRight, isAtrasado && { color: C.red }]}>
                    R$ {formatBRL(Math.round(saldoDevedor))}
                  </Text>
                </View>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      { width: `${percentPago}%` as any, backgroundColor: isAtrasado ? C.red : C.ink },
                    ]}
                  />
                </View>
                <Text style={[s.loanMeta, isAtrasado && { color: C.red, fontFamily: fonts.bold }]}>
                  {isAtrasado
                    ? `Venceu há ${diasDiff} dias`
                    : `Próximo vencimento em ${diasDiff} dias`}
                </Text>

                {/* Grade 2×2 de detalhes */}
                <View style={s.detailGrid}>
                  <View style={s.detailCell}>
                    <Text style={s.detailLabel}>Prazo</Text>
                    <Text style={s.detailValue}>{loan.prazoDias} dias</Text>
                  </View>
                  <View style={s.detailCell}>
                    <Text style={s.detailLabel}>Ciclo</Text>
                    <Text style={s.detailValue}>{cicloLabel}</Text>
                  </View>
                  <View style={s.detailCell}>
                    <Text style={s.detailLabel}>Taxa total</Text>
                    <Text style={s.detailValue}>{loan.taxaJurosTotal}%</Text>
                  </View>
                  <View style={s.detailCell}>
                    <Text style={s.detailLabel}>Total a pagar</Text>
                    <Text style={s.detailValue}>R$ {formatBRL(Math.round(totalAPagar))}</Text>
                  </View>
                </View>

                {/* Botão de pagamento */}
                <TouchableOpacity
                  style={[s.payBtn, { backgroundColor: isAtrasado ? C.red : C.ink }]}
                  activeOpacity={0.8}
                  onPress={(e) => { e.stopPropagation?.(); }}
                >
                  <Text style={s.payBtnText}>
                    {isAtrasado ? 'Pagar vencimento em atraso' : 'Pagar próximo vencimento'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
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
  screen: { flex: 1, backgroundColor: C.bg },

  greeting:     { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4], fontSize: fontSize.lg, color: C.inkSoft, fontFamily: fonts.regular },
  greetingName: { color: C.ink, fontFamily: fonts.bold },
  totalText:    { fontSize: fontSize.md, color: C.onDarkMid, fontFamily: fonts.medium, marginBottom: 16, marginTop: 6 },
  progressCaption:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, marginBottom: 22 },
  progressCaptionText: { fontSize: fontSize['sm+'], color: C.onDarkFaint, fontFamily: fonts.regular },

  sectionTitle: { marginHorizontal: spacing[4], marginTop: 14, marginBottom: 10 },

  // ── Hero card ──────────────────────────────────────────────────────────
  emprestimosHero: {
    marginHorizontal: spacing[4],
    marginBottom: 12,
    backgroundColor: C.card,
    borderRadius: radii.card,
    padding: 20,
  },
  heroTopRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 },
  heroValue:   { fontFamily: fonts.display, fontSize: 34, color: C.ink, letterSpacing: -0.6 },
  heroSubtitle: { fontFamily: fonts.display, fontSize: 15, color: C.inkSoft, marginTop: 4 },

  proximoVencRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.line },
  proximoVencText:  { flex: 1, fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },
  proximoVencStrong: { fontFamily: fonts.bold, color: C.ink },

  statusStrip:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: radii.md },
  statusStripAtrasado: { backgroundColor: C.redBg },
  statusStripEmDia:    { backgroundColor: '#ECECEF' },
  statusStripText:    { fontSize: fontSize['sm+'], fontFamily: fonts.bold },

  // ── Loan cards ─────────────────────────────────────────────────────────
  loanCard: {
    marginHorizontal: spacing[4],
    marginBottom: 12,
    backgroundColor: C.card,
    borderRadius: radii.card,
    padding: 20,
  },
  loanCardAtrasado: { borderWidth: 1.5, borderColor: 'rgba(192,57,43,0.28)' },

  loanTopRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  loanValue:   { fontFamily: fonts.display, fontSize: 22, color: C.ink, letterSpacing: -0.3, marginBottom: 3 },
  loanLabel:   { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },

  loanBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full },
  loanBadgeAtivo:    { backgroundColor: '#ECECEF' },
  loanBadgeAtrasado: { backgroundColor: C.redBg },
  loanBadgeText:     { fontSize: 11.5, fontFamily: fonts.bold },

  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLeft:  { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  progressRight: { fontFamily: fonts.display, fontSize: fontSize['sm+'], color: C.inkSoft },

  progressTrack: { height: 14, borderRadius: radii.full, backgroundColor: C.line, overflow: 'hidden', marginBottom: 9 },
  progressFill:  { height: '100%', borderRadius: radii.full },

  loanMeta: { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginBottom: 18 },

  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 18, marginBottom: 18, gap: 16 },
  detailCell:  { width: '45%' },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: fonts.semibold, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },

  payBtn:     { width: '100%', paddingVertical: 14, borderRadius: radii.md, alignItems: 'center' },
  payBtnText: { fontSize: fontSize.base, fontFamily: fonts.bold, color: '#fff' },
});
