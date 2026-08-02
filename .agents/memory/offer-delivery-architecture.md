---
name: Offer delivery architecture
description: Como as ofertas de investimento chegam ao investidor (SSE + Push), substituindo o polling de 20s.
---

## Regra
Ofertas são entregues por duas camadas complementares — nunca só por polling.

1. **SSE (foreground)** — `GET /api/investor/events` mantém conexão persistente.
   O `sse-manager.ts` guarda um `Map<investorId, Set<Response>>` em memória.
   Quando o motor cria ofertas, emite `event: offer_created` para cada investidor conectado.
   O mobile invalida `['investor-offers']` no QueryClient → refetch imediato.

2. **Push (background)** — investidores sem SSE ativa recebem `ExponentPushToken` via Expo Push API (`https://exp.host/--/api/v2/push/send`).
   Tokens armazenados em `push_tokens` (DB, migration 0002).
   Mobile registra token em `POST /api/investor/push-token` ao autenticar.

## Por que não polling
O `OfertaOverlayContext` tinha `refetchInterval: 20_000` → até 20 s de latência.
Substituído por SSE primária + poll de fallback em 60 s (cobre gap de reconexão SSE).

## Como aplicar em mudanças futuras
- Qualquer ponto do backend que precise notificar investidores em tempo real: chame `sseManager.emit()` + `sendExpoPush()` do `expo-push.ts`.
- SSE não persiste entre reinícios do servidor — o mobile reconecta automaticamente em 5 s.
- Push funciona apenas em dispositivos físicos (simuladores ignoram silenciosamente).

**Why:** polling de 20 s era perceptível pelo usuário como delay gigantesco no card de oferta.
