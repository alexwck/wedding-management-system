-- Add layout preset and theme configuration to weddings table
ALTER TABLE public.weddings
  ADD COLUMN layout_preset VARCHAR(50) NOT NULL DEFAULT 'bento',
  ADD COLUMN theme_json JSONB NULL;

-- Validate layout_preset values at database level
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_layout_preset_check
  CHECK (layout_preset IN ('minimalist', 'bento', 'storytelling', 'magazine', 'card-stack', 'asymmetric', 'cinematic'));

COMMENT ON COLUMN public.weddings.layout_preset IS 'Active layout preset for the wedding landing page';
COMMENT ON COLUMN public.weddings.theme_json IS 'Per-wedding theme overrides (JSONB). NULL inherits global default.';
