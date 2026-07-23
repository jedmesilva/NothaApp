import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletsTable = pgTable(
  "wallets",
  {
    id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:       text("user_id").notNull().unique(),
    balanceCents: integer("balance_cents").notNull().default(0),
    createdAt:    timestamp("created_at").notNull().defaultNow(),
    updatedAt:    timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertWallet = typeof walletsTable.$inferInsert;
export type Wallet = typeof walletsTable.$inferSelect;
