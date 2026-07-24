/**
 * ConfirmDialog — diálogo de confirmação centralizado do DS.
 *
 * Padrão consagrado para ações destrutivas ou irreversíveis:
 * overlay escuro com card centralizado, título, descrição e botões.
 *
 * Props:
 *  - visible        : controla exibição
 *  - title          : título do dialog
 *  - description    : texto explicativo (opcional)
 *  - confirmLabel   : rótulo do botão de confirmação (padrão: "Confirmar")
 *  - cancelLabel    : rótulo do botão de cancelar (padrão: "Cancelar")
 *  - variant        : "danger" deixa o botão confirmar vermelho
 *  - loading        : desabilita botões e mostra spinner no confirm
 *  - onConfirm      : callback ao confirmar
 *  - onCancel       : callback ao cancelar / fechar
 */
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const SPRING_IN  = { damping: 22, stiffness: 340, mass: 0.7 } as const;
const TIMING_OUT = { duration: 160 } as const;

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'default',
  loading      = false,
  onConfirm,
  onCancel,
}: Props) {
  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0.88);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value   = withSpring(1, SPRING_IN);
    } else {
      opacity.value = withTiming(0, TIMING_OUT);
      scale.value   = withTiming(0.88, TIMING_OUT);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle     = useAnimatedStyle(() => ({
    opacity:  opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isDanger = variant === 'danger';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={loading ? undefined : onCancel}>
        <Animated.View style={[s.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Card centralizado — não propaga toque para o backdrop */}
      <View style={s.center} pointerEvents="box-none">
        <Animated.View style={[s.card, cardStyle]}>
          {/* Ícone decorativo */}
          <View style={[s.iconWrap, isDanger && s.iconWrapDanger]}>
            <Feather
              name={isDanger ? 'alert-triangle' : 'help-circle'}
              size={24}
              color={isDanger ? C.red : C.inkSoft}
            />
          </View>

          <Text style={s.title}>{title}</Text>

          {description ? (
            <Text style={s.description}>{description}</Text>
          ) : null}

          {/* Botões */}
          <View style={s.actions}>
            {/* Cancelar */}
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            {/* Confirmar */}
            <TouchableOpacity
              style={[s.confirmBtn, isDanger && s.confirmBtnDanger, loading && s.btnDisabled]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.scrimHeavy,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: C.card,
    borderRadius: radii.hero,
    padding: spacing[6],
    alignItems: 'center',
  },

  // Ícone decorativo
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: C.chipMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  iconWrapDanger: {
    backgroundColor: C.redBg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSize['base+'],
    color: C.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[2],
  },

  actions: {
    width: '100%',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  cancelBtn: {
    paddingVertical: 15,
    borderRadius: radii.xl,
    backgroundColor: C.chipMuted,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.bold,
    fontSize: fontSize['lg+'],
    color: C.inkSoft,
  },
  confirmBtn: {
    paddingVertical: 15,
    borderRadius: radii.xl,
    backgroundColor: C.dark,
    alignItems: 'center',
  },
  confirmBtnDanger: {
    backgroundColor: C.red,
  },
  confirmText: {
    fontFamily: fonts.bold,
    fontSize: fontSize['lg+'],
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
