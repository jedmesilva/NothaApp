import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { loanInstallmentsTable } from "./loan-installments";
import { loansTable } from "./loans";
import { walletTransactionsTable } from "./wallet-transactions";

export const installmentPaymentsTable = pgTable(
  "installment_payments",
  {
    id:                  text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    installmentId:       text("installment_id").notNull(),
    // Atalho para facilitar queries por empréstimo sem precisar de JOIN extra
    loanId:              text("loan_id").notNull(),
    amountCents:         integer("amount_cents").notNull(),
    paidAt:              timestamp("paid_at").notNull().defaultNow(),
    // Transação na carteira do tomador que originou este pagamento
    walletTransactionId: text("wallet_transaction_id"),
    createdAt:           timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.installmentId], foreignColumns: [loanInstallmentsTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.loanId], foreignColumns: [loansTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.walletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
  ],
);

export type InsertInstallmentPayment = typeof installmentPaymentsTable.$inferInsert;
export type InstallmentPayment = typeof installmentPaymentsTable.$inferSelect;
