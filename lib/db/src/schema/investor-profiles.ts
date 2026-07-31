import { pgTable, text, integer, boolean, jsonb, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const investorStatusEnum = ["pending_review", "active", "suspended"] as const;
export type InvestorStatus = typeof investorStatusEnum[number];

// Classificação CVM (Comissão de Valores Mobiliários)
export const investorTypeEnum = [
  "retail",       // varejo — sem requisitos mínimos
  "qualified",    // qualificado — R$ 1M+ em investimentos financeiros ou certificação
  "professional", // profissional — R$ 10M+ ou gestores/analistas certificados
] as const;
export type InvestorType = typeof investorTypeEnum[number];

// Status de validação de documentos do investidor
export const investorDocumentStatusEnum = [
  "pending",       // aguardando envio
  "under_review",  // documentos enviados, em análise
  "approved",      // documentos validados
  "rejected",      // documentos rejeitados (motivo em document_rejection_reason)
] as const;
export type InvestorDocumentStatus = typeof investorDocumentStatusEnum[number];

export const investorProfilesTable = pgTable(
  "investor_profiles",
  {
    id:     text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().unique(),

    // ── Status e elegibilidade ───────────────────────────────────────────────
    status:         text("status").$type<InvestorStatus>().notNull().default("pending_review"),
    investorType:   text("investor_type").$type<InvestorType>().notNull().default("retail"),
    documentStatus: text("document_status").$type<InvestorDocumentStatus>().notNull().default("pending"),
    documentRejectionReason: text("document_rejection_reason"),

    // ── Limites de exposição ─────────────────────────────────────────────────
    // Teto de exposição total que o investidor aceita (null = sem limite definido)
    maxExposureCents: integer("max_exposure_cents"),

    // ── Auto-investimento ────────────────────────────────────────────────────
    autoInvestEnabled:         boolean("auto_invest_enabled").notNull().default(false),
    autoInvestMaxPerLoanCents: integer("auto_invest_max_per_loan_cents"), // teto por operação

    // Filtros de preferência para o auto-investimento e busca manual
    // Ex: ["semanal", "mensal"] / ["aa", "a", "b"]
    preferredCycles:    jsonb("preferred_cycles").$type<string[]>(),
    preferredRiskTiers: jsonb("preferred_risk_tiers").$type<string[]>(),

    // ── Contadores históricos (append-only, nunca decrementam) ───────────────
    totalInvestedCents: integer("total_invested_cents").notNull().default(0),
    totalReturnsCents:  integer("total_returns_cents").notNull().default(0),
    totalDefaultedCents: integer("total_defaulted_cents").notNull().default(0), // valor exposto a defaults

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertInvestorProfile = typeof investorProfilesTable.$inferInsert;
export type InvestorProfile = typeof investorProfilesTable.$inferSelect;
