/**
 * StatusBadge — pill badge for emprestimo/ativo status.
 *
 * Used in: emprestimos list, emprestimo-detalhe hero, ativos list.
 *
 * context="light"  — shown on a white/light card (default)
 * context="dark"   — shown on the dark hero card (inverted colors)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fontSize, fonts } from '@/constants/theme';

/** Retorna sufixo de tempo relativo a partir de um ISO string, ex: "há 3 dias" */
function tempoRelativo(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hrs   = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(days / 7);
  if (mins  <  1) return 'agora';
  if (mins  < 60) return `há ${mins}min`;
  if (hrs   < 24) return `há ${hrs}h`;
  if (days  <  7) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  return `há ${weeks} ${weeks === 1 ? 'sem.' : 'sem.'}`;
}

export type LoanStatus = 'analise' | 'captacao' | 'ativo' | 'atrasado' | 'quitado' | 'cancelado';

type Props = {
  status: LoanStatus;
  context?: 'light' | 'dark';
  /** Optional override for the label text */
  label?: string;
  /** ISO string — quando fornecido, status analise/captacao exibem
   *  "Em captação há 3 dias" em vez do label estático */
  createdAt?: string;
};

type BadgeStyle = { bg: string; color: string; border?: string };

const LIGHT_STYLES: Record<LoanStatus, BadgeStyle> = {
  analise:   { bg: C.chipMuted,     color: C.inkSoft },
  captacao:  { bg: C.chipMuted,     color: C.inkSoft },
  ativo:     { bg: C.dark,          color: '#fff' },
  atrasado:  { bg: C.redBg,         color: C.red },
  quitado:   { bg: 'transparent',   color: C.inkFaint, border: C.line },
  cancelado: { bg: 'transparent',   color: C.inkFaint, border: C.line },
};

const DARK_STYLES: Record<LoanStatus, BadgeStyle> = {
  analise:   { bg: C.onDarkSubtle,  color: '#fff' },
  captacao:  { bg: C.onDarkSubtle,  color: '#fff' },
  ativo:     { bg: '#fff',          color: C.dark },
  atrasado:  { bg: '#fff',          color: C.dark },
  quitado:   { bg: 'transparent',   color: C.onDarkMid, border: 'rgba(255,255,255,0.3)' },
  cancelado: { bg: 'transparent',   color: C.onDarkMid, border: 'rgba(255,255,255,0.3)' },
};

const ICON_NAME: Record<LoanStatus, string> = {
  analise:   'clock',
  captacao:  'users',
  ativo:     'zap',
  atrasado:  'alert-triangle',
  quitado:   'check-circle',
  cancelado: 'x-circle',
};

const STATUS_LABEL: Record<LoanStatus, string> = {
  analise:   'Em análise',
  captacao:  'Em captação',
  ativo:     'Ativo',
  atrasado:  'Atrasado',
  quitado:   'Quitado',
  cancelado: 'Cancelado',
};

export function StatusBadge({ status, context = 'light', label, createdAt }: Props) {
  const map   = context === 'dark' ? DARK_STYLES : LIGHT_STYLES;
  const style = map[status] ?? map.analise;
  const icon  = ICON_NAME[status] ?? 'clock';

  // Para analise/captacao com createdAt: "Em captação há 3 dias"
  const base = label ?? STATUS_LABEL[status] ?? status;
  const text = createdAt && (status === 'analise' || status === 'captacao')
    ? `${base} ${tempoRelativo(createdAt)}`
    : base;

  return (
    <View
      style={[
        s.badge,
        { backgroundColor: style.bg },
        style.border ? { borderWidth: 1, borderColor: style.border } : undefined,
      ]}
    >
      <Feather name={icon as any} size={13} color={style.color} />
      <Text style={[s.label, { color: style.color }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
  },
});
