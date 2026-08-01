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
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const progress   = useRef(new Animated.Value(1)).current;
  const exitAnim   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? 5000;

    translateY.setValue(120);
    opacity.setValue(0);
    progress.setValue(1);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 300,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    exitAnim.current = Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    });
    exitAnim.current.start(({ finished }) => {
      if (finished) {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());
      }
    });

    return () => exitAnim.current?.stop();
  }, [toast?.id]);

  if (!toast) return null;

  const bottomOffset = (insets.bottom || 0) + 72; // acima do bottom nav

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
      onPress={onClose}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          s.card,
          { bottom: bottomOffset, opacity, transform: [{ translateY }] },
        ]}
        onStartShouldSetResponder={() => true}
      >
        {/* Conteúdo principal */}
        <View style={s.row}>
          {/* Ícone */}
          <View style={s.iconWrap}>
            <Feather name="check" size={17} color="#fff" strokeWidth={2.8} />
          </View>

          {/* Textos */}
          <View style={s.textWrap}>
            <Text style={s.title} numberOfLines={1}>{toast.title}</Text>
            {toast.subtitle ? (
              <Text style={s.subtitle} numberOfLines={2}>{toast.subtitle}</Text>
            ) : null}
          </View>

          {/* Ação ou fechar */}
          {toast.actionLabel && toast.onAction ? (
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => { onClose(); toast.onAction?.(); }}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            >
              <Text style={s.actionBtnText}>{toast.actionLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            >
              <Feather name="x" size={15} color={C.inkFaint} />
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de progresso */}
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: widthInterp }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    backgroundColor: C.card,
    borderRadius: radii.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4] - 2,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.base,
    color: C.ink,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize['sm+'],
    color: C.inkSoft,
    lineHeight: 16,
    marginTop: 2,
  },

  actionBtn: {
    flexShrink: 0,
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    borderRadius: radii.md,
    backgroundColor: C.dark,
  },
  actionBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: '#fff',
  },

  closeBtn: {
    flexShrink: 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTrack: {
    height: 3,
    backgroundColor: C.line,
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.dark,
  },
});
