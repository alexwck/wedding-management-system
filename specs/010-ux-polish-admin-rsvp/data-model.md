# Data Model: Admin Lock, Floor Plan Polish & RSVP Redesign

**Date**: 2026-04-25 | **Feature**: 010-ux-polish-admin-rsvp

## Schema Changes

### Migration: `XXXXXXXX_add_wedding_lock.sql`

Add lock status to weddings table.

```sql
ALTER TABLE weddings
  ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN weddings.is_locked IS 'When true, all edits are frozen for all users including admin. Only the lock toggle itself may be changed.';
```

**Rationale**: Single boolean column. No lock reason, no lock timestamp, no locked-by tracking — the feature spec requires a simple on/off toggle for dev stage. These can be added later if needed.

**Existing columns unchanged**: `id`, `slug`, `user_id`, `couple_name`, `template_image_url`, `wedding_date`, `venue`, `venue_address`, `venue_lat`, `venue_lng`, `welcome_message`, `timezone`, `template_focal_x`, `template_focal_y`, `created_at`, `updated_at`.

### No other schema changes

- **Catalog availability**: Computed at runtime from existing items/canvas dimensions, not stored.
- **Save UX**: Status is client-side state, not persisted.
- **Undo/redo**: In-memory history, not persisted.
- **Template image cache-bust**: Stored as part of `template_image_url` (URL with query param), no new column.
- **Couple name editing**: Uses existing `weddings.couple_name` column, just adding a write path.

## Entity Relationships (unchanged)

```
users (1) ──< weddings (1) ──< rsvps
                          ├──< floor_plans (1)
                          └──< seat_assignments (via floor_plans)
```

The `is_locked` column on `weddings` gates mutations to:
- `weddings` row itself (venue, date, timezone, couple_name, template)
- `floor_plans` row (via lock check in `saveFloorPlan`)
- `rsvps` inserts (via lock check in `submitRSVP`)
- Storage uploads (via lock check in `uploadTemplateImage`)
- `seat_assignments` are mutated via floor plan save, so covered transitively

## Validation Rules

### Lock Toggle

- **Input**: `{ weddingId: string }`
- **Authorization**: Admin only (checked via `user.app_metadata?.role === "admin"`)
- **Behavior**: Flips `is_locked` to `!is_locked`
- **No lock check needed**: The toggle itself is the only mutation allowed on a locked wedding

### Couple Name Update

- **Input**: `{ weddingId: string, coupleName: string }`
- **Zod schema**: `z.string().min(1, "Couple name is required").max(100)`
- **Lock check**: Yes — cannot update when `is_locked = true`
- **Authorization**: Admin or couple owner (via `verifyWeddingAccess`)

### OOB Validation (floor plan save)

- **Not a schema change**: OOB check is application-level
- **Logic**: For each item in `items[]`, call `isItemOutOfBounds(item, width, height)`
- **Behavior**: Reject save with error listing count of OOB items if any are out of bounds
