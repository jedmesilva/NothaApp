import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";

export const fundingOrderStatusEnum = ["open", "filled", "cancelled"] as const;
export type FundingOrderStatus = typeof fundingOrderStatusEnum[number];

export const fundingOrdersTable = pgTable(
  "funding_orders",
  {
    id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    loanId:      text("loan_id").notNull(),
    orderNumber: integer("order_number").notNull(),
    amountCents: integer("amount_cents").notNull(),
    status:      text("status").$type<FundingOrderStatus>().notNull().default("open"),
    createdAt:   timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId], foreignColumns: [loansTable.id] }).onDelete("cascade"),
  ],
);

export type InsertFundingOrder = typeof fundingOrdersTable.$inferInsert;
export type FundingOrder = typeof fundingOrdersTable.$inferSelect;
