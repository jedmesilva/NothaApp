import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useArea } from '@/contexts/AreaContext';

const C = {
  dark: '#15151D',
  white: '#FFFFFF',
  whiteActive: 'rgba(255,255,255,0.12)',
  whiteInactive: 'rgba(255,255,255,0.5)',
};

type TabDef = {
  name: string;
  label: string;
  area: 'credito' | 'investir';
  icon: (active: boolean) => React.ReactNode;
};

const CREDITO_TABS: TabDef[] = [
  {
    name: 'index',
    label: 'Início',
    area: 'credito',
    icon: (active) => <Feather name="home" size={19} color={active ? C.white : C.whiteInactive} />,
  },
  {
    name: 'emprestimos',
    label: 'Empréstimos',
    area: 'credito',
    icon: (active) => (
      <MaterialCommunityIcons name="bank-outline" size={19} color={active ? C.white : C.whiteInactive} />
    ),
  },
];

const INVESTIR_TABS: TabDef[] = [
  {
    name: 'index',
    label: 'Início',
    area: 'investir',
    icon: (active) => <Feather name="home" size={19} color={active ? C.white : C.whiteInactive} />,
  },
  {
    name: 'ofertas',
    label: 'Ofertas',
    area: 'investir',
    icon: (active) => <Feather name="tag" size={19} color={active ? C.white : C.whiteInactive} />,
  },
  {
    name: 'carteira',
    label: 'Carteira',
    area: 'investir',
    icon: (active) => <Feather name="briefcase" size={19} color={active ? C.white : C.whiteInactive} />,
  },
];

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { area, setArea } = useArea();

  const tabs = area === 'investir' ? INVESTIR_TABS : CREDITO_TABS;
  const currentRouteName = state.routes[state.index]?.name;

  const onPress = (tab: TabDef) => {
    // Update area when switching between area-specific screens
    if (tab.name === 'emprestimos') setArea('credito');
    if (tab.name === 'ofertas' || tab.name === 'carteira') setArea('investir');

    const route = state.routes.find((r) => r.name === tab.name);
    const isActive = currentRouteName === tab.name;
    const event = navigation.emit({
      type: 'tabPress',
      target: route?.key ?? tab.name,
      canPreventDefault: true,
    });
    if (!isActive && !event.defaultPrevented) {
      navigation.navigate(tab.name);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom > 0 ? insets.bottom - 4 : 8,
        },
      ]}
    >
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const isActive = currentRouteName === tab.name;
          return (
            <TouchableOpacity
              key={`${tab.name}-${area}`}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onPress(tab)}
              activeOpacity={0.8}
            >
              {tab.icon(isActive)}
              <Text style={[styles.navLabel, { color: isActive ? C.white : C.whiteInactive }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  navItemActive: {
    backgroundColor: C.whiteActive,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
