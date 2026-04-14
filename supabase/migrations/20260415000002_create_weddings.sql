-- Create weddings table
CREATE TABLE public.weddings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  couple_name TEXT NOT NULL,
  template_image_url TEXT,
  wedding_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on user_id for couple lookups
CREATE INDEX idx_weddings_user_id ON public.weddings(user_id);

-- RLS: couples can only see their own wedding
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can view own wedding"
  ON public.weddings
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
