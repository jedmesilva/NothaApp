import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { walletsTable } from "./wallets";

export const walletTransactionTypeEnum = [
  "deposit",
  "withdrawal",
  "loan_disbursement",
  "loan_payment",
  "investment_out",
  "investment_return",
] as const;

export const walletTransactionStatusEnum = ["pending", "completed", "failed"] as const;
export const walletTransactionDirectionEnum = ["credit", "debit"] as const;

export type WalletTransactionType = typeof walletTransactionTypeEnum[number];
export type WalletTransactionStatus = typeof walletTransactionStatusEnum[number];
export type WalletTransactionDirection = typeof walletTransactionDirectionEnum[number];

export const walletTransactionsTable = pgTable(
  "wallet_transactions",
  {
    id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    walletId:    text("wallet_id").notNull(),
    type:        text("type").$type<WalletTransactionType>().notNull(),
    direction:   text("direction").$type<WalletTransactionDirection>().notNull(),
    amountCents: integer("amount_cents").notNull(),
    status:      text("status").$type<WalletTransactionStatus>().notNull().default("pending"),
    pixKey:      text("pix_key"),
    description: text("description"),
    referenceId: text("reference_id"),
    createdAt:   timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.walletId], foreignColumns: [walletsTable.id] }).onDelete("cascade"),
  ],
);

export type InsertWalletTransaction = typeof walletTransactionsTable.$inferInsert;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
