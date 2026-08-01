import { pgTable, text, integer, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";
import { investorProfilesTable } from "./investor-profiles";
import { fundingOrderOffersTable } from "./funding-order-offers";

export const positionStatusEnum = ["active", "transferred_out", "settled"] as const;
export type PositionStatus = typeof positionStatusEnum[number];

/**
 * Representa a fatia de um empréstimo que pertence a um investidor.
 *
 * Ciclo de vida:
 *   - Nasce quando a captação fecha (funding_order_offer aceita + loan ativado)
 *   - principalBalanceCents decrementado a cada repasse de parcela recebido
 *   - status → "transferred_out" quando cedida via position_transfer_orders
 *   - status → "settled" quando principalBalanceCents chega a zero (empréstimo quitado)
 *
 * Duas origens possíveis (mutuamente exclusivas):
 *   - fundingOrderOfferId → nasceu de captação primária
 *   - parentPositionId    → nasceu de cessão no mercado secundário
 */
export const positionsTable = pgTable(
  "positions",
  {
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    loanId:     text("loan_id").notNull(),
    investorId: text("investor_id").notNull(),

    // Origem: captação primária (null se nasceu de cessão)
    fundingOrderOfferId: text("funding_order_offer_id"),
    // Origem: cessão no secundário (null se nasceu de captação)
    parentPositionId:    text("parent_position_id"),

    // Saldo atual do principal — decrementado em cada distribuição de parcela
    principalBalanceCents: integer("principal_balance_cents").notNull(),
    // Valor original quando a posição foi criada — imutável, para histórico
    originalPrincipalCents: integer("original_principal_cents").notNull(),

    status:    text("status").$type<PositionStatus>().notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId],     foreignColumns: [loansTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.fundingOrderOfferId], foreignColumns: [fundingOrderOffersTable.id] }).onDelete("set null"),
    // Auto-referência: posição filha aponta para a posição pai que foi cedida
    foreignKey({ columns: [t.parentPositionId], foreignColumns: [t.id] }).onDelete("set null"),
    index("positions_loan_id_idx").on(t.loanId),
    index("positions_investor_id_idx").on(t.investorId),
  ],
);

export type InsertPosition = typeof positionsTable.$inferInsert;
export type Position = typeof positionsTable.$inferSelect;
