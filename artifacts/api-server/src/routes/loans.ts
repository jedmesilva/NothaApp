import { Router } from "express";
import { eq, and, count, desc, sql } from "drizzle-orm";
import {
  db,
  borrowerProfilesTable,
  loansTable,
  loanEventsTable,
  fundingOrderOffersTable,
  positionsTable,
  loanInstallmentsTable,
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";
import { runDistribution } from "../lib/distribution-engine.js";

const createLoanSchema = z.object({
  amountCents:  z.number().int().min(1000),
  cicloKey:     z.enum(["diario", "semanal", "mensal"]),
  numPeriodos:  z.number().int().min(1),
  prazoDias:    z.number().int().min(1),
  taxaTotal:    z.number().min(0),
});

class CreditLimitExceededError extends Error {
  constructor() { super("CREDIT_LIMIT_EXCEEDED"); }
}

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

  try {
    const loan = await db.transaction(async (tx) => {
      // Busca (ou cria) perfil e trava a linha para leitura consistente
      let [borrower] = await tx
        .select()
        .from(borrowerProfilesTable)
        .where(eq(borrowerProfilesTable.userId, userId))
        .for("update")
        .limit(1);

      if (!borrower) {
        [borrower] = await tx
          .insert(borrowerProfilesTable)
          .values({ userId })
          .returning();
      }

      // Verifica limite disponível antes de qualquer insert
      const available = borrower.creditLimitCents - borrower.usedCreditCents;
      if (available < amountCents) {
        throw new CreditLimitExceededError();
      }

      // Gera contractId único: EMP-{ano}-{5 dígitos aleatórios}
      const year       = new Date().getFullYear();
      const suffix     = String(Math.floor(10000 + Math.random() * 90000));
      const contractId = `EMP-${year}-${suffix}`;

      const [loan] = await tx
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

      // Incrementa crédito em uso atomicamente
      await tx
        .update(borrowerProfilesTable)
        .set({
          usedCreditCents: sql`${borrowerProfilesTable.usedCreditCents} + ${amountCents}`,
          updatedAt: new Date(),
        })
        .where(eq(borrowerProfilesTable.id, borrower.id));

      // Registra evento de solicitação
      await tx.insert(loanEventsTable).values({
        loanId:    loan.id,
        eventType: "loan_requested",
        actorId:   userId,
        actorType: "user",
        payload:   { amountCents, cicloKey, numPeriodos, prazoDias, taxaTotal },
      });

      return loan;
    });

    // Dispara a distribuição de forma assíncrona — não bloqueia a resposta
    setImmediate(() => {
      runDistribution(loan.id).catch((err) => {
        console.error("[distribution-engine] Falha ao distribuir empréstimo", loan.id, err);
      });
    });

    res.status(201).json({ loan });
  } catch (err) {
    if (err instanceof CreditLimitExceededError) {
      res.status(422).json({ error: "Limite de crédito insuficiente" });
      return;
    }
    throw err;
  }
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
        // Soma do principal original de todas as posições ativas — representa
        // o total captado para este empréstimo no novo modelo
        db
          .select({ amountCents: positionsTable.originalPrincipalCents })
          .from(positionsTable)
          .where(eq(positionsTable.loanId, loan.id)),
        // Conta ofertas aceitas diretamente pelo loanId — não há mais fundingOrdersTable
        db
          .select({ count: count() })
          .from(fundingOrderOffersTable)
          .where(
            and(
              eq(fundingOrderOffersTable.loanId, loan.id),
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
  const id = req.params["id"] as string;

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
      // Soma do principal original de todas as posições — total captado
      db
        .select({ amountCents: positionsTable.originalPrincipalCents })
        .from(positionsTable)
        .where(eq(positionsTable.loanId, loan.id)),
      // Conta credores com oferta aceita diretamente pelo loanId
      db
        .select({ count: count() })
        .from(fundingOrderOffersTable)
        .where(
          and(
            eq(fundingOrderOffersTable.loanId, loan.id),
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

// PATCH /api/loans/:id/cancel — cancela uma solicitação em análise ou captação
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;
  const id = req.params["id"] as string;

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

  if (loan.status !== "pending_review" && loan.status !== "funding") {
    res.status(422).json({ error: "Apenas solicitações em análise ou captação podem ser canceladas" });
    return;
  }

  const updated = await db.transaction(async (tx) => {
    const [updatedLoan] = await tx
      .update(loansTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(loansTable.id, id))
      .returning();

    // Devolve o crédito ao limite disponível do tomador
    await tx
      .update(borrowerProfilesTable)
      .set({
        usedCreditCents: sql`GREATEST(0, ${borrowerProfilesTable.usedCreditCents} - ${loan.amountCents})`,
        updatedAt: new Date(),
      })
      .where(eq(borrowerProfilesTable.id, borrower.id));

    // Registra evento de cancelamento
    await tx.insert(loanEventsTable).values({
      loanId:    loan.id,
      eventType: "loan_cancelled",
      actorId:   userId,
      actorType: "user",
    });

    return updatedLoan;
  });

  res.json({ loan: updated });
});

export default router;
