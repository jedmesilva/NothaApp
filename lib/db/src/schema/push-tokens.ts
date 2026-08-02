import {
  pgTable,
  text,
  timestamp,
  foreignKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { investorProfilesTable } from "./investor-profiles";

/**
 * Expo push tokens por investidor.
 *
 * Um mesmo investidor pode ter múltiplos dispositivos (tokens distintos).
 * O token é único globalmente — se mudar de dispositivo, upsert pelo token.
 */
export const pushTokensTable = pgTable(
  "push_tokens",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    investorId: text("investor_id").notNull(),
    /** ExponentPushToken[xxxxxx] */
    token: text("token").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("cascade"),
    uniqueIndex("push_tokens_token_idx").on(t.token),
    index("push_tokens_investor_id_idx").on(t.investorId),
  ],
);

export type InsertPushToken = typeof pushTokensTable.$inferInsert;
export type PushToken = typeof pushTokensTable.$inferSelect;
