import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";
import { investorProfilesTable } from "./investor-profiles";

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

    // Range de valor decidido pelo engine para este credor especificamente
    minAmountCents:      integer("min_amount_cents").notNull(),  // mínimo aceitável
    maxAmountCents:      integer("max_amount_cents").notNull(),  // máximo oferecido pelo engine
    // Preenchido no aceite com o valor escolhido pelo credor dentro de [min, max]
    acceptedAmountCents: integer("accepted_amount_cents"),

    // Taxa oferecida a este credor especificamente
    ratePct: integer("rate_pct").notNull(),

    status: text("status").$type<FundingOrderOfferStatus>().notNull().default("pending"),

    // ── Timing ───────────────────────────────────────────────────────────────
    sentAt:      timestamp("sent_at").notNull().defaultNow(),
    expiresAt:   timestamp("expires_at").notNull(),
    respondedAt: timestamp("responded_at"),

    // ── Escalonamento ────────────────────────────────────────────────────────
    // 1 = primeira oferta, 2+ = reoferta com taxa maior
    escalationRound: integer("escalation_round").notNull().default(1),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId],     foreignColumns: [loansTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("cascade"),
  ],
);

export type InsertFundingOrderOffer = typeof fundingOrderOffersTable.$inferInsert;
export type FundingOrderOffer = typeof fundingOrderOffersTable.$inferSelect;
