import { pgTable, text, integer, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { borrowerProfilesTable } from "./borrower-profiles";
import { usersTable } from "./users";

// Motivo da alteração de limite
export const creditLimitChangeReasonEnum = [
  "initial_approval",    // primeiro limite concedido após análise de crédito
  "periodic_review",     // revisão periódica automática (job agendado)
  "manual_increase",     // aumento manual por admin
  "manual_decrease",     // redução manual por admin
  "score_upgrade",       // melhora de score disparou aumento automático
  "score_downgrade",     // queda de score disparou redução automática
  "default_penalty",     // redução por inadimplência
  "suspension",          // limite zerado por suspensão de conta
] as const;
export type CreditLimitChangeReason = typeof creditLimitChangeReasonEnum[number];

export const creditLimitHistoryTable = pgTable(
  "credit_limit_history",
  {
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    borrowerId: text("borrower_id").notNull(),

    // Valores antes e depois — permite reconstruir a linha do tempo completa
    previousLimitCents: integer("previous_limit_cents").notNull(), // 0 no registro inicial
    newLimitCents:      integer("new_limit_cents").notNull(),

    reason:  text("reason").$type<CreditLimitChangeReason>().notNull(),
    note:    text("note"), // observação livre (obrigatória em alterações manuais)

    // Quem originou a mudança (null = processo automático)
    changedByUserId: text("changed_by_user_id"),

    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.borrowerId], foreignColumns: [borrowerProfilesTable.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.changedByUserId], foreignColumns: [usersTable.id] }).onDelete("set null"),
    index("credit_limit_history_borrower_id_occurred_at_idx").on(t.borrowerId, t.occurredAt),
  ],
);

export type InsertCreditLimitHistory = typeof creditLimitHistoryTable.$inferInsert;
export type CreditLimitHistory = typeof creditLimitHistoryTable.$inferSelect;
