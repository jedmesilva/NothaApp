/**
 * usePushNotifications
 *
 * - Solicita permissão ao usuário (uma única vez)
 * - Obtém o Expo Push Token do dispositivo
 * - Registra o token no servidor via POST /api/investor/push-token
 *
 * Só roda em dispositivos físicos (simuladores não têm push).
 * Chame este hook dentro de um componente autenticado.
 */
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiFetch } from '@/lib/apiClient';

// Configura como as notificações são exibidas quando o app está em foreground
// (expo-notifications@57: shouldShowBanner + shouldShowList substituem shouldShowAlert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!Device.isDevice) return; // simulador — sem push

    (async () => {
      // Canal Android (obrigatório para Android 8+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('offers', {
          name: 'Ofertas de investimento',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      }

      // Verifica / solicita permissão
      // Cast necessário: divergência de tipos entre expo-notifications@57 e expo@54
      type PermResult = { granted: boolean };
      const existing = await Notifications.getPermissionsAsync() as unknown as PermResult;
      let permGranted = existing.granted;
      if (!permGranted) {
        const result = await Notifications.requestPermissionsAsync() as unknown as PermResult;
        permGranted = result.granted;
      }
      if (!permGranted) return;

      // Obtém o token Expo
      let pushToken: string;
      try {
        const result = await Notifications.getExpoPushTokenAsync();
        pushToken = result.data;
      } catch (err) {
        console.warn('[push] Falha ao obter token:', err);
        return;
      }

      // Registra no servidor
      try {
        await apiFetch('/api/investor/push-token', {
          method: 'POST',
          body: JSON.stringify({ token: pushToken }),
        });
      } catch (err) {
        console.warn('[push] Falha ao registrar token:', err);
      }
    })();
  }, [isAuthenticated]);
}
