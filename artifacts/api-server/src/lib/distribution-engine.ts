/**
 * Motor de distribuição simples (para testes)
 *
 * Fluxo:
 *  1. Recebe um loanId em status pending_review ou funding
 *  2. Move o empréstimo para "funding" (se ainda estiver em pending_review)
 *  3. Lista TODOS os credores (investor_profiles com status active) e seus saldos
 *  4. Cria uma oferta para cada credor no valor de 20% do seu saldo de carteira
 *  5. Pode enviar múltiplas ofertas ao mesmo credor sem restrições
 */

import { eq, and, gt } from "drizzle-orm";
import {
  db,
  loansTable,
  investorProfilesTable,
  walletsTable,
  fundingOrderOffersTable,
  loanEventsTable,
} from "@workspace/db";

export interface DistributionResult {
  loanId: string;
  offersCreated: number;
  totalOfferedCents: number;
  investors: Array<{ investorId: string; amountCents: number }>;
  message?: string;
}

export async function runDistribution(loanId: string): Promise<DistributionResult> {
  // ── 1. Carrega o empréstimo ───────────────────────────────────────────────
  const [loan] = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.id, loanId))
    .limit(1);

  if (!loan) throw new Error(`Empréstimo ${loanId} não encontrado`);

  if (loan.status !== "pending_review" && loan.status !== "funding") {
    throw new Error(
      `Empréstimo ${loanId} não pode ser distribuído no status "${loan.status}"`,
    );
  }

  // ── 2. Aprova e move para captação ───────────────────────────────────────
  if (loan.status === "pending_review") {
    await db
      .update(loansTable)
      .set({ status: "funding", updatedAt: new Date() })
      .where(eq(loansTable.id, loanId));

    await db.insert(loanEventsTable).values([
      {
        loanId,
        eventType: "loan_approved",
        actorType: "system",
        payload: { engine: "simple-distribution-v1", auto: true },
      },
      {
        loanId,
        eventType: "loan_funding_started",
        actorType: "system",
        payload: { engine: "simple-distribution-v1" },
      },
    ]);
  }

  // ── 3. Lista todos os credores ativos com saldo > 0 ──────────────────────
  const investors = await db
    .select({
      investorId: investorProfilesTable.id,
      balanceCents: walletsTable.balanceCents,
    })
    .from(investorProfilesTable)
    .innerJoin(
      walletsTable,
      and(
        eq(walletsTable.userId, investorProfilesTable.userId),
        eq(walletsTable.type, "main"),
        gt(walletsTable.balanceCents, 0),
      ),
    )
    .where(eq(investorProfilesTable.status, "active"));

  if (investors.length === 0) {
    return {
      loanId,
      offersCreated: 0,
      totalOfferedCents: 0,
      investors: [],
      message: "Nenhum credor ativo com saldo encontrado",
    };
  }

  // ── 4. Monta as ofertas: 20% do saldo de cada credor ────────────────────
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 horas

  const offers = investors
    .map((inv) => {
      // Cap: investidor nunca recebe oferta maior que o valor total do empréstimo
      const maxAmountCents = Math.min(
        Math.floor(inv.balanceCents * 0.2),
        loan.amountCents,
      );
      // Mínimo aceitável = 25% do valor ofertado, com piso de R$ 10,00 (1000 centavos)
      const minAmountCents = Math.min(
        Math.max(1_000, Math.round(maxAmountCents * 0.25 / 100) * 100),
        maxAmountCents, // garante que o mínimo nunca exceda o máximo
      );
      return {
        loanId,
        investorId: inv.investorId,
        maxAmountCents,
        minAmountCents,
        ratePct: loan.interestRatePct,
        status: "pending" as const,
        sentAt: now,
        expiresAt,
        escalationRound: 1,
      };
    })
    .filter((o) => o.maxAmountCents > 0); // ignora quem teria oferta de R$ 0,00

  if (offers.length === 0) {
    return {
      loanId,
      offersCreated: 0,
      totalOfferedCents: 0,
      investors: [],
      message: "Saldos insuficientes para gerar ofertas (20% < 1 centavo)",
    };
  }

  // ── 5. Persiste as ofertas em batch ──────────────────────────────────────
  await db.insert(fundingOrderOffersTable).values(offers);

  const totalOfferedCents = offers.reduce((s, o) => s + o.maxAmountCents, 0);

  await db.insert(loanEventsTable).values({
    loanId,
    eventType: "note_added",
    actorType: "system",
    payload: {
      note: `Motor de distribuição criou ${offers.length} oferta(s) — total ofertado: R$ ${(totalOfferedCents / 100).toFixed(2)}`,
      engine: "simple-distribution-v1",
      offersCount: offers.length,
      totalOfferedCents,
    },
  });

  return {
    loanId,
    offersCreated: offers.length,
    totalOfferedCents,
    investors: offers.map((o) => ({
      investorId: o.investorId,
      amountCents: o.maxAmountCents,
    })),
  };
}
