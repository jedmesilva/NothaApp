import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import GlobalHeader from '@/components/GlobalHeader';
import { ContaModalProvider } from '@/contexts/ContaModalContext';

export default function TabLayout() {
  return (
    <ContaModalProvider>
    <View style={{ flex: 1 }}>
      <GlobalHeader />
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomNav {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: 'Início' }} />
        <Tabs.Screen name="emprestimos" options={{ title: 'Empréstimos' }} />
        <Tabs.Screen name="ofertas" options={{ title: 'Ofertas' }} />
        <Tabs.Screen name="carteira" options={{ title: 'Carteira' }} />
      </Tabs>
    </View>
    </ContaModalProvider>
  );
}
