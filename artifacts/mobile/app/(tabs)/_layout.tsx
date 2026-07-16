import React from 'react';
import { Tabs } from 'expo-router';
import BottomNav from '@/components/BottomNav';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="emprestimos" options={{ title: 'Empréstimos' }} />
    </Tabs>
  );
}
