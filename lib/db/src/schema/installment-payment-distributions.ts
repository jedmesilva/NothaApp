import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { installmentPaymentsTable } from "./installment-payments";
import { positionsTable } from "./positions";
import { investorProfilesTable } from "./investor-profiles";
import { walletTransactionsTable } from "./wallet-transactions";

/**
 * Distribuição de parcela para um credor.
 *
 * interestCents e principalCents são calculados uma única vez no momento
 * em que a distribution nasce, usando principalBalanceCents e ratePct da
 * position ANTES desta distribuição, e gravados aqui — nunca recalculados.
 *
 *   interestCents  = principalBalanceCents_da_position × ratePct_da_position
 *   principalCents = amountCents − interestCents
 *
 * Gravar em vez de recalcular permite somar rendimento por período (7 dias,
 * 1 mês, 1 ano) com uma simples SUM(interest_cents) sem reconstruir histórico
 * de saldos. Como investorId é o dono da position naquele momento específico,
 * cessões no secundário são resolvidas automaticamente.
 */
export const installmentPaymentDistributionsTable = pgTable(
  "installment_payment_distributions",
  {
    id:                   text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    installmentPaymentId: text("installment_payment_id").notNull(),
    // Posição ativa no momento da distribuição — resolve cessões automaticamente
    positionId:           text("position_id").notNull(),
    // Investidor ativo naquele momento (denormalizado para evitar join no extrato)
    investorId:           text("investor_id").notNull(),
    // Total distribuído nesta parcela para esta posição
    amountCents:          integer("amount_cents").notNull(),
    // Decomposição calculada e gravada uma única vez no momento da distribuição
    interestCents:        integer("interest_cents").notNull(),
    principalCents:       integer("principal_cents").notNull(),
    // Transação na carteira do investidor que recebeu este repasse
    walletTransactionId:  text("wallet_transaction_id"),
    distributedAt:        timestamp("distributed_at").notNull().defaultNow(),
    createdAt:            timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.installmentPaymentId], foreignColumns: [installmentPaymentsTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.positionId],  foreignColumns: [positionsTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.investorId],  foreignColumns: [investorProfilesTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.walletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
  ],
);

export type InsertInstallmentPaymentDistribution = typeof installmentPaymentDistributionsTable.$inferInsert;
export type InstallmentPaymentDistribution = typeof installmentPaymentDistributionsTable.$inferSelect;
