# Data Model: Homepage Redesign for Mobile Conversion

**Feature**: specs/011-homepage-redesign | **Date**: 2026-04-26

## Entity: Wedding (Extended)

The existing `weddings` table is extended with theme and layout configuration.

### Fields Added

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `layout_preset` | `VARCHAR(50)` | No | `'bento'` | Active layout preset: `minimalist`, `bento`, `storytelling`, `magazine`, `card-stack`, `asymmetric`, `cinematic` |
| `theme_json` | `JSONB` | Yes | `NULL` | Per-wedding theme overrides. NULL = inherit global default. |

### Theme JSON Schema (Zod)

```typescript
const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glassBlurRadius: z.number().min(0).max(32).optional(),
  borderOpacity: z.number().min(0).max(1).optional(),
  borderRadius: z.string().optional(), // e.g. "16px"
  fontFamily: z.enum(['sans', 'serif']).optional(),
});

type ThemeConfiguration = z.infer<typeof ThemeSchema>;
```

### Global Default Theme (Code-Level)

```typescript
const DEFAULT_THEME: ThemeConfiguration = {
  primaryColor: '#E8D5C4',   // soft pastel warm beige
  accentColor: '#C4B5A0',    // earthy warm brown
  glassBlurRadius: 16,
  borderOpacity: 0.2,
  borderRadius: '16px',
  fontFamily: 'sans',
};
```

## Entity: Platform Settings (New Table)

Optional: if global theme customization is needed post-launch.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `key` | `VARCHAR(100)` | No | — | Setting key, e.g. `global_theme` |
| `value` | `JSONB` | No | — | Setting value |
| `updated_at` | `TIMESTAMPTZ` | No | `now()` | Last updated |

**Primary Key**: `id`  
**Unique Index**: `key`

## Entity: RSVP Token (New Table)

Maps short-lived browser cookies to RSVP records for the "Edit RSVP" feature.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `token` | `VARCHAR(64)` | No | — | Random URL-safe token |
| `rsvp_id` | `UUID` | No | — | FK → `rsvps.id` |
| `wedding_id` | `UUID` | No | — | FK → `weddings.id` |
| `expires_at` | `TIMESTAMPTZ` | No | — | Token expiration (default: 30 days) |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | Creation timestamp |

**Primary Key**: `id`  
**Unique Index**: `token`  
**Foreign Keys**: `rsvp_id` → `rsvps.id` (ON DELETE CASCADE), `wedding_id` → `weddings.id` (ON DELETE CASCADE)

### Row Level Security

- **Guest**: Can `SELECT` where `token` matches the cookie (via server action)
- **Admin**: Full access
- **Cleanup**: Cron job or trigger deletes expired tokens daily

## Entity: Bento Module (Conceptual)

Not stored in DB. Rendered at runtime based on layout preset and wedding data.

| Module Type | Description | Data Source |
|-------------|-------------|-------------|
| `hero` | Couple names, wedding date, template image/gradient | `weddings.couple_name`, `weddings.wedding_date`, `weddings.template_image_url`, `weddings.template_focal_x`, `weddings.template_focal_y` |
| `date-time` | Formatted date and time with timezone | `weddings.wedding_date`, `weddings.timezone` |
| `venue` | Venue name, address, map embed | `weddings.venue_name`, `weddings.venue_address`, `weddings.venue_lat`, `weddings.venue_lng` |
| `welcome-message` | Couple's welcome text | `weddings.welcome_message` |
| `rsvp-form` | RSVP form or confirmation card | `rsvps` table (for returning guests via token) |
| `quick-stats` | RSVP summary counts | Aggregated from `rsvps` table |

## State Transitions

### Theme Configuration

```
Global Default → Per-Wedding Override (admin edits)
Per-Wedding Override → Global Default (admin clears)
```

### RSVP Token Lifecycle

```
RSVP Submission → Token Generated → Cookie Set (browser)
                  ↓
            Guest Revisits → Cookie Sent → Token Validated → Confirmation Card Shown
                  ↓
            Token Expired → Standard RSVP Form Shown
```

## Validation Rules

- `layout_preset` must be one of the 7 allowed values (enforced at DB + application level)
- `theme_json` must match Zod `ThemeSchema` (validated before DB write)
- `token` must be cryptographically random (32+ bytes, base64url encoded)
- `expires_at` must be in the future (default: `now() + interval '30 days'`)

## Migration Order

1. `migrations/013_add_theme_to_weddings.sql` — Add `layout_preset` and `theme_json` to `weddings`
2. `migrations/014_create_rsvp_tokens.sql` — Create `rsvp_tokens` table
3. `migrations/015_create_platform_settings.sql` — Create `platform_settings` table (optional)

## Data Integrity

- `layout_preset` defaults to `'bento'` so existing weddings continue working
- `theme_json` NULL = inherit global default; no breaking change for existing rows
- `rsvp_tokens` uses ON DELETE CASCADE so RSVP deletion cleans up tokens automatically
- `token` column has unique index to prevent collisions
