import { pgTable, text, integer, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletTypeEnum = [
  "main",   // wallet principal do usuário
  "sub",    // wallet filha (ex: reserva, investimento segregado)
] as const;
export type WalletType = typeof walletTypeEnum[number];

export const walletsTable = pgTable(
  "wallets",
  {
    id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:       text("user_id").notNull(),
    // Wallet pai — null indica que esta é a wallet raiz do usuário
    parentWalletId: text("parent_wallet_id"),
    type:         text("type").$type<WalletType>().notNull().default("main"),
    balanceCents: integer("balance_cents").notNull().default(0),
    createdAt:    timestamp("created_at").notNull().defaultNow(),
    updatedAt:    timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
    // Auto-referência: wallet filha aponta para a wallet pai
    foreignKey({ columns: [t.parentWalletId], foreignColumns: [t.id] }).onDelete("set null"),
    index("wallets_user_id_idx").on(t.userId),
  ],
);

export type InsertWallet = typeof walletsTable.$inferInsert;
export type Wallet = typeof walletsTable.$inferSelect;
