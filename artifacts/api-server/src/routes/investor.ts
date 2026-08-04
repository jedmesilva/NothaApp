import { Router } from "express";
import { eq, and, inArray, sql, lt } from "drizzle-orm";
import type { PositionStatus } from "@workspace/db";
import {
  db,
  investorProfilesTable,
  positionsTable,
  loansTable,
  loanInstallmentsTable,
  fundingOrderOffersTable,
  pushTokensTable,
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import * as sseManager from "../lib/sse-manager.js";

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

  // Total captado por empréstimo — soma das positions em reserved ou active
  const fundedRows = await db
    .select({
      loanId: positionsTable.loanId,
      fundedCents: sql<number>`COALESCE(SUM(${positionsTable.principalBalanceCents}), 0)`,
    })
    .from(positionsTable)
    .where(
      and(
        inArray(positionsTable.loanId, loanIds),
        inArray(positionsTable.status, ["reserved", "active"] as PositionStatus[]),
      ),
    )
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

  // Para cada loan, calcula quanto já foi captado via positions (reserved + active)
  const loanIds = [...new Set(offerRows.map((r) => r.loan.id))];
  const fundedRows = await db
    .select({
      loanId: positionsTable.loanId,
      fundedCents: sql<number>`COALESCE(SUM(${positionsTable.principalBalanceCents}), 0)`,
    })
    .from(positionsTable)
    .where(
      and(
        inArray(positionsTable.loanId, loanIds),
        inArray(positionsTable.status, ["reserved", "active"] as PositionStatus[]),
      ),
    )
    .groupBy(positionsTable.loanId);

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
// body: { action: "accepted" | "rejected", amountCents?: number }
//
// No aceite, o credor pode informar qualquer valor dentro de
// [minAmountCents, maxAmountCents]. Esse valor é gravado em
// acceptedAmountCents na oferta e define o tamanho da position criada.
//
// A position nasce com status "reserved" (saldo bloqueado na wallet,
// aguardando fechamento da captação do loan). O fechamento da captação
// transiciona reserved → active — não cria nada novo.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/offers/:id/respond", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;
  const { id }     = req.params as { id: string };
  const { action, amountCents } = req.body as { action: string; amountCents?: number };

  if (action !== "accepted" && action !== "rejected" && action !== "push_dismissed") {
    res.status(400).json({ error: "action must be 'accepted', 'rejected' or 'push_dismissed'" });
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

  // ── push_dismissed: registra rejeição do push card sem alterar status ──────
  // A oferta permanece "pending" e continua visível na lista. Apenas o overlay
  // não é re-exibido (o cliente filtra por pushDismissedAt).
  if (action === "push_dismissed") {
    await db
      .update(fundingOrderOffersTable)
      .set({ pushDismissedAt: new Date() })
      .where(eq(fundingOrderOffersTable.id, id));
    res.json({ ok: true, status: "pending" });
    return;
  }

  // Valor aceito: dentro de [minAmountCents, maxAmountCents]; default = maxAmountCents
  const acceptedAmountCents = (action === "accepted" && amountCents != null)
    ? Math.min(Math.max(amountCents, offer.minAmountCents), offer.maxAmountCents)
    : offer.maxAmountCents;

  await db
    .update(fundingOrderOffersTable)
    .set({
      status:              action as "accepted" | "rejected",
      respondedAt:         new Date(),
      acceptedAmountCents: action === "accepted" ? acceptedAmountCents : null,
    })
    .where(eq(fundingOrderOffersTable.id, id));

  // Ao aceitar: cria uma position individual com status "reserved".
  // Múltiplas posições por (investorId, loanId) são esperadas e corretas —
  // sem upsert, sem consolidação.
  if (action === "accepted") {
    await db.insert(positionsTable).values({
      fundingOrderOfferId:    offer.id,
      loanId:                 offer.loanId,
      investorId:             offer.investorId,
      principalBalanceCents:  acceptedAmountCents,
      originalPrincipalCents: acceptedAmountCents,
      totalReturnedCents:     0,
      ratePct:                offer.ratePct,
      status:                 "reserved",
    });
  }

  res.json({ ok: true, status: action });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/investor/events
//
// SSE — conexão persistente. O servidor empurra eventos em tempo real:
//   event: offer_created  → nova oferta criada pelo motor de distribuição
//   event: connected      → confirmação inicial de conexão
//   ": ping"              → heartbeat a cada 25 s (evita timeout do proxy)
//
// O cliente invalida o cache de ofertas ao receber "offer_created" e faz
// um refetch imediato — sem polling desnecessário.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/events", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;

  const investorId = await getInvestorId(userId);
  if (!investorId) {
    res.status(404).json({ error: "Investor not found" });
    return;
  }

  // Cabeçalhos SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // desativa buffer do nginx/proxy
  res.flushHeaders();

  // Registra conexão no manager
  sseManager.addConnection(investorId, res);

  // Confirmação inicial
  res.write("event: connected\ndata: {}\n\n");

  // Heartbeat a cada 25 s para não deixar a conexão morrer no proxy
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25_000);

  // Limpa ao desconectar
  req.on("close", () => {
    clearInterval(heartbeat);
    sseManager.removeConnection(investorId, res);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/investor/push-token
//
// Registra (ou atualiza) o Expo Push Token do dispositivo do credor.
// body: { token: "ExponentPushToken[xxx]" }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/push-token", requireAuth, async (req, res) => {
  const { userId } = (req as AuthRequest).user;
  const { token } = req.body as { token?: string };

  if (!token || !token.startsWith("ExponentPushToken[")) {
    res.status(400).json({ error: "Token Expo inválido" });
    return;
  }

  const investorId = await getInvestorId(userId);
  if (!investorId) {
    res.status(404).json({ error: "Investor not found" });
    return;
  }

  // Upsert: um token pode mudar de investidor (troca de conta no mesmo device)
  await db
    .insert(pushTokensTable)
    .values({ id: crypto.randomUUID(), investorId, token })
    .onConflictDoUpdate({
      target: pushTokensTable.token,
      set: { investorId, updatedAt: new Date() },
    });

  res.json({ ok: true });
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
