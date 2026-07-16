/**
 * ContaCard — compact account notification row.
 *
 * Discreet by design: small label, modest value, chevron on the right.
 * Renders nothing when `valor` is 0 or negative.
 *
 * Variants:
 *   deposito   — loan was deposited into the account
 *   rendimento — investment return was credited
 *   saldo      — current available balance
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fontSize, fonts } from '@/constants/theme';
import { LightCard } from './Card';

export type ContaCardVariant = 'deposito' | 'rendimento' | 'saldo';

export type ContaCardProps = {
  variant: ContaCardVariant;
  valor: number;
  onPress?: () => void;
  style?: ViewStyle;
};

const LABELS: Record<ContaCardVariant, { above: string; showPlus?: boolean }> = {
  deposito:   { above: 'Empréstimo disponível na conta' },
  rendimento: { above: 'Rendimento creditado na conta', showPlus: true },
  saldo:      { above: 'Saldo disponível na conta' },
};

export function ContaCard({ variant, valor, onPress, style }: ContaCardProps) {
  if (valor <= 0) return null;

  const { above, showPlus } = LABELS[variant];
  const formatted = valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <LightCard style={[s.card, style]}>
      <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
        <View style={s.left}>
          <Text style={s.label}>{above}</Text>
          <Text style={s.value}>
            {showPlus ? '+' : ''}R$ {formatted}
          </Text>
        </View>
        <View style={s.chevronWrap}>
          <Feather name="chevron-right" size={16} color={C.inkSoft} />
        </View>
      </TouchableOpacity>
    </LightCard>
  );
}

const s = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.regular,
    color: C.inkFaint,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize['4xl'], // 20px — readable but not dominant
    color: C.ink,
    letterSpacing: -0.3,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
