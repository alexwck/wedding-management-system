# Data Model Changes: Layout Preset Removal

**Date**: 2026-05-17  
**Feature**: 013-update-design-stitch

---

## Schema Change Summary

Remove the `layout_preset` column from the `weddings` table. This column was part of a legacy layout preset system (bento, minimalist, cinematic, etc.) that is being replaced with a single unified glassmorphic design.

### Impact Assessment

- **Production data**: NONE — system has not been deployed to production
- **Seed data**: Contains `layout_preset` values that will be removed on next reset
- **Application code**: 4 files reference `layout_preset` — all references will be removed

---

## Migration File

**Filename**: `supabase/migrations/20260517_drop_layout_preset.sql` (timestamp to be updated)

```sql
-- Drop the layout_preset column and its CHECK constraint
-- Safe: no production deployment, simplifies codebase per Stitch redesign

ALTER TABLE weddings 
  DROP CONSTRAINT IF EXISTS weddings_layout_preset_check;

ALTER TABLE weddings 
  DROP COLUMN IF EXISTS layout_preset;

-- Update column comment (remove reference to layout_preset)
COMMENT ON COLUMN weddings.theme IS 'Wedding theme/color scheme (future use)';
```

---

## TypeScript Type Changes

### Before
```typescript
// src/lib/design-system/layout-preset-props.ts
interface LayoutPresetProps {
  layout_preset: string;  // REMOVE
  theme?: string;
  // ...
}
```

### After
```typescript
// File deleted — no longer needed
```

---

## Database Schema (Updated)

### weddings table

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| couple_name | text | NO | - | Display name |
| slug | text | NO | - | Unique URL identifier |
| theme | text | YES | NULL | Future use |
| ~layout_preset~ | ~~text~~ | ~~NO~~ | ~~'minimalist'~~ | **REMOVED** |
| ... | ... | ... | ... | Other columns unchanged |

---

## Validation Changes

### Zod Schemas

No Zod schema changes required — `layout_preset` was not validated at the schema level.

### Database Constraints Removed

```sql
-- This CHECK constraint is dropped
CONSTRAINT weddings_layout_preset_check 
  CHECK (layout_preset IN ANY (ARRAY['bento','minimalist','cinematic',...]))
```

---

## Code Removal Summary

### Server Actions (`src/app/actions/admin.ts`)

**Removed from select queries:**
```typescript
// BEFORE
.select('id, couple_name, slug, layout_preset, theme, ...')

// AFTER  
.select('id, couple_name, slug, theme, ...')
```

**Removed from return objects:**
```typescript
// BEFORE
return {
  id: wedding.id,
  layoutPreset: wedding.layout_preset,  // REMOVE
  theme: wedding.theme,
  // ...
}

// AFTER
return {
  id: wedding.id,
  theme: wedding.theme,
  // ...
}
```

**Removed function:**
```typescript
// DELETE ENTIRELY
export async function updateWeddingPreset(formData: FormData) {
  // ... (lines 636-669)
}
```

---

## Component Changes

### Files Deleted (21 total)

See `research.md` section R-002 for complete list.

### Files Modified (4 total)

| File | Change |
|------|--------|
| `src/app/actions/admin.ts` | Remove `layout_preset` references |
| `src/app/(public)/w/[slug]/page.tsx` | Remove preset logic |
| `src/app/(auth)/admin/weddings/[id]/page.tsx` | Remove `PresetSelector` |
| `src/lib/design-system/layout-preset-props.ts` | Delete file |

---

## Test Changes

### Tests to Delete (4 files)

| File | Reason |
|------|--------|
| `tests/unit/actions/admin-preset.test.ts` | Tests removed function |
| `tests/component/layout-presets/preset-rendering.test.tsx` | Tests deleted components |
| `tests/component/preset-selector.test.tsx` | Tests deleted component |
| `tests/unit/lib/design-system/preset-loader.test.ts` | Tests deleted module |

### Tests to Update

None — no tests assert on `layout_preset` values in remaining functionality.

---

## Migration Execution Order

1. Run code changes first (application won't break if column still exists)
2. Run migration to drop column
3. Verify application functions without `layout_preset`

**Rollback**: If needed, migration can be reversed by re-adding column with default value.

---

## Verification Checklist

- [ ] All `layout_preset` references removed from TypeScript code
- [ ] Migration runs successfully on local Supabase
- [ ] `npm run dev` starts without errors
- [ ] Admin wedding page loads without `PresetSelector`
- [ ] Public wedding page renders without preset wrapper
- [ ] No TypeScript compilation errors
