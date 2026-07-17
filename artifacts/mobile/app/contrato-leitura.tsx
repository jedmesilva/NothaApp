import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// ---------------------------------------------------------------------------
// Contract content
// ---------------------------------------------------------------------------
const CLAUSULAS = [
  {
    titulo: '1. Objeto',
    texto:
      'Este instrumento formaliza o empréstimo entre o tomador identificado nesta plataforma e o(s) credor(es) que fizerem o aporte do valor solicitado, nas condições descritas no resumo apresentado na tela de confirmação, que é parte integrante deste contrato.',
  },
  {
    titulo: '2. Desembolso e pagamento',
    texto:
      'O valor líquido será depositado na conta cadastrada em até 1 dia útil após a confirmação. As parcelas serão descontadas automaticamente na frequência escolhida, na data de vencimento de cada uma, da conta indicada pelo tomador no momento da contratação.',
  },
  {
    titulo: '3. Atraso e inadimplência',
    texto:
      'Em caso de atraso, incidem multa de 2% sobre a parcela em aberto e juros de mora de 1% ao mês, calculados a partir do 1º dia após o vencimento. A permanência do atraso por período superior a 30 dias poderá resultar em inclusão do nome do tomador em cadastros de proteção ao crédito, conforme legislação vigente.',
  },
  {
    titulo: '4. Quitação antecipada',
    texto:
      'A quitação antecipada, total ou parcial, é permitida a qualquer momento, com desconto proporcional dos juros sobre o período não utilizado, sem incidência de multa ou tarifa adicional para essa finalidade.',
  },
  {
    titulo: '5. Papel da plataforma',
    texto:
      'O tomador declara estar ciente de que a plataforma atua apenas como intermediária entre tomadores e credores, não sendo parte na relação de crédito em si, e que o contrato aqui aceito tem validade jurídica plena entre as partes envolvidas.',
  },
  {
    titulo: '6. Validade da assinatura eletrônica',
    texto:
      'O tomador reconhece a validade e eficácia do aceite eletrônico realizado nesta tela como forma de manifestação de vontade, dispensando a assinatura física, nos termos da legislação aplicável a documentos eletrônicos.',
  },
  {
    titulo: '7. Foro',
    texto:
      'Fica eleito o foro da comarca de domicílio do tomador para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
  },
];

const THRESHOLD_FIM_PX = 24;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ContratoLeituraScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [progresso, setProgresso] = useState(0);
  const [chegouAoFim, setChegouAoFim] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Params (passed from aceite-contrato, not used in contract text but kept for confirmation)
  const params = useLocalSearchParams<{
    valorCentavos: string;
    cicloKey: string;
    numPeriodos: string;
    prazoDias: string;
    taxaTotal: string;
    valorParcela: string;
    totalAPagar: string;
    primeiraParcela: string;
    vencimentoFinal: string;
  }>();

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    if (scrollable <= 0) {
      setProgresso(100);
      setChegouAoFim(true);
      return;
    }
    const pct = Math.min(100, (contentOffset.y / scrollable) * 100);
    setProgresso(pct);
    if (contentOffset.y >= scrollable - THRESHOLD_FIM_PX) {
      setChegouAoFim(true);
    }
  };

  const handleAceitar = () => {
    // Navigate back to the loans tab, clearing the stack
    router.navigate('/(tabs)/emprestimos');
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Contrato de empréstimo</Text>
        </View>
      </View>
      <Text style={s.subtitle}>
        {chegouAoFim
          ? 'Você chegou ao final do contrato.'
          : 'Role até o final para liberar o aceite.'}
      </Text>

      {/* Progress bar — sits above the ScrollView, fixed */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progresso}%` as any }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          s.content,
          { paddingBottom: 110 + Math.max(insets.bottom, 18) },
        ]}
      >
        {CLAUSULAS.map((clausula) => (
          <View key={clausula.titulo} style={s.clauseBlock}>
            <Text style={s.clauseTitle}>{clausula.titulo}</Text>
            <Text style={s.clauseBody}>{clausula.texto}</Text>
          </View>
        ))}
        <Text style={s.endMarker}>— fim do contrato —</Text>
      </ScrollView>

      {/* Fixed CTA */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity
          style={[s.ctaButton, !chegouAoFim && s.ctaButtonDisabled]}
          onPress={handleAceitar}
          disabled={!chegouAoFim}
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, !chegouAoFim && s.ctaTextDisabled]}>
            Aceitar e confirmar empréstimo
          </Text>
        </TouchableOpacity>
        {!chegouAoFim && (
          <Text style={s.ctaHint}>Role até o final do contrato para continuar</Text>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: 4,
  },
  title:    { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  subtitle: {
    paddingHorizontal: spacing[5],
    paddingBottom: 0,
    paddingTop: 4,
    fontSize: fontSize.base,
    fontFamily: fonts.regular,
    color: C.inkSoft,
    minHeight: 22,
  },

  // Progress bar
  progressTrack: {
    height: 3,
    backgroundColor: C.line,
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.dark,
  },

  // Content
  content: { paddingHorizontal: spacing[5], paddingTop: 20 },
  clauseBlock: { marginBottom: 22 },
  clauseTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize['base+'],
    color: C.ink,
    marginBottom: 6,
  },
  clauseBody: {
    fontSize: fontSize['base+'],
    lineHeight: 22,
    color: C.inkSoft,
    fontFamily: fonts.regular,
  },
  endMarker: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: C.inkFaint,
    fontFamily: fonts.regular,
    paddingVertical: 8,
  },

  // CTA
  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  ctaButton: {
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaButtonDisabled: { backgroundColor: C.line },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: fontSize['lg+'],
    color: '#fff',
    letterSpacing: 0.1,
  },
  ctaTextDisabled: { color: C.inkFaint },
  ctaHint: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: C.inkFaint,
    fontFamily: fonts.regular,
    marginTop: 9,
  },
});
