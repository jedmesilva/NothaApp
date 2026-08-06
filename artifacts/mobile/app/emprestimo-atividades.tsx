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
import { useLoan, mapLoan } from '@/hooks/useLoans';

export default function EmprestimoAtividadesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { data, isLoading } = useLoan(id ?? '');

  if (isLoading || !data) {
    return (
      <View style={[s.screen, { paddingTop: topPad, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  const emprestimo = mapLoan(data.loan);
  const {
    valor, taxaJurosTotal, prazoDias, ciclo, parcelasTotal,
    status, contratoId, diasDesdeConcessao, fundingStartedAt, createdAt,
  } = emprestimo;

  const cicloMeta       = CICLO_META[ciclo];
  const totalAPagar     = valor * (1 + taxaJurosTotal / 100);
  const valorParcela    = totalAPagar / parcelasTotal;

  const hoje = new Date();
  const dataBase = diasDesdeConcessao != null
    ? addDays(hoje, -diasDesdeConcessao)
    : hoje;

  const dataConcessao         = dataBase;
  const dataSolicitacao       = addDays(dataConcessao, -3);
  const dataCaptacaoIniciada  = addDays(dataSolicitacao, 1);
  const dataCaptacaoConcluida = addDays(dataConcessao, -1);
  const dataVencimentoFinal   = addDays(dataConcessao, prazoDias);

  const jaConcedido        = status !== 'analise' && status !== 'captacao' && status !== 'cancelado';
  const jaCaptacaoIniciada = status !== 'analise';

  const subEventsPagamento: TimelineSubEvent[] = jaConcedido
    ? data.installments.map((inst) => {
        const isPaid = inst.status === 'paid';
        return {
          number:      inst.installmentNumber,
          date:        new Date(isPaid && inst.paidAt ? inst.paidAt : inst.dueDate),
          status:      isPaid ? 'paid' : inst.status === 'overdue' ? 'overdue' : 'pending',
          amountCents: inst.amountCents,
        } satisfies TimelineSubEvent;
      })
    : [];

  const pagas           = subEventsPagamento.filter((p) => p.status === 'paid').length;
  const todosPagesPagos = pagas >= parcelasTotal && parcelasTotal > 0;

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitado',         date: dataSolicitacao,                                                                             done: true                },
    { label: 'Captação iniciada',  date: jaCaptacaoIniciada ? dataCaptacaoIniciada : undefined,                                       done: jaCaptacaoIniciada  },
    { label: 'Captação concluída', date: jaConcedido        ? dataCaptacaoConcluida : undefined,                                      done: jaConcedido         },
    { label: 'Concedido',          date: jaConcedido        ? dataConcessao : undefined,                                               done: jaConcedido         },
    { label: 'Pagamentos',         done: todosPagesPagos,   progress: { value: pagas, total: parcelasTotal }, subEvents: subEventsPagamento.length > 0 ? subEventsPagamento : undefined },
    { label: 'Quitado',            date: (status === 'quitado' || todosPagesPagos) ? dataVencimentoFinal : undefined, done: status === 'quitado' || todosPagesPagos },
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
