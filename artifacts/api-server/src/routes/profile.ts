import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable, userProfilesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const updateProfileSchema = z.object({
  name:         z.string().min(2, "Nome deve ter ao menos 2 caracteres").optional(),
  cpf:          z.string().optional(),
  birthDate:    z.string().optional(),
  phone:        z.string().optional(),
  zipCode:      z.string().optional(),
  street:       z.string().optional(),
  streetNumber: z.string().optional(),
  complement:   z.string().optional(),
  neighborhood: z.string().optional(),
  city:         z.string().optional(),
  state:        z.string().length(2, "Estado deve ter 2 letras").optional(),
});

// GET /api/profile
router.get("/", requireAuth, async (req, res) => {
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

  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, userId))
    .limit(1);

  res.json({ user, profile: profile ?? null });
});

// PUT /api/profile
router.put("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const { name, ...profileFields } = parsed.data;

  if (name) {
    await db
      .update(usersTable)
      .set({ name, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }

  if (Object.keys(profileFields).length > 0) {
    await db
      .insert(userProfilesTable)
      .values({ userId, ...profileFields, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userProfilesTable.userId,
        set: { ...profileFields, updatedAt: new Date() },
      });
  }

  const [user] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, userId))
    .limit(1);

  res.json({ user, profile: profile ?? null });
});

export default router;
