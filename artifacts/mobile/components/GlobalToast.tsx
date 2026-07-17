import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import type { ToastState } from '@/contexts/ToastContext';

interface Props {
  toast: ToastState;
  onClose: () => void;
}

export default function GlobalToast({ toast, onClose }: Props) {
  const progress  = useRef(new Animated.Value(1)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? 6000;
    progress.setValue(1);
    animation.current = Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    });
    animation.current.start(({ finished }) => { if (finished) onClose(); });
    return () => animation.current?.stop();
  }, [toast?.id]);

  if (!toast) return null;

  const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={s.card}>
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: widthInterp }]} />
        </View>

        <View style={s.topRow}>
          <View style={s.iconWrap}>
            <Feather name="check" size={16} color="#fff" strokeWidth={2.6} />
          </View>
          <View style={s.textBlock}>
            <Text style={s.title}>{toast.title}</Text>
            {toast.subtitle ? <Text style={s.subtitle}>{toast.subtitle}</Text> : null}
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Feather name="x" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {toast.actionLabel && toast.onAction ? (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => { onClose(); toast.onAction?.(); }}
            activeOpacity={0.85}
          >
            <Text style={s.actionBtnText}>{toast.actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 100,          // acima do bottom nav
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  card: {
    backgroundColor: C.dark,
    borderRadius: 18,
    padding: spacing[4],
    paddingBottom: spacing[3],
    overflow: 'hidden',
  },
  topRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  iconWrap:  { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textBlock: { flex: 1 },
  title:     { fontFamily: fonts.display, fontSize: fontSize['base+'], color: '#fff', marginBottom: 2 },
  subtitle:  { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)', fontFamily: fonts.regular },
  closeBtn:  { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionBtn:     { width: '100%', paddingVertical: 11, borderRadius: radii.md, backgroundColor: '#fff', alignItems: 'center', marginBottom: 10 },
  actionBtnText: { fontSize: fontSize['sm+'], fontFamily: fonts.bold, color: C.dark },
  progressTrack: { marginHorizontal: -spacing[4], marginTop: -spacing[4], marginBottom: spacing[3], height: 3, backgroundColor: 'rgba(255,255,255,0.16)', overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: '#fff', borderRadius: radii.full },
});
