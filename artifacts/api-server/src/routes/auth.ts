import { Router } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable, revokedTokensTable } from "@workspace/db";
import { signToken, setAuthCookie, extractRawToken, verifyToken, COOKIE_NAME } from "../lib/auth.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const SALT_ROUNDS = 12;

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "E-mail já cadastrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash })
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

  const token = signToken({ userId: user.id, email: user.email });
  setAuthCookie(res, token);

  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "E-mail ou senha incorretos" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  setAuthCookie(res, token);

  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const token = extractRawToken(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Adiciona o jti à blocklist até a expiração natural do token
      const expiresAt = new Date((payload as any).exp * 1000);
      await db
        .insert(revokedTokensTable)
        .values({ jti: payload.jti, expiresAt })
        .onConflictDoNothing();
    }
  }

  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [user] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(user);
});

export default router;
