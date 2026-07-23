import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const revokedTokensTable = pgTable("revoked_tokens", {
  jti: text("jti").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
});
