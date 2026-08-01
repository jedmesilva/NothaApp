import { Router } from "express";
import { eq, and, inArray, sql, lt } from "drizzle-orm";
import {
  db,
  investorProfilesTable,
  positionsTable,
  loansTable,
  loanInstallmentsTable,
  fundingOrderOffersTable,
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** Resolve investorProfile.id a partir do userId autenticado. */
async function getInvestorId(userId: string): Promise<string | null> {
  const [profile] = await db
    .select({ id: investorProfilesTable.id })
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, userId))
    .limit(1);
  return profile?.id ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/investor/positions
//
// Retorna:
//   summary   — totais consolidados de todas as posições do investidor
//   positions — lista com detalhes do loan + próxima/última parcela
// ─────────────────────────────────────────────────────────────────────────────
router.get("/positions", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const investorId = await getInvestorId(userId);
  if (!investorId) {
    res.json({ summary: emptySummary(), positions: [] });
    return;
  }

  // Todas as posições do investidor (join direto com loans)
  const rows = await db
    .select({
      position: positionsTable,
      loan: {
        id:                loansTable.id,
        contractId:        loansTable.contractId,
        amountCents:       loansTable.amountCents,
        cycle:             loansTable.cycle,
        installmentsTotal: loansTable.installmentsTotal,
        termDays:          loansTable.termDays,
        status:            loansTable.status,
        grantedAt:         loansTable.grantedAt,
      },
    })
    .from(positionsTable)
    .innerJoin(loansTable, eq(positionsTable.loanId, loansTable.id))
    .where(eq(positionsTable.investorId, investorId));

  if (rows.length === 0) {
    res.json({ summary: emptySummary(), positions: [] });
    return;
  }

  // Busca todas as parcelas dos loans envolvidos de uma só vez
  const loanIds = [...new Set(rows.map((r) => r.loan.id))];
  const allInstallments = await db
    .select()
    .from(loanInstallmentsTable)
    .where(inArray(loanInstallmentsTable.loanId, loanIds));

  // Agrupa parcelas por loanId
  const installmentsByLoan = new Map<string, typeof allInstallments>();
  for (const inst of allInstallments) {
    if (!installmentsByLoan.has(inst.loanId)) installmentsByLoan.set(inst.loanId, []);
    installmentsByLoan.get(inst.loanId)!.push(inst);
  }

  // Total captado por empréstimo (soma de principalBalanceCents de todos os investidores)
  const fundedRows = await db
    .select({
      loanId: positionsTable.loanId,
      fundedCents: sql<number>`COALESCE(SUM(${positionsTable.principalBalanceCents}), 0)`,
    })
    .from(positionsTable)
    .where(inArray(positionsTable.loanId, loanIds))
    .groupBy(positionsTable.loanId);

  const fundedByLoan = new Map(
    fundedRows.map((r) => [r.loanId, Number(r.fundedCents)]),
  );

  // Monta resultado por posição
  const positions = rows.map(({ position, loan }) => {
    const installments = installmentsByLoan.get(loan.id) ?? [];

    const pending = installments
      .filter((i) => i.status === "pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const overdue = installments
      .filter((i) => i.status === "overdue")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const all = [...installments].sort((a, b) =>
      a.installmentNumber - b.installmentNumber,
    );

    const nextInstallment = pending[0] ?? null;
    const lastInstallment = all[all.length - 1] ?? null;
    const hasOverdue = overdue.length > 0;
    const earliestOverdue = overdue[0] ?? null;

    return {
      ...position,
      loan: {
        ...loan,
        fundedAmountCents: fundedByLoan.get(loan.id) ?? 0,
      },
      installments: all,
      nextInstallment,
      lastInstallment,
      hasOverdue,
      earliestOverdue,
    };
  });

  // Resumo consolidado (soma de todas as posições)
  const summary = {
    principalBalanceCents: positions.reduce(
      (s, p) => s + p.principalBalanceCents, 0,
    ),
    originalPrincipalCents: positions.reduce(
      (s, p) => s + p.originalPrincipalCents, 0,
    ),
    totalReturnedCents: positions.reduce(
      (s, p) => s + p.totalReturnedCents, 0,
    ),
    activeCount: positions.filter((p) => p.status === "active").length,
    hasAnyOverdue: positions.some((p) => p.hasOverdue),
  };

  res.json({ summary, positions });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/investor/offers
//
// Retorna as funding_order_offers com status "pending" ainda não expiradas,
// com detalhes do loan e do total já captado.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/offers", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const investorId = await getInvestorId(userId);
  if (!investorId) {
    res.json({ offers: [] });
    return;
  }

  const now = new Date();

  // Ofertas pendentes não expiradas
  const offerRows = await db
    .select({
      offer: fundingOrderOffersTable,
      loan: {
        id:                loansTable.id,
        contractId:        loansTable.contractId,
        amountCents:       loansTable.amountCents,
        cycle:             loansTable.cycle,
        installmentsTotal: loansTable.installmentsTotal,
        termDays:          loansTable.termDays,
        status:            loansTable.status,
      },
    })
    .from(fundingOrderOffersTable)
    .innerJoin(loansTable, eq(fundingOrderOffersTable.loanId, loansTable.id))
    .where(
      and(
        eq(fundingOrderOffersTable.investorId, investorId),
        eq(fundingOrderOffersTable.status, "pending"),
        lt(sql`now()`, fundingOrderOffersTable.expiresAt),
      ),
    );

  if (offerRows.length === 0) {
    res.json({ offers: [] });
    return;
  }

  // Para cada loan, calcula quanto já foi captado (soma das ofertas aceitas)
  const loanIds = [...new Set(offerRows.map((r) => r.loan.id))];
  const fundedRows = await db
    .select({
      loanId: fundingOrderOffersTable.loanId,
      fundedCents: sql<number>`COALESCE(SUM(${fundingOrderOffersTable.amountCents}), 0)`,
    })
    .from(fundingOrderOffersTable)
    .where(
      and(
        inArray(fundingOrderOffersTable.loanId, loanIds),
        eq(fundingOrderOffersTable.status, "accepted"),
      ),
    )
    .groupBy(fundingOrderOffersTable.loanId);

  const fundedByLoan = new Map(
    fundedRows.map((r) => [r.loanId, Number(r.fundedCents)]),
  );

  const offers = offerRows.map(({ offer, loan }) => ({
    ...offer,
    loan: {
      ...loan,
      fundedAmountCents: fundedByLoan.get(loan.id) ?? 0,
    },
  }));

  res.json({ offers });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/investor/offers/:id/respond
//
// Aceita ou recusa uma oferta pendente.
// body: { action: "accepted" | "rejected" }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/offers/:id/respond", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;
  const { id }     = req.params;
  const { action, amountCents } = req.body as { action: string; amountCents?: number };

  if (action !== "accepted" && action !== "rejected") {
    res.status(400).json({ error: "action must be 'accepted' or 'rejected'" });
    return;
  }

  const investorId = await getInvestorId(userId);
  if (!investorId) {
    res.status(404).json({ error: "Investor not found" });
    return;
  }

  const [offer] = await db
    .select()
    .from(fundingOrderOffersTable)
    .where(
      and(
        eq(fundingOrderOffersTable.id, id),
        eq(fundingOrderOffersTable.investorId, investorId),
        eq(fundingOrderOffersTable.status, "pending"),
      ),
    );

  if (!offer) {
    res.status(404).json({ error: "Oferta não encontrada ou já respondida" });
    return;
  }

  // If investor chose a partial amount, clamp it within valid bounds
  const finalAmountCents = (action === "accepted" && amountCents != null)
    ? Math.min(Math.max(amountCents, 1), offer.amountCents)
    : offer.amountCents;

  await db
    .update(fundingOrderOffersTable)
    .set({
      status: action as "accepted" | "rejected",
      respondedAt: new Date(),
      amountCents: action === "accepted" ? finalAmountCents : offer.amountCents,
    })
    .where(eq(fundingOrderOffersTable.id, id));

  // Ao aceitar: cria (ou soma a) posição do investidor no empréstimo
  if (action === "accepted") {
    await db
      .insert(positionsTable)
      .values({
        loanId:                 offer.loanId,
        investorId:             offer.investorId,
        principalBalanceCents:  finalAmountCents,
        originalPrincipalCents: finalAmountCents,
        totalReturnedCents:     0,
        ratePct:                offer.ratePct,
        status:                 "active",
      })
      .onConflictDoUpdate({
        target:  [positionsTable.loanId, positionsTable.investorId],
        set: {
          principalBalanceCents:  sql`${positionsTable.principalBalanceCents} + ${finalAmountCents}`,
          originalPrincipalCents: sql`${positionsTable.originalPrincipalCents} + ${finalAmountCents}`,
        },
      });
  }

  res.json({ ok: true, status: action });
});

function emptySummary() {
  return {
    principalBalanceCents: 0,
    originalPrincipalCents: 0,
    totalReturnedCents: 0,
    activeCount: 0,
    hasAnyOverdue: false,
  };
}

export default router;
