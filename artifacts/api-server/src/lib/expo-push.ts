/**
 * Envia push notifications via Expo Push API.
 * Usado quando o investidor não tem SSE ativa (app fechado / em background).
 *
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */

export interface PushMessage {
  to: string;           // ExponentPushToken[xxx]
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  channelId?: string;   // Android only
}

export async function sendExpoPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  // Expo aceita até 100 mensagens por request
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  await Promise.all(
    chunks.map((chunk) =>
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      }).catch((err) => {
        console.error("[expo-push] Falha ao enviar push:", err.message);
      }),
    ),
  );
}
