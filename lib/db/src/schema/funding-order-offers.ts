import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { fundingOrdersTable } from "./funding-orders";
import { investorProfilesTable } from "./investor-profiles";
import { walletTransactionsTable } from "./wallet-transactions";

export const fundingOrderOfferStatusEnum = [
  "pending",
  "accepted",
  "rejected",
  "expired",
] as const;
export type FundingOrderOfferStatus = typeof fundingOrderOfferStatusEnum[number];

export const fundingOrderOffersTable = pgTable(
  "funding_order_offers",
  {
    id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    fundingOrderId: text("funding_order_id").notNull(),
    investorId:     text("investor_id").notNull(),
    status:         text("status").$type<FundingOrderOfferStatus>().notNull().default("pending"),

    // ── Range de aceite parcial ──────────────────────────────────────────────
    // Investidor pode aceitar qualquer valor entre min e max
    minAmountCents:      integer("min_amount_cents").notNull(),
    maxAmountCents:      integer("max_amount_cents").notNull(),
    // Preenchido no aceite — valor efetivamente comprometido (dentro do range)
    acceptedAmountCents: integer("accepted_amount_cents"),

    // ── Taxa e escalonamento ─────────────────────────────────────────────────
    // Taxa congelada para esta rodada (em pontos base, ex: 1200 = 12%)
    offeredRatePct:   integer("offered_rate_pct").notNull(),
    // Rodada de escalonamento: 1 = primeira oferta, 2+ = reoferta com taxa maior
    escalationRound:  integer("escalation_round").notNull().default(1),

    // ── Timing ───────────────────────────────────────────────────────────────
    // Data em que o investidor recebeu a oferta
    sentAt:      timestamp("sent_at").notNull().defaultNow(),
    // Prazo para resposta — job periódico marca "expired" após este timestamp
    expiresAt:   timestamp("expires_at").notNull(),
    // Data em que o investidor respondeu (aceite ou recusa)
    respondedAt: timestamp("responded_at"),

    // ── Rastreabilidade financeira ───────────────────────────────────────────
    // Transação de reserva criada no aceite (status "reserved" → "completed" no fechamento)
    walletTransactionId: text("wallet_transaction_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.fundingOrderId], foreignColumns: [fundingOrdersTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.walletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
  ],
);

export type InsertFundingOrderOffer = typeof fundingOrderOffersTable.$inferInsert;
export type FundingOrderOffer = typeof fundingOrderOffersTable.$inferSelect;
