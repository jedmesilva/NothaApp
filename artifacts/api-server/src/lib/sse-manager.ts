/**
 * SSE Manager — registro em memória de conexões SSE ativas por investidor.
 *
 * Quando o motor de distribuição cria uma oferta para o investidor X,
 * emite o evento diretamente para todas as conexões abertas desse investidor.
 * Sem polling — latência zero do lado do servidor.
 */
import type { Response } from "express";

// investorId → Set de streams SSE ativos
const connections = new Map<string, Set<Response>>();

export function addConnection(investorId: string, res: Response): void {
  if (!connections.has(investorId)) connections.set(investorId, new Set());
  connections.get(investorId)!.add(res);
}

export function removeConnection(investorId: string, res: Response): void {
  const set = connections.get(investorId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) connections.delete(investorId);
}

/**
 * Emite um evento SSE para todas as conexões abertas de um investidor.
 * Retorna true se havia pelo menos uma conexão ativa.
 */
export function emit(investorId: string, event: string, data: object): boolean {
  const set = connections.get(investorId);
  if (!set || set.size === 0) return false;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      // Conexão morreu — remove silenciosamente
      set.delete(res);
    }
  }
  return true;
}

/** Verdadeiro se o investidor tem pelo menos uma conexão SSE aberta. */
export function hasConnection(investorId: string): boolean {
  return (connections.get(investorId)?.size ?? 0) > 0;
}
