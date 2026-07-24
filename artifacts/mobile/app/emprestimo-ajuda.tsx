import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton, ConfirmDialog } from '@/components/ds';
import { useCancelLoan } from '@/hooks/useLoans';

type HelpOption = {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  loading?: boolean;
};

export default function EmprestimoAjudaScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const params = useLocalSearchParams<{
    id: string;
    status: string;
    contratoId: string;
    valor: string;
  }>();

  const { id, status, contratoId, valor } = params;
  const podeCancelar = status === 'analise' || status === 'captacao';

  const cancelLoan = useCancelLoan();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmCancel = async () => {
    try {
      await cancelLoan.mutateAsync(id);
      setShowConfirm(false);
      // dismiss(2): ajuda → detalhe → emprestimos
      // preserva (tabs) no stack para o botão de voltar funcionar
      router.dismiss(2);
    } catch (err: unknown) {
      setShowConfirm(false);
      const message = err instanceof Error ? err.message : 'Erro ao cancelar. Tente novamente.';
      Alert.alert('Erro', message);
    }
  };

  const mainOptions: HelpOption[] = [
    {
      icon: 'file-text',
      label: 'Ver contrato',
      description: 'Acesse os termos e condições do seu empréstimo.',
      onPress: () => router.back(),
    },
    {
      icon: 'message-circle',
      label: 'Falar com suporte',
      description: 'Entre em contato com nossa equipe de atendimento.',
      onPress: () => Alert.alert('Em breve', 'O chat de suporte estará disponível em breve.'),
    },
    {
      icon: 'help-circle',
      label: 'Dúvidas frequentes',
      description: 'Respostas para as perguntas mais comuns sobre empréstimos.',
      onPress: () => Alert.alert('Em breve', 'A central de ajuda estará disponível em breve.'),
    },
  ];

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.title}>Ajuda</Text>
      </View>

      {/* Subtítulo com identificação do empréstimo */}
      <Text style={s.subtitle}>
        {contratoId ? `Contrato Nº ${contratoId}` : valor ? `Empréstimo de R$ ${valor}` : 'Empréstimo'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Opções gerais */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>O que você precisa?</Text>
          <View style={s.optionsCard}>
            {mainOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.label}
                style={[s.optionRow, i < mainOptions.length - 1 && s.optionBorder]}
                onPress={opt.onPress}
                activeOpacity={0.75}
              >
                <View style={s.optionIconWrap}>
                  <Feather name={opt.icon as any} size={18} color={C.ink} />
                </View>
                <View style={s.optionText}>
                  <Text style={s.optionLabel}>{opt.label}</Text>
                  <Text style={s.optionDesc}>{opt.description}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={C.inkFaint} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cancelamento — só para análise ou captação */}
        {podeCancelar && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Ações da solicitação</Text>
            <View style={s.optionsCard}>
              <TouchableOpacity
                style={s.optionRow}
                onPress={() => setShowConfirm(true)}
                activeOpacity={0.75}
                disabled={cancelLoan.isPending}
              >
                <View style={[s.optionIconWrap, s.optionIconDanger]}>
                  <Feather name="x-circle" size={18} color={C.red} />
                </View>
                <View style={s.optionText}>
                  <Text style={[s.optionLabel, s.optionLabelDanger]}>
                    Cancelar solicitação
                  </Text>
                  <Text style={s.optionDesc}>
                    {status === 'captacao'
                      ? 'Encerra a captação e cancela o empréstimo.'
                      : 'Remove a solicitação antes de ser analisada.'}
                  </Text>
                </View>
                {!cancelLoan.isPending && (
                  <Feather name="chevron-right" size={16} color={C.red} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        variant="danger"
        title="Tem certeza que deseja cancelar?"
        description={
          status === 'captacao'
            ? 'Isso encerrará a captação e cancelará o empréstimo. Essa ação não pode ser desfeita.'
            : 'A solicitação será removida antes de ser analisada. Essa ação não pode ser desfeita.'
        }
        confirmLabel="Sim, cancelar solicitação"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
        loading={cancelLoan.isPending}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: 4 },
  title:       { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  subtitle:    { paddingHorizontal: spacing[5], paddingBottom: spacing[4], paddingTop: 4, fontSize: fontSize['base+'], fontFamily: fonts.regular, color: C.inkSoft },

  section:      { marginHorizontal: spacing[4], marginBottom: spacing[4] },
  sectionLabel: { fontSize: fontSize.base, fontFamily: fonts.bold, color: C.ink, paddingHorizontal: 4, paddingBottom: 10 },

  optionsCard:      { borderRadius: radii.cardLg, backgroundColor: C.card, overflow: 'hidden' },
  optionRow:        { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing[4] },
  optionBorder:     { borderBottomWidth: 1, borderBottomColor: C.line },
  optionIconWrap:   { width: 38, height: 38, borderRadius: radii.md, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionIconDanger: { backgroundColor: C.redBg },
  optionText:       { flex: 1 },
  optionLabel:      { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: C.ink, marginBottom: 2 },
  optionLabelDanger:{ color: C.red },
  optionDesc:       { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.inkSoft, lineHeight: 18 },
});
