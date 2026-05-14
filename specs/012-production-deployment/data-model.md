# Data Model: Production Deployment

**Branch**: `012-production-deployment`  
**Date**: 2026-05-14

---

## Overview

This feature deploys existing database schema to production — **no new entities are introduced**. The production Supabase project MUST match the local development schema exactly.

---

## Existing Schema (Reference)

The following entities already exist in local migrations and will be applied to production:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Admin and couple accounts | `id`, `email`, `role`, `created_at` |
| `weddings` | Wedding metadata | `id`, `couple_name`, `slug`, `wedding_date`, `timezone`, `is_locked`, venue columns (`venue_name`, `venue_address`, `venue_lat`, `venue_lng`, `venue_welcome_message`), `template_image_url`, `template_focal_x`, `template_focal_y` |
| `rsvps` | Guest responses | `id`, `wedding_id`, `guest_name`, `status`, `dietary_requirements`, `baby_chair_required`, `table_number` |
| `floor_plans` | Canvas state | `wedding_id`, `items_json`, `canvas_width_ft`, `canvas_height_ft` |
| `seat_assignments` | Guest-to-chair assignments | `id`, `wedding_id`, `guest_name`, `item_id`, `created_at` |
| `storage_buckets` | Supabase Storage | `wedding-templates` bucket for template images |

**Migrations**: All 12 migrations in `supabase/migrations/` will be applied in order via `supabase db push`.

---

## Environment Configuration

Not a database entity, but critical for production operation:

| Variable | Type | Scope | Description |
|----------|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL | All envs | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Secret | All envs | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Production | Admin bypass key (never expose to client) |
| `SENTRY_DSN` | Secret | Production | Sentry error monitoring endpoint |
| `DATABASE_URL` | URL | Production | **Direct** connection string (port 5432 — pgbouncer NOT available on Free plan) |

**Validation Rules**:
- All URLs must be HTTPS in production
- Secrets must be stored in Vercel encrypted environment variables
- `DATABASE_URL` uses direct connection (Free plan limitation — 60 max connections)

---

## State Transitions

N/A — this is an infrastructure deployment feature with no stateful application logic.

---

## Data Integrity Constraints

| Constraint | Enforcement |
|------------|-------------|
| Unique `(wedding_id, LOWER(guest_name))` on `rsvps` | Database unique index |
| `venue_lat` + `venue_lng` both present or both null | CHECK constraint + Zod schema |
| Migrations run before deploy | GitHub Actions workflow |
| Secrets never in repository | `.env.example` with placeholders, code review |

---

## Notes

- **No new migrations** are created in this feature
- **No schema changes** — production must match local exactly
- **Connection pooling** via Supabase pgbouncer is required (Transaction mode)
