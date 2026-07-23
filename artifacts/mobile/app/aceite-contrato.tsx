import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, DetailGrid } from '@/components/ds';
import { formatData } from '@/data/loans';
import { useCreateLoan } from '@/hooks/useLoans';
import type { CreateLoanInput } from '@/hooks/useLoans';

const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CICLO_META: Record<string, { label: string; unidade: string; unidadePlural: string }> = {
  diario:  { label: 'Diário',  unidade: 'dia',    unidadePlural: 'dias' },
  semanal: { label: 'Semanal', unidade: 'semana', unidadePlural: 'semanas' },
  mensal:  { label: 'Mensal',  unidade: 'mês',    unidadePlural: 'meses' },
};

const unidadeLabel = (key: string, n: number) => {
  const c = CICLO_META[key];
  return n === 1 ? c.unidade : c.unidadePlural;
};

const CONTRATO_PREVIEW =
  'Este instrumento formaliza o empréstimo entre o tomador identificado nesta plataforma e o(s) credor(es) que fizerem o aporte do valor solicitado, nas condições descritas no resumo acima.';

export default function AceiteContratoScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

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

  const cicloKey    = params.cicloKey ?? 'semanal';
  const numPeriodos = parseInt(params.numPeriodos ?? '8', 10);
  const prazoDias   = parseInt(params.prazoDias ?? '56', 10);
  const taxaTotal   = parseFloat(params.taxaTotal ?? '14.3');
  const valorParcela = parseFloat(params.valorParcela ?? '114.33');
  const totalAPagar  = parseFloat(params.totalAPagar ?? '914.67');
  const primeiraParcela = new Date(params.primeiraParcela ?? Date.now());
  const vencimentoFinal = new Date(params.vencimentoFinal ?? Date.now());

  const ciclo = CICLO_META[cicloKey] ?? CICLO_META.semanal;

  const createLoan = useCreateLoan();

  const handleConfirmar = async () => {
    const input: CreateLoanInput = {
      amountCents: parseInt(params.valorCentavos ?? '50000', 10),
      cicloKey: cicloKey as CreateLoanInput['cicloKey'],
      numPeriodos,
      prazoDias,
      taxaTotal,
    };

    try {
      const result = await createLoan.mutateAsync(input);
      router.dismissAll();
      router.push({ pathname: '/emprestimo-detalhe', params: { id: result.loan.id } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar solicitação. Tente novamente.';
      Alert.alert('Erro', message);
    }
  };

  const handleLerContrato = () => {
    router.push({
      pathname: '/contrato-leitura',
      params: {
        valorCentavos: params.valorCentavos,
        cicloKey,
        numPeriodos: params.numPeriodos,
        prazoDias: params.prazoDias,
        taxaTotal: params.taxaTotal,
        valorParcela: params.valorParcela,
        totalAPagar: params.totalAPagar,
        primeiraParcela: params.primeiraParcela,
        vencimentoFinal: params.vencimentoFinal,
      },
    });
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <View>
          <Text style={s.title}>Revisar e confirmar</Text>
        </View>
      </View>
      <Text style={s.subtitle}>Confira os termos do seu empréstimo antes de confirmar.</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* ── Resumo ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Resumo do empréstimo</Text>

          <View style={s.summaryCard}>
            <Text style={s.planBlockLabel}>Você pagará</Text>
            <View style={s.summaryValueRow}>
              <Text style={s.summaryValue}>R$ {fmtBRL(valorParcela)}</Text>
              <Text style={s.summaryValueUnit}>/{ciclo.unidade}</Text>
            </View>
            <Text style={s.summaryCycles}>
              durante {numPeriodos} {unidadeLabel(cicloKey, numPeriodos)}
            </Text>

            <DetailGrid
              items={[
                { label: 'Prazo',      value: `${prazoDias} dias`,             sub: `vence ${formatData(vencimentoFinal)}` },
                { label: 'Ciclo',      value: ciclo.label,                      sub: `R$ ${fmtBRL(valorParcela)}/${ciclo.unidade}` },
                { label: 'Taxa total', value: `${taxaTotal.toFixed(1)}%` },
                {
                  label: numPeriodos === 1 ? 'Vencimento' : '1º vencimento',
                  value: formatData(numPeriodos === 1 ? vencimentoFinal : primeiraParcela),
                },
              ]}
            />

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total a pagar</Text>
              <Text style={s.totalValue}>R$ {fmtBRL(totalAPagar)}</Text>
            </View>
          </View>
        </View>

        {/* ── Contrato ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Contrato de empréstimo</Text>

          <View style={s.contractCard}>
            <View style={s.contractTopRow}>
              <View style={s.contractTitleGroup}>
                <View style={s.contractIconBadge}>
                  <Feather name="file-text" size={15} color={C.ink} />
                </View>
                <Text style={s.contractTitle}>Termos e condições</Text>
              </View>
              <TouchableOpacity style={s.downloadBtn} activeOpacity={0.7}>
                <Feather name="download" size={14} color={C.inkSoft} />
                <Text style={s.downloadText}>PDF</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.contractPreview} numberOfLines={2}>
              {CONTRATO_PREVIEW}
            </Text>

            <TouchableOpacity
              style={s.contractNavRow}
              onPress={handleLerContrato}
              activeOpacity={0.8}
            >
              <Text style={s.contractNavText}>Ler contrato completo</Text>
              <Feather name="chevron-right" size={16} color={C.inkFaint} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity
          style={[s.ctaButton, createLoan.isPending && s.ctaButtonDisabled]}
          onPress={handleConfirmar}
          activeOpacity={0.85}
          disabled={createLoan.isPending}
        >
          {createLoan.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.ctaText}>Confirmar e solicitar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    paddingBottom: spacing[2],
    paddingTop: 4,
    fontSize: fontSize['base+'],
    fontFamily: fonts.regular,
    color: C.inkSoft,
  },

  section:      { marginHorizontal: spacing[4], marginBottom: 14 },
  sectionLabel: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: C.ink,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  // Summary card
  summaryCard: { borderRadius: radii.cardLg, backgroundColor: C.card, padding: spacing[5] },
  planBlockLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  summaryValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 6 },
  summaryValue:     { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.5 },
  summaryValueUnit: { fontSize: fontSize.lg, fontFamily: fonts.semibold, color: C.inkFaint },
  summaryCycles:    { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink, marginBottom: 18 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  totalLabel: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.inkSoft },
  totalValue: { fontFamily: fonts.display, fontSize: fontSize.xl, color: C.ink },

  // Contract card
  contractCard: { borderRadius: radii.cardLg, backgroundColor: C.card, padding: spacing[5] },
  contractTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  contractTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  contractIconBadge: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractTitle:   { fontSize: fontSize.md, fontFamily: fonts.bold, color: C.ink },
  downloadBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4 },
  downloadText:    { fontSize: fontSize['sm+'], fontFamily: fonts.semibold, color: C.inkSoft },
  contractPreview: {
    fontSize: fontSize.base,
    lineHeight: 20,
    color: C.inkSoft,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },
  contractNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bg,
    borderRadius: radii.lg,
    padding: 13,
  },
  contractNavText: { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: C.ink },

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
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },
});
