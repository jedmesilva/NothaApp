/**
 * AlertBanner — faixa de alerta contextual do DS.
 *
 * Variantes:
 *  'error'   — fundo redBg, ícone alert-triangle vermelho   (atraso, vencimento)
 *  'warning' — fundo amberBg, ícone alert-circle âmbar      (atenção, prazo próximo)
 *
 * Props:
 *  title    — linha em negrito (opcional)
 *  message  — corpo do alerta; aceita string ou ReactNode para texto misto
 *  style    — override de margem / posicionamento
 */
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fonts, fontSize } from '@/constants/theme';

export type AlertBannerVariant = 'error' | 'warning';

type Props = {
  variant?: AlertBannerVariant;
  title?: string;
  message: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const CONFIG: Record<AlertBannerVariant, {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  textColor: string;
}> = {
  error: {
    bg:        C.redBg,
    border:    'rgba(192,57,43,0.18)',
    icon:      'alert-triangle',
    iconColor: C.red,
    textColor: C.red,
  },
  warning: {
    bg:        C.amberBg,
    border:    'rgba(180,120,0,0.18)',
    icon:      'alert-circle',
    iconColor: C.amber,
    textColor: C.amber,
  },
};

export function AlertBanner({ variant = 'error', title, message, style }: Props) {
  const cfg = CONFIG[variant];
  return (
    <View style={[s.banner, { backgroundColor: cfg.bg, borderColor: cfg.border }, style]}>
      <Feather name={cfg.icon as any} size={16} color={cfg.iconColor} style={s.icon} />
      <View style={{ flex: 1 }}>
        {title && (
          <Text style={[s.title, { color: cfg.textColor }]}>{title}</Text>
        )}
        {typeof message === 'string' ? (
          <Text style={[s.message, { color: cfg.textColor }, title && s.messageSub]}>
            {message}
          </Text>
        ) : (
          message
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            12,
    padding:        14,
    borderRadius:   radii.lg,
    borderWidth:    1,
  },
  icon:       { marginTop: 1 },
  title:      { fontSize: fontSize['sm+'], fontFamily: fonts.bold,    marginBottom: 3 },
  message:    { fontSize: fontSize['sm+'], fontFamily: fonts.regular, lineHeight: 18 },
  messageSub: { fontSize: fontSize.sm },
});
