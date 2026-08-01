import { pgTable, text, integer, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { fundingOrderOffersTable } from "./funding-order-offers";
import { positionsTable } from "./positions";
import { loansTable } from "./loans";
import { investorProfilesTable } from "./investor-profiles";

/**
 * Histórico imutável de cada aporte individual — nunca usado em cálculo.
 *
 * Representa a proveniência de cada real que compõe o saldo e a taxa
 * consolidada de uma position. Depois de criada, nunca mais é escrita.
 *
 * Duas origens mutuamente exclusivas:
 *   - fundingOrderOfferId      → nasceu de captação primária (oferta aceita)
 *   - parentInvestmentOrderId  → nasceu de cessão no mercado secundário
 *
 * Não tem principalBalanceCents nem status — como não é decrementada por
 * rateio nem afetada por venda, não existe "saldo atual" nem "estado" a
 * rastrear. originalPrincipalCents é o único valor monetário, e é fixo.
 *
 * Operações de rateio de parcela e venda no secundário acontecem inteiramente
 * no nível de positions — investment_orders são consultadas só para auditoria.
 */
export const investmentOrdersTable = pgTable(
  "investment_orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Origem: captação primária — null se nasceu de cessão no secundário
    fundingOrderOfferId: text("funding_order_offer_id"),
    // Origem: cessão no secundário — null se nasceu de aceite de oferta
    // (auto-referência: aponta para a investment_order original do vendedor)
    parentInvestmentOrderId: text("parent_investment_order_id"),

    // Posição consolidada para a qual este aporte contribui
    positionId: text("position_id").notNull(),

    // Atalhos denormalizados — mesmo padrão de installment_payment_distributions
    loanId:     text("loan_id").notNull(),
    investorId: text("investor_id").notNull(),

    // Taxa pactuada na origem — congelada, nunca muda
    ratePct: integer("rate_pct").notNull(),
    // Valor do aporte no momento da criação — imutável
    originalPrincipalCents: integer("original_principal_cents").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.fundingOrderOfferId], foreignColumns: [fundingOrderOffersTable.id] }).onDelete("restrict"),
    // Auto-referência: ordem filha (compra no secundário) → ordem pai (origem original)
    foreignKey({ columns: [t.parentInvestmentOrderId], foreignColumns: [t.id] }).onDelete("set null"),
    foreignKey({ columns: [t.positionId],  foreignColumns: [positionsTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.loanId],      foreignColumns: [loansTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.investorId],  foreignColumns: [investorProfilesTable.id] }).onDelete("restrict"),
    index("investment_orders_position_id_idx").on(t.positionId),
    index("investment_orders_loan_id_idx").on(t.loanId),
  ],
);

export type InsertInvestmentOrder = typeof investmentOrdersTable.$inferInsert;
export type InvestmentOrder = typeof investmentOrdersTable.$inferSelect;
