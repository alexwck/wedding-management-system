-- Migration: Drop unused theme_json column from weddings table
-- The theme_json column was added for per-wedding theme overrides but
-- is never written by the application and has no UI for configuration.
-- The app uses the global DEFAULT_THEME from theme-config.ts exclusively.

ALTER TABLE public.weddings
  DROP COLUMN IF EXISTS theme_json;
