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

const router = Router();

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
