import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BottomTabBarProps = any;
import { useArea } from '@/contexts/AreaContext';
import { palette as C, fonts, fontSize, radii, shadows } from '@/constants/theme';
import { router } from 'expo-router';

type TabDef = {
  name: string;
  label: string;
  area: 'credito' | 'investir';
  icon: (active: boolean) => React.ReactNode;
};

const WHITE       = '#FFFFFF';
const WHITE_MID   = 'rgba(255,255,255,0.50)';
const WHITE_SOFT  = 'rgba(255,255,255,0.12)';

const CREDITO_TABS: TabDef[] = [];

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
  const { area, setArea, scrollToArea } = useArea();

  const tabs = area === 'investir' ? INVESTIR_TABS : CREDITO_TABS;
  const currentRouteName = state.routes[state.index]?.name;

  const onPress = (tab: TabDef) => {
    // "Início" do Investir deve voltar ao index (scroll horizontal) na Page 2,
    // não navegar para a tab carteira separada — assim o swipe horizontal funciona.
    if (tab.name === 'carteira') {
      scrollToArea('investir');
      router.navigate('/');
      return;
    }

    if (tab.name === 'emprestimos') setArea('credito');
    if (tab.name === 'ofertas') setArea('investir');

    const route = state.routes.find((r: { name: string; key: string }) => r.name === tab.name);
    const isActive = currentRouteName === tab.name;
    const event = navigation.emit({
      type: 'tabPress',
      target: route?.key ?? tab.name,
      canPreventDefault: true,
    });
    if (!isActive && !event.defaultPrevented) navigation.navigate(tab.name);
  };

  // Marca "Início" como ativo quando o usuário está no index na área investir
  const isTabActive = (tab: TabDef) => {
    if (tab.name === 'carteira' && area === 'investir' && currentRouteName === 'index') return true;
    return currentRouteName === tab.name;
  };

  if (tabs.length === 0) return null;

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
