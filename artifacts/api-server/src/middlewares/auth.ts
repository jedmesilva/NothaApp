import type { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAME } from "../lib/auth.js";

export type AuthRequest = Request & {
  user: { userId: string; email: string };
};

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 1. Cookie httpOnly (web / browser)
  let token: string | undefined = req.cookies?.[COOKIE_NAME];

  // 2. Authorization: Bearer <token> (mobile / React Native)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return;
  }

  (req as AuthRequest).user = payload;
  next();
}
