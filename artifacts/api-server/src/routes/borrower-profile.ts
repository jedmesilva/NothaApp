import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, borrowerProfilesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/borrower-profile
router.get("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [profile] = await db
    .select()
    .from(borrowerProfilesTable)
    .where(eq(borrowerProfilesTable.userId, userId))
    .limit(1);

  res.json({ profile: profile ?? null });
});

// POST /api/borrower-profile
router.post("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [existing] = await db
    .select({ id: borrowerProfilesTable.id })
    .from(borrowerProfilesTable)
    .where(eq(borrowerProfilesTable.userId, userId))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "Perfil de tomador já existe" });
    return;
  }

  const [profile] = await db
    .insert(borrowerProfilesTable)
    .values({ userId })
    .returning();

  res.status(201).json({ profile });
});

export default router;
