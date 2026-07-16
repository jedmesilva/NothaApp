import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipUrgent: '#ECECEF',
  red: '#C0392B',
  redBg: '#FBEAE8',
  amber: '#A6690A',
  amberBg: '#FCF1DC',
};

const W = Dimensions.get('window').width;

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function formatData(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

const CICLO_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensal: 30 };

const emprestimosAtivos = [
  { id: 1, valor: 8500, taxaJurosTotal: 20, prazoDias: 60, ciclo: 'mensal', parcelasTotal: 2, parcelasPagas: 0, diasDesdeConcessao: 36, status: 'atrasado' },
  { id: 2, valor: 3200, taxaJurosTotal: 12, prazoDias: 90, ciclo: 'semanal', parcelasTotal: 13, parcelasPagas: 6, diasDesdeConcessao: 42, status: 'ativo' },
];

const extrato = [
  { id: 1, desc: 'Depósito via Pix', data: '10 de julho', valor: 500, tipo: 'entrada' },
  { id: 2, desc: 'Pagamento de parcela', data: '05 de julho', valor: -331, tipo: 'saida' },
  { id: 3, desc: 'Saque', data: '28 de junho', valor: -300, tipo: 'saida' },
  { id: 4, desc: 'Empréstimo liberado', data: '20 de junho', valor: 3200, tipo: 'entrada' },
];

const ofertas = [
  { id: 3, valorTotalPedido: 5000, taxaJurosTotal: 18, prazoDias: 45, ciclo: 'semanal', jaCaptado: 3100, valorOferta: 900, numCredores: 14, risco: 'Médio', tomadorScore: 'B' },
  { id: 6, valorTotalPedido: 12000, taxaJurosTotal: 22, prazoDias: 90, ciclo: 'mensal', jaCaptado: 4200, valorOferta: 2000, numCredores: 8, risco: 'Alto', tomadorScore: 'C' },
  { id: 7, valorTotalPedido: 2500, taxaJurosTotal: 10, prazoDias: 15, ciclo: 'diario', jaCaptado: 2100, valorOferta: 300, numCredores: 22, risco: 'Baixo', tomadorScore: 'A' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'credito' | 'investir'>('credito');
  const [showConta, setShowConta] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = 100;

  const limiteTotal = 10000;
  const limiteDisponivel = 1500;
  const limiteUsado = limiteTotal - limiteDisponivel;
  const percentUsado = Math.round((limiteUsado / limiteTotal) * 100);
  const saldoConta = 8500;

  const hoje = new Date();

  const proximasParcelas = emprestimosAtivos.map((loan) => {
    const cicloDias = CICLO_DIAS[loan.ciclo];
    const totalAPagar = loan.valor * (1 + loan.taxaJurosTotal / 100);
    const valorParcela = totalAPagar / loan.parcelasTotal;
    const saldoDevedor = (loan.parcelasTotal - loan.parcelasPagas) * valorParcela;
    const dataConcessao = addDays(hoje, -loan.diasDesdeConcessao);
    const dataProxima = addDays(dataConcessao, (loan.parcelasPagas + 1) * cicloDias);
    const diasParaVencer = Math.round((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const estado = diasParaVencer < 0 ? 'vencida' : diasParaVencer <= 5 ? 'proxima' : 'futura';
    return { loanId: loan.id, loanValor: loan.valor, valorParcela, saldoDevedor, parcelasRestantes: loan.parcelasTotal - loan.parcelasPagas, data: dataProxima, estado };
  }).sort((a, b) => a.data.getTime() - b.data.getTime());

  const divida = {
    totalEmAberto: proximasParcelas.reduce((s, p) => s + p.saldoDevedor, 0),
    parcelasRestantes: proximasParcelas.reduce((s, p) => s + p.parcelasRestantes, 0),
  };

  const hour = hoje.getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const goToTab = (tab: 'credito' | 'investir') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ x: tab === 'credito' ? 0 : W, animated: true });
  };

  const handleSwipeScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const index = Math.round(x / W);
      setActiveTab(index === 0 ? 'credito' : 'investir');
    }, 100);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatar} onPress={() => setShowConta(true)} activeOpacity={0.8}>
          <Text style={styles.avatarText}>R</Text>
        </TouchableOpacity>

        <View style={styles.tabWrap}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'credito' && styles.tabBtnActive]}
            onPress={() => goToTab('credito')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, { color: activeTab === 'credito' ? '#fff' : C.inkSoft }]}>Crédito</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'investir' && styles.tabBtnActive]}
            onPress={() => goToTab('investir')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, { color: activeTab === 'investir' ? '#fff' : C.inkSoft }]}>Investir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bellWrap}>
          <Ionicons name="notifications-outline" size={19} color={C.ink} />
          <View style={styles.notifDot} />
        </View>
      </View>

      {/* Swipeable pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleSwipeScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: W * 2 }}
      >
        {/* Page 1 — Crédito */}
        <ScrollView style={{ width: W }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          <Text style={styles.greeting}>{saudacao}, <Text style={styles.greetingName}>Rafael</Text></Text>

          {/* Limit card */}
          <View style={styles.primaryCard}>
            <Text style={styles.eyebrow}>Limite disponível</Text>
            <Text style={styles.bigValue}>R$ {formatBRL(limiteDisponivel)}</Text>
            <Text style={styles.totalText}>de R$ {formatBRL(limiteTotal)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percentUsado}%` as any }]} />
            </View>
            <View style={styles.progressCaption}>
              <Text style={styles.progressCaptionText}>R$ {formatBRL(limiteUsado)} utilizados</Text>
              <Text style={styles.progressCaptionText}>{percentUsado}%</Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, limiteDisponivel <= 0 && styles.primaryBtnDisabled]}
              disabled={limiteDisponivel <= 0}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, limiteDisponivel <= 0 && styles.primaryBtnTextDisabled]}>
                {limiteDisponivel > 0 ? 'Solicitar empréstimo' : 'Limite esgotado'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance card */}
          <View style={styles.secondaryCard}>
            <Text style={styles.eyebrowLight}>Saldo em conta</Text>
            <Text style={styles.secondaryValue}>R$ {formatBRL(saldoConta)}</Text>
            <Text style={styles.helperText}>Disponível para usar</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                <Feather name="arrow-down" size={17} color={C.ink} />
                <Text style={styles.actionBtnText}>Sacar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                <Feather name="plus" size={17} color={C.ink} />
                <Text style={styles.actionBtnText}>Depositar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vencimentos card */}
          <View style={[styles.secondaryCard, { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>Vencimentos</Text>
            <Text style={styles.vencSummary}>R$ {formatBRL(Math.round(divida.totalEmAberto))} em aberto · {divida.parcelasRestantes} parcelas</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Em atraso</Text>
                <Text style={styles.statValue}>{proximasParcelas.filter(p => p.estado === 'vencida').length}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Próximas (5 dias)</Text>
                <Text style={styles.statValue}>{proximasParcelas.filter(p => p.estado === 'proxima').length}</Text>
              </View>
            </View>

            {proximasParcelas.map((p) => {
              const isVencida = p.estado === 'vencida';
              const isProxima = p.estado === 'proxima';
              return (
                <View
                  key={p.loanId}
                  style={[
                    styles.parcelaRow,
                    isVencida && styles.parcelaRowVencida,
                    isProxima && styles.parcelaRowProxima,
                    !isVencida && !isProxima && styles.parcelaRowFutura,
                  ]}
                >
                  <View style={styles.installIcon}>
                    <Feather name="calendar" size={16} color={isVencida ? C.red : isProxima ? C.amber : C.inkSoft} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.installLoanTag}>Empréstimo #{p.loanId}</Text>
                    <Text style={[styles.installLabel, isVencida && { color: C.red, fontFamily: 'Inter_700Bold' }, isProxima && { color: C.amber, fontFamily: 'Inter_700Bold' }]}>
                      {isVencida ? 'Vencida' : isProxima ? 'Vence em breve' : `Vence ${formatData(p.data)}`}
                    </Text>
                    <Text style={styles.installValue}>R$ {formatBRL(Math.round(p.valorParcela))}</Text>
                  </View>
                  <TouchableOpacity style={styles.payBtn} activeOpacity={0.8} onPress={() => router.push('/emprestimos' as any)}>
                    <Text style={styles.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity style={styles.seeAllLink} onPress={() => router.push('/emprestimos' as any)} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Ver todos os empréstimos</Text>
              <Feather name="chevron-right" size={13} color={C.inkSoft} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Page 2 — Investir */}
        <ScrollView style={{ width: W }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          <View style={styles.ofertasHeader}>
            <Text style={styles.ofertasTitle}>Oportunidades</Text>
            <Text style={styles.ofertasSubtitle}>Empréstimos disponíveis para você investir</Text>
          </View>

          <View style={styles.saldoChip}>
            <Text style={styles.saldoChipText}>Saldo disponível · R$ {formatBRL(saldoConta)}</Text>
          </View>

          {ofertas.map((o) => {
            const percentCaptado = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
            const restante = o.valorTotalPedido - o.jaCaptado;
            return (
              <View key={o.id} style={styles.ofertaCard}>
                <Text style={styles.ofertaEyebrow}>RETORNO ESTIMADO</Text>
                <Text style={styles.ofertaRetorno}><Text style={styles.ofertaRetornoSign}>+</Text>{o.taxaJurosTotal}%</Text>
                <Text style={styles.ofertaCaption}>em {o.prazoDias} dias · ciclo {o.ciclo}</Text>

                <View style={styles.ofertaSplitRow}>
                  <View>
                    <Text style={styles.ofertaSplitLabel}>VALOR PEDIDO</Text>
                    <Text style={styles.ofertaSplitValue}>R$ {formatBRL(o.valorTotalPedido)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.ofertaSplitLabel}>DISPONÍVEL</Text>
                    <Text style={styles.ofertaSplitValue}>R$ {formatBRL(restante)}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.poolTopRow}>
                  <Text style={styles.poolLabel}>CAPTAÇÃO</Text>
                  <Text style={styles.poolValue}>R$ {formatBRL(o.jaCaptado)} de R$ {formatBRL(o.valorTotalPedido)}</Text>
                </View>
                <View style={styles.poolTrack}>
                  <View style={[styles.poolFill, { width: `${percentCaptado}%` as any }]} />
                </View>

                <View style={styles.ofertaGrid}>
                  <View>
                    <Text style={styles.detailLabel}>RISCO</Text>
                    <Text style={styles.detailValue}>{o.risco}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>SCORE TOMADOR</Text>
                    <Text style={styles.detailValue}>{o.tomadorScore}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>CREDORES</Text>
                    <Text style={styles.detailValue}>{o.numCredores}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>SUA OFERTA</Text>
                    <Text style={styles.detailValue}>R$ {formatBRL(o.valorOferta)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.ofertaBtn} activeOpacity={0.85}>
                  <Feather name="arrow-up-right" size={16} color="#fff" />
                  <Text style={styles.ofertaBtnText}>Investir nessa oferta</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>

      {/* Conta Modal */}
      <Modal visible={showConta} animationType="slide" onRequestClose={() => setShowConta(false)}>
        <View style={[styles.contaScreen, { paddingTop: topPad }]}>
          <View style={styles.contaHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowConta(false)} activeOpacity={0.8}>
              <Feather name="arrow-left" size={18} color={C.ink} />
            </TouchableOpacity>
            <Text style={styles.contaTitle}>Minha Conta</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.primaryCard}>
              <Text style={styles.eyebrow}>Saldo em conta</Text>
              <Text style={[styles.bigValue, { marginBottom: 8 }]}>R$ {formatBRL(saldoConta)}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtnDark} activeOpacity={0.8}>
                  <Feather name="arrow-down" size={16} color="#fff" />
                  <Text style={styles.actionBtnDarkText}>Sacar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnDark} activeOpacity={0.8}>
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={styles.actionBtnDarkText}>Depositar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.secondaryCard, { margin: 16 }]}>
              <Text style={styles.sectionTitle}>Extrato</Text>
              {extrato.map((item, idx) => (
                <View key={item.id} style={[styles.extratoRow, idx === extrato.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
                  <View style={styles.extratoIcon}>
                    <Feather name={item.tipo === 'entrada' ? 'arrow-down' : 'arrow-up'} size={15} color={C.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.extratoDesc}>{item.desc}</Text>
                    <Text style={styles.extratoData}>{item.data}</Text>
                  </View>
                  <Text style={[styles.extratoValor, { color: item.tipo === 'entrada' ? C.ink : C.inkSoft }]}>
                    {item.tipo === 'entrada' ? '+' : '−'} R$ {formatBRL(Math.abs(item.valor))}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16 },
  tabWrap: { flex: 1, flexDirection: 'row', backgroundColor: C.card, borderRadius: 999, padding: 4, marginHorizontal: 14, maxWidth: 240 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  tabBtnActive: { backgroundColor: C.dark },
  tabLabel: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold' },
  bellWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: C.ink, borderWidth: 1.5, borderColor: C.card },
  greeting: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, fontSize: 15, color: C.inkSoft, fontFamily: 'Inter_400Regular' },
  greetingName: { color: C.ink, fontFamily: 'Inter_700Bold' },
  primaryCard: { borderRadius: 28, marginHorizontal: 16, marginBottom: 14, padding: 24, backgroundColor: C.dark },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  bigValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 42, color: '#fff', letterSpacing: -1, lineHeight: 48 },
  totalText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium', marginBottom: 16, marginTop: 6 },
  progressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  progressCaption: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, marginBottom: 22 },
  progressCaptionText: { fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter_400Regular' },
  primaryBtn: { width: '100%', paddingVertical: 17, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center' },
  primaryBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  primaryBtnText: { fontSize: 15.5, fontFamily: 'Inter_700Bold', color: C.dark, letterSpacing: 0.1 },
  primaryBtnTextDisabled: { color: 'rgba(255,255,255,0.35)' },
  secondaryCard: { borderRadius: 24, marginHorizontal: 16, padding: 22, backgroundColor: C.card },
  eyebrowLight: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: C.inkFaint, marginBottom: 10 },
  secondaryValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: C.ink, letterSpacing: -0.5, marginTop: 2 },
  helperText: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginTop: 4, marginBottom: 18 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: C.bg },
  actionBtnText: { fontSize: 14.5, fontFamily: 'Inter_600SemiBold', color: C.ink },
  actionBtnDark: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  actionBtnDarkText: { fontSize: 14.5, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: C.ink, marginBottom: 4 },
  vencSummary: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statBlock: { flex: 1 },
  statDivider: { width: 1, height: 34, backgroundColor: C.line, marginHorizontal: 18 },
  statLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3 },
  parcelaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 16, marginBottom: 10 },
  parcelaRowVencida: { backgroundColor: C.redBg, borderWidth: 1.5, borderColor: C.red },
  parcelaRowProxima: { backgroundColor: C.amberBg },
  parcelaRowFutura: { backgroundColor: C.bg },
  installIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  installLoanTag: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.inkFaint, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 3 },
  installLabel: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  installValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: C.ink },
  payBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: C.ink },
  payBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#fff' },
  seeAllLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 4, paddingBottom: 4 },
  seeAllText: { fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },
  // Investir
  ofertasHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 },
  ofertasTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  ofertasSubtitle: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular' },
  saldoChip: { marginHorizontal: 20, marginTop: 14, marginBottom: 4, padding: 10, borderRadius: 12, backgroundColor: C.chipUrgent },
  saldoChipText: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_600SemiBold' },
  ofertaCard: { borderRadius: 22, marginHorizontal: 16, marginTop: 14, padding: 20, backgroundColor: C.card },
  ofertaEyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  ofertaRetorno: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 44, color: C.ink, letterSpacing: -1.1, lineHeight: 48, marginBottom: 8 },
  ofertaRetornoSign: { fontSize: 24, fontFamily: 'SpaceGrotesk_700Bold' },
  ofertaCaption: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 18 },
  ofertaSplitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  ofertaSplitLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 },
  ofertaSplitValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  poolLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.2 },
  poolValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 18 },
  poolFill: { height: '100%', backgroundColor: C.ink },
  ofertaGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 18, marginBottom: 18, rowGap: 16, columnGap: 12 },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  ofertaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: 16, backgroundColor: C.dark },
  ofertaBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
  // Conta
  contaScreen: { flex: 1, backgroundColor: C.bg },
  contaHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  contaTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: C.ink, letterSpacing: -0.2 },
  extratoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  extratoIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.chipUrgent, alignItems: 'center', justifyContent: 'center' },
  extratoDesc: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold', color: C.ink, marginBottom: 2 },
  extratoData: { fontSize: 12, color: C.inkFaint, fontFamily: 'Inter_400Regular' },
  extratoValor: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14.5 },
});
