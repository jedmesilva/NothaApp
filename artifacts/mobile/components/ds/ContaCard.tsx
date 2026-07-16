/**
 * ContaCard — contextual account-balance notification card.
 *
 * Three variants, each representing a different event:
 *   deposito   — a loan was just granted and deposited into the account
 *   rendimento — an investment return was credited to the account
 *   saldo      — shows current total available balance
 *
 * Renders nothing when `valor` is 0 or negative.
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

// ---------------------------------------------------------------------------
// Per-variant visual config
// ---------------------------------------------------------------------------
type VariantConfig = {
  pill: { bg: string; color: string };
  pillLabel: string;
  pillIcon: string;
  showPlus?: boolean;
  helper: string;
  cta: string;
};

const VARIANTS: Record<ContaCardVariant, VariantConfig> = {
  deposito: {
    pill: { bg: C.dark, color: '#fff' },
    pillLabel: 'Empréstimo disponível',
    pillIcon: 'arrow-down',
    helper: 'Depositado na sua conta',
    cta: 'Acessar conta',
  },
  rendimento: {
    pill: { bg: C.amberBg, color: C.amber },
    pillLabel: 'Rendimento creditado',
    pillIcon: 'trending-up',
    showPlus: true,
    helper: 'Creditado na sua conta',
    cta: 'Ver na carteira',
  },
  saldo: {
    pill: { bg: C.chipUrgent, color: C.inkSoft },
    pillLabel: 'Saldo disponível',
    pillIcon: 'credit-card',
    helper: 'Disponível para usar',
    cta: 'Acessar conta',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ContaCard({ variant, valor, onPress, style }: ContaCardProps) {
  if (valor <= 0) return null;

  const cfg = VARIANTS[variant];
  const formatted = valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <LightCard style={style}>
      {/* State pill */}
      <View style={[s.pill, { backgroundColor: cfg.pill.bg }]}>
        <Feather name={cfg.pillIcon as any} size={11} color={cfg.pill.color} />
        <Text style={[s.pillText, { color: cfg.pill.color }]}>{cfg.pillLabel}</Text>
      </View>

      {/* Value */}
      <Text style={s.value}>
        {cfg.showPlus && <Text style={s.valuePrefix}>+</Text>}
        {'R$ '}
        {formatted}
      </Text>

      {/* Helper text */}
      <Text style={s.helper}>{cfg.helper}</Text>

      {/* CTA */}
      <TouchableOpacity style={s.cta} onPress={onPress} activeOpacity={0.85}>
        <Text style={s.ctaText}>{cfg.cta}</Text>
        <Feather name="arrow-right" size={15} color="#fff" />
      </TouchableOpacity>
    </LightCard>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    marginBottom: 16,
  },
  pillText: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.semibold,
    letterSpacing: 0.1,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: C.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  valuePrefix: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: C.ink,
  },
  helper: {
    fontSize: fontSize['base+'],
    fontFamily: fonts.regular,
    color: C.inkSoft,
    marginBottom: 20,
    marginTop: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radii.md,
    backgroundColor: C.dark,
  },
  ctaText: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: '#fff',
  },
});
