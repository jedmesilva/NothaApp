import { pgTable, text, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const borrowerStatusEnum = ["pending_review", "active", "suspended"] as const;
export type BorrowerStatus = typeof borrowerStatusEnum[number];

// Classificação de risco interna (AA = menor risco, D = maior risco)
export const borrowerRiskTierEnum = ["aa", "a", "b", "c", "d"] as const;
export type BorrowerRiskTier = typeof borrowerRiskTierEnum[number];

// Status de validação de documentos do tomador
export const borrowerDocumentStatusEnum = [
  "pending",       // aguardando envio
  "under_review",  // documentos enviados, em análise
  "approved",      // documentos validados
  "rejected",      // documentos rejeitados (motivo em document_rejection_reason)
] as const;
export type BorrowerDocumentStatus = typeof borrowerDocumentStatusEnum[number];

export const borrowerProfilesTable = pgTable(
  "borrower_profiles",
  {
    id:     text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().unique(),

    // ── Status e elegibilidade ───────────────────────────────────────────────
    status:         text("status").$type<BorrowerStatus>().notNull().default("pending_review"),
    documentStatus: text("document_status").$type<BorrowerDocumentStatus>().notNull().default("pending"),
    documentRejectionReason: text("document_rejection_reason"),

    // ── Capacidade de crédito ────────────────────────────────────────────────
    creditLimitCents: integer("credit_limit_cents").notNull().default(0), // limite aprovado
    usedCreditCents:  integer("used_credit_cents").notNull().default(0),  // em uso (atualizado por trigger/job)
    creditScore:      integer("credit_score"),    // score interno 0–1000 (null = ainda não calculado)
    riskTier:         text("risk_tier").$type<BorrowerRiskTier>(), // null = ainda não classificado

    // ── Dados financeiros declarados ─────────────────────────────────────────
    monthlyIncomeCents: integer("monthly_income_cents"), // renda mensal declarada
    occupation:         text("occupation"),              // profissão declarada

    // ── Contadores históricos (append-only, nunca decrementam) ───────────────
    totalLoans:         integer("total_loans").notNull().default(0),
    totalBorrowedCents: integer("total_borrowed_cents").notNull().default(0),
    totalDefaulted:     integer("total_defaulted").notNull().default(0), // nº de empréstimos que foram a default

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertBorrowerProfile = typeof borrowerProfilesTable.$inferInsert;
export type BorrowerProfile = typeof borrowerProfilesTable.$inferSelect;
