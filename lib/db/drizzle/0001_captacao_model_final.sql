-- Migration: modelo final de captação e investimento
-- Substitui investment_orders por posições individuais sem consolidação.
-- Refs: Estrutura de captação e investimento — modelo final

-- ─── 1. funding_order_offers ─────────────────────────────────────────────────

-- 1a. Renomeia amount_cents → max_amount_cents
ALTER TABLE "funding_order_offers" RENAME COLUMN "amount_cents" TO "max_amount_cents";
--> statement-breakpoint

-- 1b. Adiciona min_amount_cents (NOT NULL — dados existentes recebem 0 como default temporário)
ALTER TABLE "funding_order_offers" ADD COLUMN "min_amount_cents" integer NOT NULL DEFAULT 0;
--> statement-breakpoint

-- 1c. Remove o default após a coluna ser populada (novos registros devem definir explicitamente)
ALTER TABLE "funding_order_offers" ALTER COLUMN "min_amount_cents" DROP DEFAULT;
--> statement-breakpoint

-- 1d. Adiciona accepted_amount_cents (nullable — preenchido só no aceite)
ALTER TABLE "funding_order_offers" ADD COLUMN "accepted_amount_cents" integer;
--> statement-breakpoint

-- 1e. Remove FK e coluna wallet_transaction_id (reserva migra para positions)
ALTER TABLE "funding_order_offers" DROP CONSTRAINT IF EXISTS "funding_order_offers_wallet_transaction_id_wallet_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "funding_order_offers" DROP COLUMN "wallet_transaction_id";
--> statement-breakpoint

-- ─── 2. positions ────────────────────────────────────────────────────────────

-- 2a. Adiciona colunas de origem e rastreabilidade
ALTER TABLE "positions" ADD COLUMN "funding_order_offer_id" text;
--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "parent_position_id" text;
--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "wallet_transaction_id" text;
--> statement-breakpoint

-- 2b. Muda default de status: 'active' → 'reserved'
--     (posições existentes já estão ativas — o default novo só vale para inserções futuras)
ALTER TABLE "positions" ALTER COLUMN "status" SET DEFAULT 'reserved';
--> statement-breakpoint

-- 2c. Remove o índice único — múltiplas posições por (investor, loan) são esperadas
DROP INDEX IF EXISTS "positions_loan_investor_idx";
--> statement-breakpoint

-- 2d. Cria índices não-únicos substitutos
CREATE INDEX "positions_loan_investor_idx" ON "positions" USING btree ("loan_id","investor_id");
--> statement-breakpoint
CREATE INDEX "positions_investor_idx" ON "positions" USING btree ("investor_id");
--> statement-breakpoint

-- 2e. FKs para as novas colunas
ALTER TABLE "positions" ADD CONSTRAINT "positions_funding_order_offer_id_funding_order_offers_id_fk"
  FOREIGN KEY ("funding_order_offer_id") REFERENCES "public"."funding_order_offers"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_parent_position_id_positions_id_fk"
  FOREIGN KEY ("parent_position_id") REFERENCES "public"."positions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_wallet_transaction_id_wallet_transactions_id_fk"
  FOREIGN KEY ("wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- ─── 3. investment_orders — remoção completa ─────────────────────────────────

-- 3a. Remove FKs que apontam para investment_orders ou que estão nela
ALTER TABLE "investment_orders" DROP CONSTRAINT IF EXISTS "investment_orders_funding_order_offer_id_funding_order_offers_id_fk";
--> statement-breakpoint
ALTER TABLE "investment_orders" DROP CONSTRAINT IF EXISTS "investment_orders_parent_investment_order_id_investment_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "investment_orders" DROP CONSTRAINT IF EXISTS "investment_orders_position_id_positions_id_fk";
--> statement-breakpoint
ALTER TABLE "investment_orders" DROP CONSTRAINT IF EXISTS "investment_orders_loan_id_loans_id_fk";
--> statement-breakpoint
ALTER TABLE "investment_orders" DROP CONSTRAINT IF EXISTS "investment_orders_investor_id_investor_profiles_id_fk";
--> statement-breakpoint

-- 3b. Remove índices
DROP INDEX IF EXISTS "investment_orders_position_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "investment_orders_loan_id_idx";
--> statement-breakpoint

-- 3c. Drop da tabela
DROP TABLE "investment_orders";
