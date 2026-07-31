/**
 * InfoRows — lista vertical de linhas label/valor separadas por divisórias.
 *
 * Cada item tem:
 *   - label    — texto à esquerda (ex: "Taxa total")
 *   - value    — texto à direita (ex: "14.3%")
 *   - sub?     — sub-texto abaixo do valor, alinhado à direita
 *   - onInfo?  — quando presente, exibe ícone ⓘ ao lado do label
 *
 * Uso:
 *   <InfoRows
 *     items={[
 *       { label: 'Prazo',      value: '56 dias', sub: 'vence 14 out' },
 *       { label: 'Taxa total', value: '14.3%',   onInfo: () => setModalVisible(true) },
 *     ]}
 *   />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fontSize, fonts } from '@/constants/theme';

export type InfoRowItem = {
  label: string;
  value: string;
  sub?: string;
  onInfo?: () => void;
};

type Props = {
  items: InfoRowItem[];
  style?: ViewStyle;
};

export function InfoRows({ items, style }: Props) {
  return (
    <View style={[s.container, style]}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={s.divider} />}
          <View style={s.row}>
            {/* Label (+ optional info icon) */}
            <View style={s.labelGroup}>
              <Text style={s.label}>{item.label}</Text>
              {item.onInfo != null && (
                <TouchableOpacity
                  onPress={item.onInfo}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.6}
                >
                  <Feather name="info" size={14} color={C.inkFaint} />
                </TouchableOpacity>
              )}
            </View>

            {/* Value (+ optional sub) */}
            {item.sub != null ? (
              <View style={s.valueGroup}>
                <Text style={s.value}>{item.value}</Text>
                <Text style={s.sub}>{item.sub}</Text>
              </View>
            ) : (
              <Text style={s.value}>{item.value}</Text>
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 18,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  divider: { height: 1, backgroundColor: C.line },
  labelGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.inkFaint },
  valueGroup: { alignItems: 'flex-end' },
  value: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: C.ink },
  sub: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkFaint, marginTop: 2 },
});
