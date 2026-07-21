import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import type { ToastState } from '@/contexts/ToastContext';

interface Props {
  toast: ToastState;
  onClose: () => void;
}

const GREEN = '#22C55E';

export default function GlobalToast({ toast, onClose }: Props) {
  const progress   = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const exitAnim   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? 6000;

    // Reset
    translateY.setValue(80);
    opacity.setValue(0);
    progress.setValue(1);

    // Entrance: spring slide-up + quick fade-in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss progress
    exitAnim.current = Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    });
    exitAnim.current.start(({ finished }) => { if (finished) onClose(); });

    return () => exitAnim.current?.stop();
  }, [toast?.id]);

  if (!toast) return null;

  const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={s.overlay} pointerEvents="box-none">
      <Animated.View style={[s.card, { transform: [{ translateY }], opacity }]}>

        <View style={s.topRow}>
          <View style={s.iconWrap}>
            <Feather name="check" size={17} color="#fff" strokeWidth={2.8} />
          </View>

          <View style={s.textBlock}>
            <Text style={s.title}>{toast.title}</Text>
            {toast.subtitle ? <Text style={s.subtitle}>{toast.subtitle}</Text> : null}
          </View>

          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Feather name="x" size={14} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>
        </View>

        {toast.actionLabel && toast.onAction ? (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => { onClose(); toast.onAction?.(); }}
            activeOpacity={0.85}
          >
            <Text style={s.actionBtnText}>{toast.actionLabel}</Text>
            <Feather name="arrow-right" size={14} color={C.dark} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ) : null}

        {/* Progress bar at bottom edge */}
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: widthInterp }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 104,
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#1C1C26',
    borderRadius: 22,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    overflow: 'hidden',
    // Float above everything with a strong shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // Glow under the icon
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  textBlock: {
    flex: 1,
    paddingTop: 3,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: '#fff',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: fontSize['sm+'],
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fonts.regular,
    lineHeight: 17,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  actionBtnText: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: C.dark,
  },
  progressTrack: {
    marginHorizontal: -spacing[4],
    marginBottom: -spacing[3],
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
  },
});
