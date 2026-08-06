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
import { useInvestorOffers } from '@/hooks/useInvestorOffers';

export default function OfertaAtividadesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { data: offersData, isLoading } = useInvestorOffers();

  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  const offer = offersData?.offers.find((o) => o.id === id);
  if (!offer) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.inkFaint, fontFamily: fonts.regular }}>Oferta não encontrada.</Text>
      </View>
    );
  }

  const ciclo     = offer.loan.cycle as 'diario' | 'semanal' | 'mensal';
  const cicloMeta = CICLO_META[ciclo];
  const prazoDias = offer.loan.termDays;

  // Ofertas estão sempre em captação
  const jaConcedido           = false;
  const hoje                  = new Date();
  const dataConcessao         = hoje;
  const dataSolicitacao       = addDays(dataConcessao, -3);
  const dataCaptacaoIniciada  = addDays(dataSolicitacao, 1);
  const dataVencimentoFinal   = addDays(dataConcessao, prazoDias);

  const parcelasTotal     = offer.loan.installmentsTotal;
  const parcelasPrevistas = Math.round(prazoDias / cicloMeta.dias);

  const valorInvestido  = offer.maxAmountCents / 100;
  const taxaJurosTotal  = offer.ratePct / 100;
  const totalComRetorno = valorInvestido * (1 + taxaJurosTotal / 100);

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitação',            date: dataSolicitacao,       done: true  },
    { label: 'Captação iniciada',      date: dataCaptacaoIniciada,  done: true  },
    { label: 'Investimento realizado', done: false                              },
    { label: 'Captação concluída',     done: false                              },
    { label: 'Concedido',              done: false                              },
    { label: 'Pagamentos',             done: false, progress: { value: 0, total: parcelasPrevistas } },
    { label: 'Encerrado',              done: false                              },
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
              <Text style={s.metaLabel}>Oferta</Text>
              <Text style={s.metaValue}>+{taxaJurosTotal}%</Text>
              <Text style={s.metaSub}>
                R$ {formatBRL(valorInvestido)} · {prazoDias} dias
              </Text>
            </View>
            <StatusBadge
              status={'captacao' as LoanStatus}
              createdAt={offer.loan.fundingStartedAt ?? undefined}
            />
          </View>
          <View style={s.metaDivider} />
          <Text style={s.contratoId}>Contrato {offer.loan.contractId}</Text>
        </View>

        {/* Timeline */}
        <View style={s.timelineCard}>
          <Text style={s.sectionLabel}>Histórico</Text>
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

});
