import jwt from "jsonwebtoken";
import type { Response } from "express";

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("SESSION_SECRET must be set");

export const COOKIE_NAME = "auth_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type JwtPayload = {
  jti: string;
  userId: string;
  email: string;
};

export function signToken(payload: Omit<JwtPayload, "jti">): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ jti, ...payload }, secret, { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_TTL_SECONDS * 1000,
  });
}

/** Extrai o token bruto do cookie ou header Authorization */
export function extractRawToken(req: {
  cookies?: Record<string, string>;
  headers: { authorization?: string };
}): string | undefined {
  const fromCookie = req.cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return undefined;
}
