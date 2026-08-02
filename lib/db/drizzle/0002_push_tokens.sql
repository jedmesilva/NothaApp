-- Migration 0002: push_tokens
-- Armazena tokens Expo push por investidor (múltiplos dispositivos suportados).

CREATE TABLE IF NOT EXISTS "push_tokens" (
  "id"          text PRIMARY KEY NOT NULL,
  "investor_id" text NOT NULL
    REFERENCES "investor_profiles"("id") ON DELETE CASCADE,
  "token"       text NOT NULL,
  "created_at"  timestamp NOT NULL DEFAULT now(),
  "updated_at"  timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "push_tokens_token_idx"
  ON "push_tokens" ("token");

CREATE INDEX IF NOT EXISTS "push_tokens_investor_id_idx"
  ON "push_tokens" ("investor_id");
