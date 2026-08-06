/**
 * PaymentSectionHeader
 *
 * Cabeçalho reutilizável para o card de Pagamento.
 *
 * O chevron é posicionado de forma ABSOLUTA sobre o lado direito do container,
 * de modo que o título sempre ocupa a largura total disponível — sem criar uma
 * "coluna" visual que deslocaria o conteúdo abaixo (PaymentProgress/OfferPaymentHint).
 *
 * Uso:
 *   // Sem chevron (não expansível)
 *   <PaymentSectionHeader />
 *
 *   // Com chevron (expansível)
 *   <PaymentSectionHeader
 *     onPress={() => setOpen(v => !v)}
 *     expanded={open}
 *   />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, spacing } from '@/constants/theme';

type Props = {
  title?: string;
  /** Quando fornecido, o header vira um botão e exibe o chevron. */
  onPress?: () => void;
  expanded?: boolean;
};

export function PaymentSectionHeader({
  title = 'Pagamento',
  onPress,
  expanded,
}: Props) {
  const hasChevron = onPress != null;

  const inner = (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>

      {/* Chevron absolutamente posicionado: não empurra o título nem cria
          deslocamento de coluna em relação ao conteúdo abaixo. */}
      {hasChevron && (
        <View style={s.chevronWrap} pointerEvents="none">
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={C.inkFaint}
          />
        </View>
      )}
    </View>
  );

  if (hasChevron) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
}

// paddingHorizontal e paddingVertical espelham os valores usados em paymentToggle
// nas telas consumidoras (spacing[4] + 2 = 18, spacing[3] + 2 = 14).
const PH = (spacing[4] as number) + 2; // 18
const PV = (spacing[3] as number) + 2; // 14

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: PH,
    paddingVertical: PV,
    // position: 'relative' é o padrão no RN — necessário para o filho absoluto.
  },
  title: {
    fontSize: fontSize['base+'],
    fontFamily: fonts.bold,
    color: C.ink,
  },
  chevronWrap: {
    position: 'absolute',
    right: PH,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
