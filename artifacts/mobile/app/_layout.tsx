import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AreaProvider } from '@/contexts/AreaContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [toast, setToast] = useState<ToastState>(null);
  const handleToast = useCallback((t: ToastState) => setToast(t), []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <ToastProvider onToast={handleToast}>
      <AreaProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerBackTitle: 'Back' }}>
            <Stack.Screen name="(auth)"              options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)"              options={{ headerShown: false }} />
            <Stack.Screen name="emprestimos"         options={{ headerShown: false }} />
            <Stack.Screen name="emprestimo-detalhe"  options={{ headerShown: false }} />
            <Stack.Screen name="ativos"              options={{ headerShown: false }} />
            <Stack.Screen name="ativo-detalhe"       options={{ headerShown: false }} />
            <Stack.Screen name="conta"               options={{ headerShown: false }} />
            <Stack.Screen name="novo-emprestimo"     options={{ headerShown: false }} />
            <Stack.Screen name="aceite-contrato"     options={{ headerShown: false }} />
            <Stack.Screen name="contrato-leitura"    options={{ headerShown: false }} />
            <Stack.Screen name="notificacoes"        options={{ headerShown: false }} />
            <Stack.Screen name="saque-valor"         options={{ headerShown: false }} />
            <Stack.Screen name="saque-pix"           options={{ headerShown: false }} />
            <Stack.Screen name="saque-confirmacao"   options={{ headerShown: false }} />
            <Stack.Screen name="saque-comprovante"   options={{ headerShown: false }} />
            <Stack.Screen name="depositar"           options={{ headerShown: false }} />
            <Stack.Screen name="perfil"              options={{ headerShown: false }} />
            <Stack.Screen name="dados-pessoais"      options={{ headerShown: false }} />
            <Stack.Screen name="emprestimo-ajuda"    options={{ headerShown: false }} />
          </Stack>

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
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
