import { pgTable, text, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { positionTransferOrdersTable } from "./position-transfer-orders";
import { positionsTable } from "./positions";
import { walletTransactionsTable } from "./wallet-transactions";

/**
 * Execução de uma cessão no mercado secundário.
 *
 * Cada registro representa a transferência efetiva de uma fatia de posição
 * de um vendedor para um comprador. Débito e crédito na wallet ocorrem na
 * mesma transação Postgres (atomicidade garantida pelo ACID).
 *
 * Uma position_transfer_order pode gerar múltiplos position_transfers
 * (preenchimento parcial por compradores diferentes).
 */
export const positionTransfersTable = pgTable(
  "position_transfers",
  {
    id:      text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id").notNull(),

    // Posição original do vendedor (source) e nova posição do comprador (destination)
    sourcePositionId:      text("source_position_id").notNull(),
    destinationPositionId: text("destination_position_id").notNull(),

    amountCents: integer("amount_cents").notNull(),
    priceCents:  integer("price_cents").notNull(),

    // Rastreabilidade no ledger — ambas nascem ou falham juntas (transação atômica)
    debitWalletTransactionId:  text("debit_wallet_transaction_id"),  // débito no comprador
    creditWalletTransactionId: text("credit_wallet_transaction_id"), // crédito no vendedor

    executedAt: timestamp("executed_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.orderId],                foreignColumns: [positionTransferOrdersTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.sourcePositionId],       foreignColumns: [positionsTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.destinationPositionId],  foreignColumns: [positionsTable.id] }).onDelete("restrict"),
    foreignKey({ columns: [t.debitWalletTransactionId],  foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
    foreignKey({ columns: [t.creditWalletTransactionId], foreignColumns: [walletTransactionsTable.id] }).onDelete("set null"),
  ],
);

export type InsertPositionTransfer = typeof positionTransfersTable.$inferInsert;
export type PositionTransfer = typeof positionTransfersTable.$inferSelect;
