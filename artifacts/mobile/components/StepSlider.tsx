/**
 * StepSlider — slider de valores inteiros com passo configurável.
 *
 * Mesma mecânica de PanResponder do ValueSlider:
 *  - Toque em qualquer ponto da trilha: thumb pula imediatamente.
 *  - Arrastar: thumb segue o dedo com precisão.
 *  - Captura o gesto antes do ScrollView pai.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

const THUMB_SIZE   = 28;
const TRACK_HEIGHT = 5;
const HIT_SLOP     = 10;

interface Props {
  min:          number;
  max:          number;
  value:        number;
  step?:        number;
  onChange:     (n: number) => void;
  /** Rótulo do valor mínimo exibido abaixo da trilha */
  formatMin?:   (n: number) => string;
  /** Rótulo do valor máximo exibido abaixo da trilha */
  formatMax?:   (n: number) => string;
  context?:     'light' | 'dark';
  style?:       object;
}

export default function StepSlider({
  min,
  max,
  value,
  step = 1,
  onChange,
  formatMin,
  formatMax,
  context = 'light',
  style,
}: Props) {
  const isDark = context === 'dark';

  // Refs — sempre atuais dentro dos closures do PanResponder
  const trackWidth      = useRef(0);
  const [trackWidthState, setTrackWidthState] = useState(0);
  const currentValue    = useRef(value);
  const minRef          = useRef(min);
  const maxRef          = useRef(max);
  const stepRef         = useRef(step);
  const onChangeRef     = useRef(onChange);
  const grantTouchX     = useRef(0);

  currentValue.current  = value;
  minRef.current        = min;
  maxRef.current        = max;
  stepRef.current       = step;
  onChangeRef.current   = onChange;

  // Converte pixels → valor inteiro snappado ao step
  function pixelToValue(px: number): number {
    const w = trackWidth.current;
    if (w <= 0) return currentValue.current;
    const ratio  = Math.max(0, Math.min(1, px / w));
    const raw    = minRef.current + ratio * (maxRef.current - minRef.current);
    const snapped = Math.round(raw / stepRef.current) * stepRef.current;
    return Math.max(minRef.current, Math.min(maxRef.current, snapped));
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onStartShouldSetPanResponder:        () => true,
      onMoveShouldSetPanResponder:         () => true,

      onPanResponderGrant: (evt) => {
        const lx = evt.nativeEvent.locationX;
        grantTouchX.current = lx;
        const next = pixelToValue(lx);
        if (next !== currentValue.current) onChangeRef.current(next);
      },

      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        const newX = grantTouchX.current + gs.dx;
        const next = pixelToValue(newX);
        if (next !== currentValue.current) onChangeRef.current(next);
      },

      onPanResponderRelease: () => {},
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidth.current = w;
    setTrackWidthState(w);
  };

  const range   = max - min;
  const fillPct = range > 0 ? ((value - min) / range) * 100 : 0;
  const thumbPx = trackWidthState > 0 && range > 0
    ? ((value - min) / range) * (trackWidthState - THUMB_SIZE)
    : 0;

  // Cores por contexto
  const trackBgColor  = isDark ? 'rgba(255,255,255,0.22)' : C.line;
  const fillColor     = isDark ? '#fff'                   : C.dark;
  const thumbBgColor  = isDark ? '#fff'                   : C.dark;
  const thumbBdColor  = isDark ? C.dark                   : '#fff';
  const rangeTxtColor = isDark ? 'rgba(255,255,255,0.45)' : C.inkFaint;

  const minLabel = formatMin ? formatMin(min) : String(min);
  const maxLabel = formatMax ? formatMax(max) : String(max);

  return (
    <View style={[s.wrap, style]}>
      {/* Área de toque — trilha + thumb */}
      <View
        style={s.trackWrap}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Trilha */}
        <View style={[s.track, { backgroundColor: trackBgColor }]}>
          <View style={[s.fill, { width: `${fillPct}%` as any, backgroundColor: fillColor }]} />
        </View>

        {/* Thumb */}
        <View
          style={[
            s.thumb,
            {
              left:            thumbPx,
              top:             (THUMB_SIZE + HIT_SLOP * 2 - THUMB_SIZE) / 2,
              backgroundColor: thumbBgColor,
              borderColor:     thumbBdColor,
            },
          ]}
        />
      </View>

      {/* Rótulos de extremos */}
      <View style={s.rangeRow}>
        <Text style={[s.rangeLabel, { color: rangeTxtColor }]}>{minLabel}</Text>
        <Text style={[s.rangeLabel, { color: rangeTxtColor }]}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width:    '100%',
    overflow: 'visible',
  },

  trackWrap: {
    height:         THUMB_SIZE + HIT_SLOP * 2,
    justifyContent: 'center',
    position:       'relative',
    overflow:       'visible',
  },
  track: {
    width:           '100%',
    height:          TRACK_HEIGHT,
    borderRadius:    TRACK_HEIGHT / 2,
    overflow:        'hidden',
  },
  fill: {
    height:       '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position:        'absolute',
    width:           THUMB_SIZE,
    height:          THUMB_SIZE,
    borderRadius:    THUMB_SIZE / 2,
    borderWidth:     3,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.20,
    shadowRadius:    5,
    elevation:       5,
  },

  rangeRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      6,
  },
  rangeLabel: {
    fontSize:   fontSize.xs,
    fontFamily: fonts.regular,
  },
});
