/**
 * usePushNotifications
 *
 * - Solicita permissão ao usuário (uma única vez)
 * - Obtém o Expo Push Token do dispositivo
 * - Registra o token no servidor via POST /api/investor/push-token
 *
 * Só roda em dispositivos físicos (simuladores e web ignoram silenciosamente).
 * Chame este hook dentro de um componente autenticado.
 */
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiFetch } from '@/lib/apiClient';

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;
    // Push Notifications só funcionam em dispositivos físicos
    if (!Device.isDevice) return;

    // Configura como as notificações são exibidas quando o app está em foreground.
    // Feito aqui (dentro do guard Device.isDevice) para não crashar no web/simulador,
    // onde os módulos nativos podem ser undefined.
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // Ambiente sem suporte a push — não faz nada
      return;
    }

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
      let permGranted = false;
      try {
        const existing = await Notifications.getPermissionsAsync() as unknown as PermResult;
        permGranted = existing.granted;
        if (!permGranted) {
          const result = await Notifications.requestPermissionsAsync() as unknown as PermResult;
          permGranted = result.granted;
        }
      } catch {
        return;
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
