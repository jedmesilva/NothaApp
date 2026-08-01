import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { installmentPaymentsTable } from "./installment-payments";
import { positionsTable } from "./positions";
import { investorProfilesTable } from "./investor-profiles";
import { walletTransactionsTable } from "./wallet-transactions";

export const installmentPaymentDistributionsTable = pgTable(
  "installment_payment_distributions",
  {
    id:                   text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    installmentPaymentId: text("installment_payment_id").notNull(),
    // Posição do investidor neste empréstimo (substitui fundingOrderId)
    // Permite que cessões no secundário não exijam recriar funding_orders
    positionId:           text("position_id").notNull(),
    // Atalho denormalizado — evita join extra nas consultas de extrato do investidor
    investorId:           text("investor_id").notNull(),
    amountCents:          integer("amount_cents").notNull(),
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
