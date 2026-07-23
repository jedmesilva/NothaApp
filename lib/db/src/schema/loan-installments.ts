import { pgTable, text, integer, date, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";

export const installmentStatusEnum = ["pending", "paid", "overdue"] as const;
export type InstallmentStatus = typeof installmentStatusEnum[number];

export const loanInstallmentsTable = pgTable(
  "loan_installments",
  {
    id:                 text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    loanId:             text("loan_id").notNull(),
    installmentNumber:  integer("installment_number").notNull(),
    dueDate:            date("due_date").notNull(),
    amountCents:        integer("amount_cents").notNull(),
    status:             text("status").$type<InstallmentStatus>().notNull().default("pending"),
    // Preenchido quando o tomador quita esta parcela
    paidAt:             timestamp("paid_at"),
    createdAt:          timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId], foreignColumns: [loansTable.id] }).onDelete("cascade"),
  ],
);

export type InsertLoanInstallment = typeof loanInstallmentsTable.$inferInsert;
export type LoanInstallment = typeof loanInstallmentsTable.$inferSelect;
