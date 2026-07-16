import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#ECECEF',
  red: '#C0392B',
  redBg: '#FBEAE8',
};

const W = Dimensions.get('window').width;

function formatBRL(v: number) {
  return Math.round(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const MOCK_OFERTAS = [
  {
    id: 1, valor: 900, taxaRetorno: 18, prazoDias: 45, ciclo: 'Semanal',
    risco: 'Médio', tomadorScore: 'B', valorTotalPedido: 5000, jaCaptado: 3100,
    numCredores: 14, emprestimosAnteriores: 3, valorTotalTomado: 12400,
  },
  {
    id: 2, valor: 2000, taxaRetorno: 22, prazoDias: 90, ciclo: 'Mensal',
    risco: 'Alto', tomadorScore: 'C', valorTotalPedido: 12000, jaCaptado: 4200,
    numCredores: 8, emprestimosAnteriores: 1, valorTotalTomado: 3000,
  },
  {
    id: 3, valor: 300, taxaRetorno: 10, prazoDias: 15, ciclo: 'Diário',
    risco: 'Baixo', tomadorScore: 'A', valorTotalPedido: 2500, jaCaptado: 2100,
    numCredores: 22, emprestimosAnteriores: 6, valorTotalTomado: 28500,
  },
];

const TOTAL_SECONDS = 30;

function OfertaBottomSheet({
  oferta,
  onClose,
}: {
  oferta: typeof MOCK_OFERTAS[0];
  onClose: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | 'expired'>('pending');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setSecondsLeft(TOTAL_SECONDS);
    setStatus('pending');
  }, [oferta.id]);

  useEffect(() => {
    if (status !== 'pending') return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setStatus('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [status]);

  const isUrgent = secondsLeft <= 10;
  const pctTempo = (secondsLeft / TOTAL_SECONDS) * 100;
  const pctCaptado = Math.round((oferta.jaCaptado / oferta.valorTotalPedido) * 100);
  const pctOferta = Math.round((oferta.valor / oferta.valorTotalPedido) * 100);
  const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);
  const retornoValor = Math.round(oferta.valor * (oferta.taxaRetorno / 100));
  const numeroDoEmprestimo = oferta.emprestimosAnteriores + 1;

  const botPad = Platform.OS === 'web' ? 28 : insets.bottom > 0 ? insets.bottom + 12 : 28;

  const handleAccept = () => {
    clearInterval(intervalRef.current!);
    setStatus('accepted');
  };
  const handleDecline = () => {
    clearInterval(intervalRef.current!);
    setStatus('declined');
  };

  return (
    <View style={[bss.sheet, { paddingBottom: botPad }]}>
      {/* Grabber */}
      <View style={bss.grabber} />

      {status === 'pending' && (
        <>
          <View style={bss.timerRow}>
            <View style={bss.timerLabel}>
              <Feather name="clock" size={14} color={C.inkSoft} />
              <Text style={bss.timerLabelText}>Nova solicitação de investimento</Text>
            </View>
            <Text style={[bss.timerValue, { color: isUrgent ? C.red : C.ink }]}>{secondsLeft}s</Text>
          </View>

          <View style={bss.timerTrack}>
            <View
              style={[
                bss.timerFill,
                { width: `${pctTempo}%` as any, backgroundColor: isUrgent ? C.red : C.dark },
              ]}
            />
          </View>

          <Text style={bss.eyebrow}>Retorno oferecido</Text>
          <Text style={bss.heroValue}><Text style={bss.heroSign}>+</Text>{oferta.taxaRetorno}%</Text>
          <Text style={bss.heroCaption}>
            Rendimento de R$ {formatBRL(retornoValor)} em {oferta.prazoDias} dias
          </Text>

          <View style={bss.splitRow}>
            <View>
              <Text style={bss.splitLabel}>Investimento</Text>
              <Text style={bss.splitValue}>R$ {formatBRL(oferta.valor)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={bss.splitLabel}>Retorno</Text>
              <Text style={bss.splitValue}>R$ {formatBRL(oferta.valor + retornoValor)}</Text>
            </View>
          </View>

          {/* Pool */}
          <Text style={bss.poolLabel}>Captação do pedido</Text>
          <View style={bss.poolTopRow}>
            <Text style={bss.poolPercent}>{pctCaptado}% captado</Text>
            <Text style={bss.poolValue}>R$ {formatBRL(oferta.jaCaptado)} de R$ {formatBRL(oferta.valorTotalPedido)}</Text>
          </View>
          <View style={bss.poolTrack}>
            <View style={[bss.poolSegDark, { width: `${pctCaptado}%` as any }]} />
            <View style={[bss.poolSegStripe, { width: `${pctOfertaClamped}%` as any }]} />
          </View>

          <View style={bss.detailsGrid}>
            <View style={bss.detailBlock}>
              <Text style={bss.detailLabel}>Prazo</Text>
              <Text style={bss.detailValue}>{oferta.prazoDias} dias</Text>
              <Text style={bss.detailSub}>parcelas {oferta.ciclo.toLowerCase()}s</Text>
            </View>
            <View style={bss.detailBlock}>
              <Text style={bss.detailLabel}>Risco</Text>
              <Text style={bss.detailValue}>{oferta.risco}</Text>
              <Text style={bss.detailSub}>score {oferta.tomadorScore}</Text>
            </View>
            <View style={bss.detailBlock}>
              <Text style={bss.detailLabel}>Histórico</Text>
              <Text style={bss.detailValue}>
                {oferta.emprestimosAnteriores === 0 ? 'Primeiro' : `${numeroDoEmprestimo}º empréstimo`}
              </Text>
            </View>
            <View style={bss.detailBlock}>
              <Text style={bss.detailLabel}>Já tomado</Text>
              <Text style={bss.detailValue}>
                {oferta.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(oferta.valorTotalTomado)}`}
              </Text>
            </View>
          </View>

          <View style={bss.btnRow}>
            <TouchableOpacity style={bss.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
              <Feather name="x" size={18} color={C.ink} />
              <Text style={bss.declineBtnText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bss.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
              <Feather name="check" size={18} color="#fff" />
              <Text style={bss.acceptBtnText}>Aceitar oferta</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {status === 'accepted' && (
        <View style={bss.resultWrap}>
          <View style={[bss.resultIcon, { backgroundColor: C.dark }]}>
            <Feather name="check" size={26} color="#fff" />
          </View>
          <Text style={bss.resultTitle}>Oferta aceita</Text>
          <Text style={bss.resultSub}>
            R$ {formatBRL(oferta.valor)} reservados para esse pedido.{'\n'}
            Você recebe a confirmação assim que a captação fechar.
          </Text>
          <TouchableOpacity style={bss.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={bss.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'declined' && (
        <View style={bss.resultWrap}>
          <View style={[bss.resultIcon, { backgroundColor: C.chipBg }]}>
            <Feather name="x" size={26} color={C.inkSoft} />
          </View>
          <Text style={bss.resultTitle}>Oferta recusada</Text>
          <Text style={bss.resultSub}>Sem problema. Vamos te avisar quando surgir outra oportunidade.</Text>
          <TouchableOpacity style={bss.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={bss.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'expired' && (
        <View style={bss.resultWrap}>
          <View style={[bss.resultIcon, { backgroundColor: C.redBg }]}>
            <Feather name="clock" size={24} color={C.red} />
          </View>
          <Text style={bss.resultTitle}>Tempo esgotado</Text>
          <Text style={bss.resultSub}>Essa oferta foi repassada para outro credor.{'\n'}Fique de olho na próxima.</Text>
          <TouchableOpacity style={bss.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={bss.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function OfertasScreen() {
  const [selectedOferta, setSelectedOferta] = useState<typeof MOCK_OFERTAS[0] | null>(null);
  const saldoConta = 8500;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Oportunidades</Text>
        <Text style={styles.subtitle}>Empréstimos disponíveis para você investir</Text>
      </View>

      <View style={styles.saldoChip}>
        <Text style={styles.saldoText}>Saldo disponível · R$ {formatBRL(saldoConta)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {MOCK_OFERTAS.map((o) => {
          const percentCaptado = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
          const restante = o.valorTotalPedido - o.jaCaptado;
          const retorno = Math.round(o.valor * (o.taxaRetorno / 100));

          return (
            <View key={o.id} style={styles.ofertaCard}>
              <Text style={styles.eyebrow}>RETORNO ESTIMADO</Text>
              <Text style={styles.retornoValue}>
                <Text style={styles.retornoSign}>+</Text>{o.taxaRetorno}%
              </Text>
              <Text style={styles.caption}>em {o.prazoDias} dias · ciclo {o.ciclo.toLowerCase()}</Text>

              <View style={styles.splitRow}>
                <View>
                  <Text style={styles.splitLabel}>VALOR PEDIDO</Text>
                  <Text style={styles.splitValue}>R$ {formatBRL(o.valorTotalPedido)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.splitLabel}>DISPONÍVEL</Text>
                  <Text style={styles.splitValue}>R$ {formatBRL(restante)}</Text>
                </View>
              </View>

              <View style={styles.poolTopRow}>
                <Text style={styles.poolLabel}>CAPTAÇÃO</Text>
                <Text style={styles.poolValueText}>R$ {formatBRL(o.jaCaptado)} de R$ {formatBRL(o.valorTotalPedido)}</Text>
              </View>
              <View style={styles.poolTrack}>
                <View style={[styles.poolFill, { width: `${percentCaptado}%` as any }]} />
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>RISCO</Text>
                  <Text style={styles.detailValue}>{o.risco}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>SCORE</Text>
                  <Text style={styles.detailValue}>{o.tomadorScore}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>CREDORES</Text>
                  <Text style={styles.detailValue}>{o.numCredores}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>SUA OFERTA</Text>
                  <Text style={styles.detailValue}>R$ {formatBRL(o.valor)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.investBtn}
                activeOpacity={0.85}
                onPress={() => setSelectedOferta(o)}
              >
                <Feather name="arrow-up-right" size={16} color="#fff" />
                <Text style={styles.investBtnText}>Investir nessa oferta</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={selectedOferta !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOferta(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedOferta(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {selectedOferta && (
              <OfertaBottomSheet
                oferta={selectedOferta}
                onClose={() => setSelectedOferta(null)}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  subtitle: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 14 },
  saldoChip: { marginHorizontal: 20, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: C.chipBg },
  saldoText: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_600SemiBold' },

  ofertaCard: { borderRadius: 22, marginHorizontal: 16, marginTop: 14, padding: 20, backgroundColor: C.card },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  retornoValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 44, color: C.ink, letterSpacing: -1.1, lineHeight: 48, marginBottom: 8 },
  retornoSign: { fontSize: 24, fontFamily: 'SpaceGrotesk_700Bold' },
  caption: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 18 },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  splitLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, marginBottom: 4 },
  splitValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  poolLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.2 },
  poolValueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 18 },
  poolFill: { height: '100%', backgroundColor: C.ink },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 18, marginBottom: 18, rowGap: 16, columnGap: 12 },
  detailBlock: { width: '46%' },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  investBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: 16, backgroundColor: C.dark },
  investBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(21,21,29,0.44)',
    justifyContent: 'flex-end',
  },
});

const bss = StyleSheet.create({
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  grabber: { width: 36, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: 'center', marginBottom: 20 },

  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  timerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLabelText: { fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },
  timerValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13 },
  timerTrack: { width: '100%', height: 4, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 22 },
  timerFill: { height: '100%', borderRadius: 999 },

  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  heroValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 46, color: C.ink, letterSpacing: -1.2, lineHeight: 50 },
  heroSign: { fontSize: 26, fontFamily: 'SpaceGrotesk_700Bold' },
  heroCaption: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 18, marginTop: 4 },

  splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  splitLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 },
  splitValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3 },

  poolLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 6 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  poolPercent: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: C.ink },
  poolValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 9, flexDirection: 'row' },
  poolSegDark: { height: '100%', backgroundColor: C.ink },
  poolSegStripe: { height: '100%', backgroundColor: C.inkFaint },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 18, marginBottom: 22, rowGap: 16, columnGap: 12 },
  detailBlock: { width: '46%' },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  detailSub: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_400Regular', marginTop: 2 },

  btnRow: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16, backgroundColor: C.chipBg,
  },
  declineBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.ink },
  acceptBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16, backgroundColor: C.dark,
  },
  acceptBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },

  resultWrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 10 },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 19, color: C.ink, marginBottom: 8 },
  resultSub: { fontSize: 14, color: C.inkSoft, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  closeBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: C.chipBg },
  closeBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.ink },
});
