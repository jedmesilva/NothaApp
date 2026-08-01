import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { positionsTable } from "./positions";

export const positionTransferOrderStatusEnum = ["open", "partial", "closed", "cancelled"] as const;
export type PositionTransferOrderStatus = typeof positionTransferOrderStatusEnum[number];

/**
 * Ordem de venda de posição no mercado secundário.
 *
 * O investidor coloca à venda uma fatia (ou toda) sua posição em um empréstimo.
 * Pode ser preenchida parcialmente por múltiplos compradores → status "partial".
 * Quando remainingAmountCents = 0 → status "closed".
 */
export const positionTransferOrdersTable = pgTable(
  "position_transfer_orders",
  {
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    positionId: text("position_id").notNull(),

    // Valor total posto à venda
    offeredAmountCents:   integer("offered_amount_cents").notNull(),
    // Decrementado a cada position_transfer executado; zero → status "closed"
    remainingAmountCents: integer("remaining_amount_cents").notNull(),
    // Preço em centavos — pode ter deságio ou ágio em relação ao valor de face
    priceCents: integer("price_cents").notNull(),

    status:    text("status").$type<PositionTransferOrderStatus>().notNull().default("open"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.positionId], foreignColumns: [positionsTable.id] }).onDelete("cascade"),
  ],
);

export type InsertPositionTransferOrder = typeof positionTransferOrdersTable.$inferInsert;
export type PositionTransferOrder = typeof positionTransferOrdersTable.$inferSelect;
