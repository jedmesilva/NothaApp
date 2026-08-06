/**
 * Timeline — linha do tempo vertical do DS.
 *
 * Recebe um array de `TimelineEvent` e renderiza pontos, linhas e
 * rótulos. Três estados visuais:
 *   - done    → ponto sólido escuro com ícone de check
 *   - current → anel escuro (border-only) — primeiro passo não-concluído
 *   - pending → anel cinza claro
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { formatDataComAno } from '@/data/loans';

export type TimelineEvent =
  | {
      label: string;
      date?: Date;
      done: boolean;
      progress?: undefined;
    }
  | {
      label: string;
      date?: undefined;
      done: boolean;
      progress: { value: number; total: number };
    };

type Props = {
  events: TimelineEvent[];
};

const DOT     = 22;
const LINE_W  = 2;
const ROW_GAP = 32;

export function Timeline({ events }: Props) {
  const currentIdx = events.findIndex((e) => !e.done);

  return (
    <View>
      {events.map((event, i) => {
        const isLast     = i === events.length - 1;
        const isDone     = event.done;
        const isCurrent  = i === currentIdx;
        const isPending  = !isDone && !isCurrent;
        const isProgress = event.progress !== undefined;
        const allPaid    = isProgress && event.progress!.value >= event.progress!.total;
        const pctBar     = isProgress && event.progress!.total > 0
          ? event.progress!.value / event.progress!.total
          : 0;

        return (
          <View key={event.label} style={s.row}>

            {/* ── Trilho ── */}
            <View style={s.rail}>
              <View style={[
                s.dot,
                isDone    && s.dotDone,
                isCurrent && s.dotCurrent,
                isPending && s.dotPending,
              ]}>
                {isDone    && <Feather name="check" size={11} color="#fff" />}
                {isCurrent && <View style={s.dotCurrentCore} />}
              </View>
              {!isLast && (
                <View style={[s.line, isDone && s.lineDone]} />
              )}
            </View>

            {/* ── Conteúdo ── */}
            <View style={s.content}>

              {/* Linha do rótulo */}
              <View style={s.labelRow}>
                <Text style={[
                  s.label,
                  isCurrent && s.labelCurrent,
                  isPending && s.labelPending,
                ]}>
                  {event.label}
                </Text>

                {isProgress && (
                  <View style={[s.pill, allPaid && s.pillDone]}>
                    <Text style={[s.pillText, allPaid && s.pillTextDone]}>
                      {event.progress!.value}/{event.progress!.total}
                    </Text>
                  </View>
                )}

                {isCurrent && !isProgress && (
                  <View style={s.pillCurrent}>
                    <Text style={s.pillCurrentText}>em andamento</Text>
                  </View>
                )}
              </View>

              {/* Sub-texto / data */}
              {isProgress ? (
                <>
                  {/* Barra de progresso mini */}
                  {!allPaid && (
                    <View style={s.miniBarTrack}>
                      <View style={[s.miniBarFill, { width: `${Math.round(pctBar * 100)}%` }]} />
                    </View>
                  )}
                  <Text style={[s.sub, isPending && s.subFaint]}>
                    {allPaid
                      ? 'Todos os pagamentos realizados'
                      : `${event.progress!.total - event.progress!.value} ${
                          event.progress!.total - event.progress!.value === 1 ? 'restante' : 'restantes'
                        }`}
                  </Text>
                </>
              ) : event.date ? (
                <Text style={[s.sub, isPending && s.subFaint]}>
                  {formatDataComAno(event.date)}
                </Text>
              ) : isPending ? (
                <Text style={s.subFaint}>Pendente</Text>
              ) : null}

            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: ROW_GAP,
  },

  // ── Trilho ────────────────────────────────────────────────────────────────
  rail: {
    alignItems: 'center',
    width: DOT,
    flexShrink: 0,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotDone: {
    backgroundColor: C.ink,
  },
  dotCurrent: {
    backgroundColor: C.bg,
    borderWidth: 2.5,
    borderColor: C.ink,
  },
  dotCurrentCore: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.ink,
  },
  dotPending: {
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  line: {
    flex: 1,
    width: LINE_W,
    marginTop: 5,
    marginBottom: -(ROW_GAP),
    backgroundColor: C.line,
    borderRadius: LINE_W,
  },
  lineDone: {
    backgroundColor: C.ink,
  },

  // ── Conteúdo ──────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingTop: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: C.ink,
    letterSpacing: -0.1,
  },
  labelCurrent: {
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
    lineHeight: 17,
  },
  subFaint: {
    color: C.inkFaint,
  },

  // ── Barra mini de progresso ────────────────────────────────────────────────
  miniBarTrack: {
    height: 3,
    backgroundColor: C.line,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: 6,
    marginTop: 2,
  },
  miniBarFill: {
    height: 3,
    backgroundColor: C.ink,
    borderRadius: radii.full,
  },

  // ── Pills ──────────────────────────────────────────────────────────────────
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
  pillCurrent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: C.chipMuted,
  },
  pillCurrentText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: C.inkSoft,
  },
});
