import { pgTable, text, jsonb, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { loansTable } from "./loans";

export const loanEventTypeEnum = [
  // ── Ciclo do empréstimo ──────────────────────────────────────────────────
  "loan_requested",        // tomador submeteu a solicitação
  "loan_approved",         // análise de crédito aprovada
  "loan_rejected",         // análise de crédito reprovada
  "loan_funding_started",  // captação com investidores iniciada
  "loan_funded",           // meta de captação atingida
  "loan_activated",        // dinheiro desembolsado, parcelas criadas
  "loan_overdue_marked",   // empréstimo entrou em atraso (job automático)
  "loan_settled",          // totalmente quitado
  "loan_cancelled",        // cancelado em qualquer fase
  // ── Ciclo das parcelas ───────────────────────────────────────────────────
  "installment_due",       // data de vencimento chegou (job automático)
  "installment_overdue",   // parcela venceu sem pagamento (job automático)
  "installment_paid",      // parcela quitada — payload: { installmentId, installmentPaymentId, amountCents }
  // ── Contrato ────────────────────────────────────────────────────────────
  "contract_generated",    // PDF/contrato gerado — payload: { contractId }
  "contract_signed",       // tomador assinou o aceite — payload: { contractId, signedAt }
  // ── Administrativo ──────────────────────────────────────────────────────
  "note_added",            // nota interna — payload: { note }
] as const;

export type LoanEventType = typeof loanEventTypeEnum[number];

// actor_type identifica quem originou o evento
export const loanEventActorTypeEnum = [
  "user",    // tomador ou investidor agindo via app
  "admin",   // operador interno via painel
  "system",  // processo automático (job, webhook, etc.)
] as const;
export type LoanEventActorType = typeof loanEventActorTypeEnum[number];

export const loanEventsTable = pgTable(
  "loan_events",
  {
    id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    loanId:     text("loan_id").notNull(),

    eventType:  text("event_type").$type<LoanEventType>().notNull(),

    // Quem originou o evento (null quando actor_type = 'system')
    actorId:    text("actor_id"),
    actorType:  text("actor_type").$type<LoanEventActorType>().notNull().default("system"),

    // Dados específicos do tipo de evento (ver comentários em loanEventTypeEnum)
    payload:    jsonb("payload"),

    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  },
  (t) => [
    foreignKey({ columns: [t.loanId], foreignColumns: [loansTable.id] }).onDelete("cascade"),
    // consultas mais comuns: timeline de um empréstimo e filtro por tipo
    index("loan_events_loan_id_occurred_at_idx").on(t.loanId, t.occurredAt),
    index("loan_events_event_type_idx").on(t.eventType),
  ],
);

export type InsertLoanEvent = typeof loanEventsTable.$inferInsert;
export type LoanEvent = typeof loanEventsTable.$inferSelect;
