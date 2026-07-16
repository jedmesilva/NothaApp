import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatBRL } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ListCard, PoolBar, SplitRow, DarkButton, DetailGrid, ModalSheet } from '@/components/ds';

const MOCK_OFERTAS = [
  { id: 1, valor: 900,  taxaRetorno: 18, prazoDias: 45, ciclo: 'Semanal', risco: 'Médio', tomadorScore: 'B', valorTotalPedido: 5000,  jaCaptado: 3100, numCredores: 14, emprestimosAnteriores: 3, valorTotalTomado: 12400 },
  { id: 2, valor: 2000, taxaRetorno: 22, prazoDias: 90, ciclo: 'Mensal',  risco: 'Alto',  tomadorScore: 'C', valorTotalPedido: 12000, jaCaptado: 4200, numCredores: 8,  emprestimosAnteriores: 1, valorTotalTomado: 3000 },
  { id: 3, valor: 300,  taxaRetorno: 10, prazoDias: 15, ciclo: 'Diário',  risco: 'Baixo', tomadorScore: 'A', valorTotalPedido: 2500,  jaCaptado: 2100, numCredores: 22, emprestimosAnteriores: 6, valorTotalTomado: 28500 },
];

const TOTAL_SECONDS = 30;

// ---------------------------------------------------------------------------
// Offer bottom-sheet content
// ---------------------------------------------------------------------------
function OfertaSheet({ oferta, onClose }: { oferta: typeof MOCK_OFERTAS[0]; onClose: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [status, setStatus]           = useState<'pending' | 'accepted' | 'declined' | 'expired'>('pending');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSecondsLeft(TOTAL_SECONDS); setStatus('pending'); }, [oferta.id]);

  useEffect(() => {
    if (status !== 'pending') return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(intervalRef.current!); setStatus('expired'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [status]);

  const isUrgent       = secondsLeft <= 10;
  const pctTempo       = (secondsLeft / TOTAL_SECONDS) * 100;
  const pctCaptado     = Math.round((oferta.jaCaptado / oferta.valorTotalPedido) * 100);
  const pctOferta      = Math.round((oferta.valor / oferta.valorTotalPedido) * 100);
  const pctOfertaClamped = Math.min(pctOferta, 100 - pctCaptado);
  const retornoValor   = Math.round(oferta.valor * (oferta.taxaRetorno / 100));
  const numeroDoEmprestimo = oferta.emprestimosAnteriores + 1;

  const handleAccept  = () => { clearInterval(intervalRef.current!); setStatus('accepted'); };
  const handleDecline = () => { clearInterval(intervalRef.current!); setStatus('declined'); };

  if (status === 'accepted' || status === 'declined' || status === 'expired') {
    const resultMap = {
      accepted: { icon: 'check',  bg: C.dark,   iconColor: '#fff',   title: 'Oferta aceita',    sub: `R$ ${formatBRL(oferta.valor)} reservados para esse pedido.\nVocê recebe a confirmação assim que a captação fechar.` },
      declined: { icon: 'x',      bg: C.chipUrgent, iconColor: C.inkSoft, title: 'Oferta recusada', sub: 'Sem problema. Vamos te avisar quando surgir outra oportunidade.' },
      expired:  { icon: 'clock',  bg: C.redBg,  iconColor: C.red,    title: 'Tempo esgotado',   sub: `Essa oferta foi repassada para outro credor.\nFique de olho na próxima.` },
    } as const;
    const r = resultMap[status];
    return (
      <View style={bs.resultWrap}>
        <View style={[bs.resultIcon, { backgroundColor: r.bg }]}>
          <Feather name={r.icon as any} size={26} color={r.iconColor} />
        </View>
        <Text style={bs.resultTitle}>{r.title}</Text>
        <Text style={bs.resultSub}>{r.sub}</Text>
        <TouchableOpacity style={bs.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={bs.closeBtnText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* Timer */}
      <View style={bs.timerRow}>
        <View style={bs.timerLabel}>
          <Feather name="clock" size={14} color={C.inkSoft} />
          <Text style={bs.timerLabelText}>Nova solicitação de investimento</Text>
        </View>
        <Text style={[bs.timerValue, { color: isUrgent ? C.red : C.ink }]}>{secondsLeft}s</Text>
      </View>
      <View style={bs.timerTrack}>
        <View style={[bs.timerFill, { width: `${pctTempo}%` as any, backgroundColor: isUrgent ? C.red : C.dark }]} />
      </View>

      <Text style={bs.eyebrow}>Retorno oferecido</Text>
      <Text style={bs.heroValue}><Text style={bs.heroSign}>+</Text>{oferta.taxaRetorno}%</Text>
      <Text style={bs.heroCaption}>Rendimento de R$ {formatBRL(retornoValor)} em {oferta.prazoDias} dias</Text>

      <SplitRow
        left={{ label: 'Investimento', value: `R$ ${formatBRL(oferta.valor)}` }}
        right={{ label: 'Retorno', value: `R$ ${formatBRL(oferta.valor + retornoValor)}` }}
      />

      <PoolBar
        label="Captação do pedido"
        headLeft={`${pctCaptado}% captado`}
        headRight={`R$ ${formatBRL(oferta.jaCaptado)} de R$ ${formatBRL(oferta.valorTotalPedido)}`}
        segments={[
          { pct: pctCaptado,       variant: 'primary' },
          { pct: pctOfertaClamped, variant: 'secondary' },
        ]}
        style={{ marginBottom: 18 }}
      />

      <DetailGrid
        items={[
          { label: 'Prazo',    value: `${oferta.prazoDias} dias`, sub: `parcelas ${oferta.ciclo.toLowerCase()}s` },
          { label: 'Risco',    value: oferta.risco,               sub: `score ${oferta.tomadorScore}` },
          { label: 'Histórico', value: oferta.emprestimosAnteriores === 0 ? 'Primeiro' : `${numeroDoEmprestimo}º empréstimo` },
          { label: 'Já tomado', value: oferta.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(oferta.valorTotalTomado)}` },
        ]}
        style={{ marginBottom: 22 }}
      />

      <View style={bs.btnRow}>
        <TouchableOpacity style={bs.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
          <Feather name="x" size={18} color={C.ink} />
          <Text style={bs.declineBtnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={bs.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={bs.acceptBtnText}>Aceitar oferta</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function OfertasScreen() {
  const [selectedOferta, setSelectedOferta] = useState<typeof MOCK_OFERTAS[0] | null>(null);
  const saldoConta = 8500;

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Oportunidades</Text>
        <Text style={s.subtitle}>Empréstimos disponíveis para você investir</Text>
      </View>

      <View style={s.saldoChip}>
        <Text style={s.saldoText}>Saldo disponível · R$ {formatBRL(saldoConta)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {MOCK_OFERTAS.map((o) => {
          const percentCaptado = Math.round((o.jaCaptado / o.valorTotalPedido) * 100);
          const restante       = o.valorTotalPedido - o.jaCaptado;

          return (
            <ListCard key={o.id}>
              <Text style={s.eyebrow}>RETORNO ESTIMADO</Text>
              <Text style={s.retornoValue}><Text style={s.retornoSign}>+</Text>{o.taxaRetorno}%</Text>
              <Text style={s.caption}>em {o.prazoDias} dias · ciclo {o.ciclo.toLowerCase()}</Text>

              <SplitRow
                left={{ label: 'VALOR PEDIDO', value: `R$ ${formatBRL(o.valorTotalPedido)}` }}
                right={{ label: 'DISPONÍVEL',  value: `R$ ${formatBRL(restante)}` }}
              />

              <PoolBar
                label="CAPTAÇÃO"
                headLeft={`R$ ${formatBRL(o.jaCaptado)} de R$ ${formatBRL(o.valorTotalPedido)}`}
                segments={[{ pct: percentCaptado, variant: 'primary' }]}
                style={{ marginBottom: 18 }}
              />

              <DetailGrid
                items={[
                  { label: 'RISCO',      value: o.risco },
                  { label: 'SCORE',      value: o.tomadorScore },
                  { label: 'CREDORES',   value: String(o.numCredores) },
                  { label: 'SUA OFERTA', value: `R$ ${formatBRL(o.valor)}` },
                ]}
                style={{ marginBottom: 18 }}
              />

              <DarkButton
                label="Investir nessa oferta"
                icon="arrow-up-right"
                onPress={() => setSelectedOferta(o)}
              />
            </ListCard>
          );
        })}
      </ScrollView>

      <ModalSheet visible={selectedOferta !== null} onClose={() => setSelectedOferta(null)}>
        {selectedOferta && <OfertaSheet oferta={selectedOferta} onClose={() => setSelectedOferta(null)} />}
      </ModalSheet>
    </View>
  );
}

const C_chipBg = C.chipUrgent; // alias

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: C.bg },
  header:    { paddingHorizontal: spacing[5], paddingTop: 6, paddingBottom: 4 },
  title:     { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  subtitle:  { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 14 },
  saldoChip: { marginHorizontal: spacing[5], marginBottom: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md, backgroundColor: C.chipUrgent },
  saldoText: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.semibold },
  eyebrow:      { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  retornoValue: { fontFamily: fonts.display, fontSize: fontSize.mega, color: C.ink, letterSpacing: -1.1, lineHeight: 48, marginBottom: 8 },
  retornoSign:  { fontSize: 24, fontFamily: fonts.display },
  caption:      { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18 },
});

const bs = StyleSheet.create({
  timerRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  timerLabel:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLabelText:{ fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  timerValue:    { fontFamily: fonts.display, fontSize: fontSize.base },
  timerTrack:    { width: '100%', height: 4, borderRadius: radii.full, backgroundColor: C.line, overflow: 'hidden', marginBottom: 22 },
  timerFill:     { height: '100%', borderRadius: radii.full },
  eyebrow:       { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.inkFaint, marginBottom: 6 },
  heroValue:     { fontFamily: fonts.display, fontSize: 46, color: C.ink, letterSpacing: -1.2, lineHeight: 50 },
  heroSign:      { fontSize: 26, fontFamily: fonts.display },
  heroCaption:   { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginBottom: 18, marginTop: 4 },
  btnRow:        { flexDirection: 'row', gap: 10 },
  declineBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: spacing[4], backgroundColor: C.chipUrgent },
  declineBtnText:{ fontSize: fontSize.lg, fontFamily: fonts.bold, color: C.ink },
  acceptBtn:     { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17, borderRadius: spacing[4], backgroundColor: C.dark },
  acceptBtnText: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: '#fff' },
  resultWrap:    { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 10 },
  resultIcon:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultTitle:   { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: C.ink, marginBottom: 8 },
  resultSub:     { fontSize: fontSize.md, color: C.inkSoft, fontFamily: fonts.regular, textAlign: 'center', lineHeight: 20 },
  closeBtn:      { marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: C.chipUrgent },
  closeBtnText:  { fontSize: fontSize.lg, fontFamily: fonts.bold, color: C.ink },
});
