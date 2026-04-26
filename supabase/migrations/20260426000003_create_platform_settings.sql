-- Create platform_settings table for global theme defaults and other platform config
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS: admin full access
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on platform_settings"
  ON public.platform_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.platform_settings IS 'Global platform configuration stored as key-value JSONB.';
