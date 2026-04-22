-- Create oauth_tokens table
CREATE TABLE public.oauth_tokens (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One token set per user per provider
ALTER TABLE public.oauth_tokens ADD CONSTRAINT oauth_tokens_user_provider_unique UNIQUE (user_id, provider);

-- Index
CREATE INDEX idx_oauth_tokens_user ON public.oauth_tokens (user_id);

-- RLS
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON public.oauth_tokens
  FOR ALL
  USING (user_id = (select auth.uid()));

-- Auto-update updated_at trigger
CREATE TRIGGER set_oauth_token_updated_at
  BEFORE UPDATE ON public.oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
