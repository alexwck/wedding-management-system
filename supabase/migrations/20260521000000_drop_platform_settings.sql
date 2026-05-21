-- Migration: Drop unused platform_settings table
-- The platform_settings table was created for global theme defaults but is
-- completely unused by the application. Removing it reduces attack surface
-- and schema complexity.

DROP TRIGGER IF EXISTS set_platform_settings_updated_at ON public.platform_settings;
DROP TABLE IF EXISTS public.platform_settings CASCADE;
