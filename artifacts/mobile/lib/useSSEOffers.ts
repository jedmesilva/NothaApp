/**
 * useSSEOffers
 *
 * Abre uma conexão SSE persistente com /api/investor/events.
 * Quando o servidor emite um evento "offer_created", chama onEvent.
 * Reconecta automaticamente após falha (5 s de espera).
 *
 * Funciona em React Native / Expo SDK 54 via fetch + ReadableStream
 * (suportado desde RN 0.76 / Hermes).
 */
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, TOKEN_KEY } from './apiClient';

export interface SSEOfferEvent {
  offerId: string;
  loanContractId: string;
  maxAmountCents: number;
  minAmountCents: number;
  ratePct: number;
}

export function useSSEOffers(
  onOfferCreated: (event: SSEOfferEvent) => void,
  enabled: boolean,
) {
  const cbRef = useRef(onOfferCreated);
  cbRef.current = onOfferCreated;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let abortController: AbortController | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    async function connect() {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token || cancelled) return;

      abortController = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/investor/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Eventos SSE são separados por linha em branco dupla (\n\n)
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? '';

          for (const block of blocks) {
            if (!block.trim()) continue;
            let eventType = 'message';
            let dataStr = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) eventType = line.slice(7).trim();
              else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
              // Linhas ":" são comentários/pings — ignorar
            }
            if (eventType === 'offer_created' && dataStr) {
              try {
                cbRef.current(JSON.parse(dataStr) as SSEOfferEvent);
              } catch {}
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || cancelled) return;
        console.log('[SSE] Desconectado, reconectando em 5 s:', err.message);
      }

      if (!cancelled) {
        reconnectTimer = setTimeout(connect, 5_000);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      abortController?.abort();
    };
  }, [enabled]);
}
