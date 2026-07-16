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
import { useContaModal } from '@/contexts/ContaModalContext';

export type ContaCardVariant = 'deposito' | 'rendimento' | 'saldo';

export type ContaCardProps = {
  variant: ContaCardVariant;
  valor: number;
  onPress?: () => void;
  style?: ViewStyle;
};

const CONFIG: Record<ContaCardVariant, { sub: string; showPlus?: boolean; cta: string }> = {
  deposito:   { sub: 'disponível em conta',  showPlus: true,  cta: 'Ver conta' },
  rendimento: { sub: 'creditado em conta',   showPlus: true,  cta: 'Ver carteira' },
  saldo:      { sub: 'disponível em conta',  showPlus: false, cta: 'Ver saldo' },
};

export function ContaCard({ variant, valor, onPress, style }: ContaCardProps) {
  if (valor <= 0) return null;

  const { openConta } = useContaModal();
  const { sub, showPlus, cta } = CONFIG[variant];
  const formatted = valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlePress = () => { onPress?.(); openConta(); };

  return (
    <LightCard style={[s.card, style]}>
      <TouchableOpacity style={s.row} onPress={handlePress} activeOpacity={0.7}>
        <View style={s.left}>
          <Text style={s.value}>
            {showPlus ? '+' : ''}R$ {formatted}
          </Text>
          <Text style={s.sub}>{sub}</Text>
        </View>
        <View style={s.ctaWrap}>
          <Text style={s.ctaText}>{cta}</Text>
          <Feather name="chevron-right" size={13} color={C.inkSoft} />
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
  value: {
    fontFamily: fonts.display,
    fontSize: fontSize['4xl'], // 20px
    color: C.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.regular,
    color: C.inkFaint,
  },
  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 12,
  },
  ctaText: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.semibold,
    color: C.inkSoft,
  },
});
