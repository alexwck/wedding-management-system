# Quickstart: Venue Details with Embedded Maps

**Feature**: 007-venue-details-maps | **Branch**: `007-venue-details-maps`

## Prerequisites

- Local Supabase running (`supabase start`)
- Dev server running (`npm run dev`)

## Setup

1. Apply migration: `supabase db reset` (re-runs all migrations including new venue columns)
2. Start dev server: `npm run dev`

## Key Files

### New Files
- `supabase/migrations/20260424000001_add_venue_columns.sql` — Add venue columns to weddings table
- `src/components/venue-editor.tsx` — Client component: venue name, address autocomplete, welcome message form
- `src/components/venue-section.tsx` — Public venue display: map embed, nav buttons, welcome message
- `src/lib/validations/wedding.ts` — Zod schema for wedding update validation
- `src/lib/geocoding.ts` — Nominatim API client (fetch, debounce, response types)

### Modified Files
- `src/app/(auth)/admin/weddings/[id]/page.tsx` — Add venue editor section
- `src/app/(auth)/dashboard/page.tsx` — Add venue editor section for couples
- `src/app/(public)/w/[slug]/page.tsx` — Pass venue data to landing page
- `src/app/(public)/w/[slug]/rsvp/page.tsx` — Pass venue data to RSVP form page
- `src/components/landing-page.tsx` — Add venue info overlay (name, date, welcome message)
- `src/components/rsvp-form.tsx` — Add venue details section above form
- `src/app/actions/admin.ts` — Add `updateWeddingDetails` server action

### Test Files
- `tests/unit/lib/geocoding.test.ts` — Nominatim client unit tests
- `tests/unit/validations/wedding.test.ts` — Zod schema validation tests
- `tests/unit/actions/admin-wedding-update.test.ts` — Server action tests
- `tests/e2e/venue-details.spec.ts` — E2E tests for all 4 user stories

## External Dependencies

- **Nominatim API**: Free, no API key, client-side fetch with User-Agent header
- **OpenStreetMap embed**: Free iframe embed, no API key

## Testing

```bash
# Unit tests
npm run test

# E2E tests (requires Supabase + dev server)
npm run test:e2e -- --workers=1
```
