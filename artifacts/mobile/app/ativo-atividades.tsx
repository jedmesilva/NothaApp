import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CICLO_META, addDays } from '@/data/loans';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';
import { BackButton, Timeline } from '@/components/ds';
import type { TimelineEvent, TimelineSubEvent } from '@/components/ds';
import { useInvestorPositions, getPosStatus } from '@/hooks/useInvestorPositions';

export default function AtivoAtividadesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { data: posData, isLoading } = useInvestorPositions();

  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  const pos = posData?.positions.find((p) => p.id === id);
  if (!pos) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.inkFaint, fontFamily: fonts.regular }}>Ativo não encontrado.</Text>
      </View>
    );
  }

  const posStatus = getPosStatus(pos);
  const ciclo     = pos.loan.cycle as 'diario' | 'semanal' | 'mensal';
  const cicloMeta = CICLO_META[ciclo];
  const prazoDias = pos.loan.termDays;

  const grantedAt = pos.loan.grantedAt
    ? new Date(pos.loan.grantedAt.slice(0, 10) + 'T00:00:00')
    : null;
  const diasDesdeConcessao = grantedAt
    ? Math.max(0, Math.floor((Date.now() - grantedAt.getTime()) / 86400000))
    : undefined;

  const jaConcedido           = posStatus !== 'captacao';
  const hoje                  = new Date();
  const dataConcessao         = jaConcedido ? addDays(hoje, -(diasDesdeConcessao ?? 0)) : hoje;
  const dataSolicitacao       = addDays(dataConcessao, -3);
  const dataCaptacaoIniciada  = addDays(dataSolicitacao, 1);
  const dataCaptacaoConcluida = addDays(dataConcessao, -1);
  const dataInvestimento      = addDays(dataConcessao, -2);
  const dataVencimentoFinal   = addDays(dataConcessao, prazoDias);

  const parcelasTotal     = pos.loan.installmentsTotal;
  const parcelasRecebidas = pos.installments.filter((i) => i.status === 'paid').length;
  const todosRecebidos    = jaConcedido && parcelasRecebidas >= parcelasTotal && parcelasTotal > 0;
  const jaEncerrado       = posStatus === 'quitado' || todosRecebidos;

  const parcelasPrevistas = !jaConcedido ? Math.round(prazoDias / cicloMeta.dias) : 0;

  const subEventsPagamento: TimelineSubEvent[] = jaConcedido
    ? pos.installments.map((inst) => ({
        number:      inst.installmentNumber,
        date:        new Date(inst.dueDate + 'T00:00:00'),
        status:      inst.status === 'paid' ? 'paid' : inst.status === 'overdue' ? 'overdue' : 'pending',
        amountCents: inst.amountCents,
      } satisfies TimelineSubEvent))
    : [];

  const valorInvestido    = pos.originalPrincipalCents / 100;
  const taxaJurosTotal    = pos.ratePct / 100;
  const totalComRetorno   = valorInvestido * (1 + taxaJurosTotal / 100);

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitação',            date: dataSolicitacao,                                    done: true                   },
    { label: 'Captação iniciada',      date: dataCaptacaoIniciada,                               done: true                   },
    { label: 'Investimento realizado', date: dataInvestimento,                                   done: true                   },
    { label: 'Captação concluída',     ...(jaConcedido ? { date: dataCaptacaoConcluida } : {}),  done: jaConcedido             },
    { label: 'Concedido',              ...(jaConcedido ? { date: dataConcessao } : {}),          done: jaConcedido             },
    { label: 'Pagamentos',             done: todosRecebidos, progress: { value: jaConcedido ? parcelasRecebidas : 0, total: jaConcedido ? parcelasTotal : parcelasPrevistas }, subEvents: subEventsPagamento.length > 0 ? subEventsPagamento : undefined },
    { label: 'Encerrado',              ...(jaEncerrado ? { date: dataVencimentoFinal } : {}),    done: jaEncerrado             },
  ];

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Atividades</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        <View style={s.timelineWrap}>
          <Timeline events={timelineEvents} />
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:   { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  timelineWrap: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },

});
