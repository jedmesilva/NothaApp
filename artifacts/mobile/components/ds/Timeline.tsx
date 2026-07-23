/**
 * Timeline — linha do tempo vertical do DS.
 *
 * Recebe um array de `TimelineEvent` e renderiza pontos, linhas e
 * rótulos de forma consistente. Toda regra visual vive aqui;
 * as telas só passam dados.
 *
 * Tipos de passo:
 *  - Com `date`     → exibe a data (ou "~data" se `estimado: true`)
 *  - Com `progress` → exibe pill X/N e texto de parcelas restantes
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { formatData, formatDataHora } from '@/data/loans';

export type TimelineEvent =
  | {
      label: string;
      date: Date;
      done: boolean;
      estimado?: boolean;
      progress?: undefined;
    }
  | {
      label: string;
      date?: undefined;
      done: boolean;
      estimado?: undefined;
      progress: { value: number; total: number };
    };

type Props = {
  events: TimelineEvent[];
};

export function Timeline({ events }: Props) {
  return (
    <View>
      {events.map((event, i) => {
        const isLast     = i === events.length - 1;
        const isProgress = event.progress !== undefined;
        const allPaid    = isProgress && event.progress.value >= event.progress.total;

        return (
          <View key={event.label} style={s.row}>
            {/* Coluna esquerda: dot + linha vertical */}
            <View style={s.rail}>
              <View style={[s.dot, !event.done && s.dotPending]} />
              {!isLast && (
                <View style={[s.line, event.done && s.lineDone]} />
              )}
            </View>

            {/* Conteúdo */}
            <View style={s.content}>
              <View style={s.labelRow}>
                <Text style={[s.label, !event.done && s.labelPending]}>
                  {event.label}
                </Text>
                {isProgress && (
                  <View style={[s.pill, allPaid && s.pillDone]}>
                    <Text style={[s.pillText, allPaid && s.pillTextDone]}>
                      {event.progress.value}/{event.progress.total}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={s.sub}>
                {isProgress
                  ? allPaid
                    ? 'Todos os pagamentos realizados'
                    : `${event.progress.total - event.progress.value} ${
                        event.progress.total - event.progress.value === 1
                          ? 'restante'
                          : 'restantes'
                      }`
                  : event.done
                  ? formatDataHora(event.date)
                  : event.estimado
                  ? `~${formatData(event.date)}`
                  : formatData(event.date)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT_SIZE = 10;
const LINE_W   = 2;
const ROW_PB   = spacing[4] + 2; // espaçamento entre linhas

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: ROW_PB,
  },

  // ── Trilho (dot + linha) ───────────────────────────────────────────────
  rail: {
    alignItems: 'center',
    width: DOT_SIZE,
    flexShrink: 0,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: C.ink,
    zIndex: 1,
    marginTop: 4,
  },
  dotPending: {
    backgroundColor: C.line,
  },
  line: {
    flex: 1,
    width: LINE_W,
    marginTop: 4,
    marginBottom: -(ROW_PB), // preenche até o início do próximo dot
    backgroundColor: C.line,
  },
  lineDone: {
    backgroundColor: C.ink,
  },

  // ── Conteúdo ───────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: C.ink,
  },
  labelPending: {
    color: C.inkFaint,
    fontFamily: fonts.semibold,
  },
  sub: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.regular,
    color: C.inkSoft,
  },

  // ── Pill de progresso ──────────────────────────────────────────────────
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: C.chipMuted,
  },
  pillDone: {
    backgroundColor: C.ink,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: C.inkSoft,
  },
  pillTextDone: {
    color: '#fff',
  },
});
