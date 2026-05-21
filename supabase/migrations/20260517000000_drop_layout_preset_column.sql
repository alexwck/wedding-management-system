-- Migration: Drop layout_preset column from weddings table
-- Feature: 013-update-design-stitch
-- Rationale: Removing legacy preset system in favor of single glassmorphic layout
-- Safety: No production deployment yet - hard removal is safe

-- Drop the check constraint first
ALTER TABLE IF EXISTS weddings
  DROP CONSTRAINT IF EXISTS weddings_layout_preset_check;

-- Drop the column
ALTER TABLE IF EXISTS weddings
  DROP COLUMN IF EXISTS layout_preset;
