import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
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
  const translateY = useRef(new Animated.Value(300)).current;
  const progress   = useRef(new Animated.Value(1)).current;
  const exitAnim   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? 6000;

    translateY.setValue(300);
    progress.setValue(1);

    // Slide up com spring — igual ao padrão de bottom sheet do app
    Animated.spring(translateY, {
      toValue: 0,
      damping: 24,
      stiffness: 280,
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
    // Scrim — toca fora para fechar
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
      <Animated.View
        style={[s.sheet, { paddingBottom: insets.bottom + spacing[4], transform: [{ translateY }] }]}
        // Impede que toques no sheet propaguem para o scrim
        onStartShouldSetResponder={() => true}
      >
        {/* Barra de tempo no topo do sheet */}
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: widthInterp }]} />
        </View>

        {/* Ícone de confirmação */}
        <View style={s.iconWrap}>
          <Feather name="check" size={22} color="#fff" strokeWidth={2.6} />
        </View>

        <Text style={s.title}>{toast.title}</Text>
        {toast.subtitle ? (
          <Text style={s.subtitle}>{toast.subtitle}</Text>
        ) : null}

        {/* Botões */}
        <View style={s.buttonRow}>
          <TouchableOpacity style={s.dismissBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.dismissBtnText}>Fechar</Text>
          </TouchableOpacity>

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
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 20,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: C.line,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing[5],
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.dark,
    borderRadius: radii.full,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: C.inkSoft,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[5],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
    marginTop: spacing[2],
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radii.lg,
    backgroundColor: C.chipMuted,
    alignItems: 'center',
  },
  dismissBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: C.ink,
  },
  actionBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: radii.lg,
    backgroundColor: C.dark,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: '#fff',
  },
});
