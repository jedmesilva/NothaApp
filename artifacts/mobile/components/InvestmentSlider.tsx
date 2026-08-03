/**
 * InvestmentSlider — horizontal drag slider, correto e sem bugs.
 *
 * Funcionamento:
 * - Toque em qualquer ponto da trilha: thumb pula para ali imediatamente.
 * - Arrastar: thumb segue o dedo a partir do ponto tocado.
 * - PanResponder captura o gesto antes do ScrollView pai.
 * - Thumb nunca é clipado: sua posição é calculada dentro dos limites [0, trackWidth - THUMB_SIZE].
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

const THUMB_SIZE   = 28;   // diâmetro do thumb
const TRACK_HEIGHT = 5;
const HIT_SLOP     = 10;   // área de toque extra acima/abaixo (total: THUMB_SIZE + 2*HIT_SLOP)

interface Props {
  minCents:   number;
  maxCents:   number;
  valueCents: number;
  onChange:   (cents: number) => void;
  showValue?: boolean;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvestmentSlider({
  minCents,
  maxCents,
  valueCents,
  onChange,
  showValue = true,
}: Props) {
  // ── Refs (sempre atuais dentro dos closures do PanResponder) ─────────────────
  const trackWidth    = useRef(0);
  const currentCents  = useRef(valueCents);
  const minRef        = useRef(minCents);
  const maxRef        = useRef(maxCents);
  const onChangeRef   = useRef(onChange);
  const grantTouchX   = useRef(0);   // locationX do ponto de toque inicial

  currentCents.current = valueCents;
  minRef.current       = minCents;
  maxRef.current       = maxCents;
  onChangeRef.current  = onChange;

  // ── Converte posição em pixels → cents (clampado e snappado) ─────────────────
  function pixelToCents(px: number): number {
    const w = trackWidth.current;
    if (w <= 0) return currentCents.current;
    const ratio   = Math.max(0, Math.min(1, px / w));
    const raw     = minRef.current + ratio * (maxRef.current - minRef.current);
    return Math.round(raw / 100) * 100;
  }

  // ── PanResponder ──────────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Captura antes do ScrollView pai
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onStartShouldSetPanResponder:        () => true,
      onMoveShouldSetPanResponder:         () => true,

      onPanResponderGrant: (evt) => {
        // locationX = posição do dedo dentro do trackWrap
        const lx = evt.nativeEvent.locationX;
        grantTouchX.current = lx;
        // Thumb pula imediatamente para onde o usuário tocou
        const newValue = pixelToCents(lx);
        if (newValue !== currentCents.current) {
          onChangeRef.current(newValue);
        }
      },

      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        // Posição atual = ponto do toque inicial + delta desde então
        const newX     = grantTouchX.current + gs.dx;
        const newValue = pixelToCents(newX);
        if (newValue !== currentCents.current) {
          onChangeRef.current(newValue);
        }
      },

      onPanResponderRelease: () => {},
    }),
  ).current;

  // ── Layout ────────────────────────────────────────────────────────────────────
  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  // ── Posição do thumb ──────────────────────────────────────────────────────────
  // O thumb viaja de 0 a (trackWidth - THUMB_SIZE), mantendo-se sempre dentro
  // dos limites visuais da trilha.
  const range    = maxCents - minCents;
  const fillPct  = range > 0 ? ((valueCents - minCents) / range) * 100 : 0;
  const thumbPx  = trackWidth.current > 0 && range > 0
    ? ((valueCents - minCents) / range) * (trackWidth.current - THUMB_SIZE)
    : 0;

  const isMin = valueCents <= minCents;
  const isMax = valueCents >= maxCents;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={s.wrap}>
      {/* Valor atual */}
      {showValue && (
        <View style={s.labelRow}>
          <Text style={s.valueLabel}>R$ {formatBRL(valueCents)}</Text>
          {isMax && <Text style={s.maxTag}>valor cheio</Text>}
          {isMin && <Text style={s.minTag}>mínimo</Text>}
        </View>
      )}

      {/* Área de toque — contém trilha + thumb */}
      <View
        style={s.trackWrap}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Trilha */}
        <View style={s.track}>
          <View style={[s.fill, { width: `${fillPct}%` as any }]} />
        </View>

        {/* Thumb — posicionado com left dentro do trackWrap */}
        <View
          style={[
            s.thumb,
            {
              left: thumbPx,
              top:  (THUMB_SIZE + HIT_SLOP * 2 - THUMB_SIZE) / 2,  // centrado verticalmente
            },
          ]}
        />
      </View>

      {/* Rótulos de extremos */}
      <View style={s.rangeRow}>
        <Text style={s.rangeLabel}>R$ {formatBRL(minCents)}</Text>
        <Text style={s.rangeLabel}>R$ {formatBRL(maxCents)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'visible',
  },

  // ── Valor ─────────────────────────────────────────────────────────────────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing[3],
  },
  valueLabel: {
    fontFamily: fonts.display,
    fontSize:   fontSize['2xl'],
    color:      C.ink,
    letterSpacing: -0.4,
  },
  maxTag: {
    fontSize:         fontSize.xs,
    fontFamily:       fonts.semibold,
    color:            C.inkSoft,
    backgroundColor:  C.chipMuted,
    borderRadius:     radii.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  minTag: {
    fontSize:         fontSize.xs,
    fontFamily:       fonts.semibold,
    color:            C.amber,
    backgroundColor:  C.amberBg,
    borderRadius:     radii.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },

  // ── Trilha ────────────────────────────────────────────────────────────────────
  trackWrap: {
    height:         THUMB_SIZE + HIT_SLOP * 2,
    justifyContent: 'center',
    position:       'relative',
    overflow:       'visible',
  },
  track: {
    width:        '100%',
    height:       TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: C.line,
    overflow:     'hidden',
  },
  fill: {
    height:          '100%',
    backgroundColor: C.dark,
    borderRadius:    TRACK_HEIGHT / 2,
  },

  // ── Thumb ─────────────────────────────────────────────────────────────────────
  thumb: {
    position:        'absolute',
    width:           THUMB_SIZE,
    height:          THUMB_SIZE,
    borderRadius:    THUMB_SIZE / 2,
    backgroundColor: C.dark,
    borderWidth:     3,
    borderColor:     '#fff',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.20,
    shadowRadius:    5,
    elevation:       5,
  },

  // ── Rótulos ────────────────────────────────────────────────────────────────────
  rangeRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    marginTop:         6,
  },
  rangeLabel: {
    fontSize:   fontSize.xs,
    fontFamily: fonts.regular,
    color:      C.inkFaint,
  },
});
