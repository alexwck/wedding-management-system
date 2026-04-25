# Quickstart: Admin Lock, Floor Plan Polish & RSVP Redesign

**Feature**: 010-ux-polish-admin-rsvp | **Date**: 2026-04-25

## Prerequisites

```bash
# Reset database with migration + seed data
supabase db reset

# Start dev server
npm run dev
```

After reset, verify the new `is_locked` column exists:
```bash
supabase db query "SELECT is_locked FROM weddings LIMIT 1;"
```

## Key Files

### New files to create
- `src/lib/auth-guards.ts` — add `verifyWeddingNotLocked()` helper
- `src/components/lock-toggle.tsx` — admin lock/unlock toggle
- `src/components/editable-couple-name.tsx` — inline editable couple name
- `src/lib/floor-plan/placement.ts` — `canPlaceItem()` availability check

### Primary files to modify
- `src/app/actions/admin.ts` — add `toggleWeddingLock`, `updateCoupleName`, lock checks in 4 existing actions
- `src/app/actions/rsvp.ts` — lock check in `submitRSVP`
- `src/app/actions/floor-plan.ts` — lock check + OOB validation in `saveFloorPlan`
- `src/app/actions/upload.ts` — lock check + cache-bust URL in `uploadTemplateImage`
- `src/app/(public)/w/[slug]/page.tsx` — merge single-page (hero + venue + RSVP)
- `src/components/landing-page.tsx` — add RSVP section, fallback hero, remove RSVP link
- `src/components/floor-plan/item-catalog.tsx` — disable items when no space
- `src/components/floor-plan/hooks/use-auto-save.ts` — OOB-aware save, clearer status
- `src/components/template-preview.tsx` — rename to "Adjust Crop"

### Files to delete
- `src/app/(public)/w/[slug]/rsvp/` — entire directory (no backward compat)

## Implementation Order

1. **Migration** — `supabase/migrations/XXXXXXXX_add_wedding_lock.sql`
2. **Lock helper** — `verifyWeddingNotLocked()` in `auth-guards.ts`
3. **Lock checks in all mutation actions** — admin.ts, rsvp.ts, floor-plan.ts, upload.ts
4. **New server actions** — `toggleWeddingLock`, `updateCoupleName`
5. **Admin lock toggle UI** — lock-toggle.tsx + admin wedding page
6. **Couple dashboard lock UI** — read-only when locked
7. **Catalog availability check** — canPlaceItem() + item-catalog.tsx
8. **Save UX overhaul** — use-auto-save.ts + floor-plan-canvas.tsx
9. **RSVP single-page merge** — page.tsx + landing-page.tsx, delete rsvp/
10. **Editable couple name** — editable-couple-name.tsx + both dashboard pages
11. **Template image fix** — cache-bust in upload.ts
12. **Template preview rename** — button text change
13. **Undo/redo audit** — verify all actions, fix gaps

## Testing

```bash
# Unit tests (run frequently during implementation)
npm run test

# E2E tests (run after implementation, dev server + Supabase must be running)
npm run test:e2e

# Build check
npm run build
```

## Seed Data Notes

Existing seed data in `supabase/seed.sql` has `test-wedding-1` and `test-wedding-2`. Neither will have `is_locked` set (defaults to `false`), so all existing tests and E2E flows continue working unchanged.
