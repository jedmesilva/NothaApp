import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, revokedTokensTable } from "@workspace/db";
import { verifyToken, extractRawToken } from "../lib/auth.js";

export type AuthRequest = Request & {
  user: { jti: string; userId: string; email: string };
};

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractRawToken(req);

  if (!token) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return;
  }

  // Verifica se o token foi revogado (logout)
  const revoked = await db
    .select({ jti: revokedTokensTable.jti })
    .from(revokedTokensTable)
    .where(eq(revokedTokensTable.jti, payload.jti))
    .limit(1);

  if (revoked.length > 0) {
    res.status(401).json({ error: "Sessão encerrada. Faça login novamente." });
    return;
  }

  (req as AuthRequest).user = payload;
  next();
}
