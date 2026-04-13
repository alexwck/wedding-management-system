# Data Model: RSVP Landing Page & Form

**Feature Branch**: `001-rsvp-landing-page`
**Date**: 2026-04-14
**Source**: spec.md, research.md

## Entities

### User (Supabase Auth)

Managed by Supabase Auth. Not a custom table, but referenced here for clarity.

- **id**: UUID (from `auth.users`)
- **email**: text (unique, not null)
- **role**: text — `"admin"` or `"couple"` (stored in `public.users` metadata)

### users (public profile table)

Extends `auth.users` with application-specific fields.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, references `auth.users(id)` ON DELETE CASCADE | Same as auth user ID |
| role | text | NOT NULL, CHECK `(role IN ('admin', 'couple'))` | User role |
| display_name | text | NOT NULL | Display name for UI |
| created_at | timestamptz | NOT NULL, DEFAULT `now()` | Account creation time |

**Indexes**: Primary key on `id`

**RLS Policy**:
- Users can read their own row: `USING ((select auth.uid()) = id)`
- Admin can read all rows (service role bypass)

### weddings

Core entity representing a couple's wedding event.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK, GENERATED ALWAYS AS IDENTITY | Internal ID |
| slug | text | UNIQUE, NOT NULL | Public URL identifier (nanoid, e.g. "xK9mP2") |
| user_id | UUID | NOT NULL, references `users(id)` ON DELETE CASCADE | Owning couple |
| couple_name | text | NOT NULL | Display name (e.g. "Alex & Sam") |
| template_image_url | text | NULLABLE | Supabase Storage URL for Canva template |
| wedding_date | timestamptz | NULLABLE | Wedding date (optional at creation) |
| created_at | timestamptz | NOT NULL, DEFAULT `now()` | Record creation |
| updated_at | timestamptz | NOT NULL, DEFAULT `now()` | Last modification |

**Indexes**:
- Primary key on `id`
- Unique index on `slug`
- Index on `user_id`

**RLS Policy**:
- Couple: `USING ((select auth.uid()) = user_id)` — can only see own wedding
- Admin: service role bypasses RLS
- Public: no direct access; landing page fetched server-side with service role

### rsvps

Guest RSVP responses tied to a wedding.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK, GENERATED ALWAYS AS IDENTITY | Internal ID |
| wedding_id | bigint | NOT NULL, references `weddings(id)` ON DELETE CASCADE | Which wedding |
| guest_name | text | NOT NULL | Guest's name |
| status | text | NOT NULL, CHECK `(status IN ('attending', 'declining'))` | RSVP status |
| dietary_notes | text | NULLABLE, CHECK `(length(dietary_notes) <= 500)` | Free text dietary info |
| is_vegetarian | boolean | NOT NULL, DEFAULT `false` | Vegetarian meal |
| needs_baby_chair | boolean | NOT NULL, DEFAULT `false` | Baby chair required |
| created_at | timestamptz | NOT NULL, DEFAULT `now()` | Submission time |

**Indexes**:
- Primary key on `id`
- Index on `wedding_id` (foreign key)
- Unique index `rsvps_wedding_guest_name_uniq` on `(wedding_id, LOWER(guest_name))` — prevents duplicate RSVPs per wedding

**RLS Policy**:
- Couple: can read RSVPs for their own wedding via `weddings.user_id` join
- Admin: service role bypasses RLS
- Public: INSERT only, scoped to the specific wedding slug (using anon key with policy)

## Relationships

```text
auth.users 1 ──── 1 users
users 1 ──── 1 weddings        (one couple owns one wedding)
weddings 1 ──── N rsvps        (one wedding has many RSVP responses)
```

## Migrations

All schema changes managed via Supabase migrations. Migration files stored in
`supabase/migrations/` with timestamp prefixes:

1. `001_create_users.sql` — users table + RLS
2. `001_create_weddings.sql` — weddings table + slug + RLS
3. `001_create_rsvps.sql` — rsvps table + unique constraint + RLS

## Seed Data

Development seeds should include:
- Admin user (admin@example.com)
- 2-3 couple users with weddings
- Sample RSVP responses per wedding
