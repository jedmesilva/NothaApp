import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, investorProfilesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/investor-profile
router.get("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [profile] = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, userId))
    .limit(1);

  res.json({ profile: profile ?? null });
});

// POST /api/investor-profile
router.post("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [existing] = await db
    .select({ id: investorProfilesTable.id })
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, userId))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "Perfil de investidor já existe" });
    return;
  }

  const [profile] = await db
    .insert(investorProfilesTable)
    .values({ userId })
    .returning();

  res.status(201).json({ profile });
});

export default router;
