import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, walletTransactionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { ensureWallet } from "../lib/wallet.js";

const router = Router();

// GET /api/wallet
router.get("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const wallet = await ensureWallet(userId);

  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.walletId, wallet.id))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(50);

  res.json({ wallet, transactions });
});

export default router;
