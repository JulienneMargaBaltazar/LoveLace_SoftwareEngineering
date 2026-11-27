-- S1-DBA-07: Email Verification Schema, Tokens, and Indexes

ALTER TABLE public.app_user
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_user(user_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'email_verification' CHECK (purpose IN ('email_verification', 'email_change')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_verification_tokens_token_hash
  ON public.email_verification_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_expires
  ON public.email_verification_tokens (user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_active_lookup
  ON public.email_verification_tokens (token_hash, expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;