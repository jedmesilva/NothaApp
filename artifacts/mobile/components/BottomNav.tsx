import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useArea } from '@/contexts/AreaContext';
import { palette as C, fonts, fontSize, radii, shadows } from '@/constants/theme';

type TabDef = {
  name: string;
  label: string;
  area: 'credito' | 'investir';
  icon: (active: boolean) => React.ReactNode;
};

const WHITE       = '#FFFFFF';
const WHITE_MID   = 'rgba(255,255,255,0.50)';
const WHITE_SOFT  = 'rgba(255,255,255,0.12)';

const CREDITO_TABS: TabDef[] = [
  {
    name: 'index', label: 'Início', area: 'credito',
    icon: (a) => <Feather name="home" size={19} color={a ? WHITE : WHITE_MID} />,
  },
  {
    name: 'emprestimos', label: 'Empréstimos', area: 'credito',
    icon: (a) => <MaterialCommunityIcons name="bank-outline" size={19} color={a ? WHITE : WHITE_MID} />,
  },
];

const INVESTIR_TABS: TabDef[] = [
  {
    name: 'carteira', label: 'Início', area: 'investir',
    icon: (a) => <Feather name="home" size={19} color={a ? WHITE : WHITE_MID} />,
  },
  {
    name: 'ofertas', label: 'Ofertas', area: 'investir',
    icon: (a) => <Feather name="tag" size={19} color={a ? WHITE : WHITE_MID} />,
  },
];

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { area, setArea } = useArea();

  const tabs = area === 'investir' ? INVESTIR_TABS : CREDITO_TABS;
  const currentRouteName = state.routes[state.index]?.name;

  const onPress = (tab: TabDef) => {
    if (tab.name === 'emprestimos') setArea('credito');
    if (tab.name === 'ofertas' || tab.name === 'carteira') setArea('investir');

    const route = state.routes.find((r) => r.name === tab.name);
    const isActive = currentRouteName === tab.name;
    const event = navigation.emit({
      type: 'tabPress',
      target: route?.key ?? tab.name,
      canPreventDefault: true,
    });
    if (!isActive && !event.defaultPrevented) navigation.navigate(tab.name);
  };

  // "Início" no Investir aponta para carteira; quando o usuário está no
  // index (scroll horizontal) na área investir, destacamos o tab Início.
  const isTabActive = (tab: TabDef) => {
    if (tab.name === 'carteira' && area === 'investir' && currentRouteName === 'index') return true;
    return currentRouteName === tab.name;
  };

  return (
    <View
      style={[
        s.container,
        { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom > 0 ? insets.bottom - 4 : 8 },
      ]}
    >
      <View style={s.pill}>
        {tabs.map((tab) => {
          const isActive = isTabActive(tab);
          return (
            <TouchableOpacity
              key={`${tab.name}-${area}`}
              style={[s.navItem, isActive && s.navItemActive]}
              onPress={() => onPress(tab)}
              activeOpacity={0.8}
            >
              {tab.icon(isActive)}
              <Text style={[s.navLabel, { color: isActive ? WHITE : WHITE_MID }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    borderRadius: radii['2xl'],
    paddingHorizontal: 8,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-around',
    ...shadows.card,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  navItemActive: { backgroundColor: WHITE_SOFT },
  navLabel: { fontSize: fontSize.base, fontFamily: fonts.semibold },
});
