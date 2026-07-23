import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AreaProvider } from '@/contexts/AreaContext';
import { ToastProvider } from '@/contexts/ToastContext';
import type { ToastState } from '@/contexts/ToastContext';
import GlobalToast from '@/components/GlobalToast';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const [toast, setToast] = useState<ToastState>(null);
  const handleToast = useCallback((t: ToastState) => setToast(t), []);

  return (
    <ToastProvider onToast={handleToast}>
      <AreaProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerBackTitle: 'Back' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="emprestimos" options={{ headerShown: false }} />
            <Stack.Screen name="emprestimo-detalhe" options={{ headerShown: false }} />
            <Stack.Screen name="ativos" options={{ headerShown: false }} />
            <Stack.Screen name="ativo-detalhe" options={{ headerShown: false }} />
            <Stack.Screen name="conta" options={{ headerShown: false }} />
            <Stack.Screen name="novo-emprestimo" options={{ headerShown: false }} />
            <Stack.Screen name="aceite-contrato" options={{ headerShown: false }} />
            <Stack.Screen name="contrato-leitura" options={{ headerShown: false }} />
            <Stack.Screen name="notificacoes" options={{ headerShown: false }} />
            <Stack.Screen name="saque-valor" options={{ headerShown: false }} />
            <Stack.Screen name="saque-pix" options={{ headerShown: false }} />
            <Stack.Screen name="saque-confirmacao" options={{ headerShown: false }} />
            <Stack.Screen name="saque-comprovante" options={{ headerShown: false }} />
            <Stack.Screen name="depositar" options={{ headerShown: false }} />
          </Stack>

          {/* Toast global — renderizado por cima de todas as telas */}
          <GlobalToast toast={toast} onClose={() => setToast(null)} />
        </View>
      </AreaProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
