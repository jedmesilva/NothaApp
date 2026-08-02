import { pgTable, text, integer, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";
import { investorProfilesTable } from "./investor-profiles";
import { walletTransactionsTable } from "./wallet-transactions";
import { fundingOrderOffersTable } from "./funding-order-offers";

export const positionStatusEnum = [
  "reserved",        // oferta aceita, aguardando fechamento da captação — saldo já bloqueado na wallet
  "active",          // captação fechou, capital de fato desembolsado ao tomador
  "transferred_out", // vendida por inteiro no secundário
  "settled",         // saldo zerado por amortização completa
  "cancelled",       // captação não fechou (expirou/foi cancelada) — saldo liberado na wallet
] as const;
export type PositionStatus = typeof positionStatusEnum[number];

/**
 * Uma linha por aporte individual — sem consolidação.
 *
 * Um mesmo investidor pode ter múltiplas posições no mesmo empréstimo
 * (aportes em rodadas diferentes, cada um com sua própria taxa e saldo).
 *
 * Duas origens mutuamente exclusivas:
 *   - fundingOrderOfferId → nasceu de captação primária (oferta aceita)
 *   - parentPositionId    → nasceu de cessão no mercado secundário
 *
 * Ciclo de vida (captação primária):
 *   reserved  → captação fecha → active → amortização completa → settled
 *   reserved  → captação expira/cancela → cancelled
 *
 * Posições nascidas de cessão (parentPositionId preenchido) nascem direto
 * como "active" — o capital já estava desembolsado, sem espera de fechamento.
 *
 * "Quanto já foi captado" — leitura direta, sem join com offers/wallet:
 *   SELECT COALESCE(SUM(principal_balance_cents), 0)
 *   FROM positions
 *   WHERE loan_id = :loanId AND status IN ('reserved', 'active')
 */
export const positionsTable = pgTable(
  "positions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Origem: captação primária — null se nasceu de cessão no secundário
    fundingOrderOfferId: text("funding_order_offer_id"),
    // Origem: cessão no secundário — null se nasceu de oferta aceita.
    // Mutuamente exclusivo com fundingOrderOfferId.
    parentPositionId: text("parent_position_id"),

    loanId:     text("loan_id").notNull(),
    investorId: text("investor_id").notNull(),

    // Saldo atual do principal — decrementado em cada distribuição de parcela
    principalBalanceCents: integer("principal_balance_cents").notNull(),
    // Valor original do aporte — fixo desde a criação
    originalPrincipalCents: integer("original_principal_cents").notNull(),
    // Total já retornado ao investidor — só cresce, nunca zera
    totalReturnedCents: integer("total_returned_cents").notNull().default(0),

    // Taxa herdada da oferta ou da posição-mãe — nunca recalculada
    ratePct: integer("rate_pct").notNull(),

    // Reserva feita no aceite; completed quando a captação fecha
    walletTransactionId: text("wallet_transaction_id"),

    // Default "reserved" para captação primária; posições de cessão nascem "active"
    status: text("status").$type<PositionStatus>().notNull().default("reserved"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.fundingOrderOfferId], foreignColumns: [fundingOrderOffersTable.id] }).onDelete("restrict"),
    // Auto-referência: posição filha (compra no secundário) → posição original do vendedor
    foreignKey({ columns: [t.parentPositionId], foreignColumns: [t.id] }).onDelete("set null"),
    foreignKey({ columns: [t.loanId],     foreignColumns: [loansTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.walletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
    // Suporta queries por empréstimo + investidor (sem unicidade — múltiplas posições por par são esperadas)
    index("positions_loan_investor_idx").on(t.loanId, t.investorId),
    // Suporta queries de saldo total do usuário em todos os loans
    index("positions_investor_idx").on(t.investorId),
  ],
);

export type InsertPosition = typeof positionsTable.$inferInsert;
export type Position = typeof positionsTable.$inferSelect;
