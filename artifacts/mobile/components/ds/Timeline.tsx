/**
 * Timeline — linha do tempo vertical do DS.
 *
 * Três estados visuais de passo:
 *   done    → ponto sólido escuro + check
 *   current → anel escuro (primeiro passo não-concluído)
 *   pending → anel cinza claro
 *
 * O passo de progresso aceita `subEvents` para exibir parcelas
 * individuais quando expandido.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { formatDataComAno, formatBRL } from '@/data/loans';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TimelineSubEvent = {
  number: number;
  date: Date;
  status: 'paid' | 'overdue' | 'pending';
  amountCents?: number;
};

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
      subEvents?: TimelineSubEvent[];
    };

type Props = {
  events: TimelineEvent[];
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const DOT     = 22;
const LINE_W  = 2;
const ROW_GAP = 32;

// ─── Componente principal ────────────────────────────────────────────────────

export function Timeline({ events }: Props) {
  const currentIdx = events.findIndex((e) => !e.done);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <View>
      {events.map((event, i) => {
        const isLast        = i === events.length - 1;
        const isDone        = event.done;
        const isCurrent     = i === currentIdx;
        const isPending     = !isDone && !isCurrent;
        const isProgress    = event.progress !== undefined;
        const allPaid       = isProgress && event.progress!.value >= event.progress!.total;
        const pctBar        = isProgress && event.progress!.total > 0
          ? event.progress!.value / event.progress!.total
          : 0;
        const subEvents     = isProgress ? (event as any).subEvents as TimelineSubEvent[] | undefined : undefined;
        const hasSubEvents  = !!subEvents && subEvents.length > 0;
        const isExpanded    = expanded.has(i);

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
              {!isLast && <View style={[s.line, isDone && s.lineDone]} />}
            </View>

            {/* ── Conteúdo ── */}
            <View style={s.content}>

              {/* Cabeçalho do passo */}
              <TouchableOpacity
                disabled={!hasSubEvents}
                onPress={() => toggle(i)}
                activeOpacity={0.7}
                style={s.labelRow}
              >
                <Text style={[
                  s.label,
                  isCurrent && s.labelCurrent,
                  isPending && s.labelPending,
                ]}>
                  {event.label}
                </Text>

                {isCurrent && !isProgress && (
                  <View style={s.pillCurrent}>
                    <Text style={s.pillCurrentText}>em andamento</Text>
                  </View>
                )}

                {hasSubEvents && (
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={C.inkFaint}
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>

              {/* Barra de progresso mini — só quando há progresso real */}
              {isProgress && !allPaid && pctBar > 0 && (
                <View style={s.miniBarTrack}>
                  <View style={[s.miniBarFill, { width: `${Math.round(pctBar * 100)}%` }]} />
                </View>
              )}

              {/* Sub-texto */}
              {isProgress ? (
                <Text style={[s.sub, isPending && s.subFaint]}>
                  {allPaid
                    ? 'Todos os pagamentos realizados'
                    : `${event.progress!.value}/${event.progress!.total} restantes`}
                </Text>
              ) : event.date ? (
                <Text style={[s.sub, isPending && s.subFaint]}>
                  {formatDataComAno(event.date)}
                </Text>
              ) : isPending ? (
                <Text style={s.subFaint}>Pendente</Text>
              ) : null}

              {/* ── Lista de parcelas expandida ── */}
              {hasSubEvents && isExpanded && (
                <View style={s.subList}>
                  {subEvents!.map((sub, si) => {
                    const isPaid    = sub.status === 'paid';
                    const isOverdue = sub.status === 'overdue';
                    const amount    = sub.amountCents != null ? sub.amountCents / 100 : null;
                    const dateLabel = isPaid
                      ? `Pago em ${formatDataComAno(sub.date)}`
                      : isOverdue
                      ? `Venceu em ${formatDataComAno(sub.date)}`
                      : `Vence em ${formatDataComAno(sub.date)}`;

                    return (
                      <View
                        key={si}
                        style={[
                          s.subRow,
                          si > 0 && s.subRowBorder,
                          isOverdue && s.subRowOverdue,
                        ]}
                      >
                        {/* Número da parcela */}
                        <View style={[s.subNum, isPaid && s.subNumPaid, isOverdue && s.subNumOverdue]}>
                          <Text style={[s.subNumText, (isPaid || isOverdue) && s.subNumTextAlt]}>
                            {sub.number}
                          </Text>
                        </View>

                        {/* Info */}
                        <View style={s.subInfo}>
                          <Text style={[s.subDateLabel, isOverdue && s.subDateLabelOverdue]}>
                            {dateLabel}
                          </Text>
                          {amount != null && (
                            <Text style={s.subAmount}>R$ {formatBRL(Math.round(amount))}</Text>
                          )}
                        </View>

                        {/* Status */}
                        {isPaid && <Feather name="check" size={14} color={C.inkSoft} />}
                        {isOverdue && (
                          <Text style={s.subOverdueTag}>Em atraso</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: ROW_GAP,
  },

  // Trilho
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
  dotDone:        { backgroundColor: C.ink },
  dotCurrent:     { backgroundColor: C.bg, borderWidth: 2.5, borderColor: C.ink },
  dotCurrentCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.ink },
  dotPending:     { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.line },
  line: {
    flex: 1,
    width: LINE_W,
    marginTop: 5,
    marginBottom: -(ROW_GAP),
    backgroundColor: C.line,
    borderRadius: LINE_W,
  },
  lineDone: { backgroundColor: C.ink },

  // Conteúdo
  content:  { flex: 1, paddingTop: 1 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  label:        { fontSize: fontSize.md, fontFamily: fonts.bold, color: C.ink, letterSpacing: -0.1 },
  labelCurrent: { color: C.ink },
  labelPending: { color: C.inkFaint, fontFamily: fonts.semibold },
  sub:          { fontSize: fontSize['sm+'], fontFamily: fonts.regular, color: C.inkSoft, lineHeight: 17 },
  subFaint:     { color: C.inkFaint },

  // Barra mini
  miniBarTrack: {
    height: 3,
    backgroundColor: C.line,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: 6,
    marginTop: 2,
  },
  miniBarFill: { height: 3, backgroundColor: C.ink, borderRadius: radii.full },

  // Pill "em andamento"
  pillCurrent:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full, backgroundColor: C.chipMuted },
  pillCurrentText: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: C.inkSoft },

  // Sub-lista de parcelas
  subList: {
    marginTop: spacing[3],
    borderRadius: radii.lg,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  subRowBorder:  { borderTopWidth: 1, borderTopColor: C.line },
  subRowOverdue: { backgroundColor: C.redBg },

  // Badge de número
  subNum: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subNumPaid:     { backgroundColor: C.chipMuted },
  subNumOverdue:  { backgroundColor: C.red },
  subNumText:     { fontSize: fontSize.xs, fontFamily: fonts.bold, color: C.inkSoft },
  subNumTextAlt:  { color: '#fff' },

  // Texto da parcela
  subInfo:              { flex: 1 },
  subDateLabel:         { fontSize: fontSize['sm+'], fontFamily: fonts.regular, color: C.inkSoft },
  subDateLabelOverdue:  { color: C.red, fontFamily: fonts.semibold },
  subAmount:            { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkFaint, marginTop: 1 },

  // Tag de atraso
  subOverdueTag: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: C.red, flexShrink: 0 },
});
