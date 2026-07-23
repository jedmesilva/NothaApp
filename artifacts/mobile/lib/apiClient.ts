import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:8080';

export const TOKEN_KEY = '@notha/auth_token';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? 'Erro inesperado');
  return json as T;
}
