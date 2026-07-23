import { Router } from "express";
import { eq, and, count, desc } from "drizzle-orm";
import {
  db,
  borrowerProfilesTable,
  loansTable,
  fundingOrdersTable,
  fundingOrderOffersTable,
  loanInstallmentsTable,
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";

const createLoanSchema = z.object({
  amountCents:  z.number().int().min(1000).max(150_000),
  cicloKey:     z.enum(["diario", "semanal", "mensal"]),
  numPeriodos:  z.number().int().min(1),
  prazoDias:    z.number().int().min(1),
  taxaTotal:    z.number().min(0),
});

const router = Router();

// POST /api/loans — cria uma solicitação de empréstimo
router.post("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const parsed = createLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }

  const { amountCents, cicloKey, numPeriodos, prazoDias, taxaTotal } = parsed.data;

  // Garante que o tomador tem perfil (cria se necessário)
  let [borrower] = await db
    .select({ id: borrowerProfilesTable.id })
    .from(borrowerProfilesTable)
    .where(eq(borrowerProfilesTable.userId, userId))
    .limit(1);

  if (!borrower) {
    [borrower] = await db
      .insert(borrowerProfilesTable)
      .values({ userId })
      .returning({ id: borrowerProfilesTable.id });
  }

  // Gera contractId único: EMP-{ano}-{5 dígitos aleatórios}
  const year       = new Date().getFullYear();
  const suffix     = String(Math.floor(10000 + Math.random() * 90000));
  const contractId = `EMP-${year}-${suffix}`;

  const [loan] = await db
    .insert(loansTable)
    .values({
      borrowerId:        borrower.id,
      amountCents,
      interestRatePct:   Math.round(taxaTotal * 100),
      termDays:          prazoDias,
      cycle:             cicloKey,
      installmentsTotal: numPeriodos,
      status:            "pending_review",
      contractId,
    })
    .returning();

  res.status(201).json({ loan });
});

// GET /api/loans — lista todos os empréstimos do tomador autenticado
router.get("/", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const [borrower] = await db
    .select({ id: borrowerProfilesTable.id })
    .from(borrowerProfilesTable)
    .where(eq(borrowerProfilesTable.userId, userId))
    .limit(1);

  if (!borrower) {
    res.json({ loans: [] });
    return;
  }

  const loans = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.borrowerId, borrower.id))
    .orderBy(desc(loansTable.createdAt));

  const loansWithData = await Promise.all(
    loans.map(async (loan) => {
      const [paidResult, filledOrders, lendersResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(loanInstallmentsTable)
          .where(
            and(
              eq(loanInstallmentsTable.loanId, loan.id),
              eq(loanInstallmentsTable.status, "paid"),
            ),
          ),
        db
          .select({ amountCents: fundingOrdersTable.amountCents })
          .from(fundingOrdersTable)
          .where(
            and(
              eq(fundingOrdersTable.loanId, loan.id),
              eq(fundingOrdersTable.status, "filled"),
            ),
          ),
        db
          .select({ count: count() })
          .from(fundingOrderOffersTable)
          .innerJoin(
            fundingOrdersTable,
            eq(fundingOrderOffersTable.fundingOrderId, fundingOrdersTable.id),
          )
          .where(
            and(
              eq(fundingOrdersTable.loanId, loan.id),
              eq(fundingOrderOffersTable.status, "accepted"),
            ),
          ),
      ]);

      return {
        ...loan,
        installmentsPaid: Number(paidResult[0]?.count ?? 0),
        fundedAmountCents: filledOrders.reduce((s, o) => s + o.amountCents, 0),
        lendersCount: Number(lendersResult[0]?.count ?? 0),
      };
    }),
  );

  res.json({ loans: loansWithData });
});

// GET /api/loans/:id — detalhe de um empréstimo com suas parcelas
router.get("/:id", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;
  const { id } = req.params;

  const [borrower] = await db
    .select({ id: borrowerProfilesTable.id })
    .from(borrowerProfilesTable)
    .where(eq(borrowerProfilesTable.userId, userId))
    .limit(1);

  if (!borrower) {
    res.status(404).json({ error: "Empréstimo não encontrado" });
    return;
  }

  const [loan] = await db
    .select()
    .from(loansTable)
    .where(and(eq(loansTable.id, id), eq(loansTable.borrowerId, borrower.id)))
    .limit(1);

  if (!loan) {
    res.status(404).json({ error: "Empréstimo não encontrado" });
    return;
  }

  const [paidResult, filledOrders, lendersResult, installments] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(loanInstallmentsTable)
        .where(
          and(
            eq(loanInstallmentsTable.loanId, loan.id),
            eq(loanInstallmentsTable.status, "paid"),
          ),
        ),
      db
        .select({ amountCents: fundingOrdersTable.amountCents })
        .from(fundingOrdersTable)
        .where(
          and(
            eq(fundingOrdersTable.loanId, loan.id),
            eq(fundingOrdersTable.status, "filled"),
          ),
        ),
      db
        .select({ count: count() })
        .from(fundingOrderOffersTable)
        .innerJoin(
          fundingOrdersTable,
          eq(fundingOrderOffersTable.fundingOrderId, fundingOrdersTable.id),
        )
        .where(
          and(
            eq(fundingOrdersTable.loanId, loan.id),
            eq(fundingOrderOffersTable.status, "accepted"),
          ),
        ),
      db
        .select()
        .from(loanInstallmentsTable)
        .where(eq(loanInstallmentsTable.loanId, loan.id))
        .orderBy(loanInstallmentsTable.installmentNumber),
    ]);

  res.json({
    loan: {
      ...loan,
      installmentsPaid: Number(paidResult[0]?.count ?? 0),
      fundedAmountCents: filledOrders.reduce((s, o) => s + o.amountCents, 0),
      lendersCount: Number(lendersResult[0]?.count ?? 0),
    },
    installments,
  });
});

export default router;
