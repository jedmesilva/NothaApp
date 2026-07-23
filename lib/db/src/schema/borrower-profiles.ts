import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const borrowerStatusEnum = ["pending_review", "active", "suspended"] as const;
export type BorrowerStatus = typeof borrowerStatusEnum[number];

export const borrowerProfilesTable = pgTable(
  "borrower_profiles",
  {
    id:                 text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:             text("user_id").notNull().unique(),
    status:             text("status").$type<BorrowerStatus>().notNull().default("pending_review"),
    totalLoans:         integer("total_loans").notNull().default(0),
    totalBorrowedCents: integer("total_borrowed_cents").notNull().default(0),
    createdAt:          timestamp("created_at").notNull().defaultNow(),
    updatedAt:          timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [usersTable.id] }).onDelete("cascade"),
  ],
);

export type InsertBorrowerProfile = typeof borrowerProfilesTable.$inferInsert;
export type BorrowerProfile = typeof borrowerProfilesTable.$inferSelect;
