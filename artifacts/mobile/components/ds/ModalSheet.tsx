/**
 * ModalSheet — bottom-sheet modal pattern used in:
 *   - Ofertas confirm sheet
 *   - Ativos filter sheet
 *   - Emprestimo-detalhe timeline sheet
 *
 * Wraps React Native Modal with a scrim + rounded sheet + grabber handle.
 * Tap the scrim (outside) to dismiss.
 */
import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette as C, radii, shadows } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Extra bottom padding added to the sheet (defaults to safe-area-aware value) */
  bottomPad?: number;
  /** Background color of the sheet surface (default: card/white) */
  bgColor?: string;
  style?: ViewStyle;
  /** Whether to render the top grabber handle (default true) */
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
  const botPad = bottomPad ?? (Platform.OS === 'web' ? 28 : insets.bottom > 0 ? insets.bottom + 12 : 28);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        {/* Inner touch stops propagation so tapping inside the sheet doesn't close it */}
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              s.sheet,
              { backgroundColor: bgColor, paddingBottom: botPad },
              style,
            ]}
          >
            {grabber && <View style={s.grabber} />}
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
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
