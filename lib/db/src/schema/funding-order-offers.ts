import { pgTable, text, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { fundingOrdersTable } from "./funding-orders";
import { investorProfilesTable } from "./investor-profiles";

export const fundingOrderOfferStatusEnum = [
  "pending",
  "accepted",
  "rejected",
  "expired",
] as const;
export type FundingOrderOfferStatus = typeof fundingOrderOfferStatusEnum[number];

export const fundingOrderOffersTable = pgTable(
  "funding_order_offers",
  {
    id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    fundingOrderId: text("funding_order_id").notNull(),
    investorId:     text("investor_id").notNull(),
    status:         text("status").$type<FundingOrderOfferStatus>().notNull().default("pending"),
    // Data em que o credor recebeu a oferta
    sentAt:         timestamp("sent_at").notNull().defaultNow(),
    // Data em que o credor respondeu (aceite ou recusa)
    respondedAt:    timestamp("responded_at"),
    createdAt:      timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.fundingOrderId], foreignColumns: [fundingOrdersTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.investorId], foreignColumns: [investorProfilesTable.id] }).onDelete("cascade"),
  ],
);

export type InsertFundingOrderOffer = typeof fundingOrderOffersTable.$inferInsert;
export type FundingOrderOffer = typeof fundingOrderOffersTable.$inferSelect;
