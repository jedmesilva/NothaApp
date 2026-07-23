/**
 * ModalSheet — bottom-sheet animado com Reanimated + Gesture Handler.
 *
 * Features:
 *   - Entrada com spring / saída com timing suave
 *   - Drag-to-dismiss com detecção de velocidade
 *   - Backdrop com opacidade animada em sincronia com a posição do sheet
 *   - Tap no backdrop fecha o sheet
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
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
const OUT_DURATION  = 280; // ms para a saída
const DISMISS_PX    = 80;  // px arrastados para acionar dismiss
const DISMISS_VEL   = 800; // px/s de velocidade para acionar dismiss

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Padding extra no fundo (padrão: resposta à safe area) */
  bottomPad?: number;
  /** Cor de fundo do sheet (padrão: C.card) */
  bgColor?: string;
  style?: ViewStyle;
  /** Se exibe a barrinha de arraste no topo (padrão true) */
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

  // mounted controla se o Modal está na árvore. É separado de visible para
  // permitir animar a saída antes de desmontar.
  const [mounted, setMounted] = useState(visible);

  const translateY = useSharedValue(SCREEN_H);
  const sheetH     = useRef(SCREEN_H); // altura real medida no onLayout
  const closing    = useRef(false);

  // Mantém referência estável ao onClose para evitar stale closures nas worklets
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Chamado na thread JS após a animação de saída completar
  const handleDismissed = useCallback(() => {
    setMounted(false);
    onCloseRef.current();
    closing.current = false;
  }, []);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    translateY.value = withTiming(sheetH.current, { duration: OUT_DURATION }, () => {
      runOnJS(handleDismissed)();
    });
  }, [handleDismissed, translateY]);

  // Abre o sheet ao montar
  useEffect(() => {
    if (mounted) {
      closing.current = false;
      translateY.value = sheetH.current; // começa fora da tela
      translateY.value = withSpring(0, SPRING);
    }
  }, [mounted, translateY]);

  // Reage a mudanças externas de visible
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      dismiss();
    }
  }, [visible, dismiss]);

  // ── Gesto de arrastar ────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Só permite arrastar para baixo
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_PX || e.velocityY > DISMISS_VEL;
      if (shouldDismiss) {
        runOnJS(dismiss)();
      } else {
        // Snap de volta para aberto
        translateY.value = withSpring(0, SPRING);
      }
    });

  // ── Estilos animados ─────────────────────────────────────────────────────
  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetH.current],
      [1, 0],
      Extrapolation.CLAMP,
    ),
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
        {/* Backdrop ─ toca fora para fechar */}
        <Animated.View style={[s.backdrop, backdropAnimStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={dismiss}
          />
        </Animated.View>

        {/* Sheet ─ arrastável */}
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
