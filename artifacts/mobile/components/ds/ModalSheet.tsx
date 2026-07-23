/**
 * ModalSheet — bottom-sheet animado com Reanimated + Gesture Handler.
 *
 * Features:
 *   - Entrada com spring / saída com timing suave
 *   - Backdrop com opacidade animada via shared value dedicado
 *   - Drag-to-dismiss com detecção de posição e velocidade
 *   - Tap no backdrop fecha o sheet
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette as C, radii, shadows } from '@/constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

const SPRING: Parameters<typeof withSpring>[1] = {
  damping: 50,
  stiffness: 400,
  mass: 0.8,
};
const OPEN_BACKDROP_MS  = 250; // ms para o backdrop aparecer
const OUT_MS            = 260; // ms para a saída
const DISMISS_PX        = 80;  // px arrastados para acionar dismiss
const DISMISS_VEL       = 800; // px/s de velocidade para acionar dismiss

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  bottomPad?: number;
  bgColor?: string;
  style?: ViewStyle;
  grabber?: boolean;
};

export function ModalSheet({
  visible,
  onClose,
  children,
  bottomPad,
  bgColor = C.card,
  style,
  grabber = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const botPad =
    bottomPad ??
    (Platform.OS === 'web' ? 28 : insets.bottom > 0 ? insets.bottom + 12 : 28);

  const [mounted, setMounted] = useState(visible);

  // translateY controla a posição vertical do sheet
  const translateY      = useSharedValue(SCREEN_H);
  // backdropOpacity é um shared value dedicado — sem depender de refs em worklets
  const backdropOpacity = useSharedValue(0);

  // Altura real do sheet (medida no onLayout), usada apenas em código JS
  const sheetH  = useRef(SCREEN_H);
  // Evita double-dismiss quando o parent reage ao onClose setando visible=false
  const closing = useRef(false);

  // Referência estável ao onClose para não criar closures antigas nas worklets
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Chamado na thread JS após a animação de saída terminar
  const handleDismissed = useCallback(() => {
    setMounted(false);
    onCloseRef.current();
    // Reseta closing SÓ depois de unmount para impedir que o useEffect do
    // visible=false dispare um segundo dismiss enquanto ainda animamos
    closing.current = false;
  }, []);

  const animateOut = useCallback(() => {
    // Anima backdrop e sheet de forma independente; sheet pode usar a altura
    // real porque isso roda na thread JS, não num worklet
    backdropOpacity.value = withTiming(0, { duration: OUT_MS });
    translateY.value = withTiming(sheetH.current, { duration: OUT_MS }, () => {
      runOnJS(handleDismissed)();
    });
  }, [backdropOpacity, handleDismissed, translateY]);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    animateOut();
  }, [animateOut]);

  // Abre o sheet ao montar
  useEffect(() => {
    if (mounted) {
      closing.current = false;
      translateY.value      = sheetH.current;
      backdropOpacity.value = 0;
      translateY.value      = withSpring(0, SPRING);
      backdropOpacity.value = withTiming(1, { duration: OPEN_BACKDROP_MS });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Reage a mudanças externas de visible
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      dismiss();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Gesto de arrastar ────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value      = e.translationY;
        // Dimmer o backdrop proporcionalmente enquanto arrasta
        backdropOpacity.value = Math.max(
          0,
          1 - e.translationY / (sheetH.current || SCREEN_H),
        );
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_PX || e.velocityY > DISMISS_VEL;
      if (shouldDismiss) {
        runOnJS(dismiss)();
      } else {
        // Snap de volta para aberto
        translateY.value      = withSpring(0, SPRING);
        backdropOpacity.value = withTiming(1, { duration: OPEN_BACKDROP_MS });
      }
    });

  // ── Estilos animados ─────────────────────────────────────────────────────
  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={s.root}>
        {/* Backdrop com opacidade animada */}
        <Animated.View style={[s.backdrop, backdropAnimStyle]}>
          <TouchableWithoutFeedback onPress={dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Sheet arrastável */}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              s.sheet,
              { backgroundColor: bgColor, paddingBottom: botPad },
              sheetAnimStyle,
              style,
            ]}
            onLayout={(e) => {
              sheetH.current = e.nativeEvent.layout.height;
            }}
          >
            {grabber && <View style={s.grabber} />}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.scrim,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    padding: 24,
    paddingTop: 14,
    ...shadows.sheet,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: C.line,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
