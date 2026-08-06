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
import type { TimelineEvent } from '@/components/ds';
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
