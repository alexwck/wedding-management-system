-- Create rsvp_tokens table for returning guest edit flow
CREATE TABLE public.rsvp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) NOT NULL,
  rsvp_id BIGINT NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  wedding_id BIGINT NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index on token to prevent collisions
CREATE UNIQUE INDEX idx_rsvp_tokens_token ON public.rsvp_tokens(token);

-- Index on rsvp_id for fast lookups
CREATE INDEX idx_rsvp_tokens_rsvp_id ON public.rsvp_tokens(rsvp_id);

-- Index on wedding_id for cleanup queries
CREATE INDEX idx_rsvp_tokens_wedding_id ON public.rsvp_tokens(wedding_id);

-- Index on expires_at for efficient cleanup of expired tokens
CREATE INDEX idx_rsvp_tokens_expires_at ON public.rsvp_tokens(expires_at);

-- RLS: guests can select their own token via server action (bypassed by admin client)
ALTER TABLE public.rsvp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on rsvp_tokens"
  ON public.rsvp_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.rsvp_tokens IS 'Maps short-lived browser cookies to RSVP records for the Edit RSVP feature.';
