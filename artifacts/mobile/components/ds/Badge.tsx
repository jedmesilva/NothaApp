/**
 * StatusBadge — pill badge for emprestimo/ativo status.
 *
 * Used in: emprestimos list, emprestimo-detalhe hero, ativos list.
 *
 * context="light"  — shown on a white/light card (default)
 * context="dark"   — shown on the dark hero card (inverted colors)
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, radii, fontSize, fonts } from '@/constants/theme';

function ContadorCaptacao({ color }: { color: string }) {
  const [seg, setSeg] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeg((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = Math.floor(seg / 3600);
  const mm = Math.floor((seg % 3600) / 60);
  const ss = seg % 60;
  const texto = hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : mm > 0 ? `${mm}:${pad(ss)}min` : `${ss}s`;
  return <Text style={[s.timer, { color }]}>{texto}</Text>;
}

export type LoanStatus = 'analise' | 'captacao' | 'ativo' | 'atrasado' | 'quitado';

type Props = {
  status: LoanStatus;
  context?: 'light' | 'dark';
  /** Optional override for the label text */
  label?: string;
};

type BadgeStyle = { bg: string; color: string; border?: string };

const LIGHT_STYLES: Record<LoanStatus, BadgeStyle> = {
  analise:  { bg: C.chipMuted,     color: C.inkSoft },
  captacao: { bg: C.chipMuted,     color: C.inkSoft },
  ativo:    { bg: C.dark,          color: '#fff' },
  atrasado: { bg: C.redBg,         color: C.red },
  quitado:  { bg: 'transparent',   color: C.inkFaint, border: C.line },
};

const DARK_STYLES: Record<LoanStatus, BadgeStyle> = {
  analise:  { bg: C.onDarkSubtle,  color: '#fff' },
  captacao: { bg: C.onDarkSubtle,  color: '#fff' },
  ativo:    { bg: '#fff',          color: C.dark },
  atrasado: { bg: '#fff',          color: C.dark },
  quitado:  { bg: 'transparent',   color: C.onDarkMid, border: 'rgba(255,255,255,0.3)' },
};

const ICON_NAME: Record<LoanStatus, string> = {
  analise:  'clock',
  captacao: 'users',
  ativo:    'zap',
  atrasado: 'alert-triangle',
  quitado:  'check-circle',
};

const STATUS_LABEL: Record<LoanStatus, string> = {
  analise:  'Em análise',
  captacao: 'Em captação',
  ativo:    'Ativo',
  atrasado: 'Atrasado',
  quitado:  'Quitado',
};

export function StatusBadge({ status, context = 'light', label }: Props) {
  const map = context === 'dark' ? DARK_STYLES : LIGHT_STYLES;
  const style = map[status] ?? map.analise;
  const text = label ?? STATUS_LABEL[status] ?? status;
  const icon = ICON_NAME[status] ?? 'clock';

  return (
    <View
      style={[
        s.badge,
        { backgroundColor: style.bg },
        style.border ? { borderWidth: 1, borderColor: style.border } : undefined,
      ]}
    >
      {status === 'captacao' ? (
        <>
          <ContadorCaptacao color={style.color} />
          <Text style={[s.sep, { color: style.color }]}>·</Text>
          <Text style={[s.label, { color: style.color }]}>{text}</Text>
        </>
      ) : (
        <>
          <Feather name={icon as any} size={13} color={style.color} />
          <Text style={[s.label, { color: style.color }]}>{text}</Text>
        </>
      )}
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
  timer: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
  },
  sep: {
    fontSize: fontSize.sm,
    opacity: 0.45,
  },
});
