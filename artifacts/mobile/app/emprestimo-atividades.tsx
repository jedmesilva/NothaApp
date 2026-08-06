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
import { CICLO_META, formatBRL, addDays, formatData } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, StatusBadge, Timeline } from '@/components/ds';
import type { LoanStatus, TimelineEvent } from '@/components/ds';
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

  const parcelas = jaConcedido
    ? data.installments.map((inst) => ({
        status: inst.status === 'paid' ? 'paga' : inst.status === 'overdue' ? 'atrasada' : 'pendente',
      }))
    : [];

  const pagas           = parcelas.filter((p) => p.status === 'paga').length;
  const todosPagesPagos = pagas >= parcelasTotal && parcelasTotal > 0;

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitado',         date: dataSolicitacao,                                                                             done: true                },
    { label: 'Captação iniciada',  date: jaCaptacaoIniciada ? dataCaptacaoIniciada : undefined,                                       done: jaCaptacaoIniciada  },
    { label: 'Captação concluída', date: jaConcedido        ? dataCaptacaoConcluida : undefined,                                      done: jaConcedido         },
    { label: 'Concedido',          date: jaConcedido        ? dataConcessao : undefined,                                               done: jaConcedido         },
    { label: 'Pagamentos',         done: todosPagesPagos,   progress: { value: pagas, total: parcelasTotal }                         },
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

        {/* Meta card */}
        <View style={s.metaCard}>
          <View style={s.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.metaLabel}>Empréstimo</Text>
              <Text style={s.metaValue}>R$ {formatBRL(valor)}</Text>
              <Text style={s.metaSub}>
                {parcelasTotal} {parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural} · {taxaJurosTotal}%
              </Text>
            </View>
            <StatusBadge
              status={status as LoanStatus}
              createdAt={status === 'captacao' ? fundingStartedAt : createdAt}
            />
          </View>
          <View style={s.metaDivider} />
          <Text style={s.contratoId}>Contrato {contratoId ?? `EMP-${id}`}</Text>
        </View>

        {/* Timeline */}
        <View style={s.timelineCard}>
          <Text style={s.sectionLabel}>Histórico</Text>
          <Timeline events={timelineEvents} />
        </View>

        {/* Nota de datas estimadas */}
        {(!jaConcedido) && (
          <Text style={s.estimadoNote}>
            As datas marcadas como "Pendente" são estimativas baseadas no fluxo padrão
            de aprovação e poderão variar.
          </Text>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:   { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  metaCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    marginBottom: spacing[4],
    borderRadius: radii.card,
    backgroundColor: C.card,
    padding: spacing[5],
  },
  metaRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  metaLabel:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, color: C.inkFaint, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 4 },
  metaValue:  { fontFamily: fonts.display, fontSize: fontSize['4xl'], color: C.ink, letterSpacing: -0.5, marginBottom: 4 },
  metaSub:    { fontSize: fontSize['sm+'], fontFamily: fonts.regular, color: C.inkSoft },
  metaDivider: { height: 1, backgroundColor: C.line, marginVertical: spacing[4] },
  contratoId: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.inkFaint },

  timelineCard: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderRadius: radii.card,
    backgroundColor: C.card,
    padding: spacing[5],
    paddingBottom: spacing[3],
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing[5],
  },

  estimadoNote: {
    marginHorizontal: spacing[5],
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: C.inkFaint,
    lineHeight: 17,
    textAlign: 'center',
  },
});
