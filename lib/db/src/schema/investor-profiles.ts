import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const investorStatusEnum = ["pending_review", "active", "suspended"] as const;
export type InvestorStatus = typeof investorStatusEnum[number];

export const investorProfilesTable = pgTable(
  "investor_profiles",
  {
    id:                 text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:             text("user_id").notNull().unique(),
    status:             text("status").$type<InvestorStatus>().notNull().default("pending_review"),
    totalInvestedCents: integer("total_invested_cents").notNull().default(0),
    totalReturnsCents:  integer("total_returns_cents").notNull().default(0),
    createdAt:          timestamp("created_at").notNull().defaultNow(),
    updatedAt:          timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertInvestorProfile = typeof investorProfilesTable.$inferInsert;
export type InvestorProfile = typeof investorProfilesTable.$inferSelect;
