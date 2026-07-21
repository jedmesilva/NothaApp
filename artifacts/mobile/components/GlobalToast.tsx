import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import type { ToastState } from '@/contexts/ToastContext';

interface Props {
  toast: ToastState;
  onClose: () => void;
}

export default function GlobalToast({ toast, onClose }: Props) {
  const insets     = useSafeAreaInsets();
  const progress   = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(-160)).current;
  const exitAnim   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? 6000;

    translateY.setValue(-160);
    progress.setValue(1);

    // Desliza de cima com spring
    Animated.spring(translateY, {
      toValue: 0,
      damping: 22,
      stiffness: 260,
      mass: 0.9,
      useNativeDriver: true,
    }).start();

    exitAnim.current = Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    });
    exitAnim.current.start(({ finished }) => { if (finished) onClose(); });

    return () => exitAnim.current?.stop();
  }, [toast?.id]);

  if (!toast) return null;

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[s.wrap, { top: insets.top + spacing[3] }]} pointerEvents="box-none">
      <Animated.View style={[s.card, { transform: [{ translateY }] }]}>

        <View style={s.body}>
          <View style={s.iconWrap}>
            <Feather name="check" size={15} color="#fff" strokeWidth={2.8} />
          </View>

          <View style={s.textBlock}>
            <Text style={s.title}>{toast.title}</Text>
            {toast.subtitle ? (
              <Text style={s.subtitle} numberOfLines={2}>{toast.subtitle}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Feather name="x" size={13} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {toast.actionLabel && toast.onAction ? (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => { onClose(); toast.onAction?.(); }}
            activeOpacity={0.85}
          >
            <Text style={s.actionBtnText}>{toast.actionLabel}</Text>
            <Feather name="chevron-right" size={14} color={C.dark} />
          </TouchableOpacity>
        ) : null}

        {/* Barra de progresso na base */}
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: widthInterp }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  card: {
    backgroundColor: C.dark,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 16,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    paddingVertical: 11,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnText: {
    fontSize: fontSize['sm+'],
    fontFamily: fonts.semibold,
    color: '#fff',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
