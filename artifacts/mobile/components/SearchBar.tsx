import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar', style }: Props) {
  return (
    <View style={[s.wrap, style]}>
      <Feather name="search" size={17} color={C.inkFaint} />
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={C.inkFaint}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: radii.lg, backgroundColor: C.card },
  input: { flex: 1, fontSize: fontSize['md+'], color: C.ink, fontFamily: fonts.regular, padding: 0 },
});
