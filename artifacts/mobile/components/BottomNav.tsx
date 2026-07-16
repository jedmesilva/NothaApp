import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const C = {
  dark: '#15151D',
  white: '#FFFFFF',
  whiteActive: 'rgba(255,255,255,0.12)',
  whiteInactive: 'rgba(255,255,255,0.5)',
};

export default function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = [
    {
      name: 'index',
      label: 'Início',
      icon: (active: boolean) => (
        <Feather name="home" size={19} color={active ? C.white : C.whiteInactive} />
      ),
    },
    {
      name: 'emprestimos',
      label: 'Empréstimos',
      icon: (active: boolean) => (
        <MaterialCommunityIcons name="bank-outline" size={19} color={active ? C.white : C.whiteInactive} />
      ),
    },
  ];

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
          const route = state.routes.find((r) => r.name === tab.name);
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isActive = state.index === routeIndex;

          const onPress = () => {
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
            <TouchableOpacity
              key={tab.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={onPress}
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
    paddingHorizontal: 20,
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
