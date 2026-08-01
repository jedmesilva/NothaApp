CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "revoked_tokens" (
	"jti" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"cpf" text,
	"birth_date" date,
	"phone" text,
	"zip_code" text,
	"street" text,
	"street_number" text,
	"complement" text,
	"neighborhood" text,
	"city" text,
	"state" char(2),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"parent_wallet_id" text,
	"type" text DEFAULT 'main' NOT NULL,
	"balance_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"pix_key" text,
	"description" text,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrower_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"document_status" text DEFAULT 'pending' NOT NULL,
	"document_rejection_reason" text,
	"credit_limit_cents" integer DEFAULT 0 NOT NULL,
	"used_credit_cents" integer DEFAULT 0 NOT NULL,
	"credit_score" integer,
	"risk_tier" text,
	"monthly_income_cents" integer,
	"occupation" text,
	"total_loans" integer DEFAULT 0 NOT NULL,
	"total_borrowed_cents" integer DEFAULT 0 NOT NULL,
	"total_defaulted" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "borrower_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "investor_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"investor_type" text DEFAULT 'retail' NOT NULL,
	"document_status" text DEFAULT 'pending' NOT NULL,
	"document_rejection_reason" text,
	"max_exposure_cents" integer,
	"auto_invest_enabled" boolean DEFAULT false NOT NULL,
	"auto_invest_max_per_loan_cents" integer,
	"preferred_cycles" jsonb,
	"preferred_risk_tiers" jsonb,
	"total_invested_cents" integer DEFAULT 0 NOT NULL,
	"total_returns_cents" integer DEFAULT 0 NOT NULL,
	"total_defaulted_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investor_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" text PRIMARY KEY NOT NULL,
	"borrower_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"interest_rate_pct" integer NOT NULL,
	"term_days" integer NOT NULL,
	"cycle" text NOT NULL,
	"installments_total" integer NOT NULL,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"contract_id" text NOT NULL,
	"granted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loans_contract_id_unique" UNIQUE("contract_id")
);
--> statement-breakpoint
CREATE TABLE "funding_order_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"loan_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"rate_pct" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"escalation_round" integer DEFAULT 1 NOT NULL,
	"wallet_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"funding_order_offer_id" text,
	"parent_investment_order_id" text,
	"position_id" text NOT NULL,
	"loan_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"rate_pct" integer NOT NULL,
	"original_principal_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_installments" (
	"id" text PRIMARY KEY NOT NULL,
	"loan_id" text NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"installment_id" text NOT NULL,
	"loan_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"wallet_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" text PRIMARY KEY NOT NULL,
	"loan_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"principal_balance_cents" integer NOT NULL,
	"original_principal_cents" integer NOT NULL,
	"total_returned_cents" integer DEFAULT 0 NOT NULL,
	"rate_pct" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_payment_distributions" (
	"id" text PRIMARY KEY NOT NULL,
	"installment_payment_id" text NOT NULL,
	"position_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"interest_cents" integer NOT NULL,
	"principal_cents" integer NOT NULL,
	"wallet_transaction_id" text,
	"distributed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_events" (
	"id" text PRIMARY KEY NOT NULL,
	"loan_id" text NOT NULL,
	"event_type" text NOT NULL,
	"actor_id" text,
	"actor_type" text DEFAULT 'system' NOT NULL,
	"payload" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_limit_history" (
	"id" text PRIMARY KEY NOT NULL,
	"borrower_id" text NOT NULL,
	"previous_limit_cents" integer NOT NULL,
	"new_limit_cents" integer NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"changed_by_user_id" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_transfer_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"position_id" text NOT NULL,
	"offered_amount_cents" integer NOT NULL,
	"remaining_amount_cents" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_transfers" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"source_position_id" text NOT NULL,
	"destination_position_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"debit_wallet_transaction_id" text,
	"credit_wallet_transaction_id" text,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_parent_wallet_id_wallets_id_fk" FOREIGN KEY ("parent_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_profiles" ADD CONSTRAINT "borrower_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_id_borrower_profiles_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_order_offers" ADD CONSTRAINT "funding_order_offers_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_order_offers" ADD CONSTRAINT "funding_order_offers_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_order_offers" ADD CONSTRAINT "funding_order_offers_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_orders" ADD CONSTRAINT "investment_orders_funding_order_offer_id_funding_order_offers_id_fk" FOREIGN KEY ("funding_order_offer_id") REFERENCES "public"."funding_order_offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_orders" ADD CONSTRAINT "investment_orders_parent_investment_order_id_investment_orders_id_fk" FOREIGN KEY ("parent_investment_order_id") REFERENCES "public"."investment_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_orders" ADD CONSTRAINT "investment_orders_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_orders" ADD CONSTRAINT "investment_orders_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_orders" ADD CONSTRAINT "investment_orders_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_installment_id_loan_installments_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."loan_installments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payment_distributions" ADD CONSTRAINT "installment_payment_distributions_installment_payment_id_installment_payments_id_fk" FOREIGN KEY ("installment_payment_id") REFERENCES "public"."installment_payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payment_distributions" ADD CONSTRAINT "installment_payment_distributions_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payment_distributions" ADD CONSTRAINT "installment_payment_distributions_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_payment_distributions" ADD CONSTRAINT "installment_payment_distributions_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_events" ADD CONSTRAINT "loan_events_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_limit_history" ADD CONSTRAINT "credit_limit_history_borrower_id_borrower_profiles_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_limit_history" ADD CONSTRAINT "credit_limit_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfer_orders" ADD CONSTRAINT "position_transfer_orders_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfers" ADD CONSTRAINT "position_transfers_order_id_position_transfer_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."position_transfer_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfers" ADD CONSTRAINT "position_transfers_source_position_id_positions_id_fk" FOREIGN KEY ("source_position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfers" ADD CONSTRAINT "position_transfers_destination_position_id_positions_id_fk" FOREIGN KEY ("destination_position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfers" ADD CONSTRAINT "position_transfers_debit_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("debit_wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_transfers" ADD CONSTRAINT "position_transfers_credit_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("credit_wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wallets_user_id_idx" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "investment_orders_position_id_idx" ON "investment_orders" USING btree ("position_id");--> statement-breakpoint
CREATE INDEX "investment_orders_loan_id_idx" ON "investment_orders" USING btree ("loan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "positions_loan_investor_idx" ON "positions" USING btree ("loan_id","investor_id");--> statement-breakpoint
CREATE INDEX "loan_events_loan_id_occurred_at_idx" ON "loan_events" USING btree ("loan_id","occurred_at");--> statement-breakpoint
CREATE INDEX "loan_events_event_type_idx" ON "loan_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "credit_limit_history_borrower_id_occurred_at_idx" ON "credit_limit_history" USING btree ("borrower_id","occurred_at");