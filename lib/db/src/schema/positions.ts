import { pgTable, text, integer, timestamp, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";
import { investorProfilesTable } from "./investor-profiles";

export const positionStatusEnum = ["active", "transferred_out", "settled"] as const;
export type PositionStatus = typeof positionStatusEnum[number];

/**
 * Uma linha por par (investorId, loanId) — representa a fatia consolidada
 * de um credor naquele empréstimo.
 *
 * Ciclo de vida:
 *   - Nasce (ou é atualizada via upsert) quando captação fecha e uma
 *     investment_order é registrada para esse credor
 *   - principalBalanceCents decrementado e totalReturnedCents incrementado
 *     atomicamente a cada distribuição de parcela
 *   - ratePct recalculado como média ponderada sempre que a composição de
 *     investment_orders mudar (novo aporte ou compra no secundário)
 *   - status → "transferred_out" quando o saldo é integralmente cedido
 *   - status → "settled" quando principalBalanceCents chega a zero
 *
 * É a única entidade que participa de cálculo (rateio de parcela, venda no
 * secundário). investment_orders são puro histórico de proveniência.
 */
export const positionsTable = pgTable(
  "positions",
  {
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    loanId:     text("loan_id").notNull(),
    investorId: text("investor_id").notNull(),

    // Saldo atual do principal — decrementado em cada distribuição de parcela
    principalBalanceCents: integer("principal_balance_cents").notNull(),
    // Total investido desde a criação — imutável, para histórico
    originalPrincipalCents: integer("original_principal_cents").notNull(),
    // Total já retornado ao investidor — só cresce, nunca zera
    totalReturnedCents: integer("total_returned_cents").notNull().default(0),

    // Taxa consolidada — média de ratePct das investment_orders ativas,
    // ponderada por principalBalanceCents de cada uma.
    // Recalculada apenas quando a composição de ordens muda (não a cada parcela).
    ratePct: integer("rate_pct").notNull(),

    status:    text("status").$type<PositionStatus>().notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId],     foreignColumns: [loansTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("restrict"),
    // Uma única linha por credor + empréstimo
    uniqueIndex("positions_loan_investor_idx").on(t.loanId, t.investorId),
  ],
);

export type InsertPosition = typeof positionsTable.$inferInsert;
export type Position = typeof positionsTable.$inferSelect;
