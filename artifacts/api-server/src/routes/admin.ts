/**
 * Rotas administrativas — Motor de distribuição simples (testes)
 *
 * POST /api/admin/distribute/:loanId   — dispara a distribuição manualmente
 * POST /api/admin/distribute-all       — distribui todos os empréstimos em pending_review
 * GET  /api/admin/loans/pending        — lista empréstimos aguardando distribuição
 * GET  /api/admin/offers/:loanId       — lista ofertas de um empréstimo
 */

import { Router } from "express";
import { eq, inArray, desc } from "drizzle-orm";
import {
  db,
  loansTable,
  fundingOrderOffersTable,
  investorProfilesTable,
  usersTable,
} from "@workspace/db";
import { runDistribution } from "../lib/distribution-engine.js";

const router = Router();

// POST /api/admin/distribute/:loanId
router.post("/distribute/:loanId", async (req, res) => {
  const { loanId } = req.params as { loanId: string };

  try {
    const result = await runDistribution(loanId);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(422).json({ ok: false, error: message });
  }
});

// POST /api/admin/distribute-all
// Distribui todos os empréstimos que ainda estão em pending_review
router.post("/distribute-all", async (_req, res) => {
  const pendingLoans = await db
    .select({ id: loansTable.id, contractId: loansTable.contractId })
    .from(loansTable)
    .where(eq(loansTable.status, "pending_review"));

  if (pendingLoans.length === 0) {
    res.json({ ok: true, processed: 0, message: "Nenhum empréstimo pendente" });
    return;
  }

  const results = await Promise.allSettled(
    pendingLoans.map((loan) => runDistribution(loan.id)),
  );

  const summary = results.map((r, i) => ({
    loanId: pendingLoans[i]!.id,
    contractId: pendingLoans[i]!.contractId,
    ...(r.status === "fulfilled"
      ? { ok: true, offersCreated: r.value.offersCreated }
      : { ok: false, error: r.reason instanceof Error ? r.reason.message : String(r.reason) }),
  }));

  res.json({ ok: true, processed: pendingLoans.length, results: summary });
});

// GET /api/admin/loans/pending
router.get("/loans/pending", async (_req, res) => {
  const loans = await db
    .select()
    .from(loansTable)
    .where(inArray(loansTable.status, ["pending_review", "funding"]))
    .orderBy(desc(loansTable.createdAt));

  res.json({ loans });
});

// GET /api/admin/offers/:loanId
router.get("/offers/:loanId", async (req, res) => {
  const { loanId } = req.params as { loanId: string };

  const [loan] = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.id, loanId))
    .limit(1);

  if (!loan) {
    res.status(404).json({ error: "Empréstimo não encontrado" });
    return;
  }

  const offers = await db
    .select({
      id: fundingOrderOffersTable.id,
      investorId: fundingOrderOffersTable.investorId,
      amountCents: fundingOrderOffersTable.amountCents,
      ratePct: fundingOrderOffersTable.ratePct,
      status: fundingOrderOffersTable.status,
      sentAt: fundingOrderOffersTable.sentAt,
      expiresAt: fundingOrderOffersTable.expiresAt,
      escalationRound: fundingOrderOffersTable.escalationRound,
      // Nome do investidor para facilitar a visualização
      investorUserId: investorProfilesTable.userId,
    })
    .from(fundingOrderOffersTable)
    .innerJoin(
      investorProfilesTable,
      eq(investorProfilesTable.id, fundingOrderOffersTable.investorId),
    )
    .where(eq(fundingOrderOffersTable.loanId, loanId))
    .orderBy(desc(fundingOrderOffersTable.sentAt));

  // Adiciona o e-mail do usuário para facilitar identificação nos testes
  const investorUserIds = [...new Set(offers.map((o) => o.investorUserId))];
  const users =
    investorUserIds.length > 0
      ? await db
          .select({ id: usersTable.id, email: usersTable.email })
          .from(usersTable)
          .where(inArray(usersTable.id, investorUserIds))
      : [];

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  const offersWithEmail = offers.map((o) => ({
    ...o,
    investorEmail: userMap[o.investorUserId] ?? null,
  }));

  res.json({
    loan,
    offersCount: offers.length,
    offers: offersWithEmail,
  });
});

export default router;
