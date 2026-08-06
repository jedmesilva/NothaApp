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
import { CICLO_META, formatBRL, addDays } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, StatusBadge, Timeline } from '@/components/ds';
import type { LoanStatus, TimelineEvent } from '@/components/ds';
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

  const valorInvestido    = pos.originalPrincipalCents / 100;
  const taxaJurosTotal    = pos.ratePct / 100;
  const totalComRetorno   = valorInvestido * (1 + taxaJurosTotal / 100);

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitação',            date: dataSolicitacao,                                    done: true                   },
    { label: 'Captação iniciada',      date: dataCaptacaoIniciada,                               done: true                   },
    { label: 'Investimento realizado', date: dataInvestimento,                                   done: true                   },
    { label: 'Captação concluída',     ...(jaConcedido ? { date: dataCaptacaoConcluida } : {}),  done: jaConcedido             },
    { label: 'Concedido',              ...(jaConcedido ? { date: dataConcessao } : {}),          done: jaConcedido             },
    { label: 'Pagamentos',             done: todosRecebidos, progress: { value: jaConcedido ? parcelasRecebidas : 0, total: jaConcedido ? parcelasTotal : parcelasPrevistas } },
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

        {/* Meta card */}
        <View style={s.metaCard}>
          <View style={s.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.metaLabel}>Investimento</Text>
              <Text style={s.metaValue}>+{taxaJurosTotal}%</Text>
              <Text style={s.metaSub}>
                R$ {formatBRL(valorInvestido)} · {prazoDias} dias
              </Text>
            </View>
            <StatusBadge
              status={posStatus as LoanStatus}
              createdAt={posStatus === 'captacao' ? (pos.loan.fundingStartedAt ?? undefined) : undefined}
            />
          </View>
          <View style={s.metaDivider} />
          <Text style={s.contratoId}>Contrato {pos.loan.contractId}</Text>
        </View>

        {/* Timeline */}
        <View style={s.timelineCard}>
          <Text style={s.sectionLabel}>Histórico</Text>
          <Timeline events={timelineEvents} />
        </View>

        {!jaConcedido && (
          <Text style={s.estimadoNote}>
            As datas marcadas como "Pendente" são estimativas e poderão variar conforme
            o andamento da captação.
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
