# Data Model: Dashboard UX Redesign & Bug Fixes

**Branch**: `008-dashboard-ux-fixes` | **Date**: 2026-04-25

## Entity Changes

### Wedding Entity (existing, modified)

**Table**: `public.weddings`

| Column | Type | Nullable | Default | Change |
|--------|------|----------|---------|--------|
| id | BIGINT | NO | auto | — |
| slug | TEXT | NO | — | — |
| user_id | UUID | NO | — | — |
| couple_name | TEXT | NO | — | — |
| template_image_url | TEXT | YES | — | — |
| wedding_date | TIMESTAMPTZ | YES | — | — (already exists, adding edit UI) |
| **timezone** | TEXT | YES | 'Asia/Kuala_Lumpur' | **NEW** — IANA timezone string (e.g. "Asia/Kuala_Lumpur"), admin-only editable |
| **template_focal_x** | DECIMAL(5,2) | YES | 50.00 | **NEW** — focal point X as percentage (0-100) |
| **template_focal_y** | DECIMAL(5,2) | YES | 50.00 | **NEW** — focal point Y as percentage (0-100) |
| venue | TEXT | YES | — | — |
| venue_address | TEXT | YES | — | — |
| venue_lat | DECIMAL(10,8) | YES | — | — |
| venue_lng | DECIMAL(11,8) | YES | — | — |
| welcome_message | TEXT | YES | — | — |
| created_at | TIMESTAMPTZ | NO | now() | — |
| updated_at | TIMESTAMPTZ | NO | now() | — |

**New Constraints**:
- `CHECK (template_focal_x IS NULL OR (template_focal_x >= 0 AND template_focal_x <= 100))`
- `CHECK (template_focal_y IS NULL OR (template_focal_y >= 0 AND template_focal_y <= 100))`
- Focal point pair integrity: both x and y must be present or both null (enforced at application level via Zod)
- Timezone defaults to `'Asia/Kuala_Lumpur'` if not set; validated as IANA timezone string at application level

### OAuth Tokens Entity (removed)

**Table**: `public.oauth_tokens` — **DROPPED**

## Validation Schema Changes

### weddingUpdateSchema (src/lib/validations/wedding.ts)

```typescript
// ADD to existing schema:
weddingDate: z.string().nullable().optional(),
timezone: z.string().optional(), // IANA timezone, admin-only
templateFocalX: z.number().min(0).max(100).nullable().optional(),
templateFocalY: z.number().min(0).max(100).nullable().optional(),
```

### WeddingDatePicker validation

```typescript
// New validation for the date picker:
weddingDateSchema: z.string()
  .nullable()
  .refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date format"),
```

## Type Definition Changes

### WeddingRow (src/types/database.ts)

```typescript
// ADD to existing WeddingRow interface:
template_focal_x: number | null;
template_focal_y: number | null;
timezone: string | null;
```

### Delete

- `src/types/oauth.ts` — OAuthToken interface (no longer needed)

## Migrations

### Migration 1: Add timezone and focal point columns

```sql
ALTER TABLE public.weddings
  ADD COLUMN timezone TEXT DEFAULT 'Asia/Kuala_Lumpur',
  ADD COLUMN template_focal_x DECIMAL(5,2),
  ADD COLUMN template_focal_y DECIMAL(5,2);

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_focal_x_range CHECK (template_focal_x IS NULL OR (template_focal_x >= 0 AND template_focal_x <= 100)),
  ADD CONSTRAINT weddings_focal_y_range CHECK (template_focal_y IS NULL OR (template_focal_y >= 0 AND template_focal_y <= 100));
```

**Rollback**: `ALTER TABLE public.weddings DROP COLUMN timezone, DROP COLUMN template_focal_x, DROP COLUMN template_focal_y;`

**Existing data impact**: Existing weddings with `wedding_date` set but no `timezone` will receive `'Asia/Kuala_Lumpur'` via the column default. No additional data migration needed.

### Migration 2: Drop oauth_tokens table

```sql
DROP TABLE IF EXISTS public.oauth_tokens CASCADE;
```

**Rollback**: Re-run the original `20260422000002_add_oauth_tokens.sql` migration.

**Deployment order**: This migration runs AFTER code deployment. The code removes all references to `oauth_tokens` first, so the application continues working during the migration window.

## Data Flow

### Wedding Date Update Flow

```
User selects date in WeddingDatePicker
  → Client validates via Zod (datetime-local string)
  → Server action: updateWeddingDate(weddingId, date)
    → Re-validate server-side
    → Store as UTC TIMESTAMPTZ
    → Return success/failure
  → Client shows success/error toast
  → Landing page reads wedding_date + timezone
    → Convert UTC to wedding's timezone for display
    → Format as "Month Day, Year at HH:MM (TZ abbreviation)"

Admin timezone change:
  → Admin selects timezone from dropdown on wedding detail page
  → Server action: updateWeddingTimezone(weddingId, timezone)
    → Validate timezone is valid IANA string
    → UPDATE weddings.timezone
  → All date displays update to use new timezone
```

### Focal Point Save Flow

```
User clicks on template preview image
  → Client calculates click position as % of image dimensions
  → Visual indicator shows selected focal point (crosshair)
  → Server action: updateTemplateFocalPoint(weddingId, x, y)
    → Validate x, y are 0-100 via Zod
    → Atomic UPDATE on weddings.template_focal_x/y
    → Return success/failure
  → Landing page reads focal point and sets CSS object-position
```

### Focal Point Reset on Image Replace

```
User uploads new template image
  → Server action: uploadTemplateImage(weddingId, file)
    → Save new image URL
    → SET template_focal_x = NULL, template_focal_y = NULL
    → (Resets focal point since old coordinates don't apply to new image)
  → Dashboard preview shows new image without focal point marker
  → Landing page renders with default center (50%, 50%)
```

### Seed Data Updates

Update `supabase/seed.sql` to include `timezone` values for existing wedding records:
- All existing weddings receive `timezone = 'Asia/Kuala_Lumpur'`
- Test wedding with venue data retains consistent timezone
