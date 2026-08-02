import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";
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
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Referência direta ao empréstimo — não mais a um slot pré-definido
    loanId:     text("loan_id").notNull(),
    investorId: text("investor_id").notNull(),

    // Valor e taxa decididos pelo engine para este credor especificamente
    amountCents:    integer("amount_cents").notNull(),
    minAmountCents: integer("min_amount_cents").notNull().default(0), // mínimo aceitável pelo investidor
    ratePct:        integer("rate_pct").notNull(),

    status: text("status").$type<FundingOrderOfferStatus>().notNull().default("pending"),

    // ── Timing ───────────────────────────────────────────────────────────────
    sentAt:      timestamp("sent_at").notNull().defaultNow(),
    expiresAt:   timestamp("expires_at").notNull(),
    respondedAt: timestamp("responded_at"),

    // ── Escalonamento ────────────────────────────────────────────────────────
    // 1 = primeira oferta, 2+ = reoferta com taxa maior
    escalationRound: integer("escalation_round").notNull().default(1),

    // ── Rastreabilidade financeira ───────────────────────────────────────────
    // Transação de reserva criada no aceite (reserved → completed no fechamento)
    walletTransactionId: text("wallet_transaction_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId],     foreignColumns: [loansTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.walletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
  ],
);

export type InsertFundingOrderOffer = typeof fundingOrderOffersTable.$inferInsert;
export type FundingOrderOffer = typeof fundingOrderOffersTable.$inferSelect;
