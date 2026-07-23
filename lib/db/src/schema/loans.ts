import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { borrowerProfilesTable } from "./borrower-profiles";

export const loanStatusEnum = [
  "pending_review",
  "funding",
  "active",
  "overdue",
  "settled",
] as const;
export type LoanStatus = typeof loanStatusEnum[number];

export const loanCycleEnum = ["diario", "semanal", "mensal"] as const;
export type LoanCycle = typeof loanCycleEnum[number];

export const loansTable = pgTable(
  "loans",
  {
    id:                text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    borrowerId:        text("borrower_id").notNull(),
    amountCents:       integer("amount_cents").notNull(),
    // Taxa de juros total × 100 para evitar ponto flutuante (ex: 20% = 2000)
    interestRatePct:   integer("interest_rate_pct").notNull(),
    termDays:          integer("term_days").notNull(),
    cycle:             text("cycle").$type<LoanCycle>().notNull(),
    installmentsTotal: integer("installments_total").notNull(),
    status:            text("status").$type<LoanStatus>().notNull().default("pending_review"),
    contractId:        text("contract_id").notNull().unique(),
    grantedAt:         timestamp("granted_at"),
    createdAt:         timestamp("created_at").notNull().defaultNow(),
    updatedAt:         timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.borrowerId], foreignColumns: [borrowerProfilesTable.id] }).onDelete("cascade"),
  ],
);

export type InsertLoan = typeof loansTable.$inferInsert;
export type Loan = typeof loansTable.$inferSelect;
