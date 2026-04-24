# Implementation Plan: Venue Details with Embedded Maps

**Branch**: `007-venue-details-maps` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-venue-details-maps/spec.md`

## Summary

Add venue name, address (with Nominatim geocoding autocomplete), and welcome message fields to weddings. Display emotional content (name, date, welcome message) on the landing page to drive RSVP clicks, and logistics content (address, embedded OSM map, navigation buttons, welcome message) on the RSVP form page to reduce form abandonment.

## Technical Context

**Language/Version**: TypeScript (strict mode) with Next.js 16 (App Router) + React 19
**Primary Dependencies**: react-hook-form, zod, Supabase JS, Tailwind CSS v4, shadcn/ui
**Storage**: Supabase PostgreSQL — new columns on existing `weddings` table
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile)
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <2s page load, autocomplete suggestions within 2s
**Constraints**: Free geocoding API only, free map embed only, no paid API keys
**Scale/Scope**: ~10 new files, 3 modified pages, 1 migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec written with 4 user stories, acceptance criteria, and edge cases |
| II. Type Safety | PASS | Zod validation for wedding update; end-to-end types from DB to UI |
| III. Component-First Architecture | PASS | New venue-editor (client), venue-section (server); RSC default preserved |
| IV. User Experience First | PASS | Inline validation, autocomplete with debounce, graceful empty/error states |
| V. Simplicity | PASS | Two decimal columns over point type; OSM iframe over Leaflet; no new deps |
| VI. Security by Default | PASS | Server action validates auth + role; Zod validates input; atomic update |
| VII. Mobile Parity | PASS | E2E tests cover mobile Chrome; venue sections responsive |
| VIII. Data Integrity | PASS | Zod validates lat/lng ranges; coordinate pair integrity enforced |
| IX. Glassmorphism Design System | PASS | Venue sections use .glass-panel on dark/image backgrounds |

No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-venue-details-maps/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: data model
├── quickstart.md        # Phase 1: setup guide
└── tasks.md             # Phase 2: implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
supabase/migrations/
└── 20260424000001_add_venue_columns.sql      # New migration

src/
├── app/
│   ├── actions/
│   │   └── admin.ts                           # Modified: add updateWeddingDetails
│   ├── (auth)/
│   │   ├── admin/weddings/[id]/page.tsx       # Modified: add venue editor section
│   │   └── dashboard/page.tsx                 # Modified: add venue editor section
│   └── (public)/
│       └── w/[slug]/
│           ├── page.tsx                       # Modified: fetch + pass venue data
│           └── rsvp/page.tsx                  # Modified: fetch + pass venue data
├── components/
│   ├── landing-page.tsx                       # Modified: add venue info overlay
│   ├── rsvp-form.tsx                          # Modified: add venue section above form
│   ├── venue-editor.tsx                       # New: admin/couple venue editing form
│   └── venue-section.tsx                      # New: public venue display with map
├── lib/
│   ├── geocoding.ts                           # New: Nominatim client
│   └── validations/
│       └── wedding.ts                         # New: Zod schema for wedding update

tests/
├── unit/
│   ├── lib/geocoding.test.ts                  # New: Nominatim client tests
│   ├── validations/wedding.test.ts            # New: Zod schema tests
│   └── actions/admin-wedding-update.test.ts   # New: server action tests
└── e2e/
    └── venue-details.spec.ts                  # New: E2E tests for all user stories
```

**Structure Decision**: Follows existing project conventions — new components in `src/components/`, new lib modules in `src/lib/`, validations in `src/lib/validations/`, migration in `supabase/migrations/`.

## Implementation Phases

### Phase 1: Database + Validation (foundation)

1. Create migration adding `venue`, `venue_address`, `venue_lat`, `venue_lng`, `welcome_message` columns to `weddings` table
2. Create Zod validation schema in `src/lib/validations/wedding.ts` with coordinate pair integrity check
3. Write unit tests for validation schema (Red)
4. Run migration: `supabase db reset`

### Phase 2: Geocoding Client + Autocomplete

1. Create `src/lib/geocoding.ts` — Nominatim fetch function with User-Agent header, response type, error handling
2. Write unit tests for geocoding client (Red)
3. Implement geocoding client (Green)

### Phase 3: Venue Editor Component (admin + couple)

1. Create `src/components/venue-editor.tsx` — client component with react-hook-form
   - Venue name input
   - Address autocomplete (uses geocoding client, debounced, min 3 chars)
   - Welcome message textarea (500 char max, with counter)
2. Add `updateWeddingDetails` server action to `src/app/actions/admin.ts`
3. Write server action unit tests (Red)
4. Integrate venue editor into admin wedding detail page
5. Integrate venue editor into couple dashboard

### Phase 4: Public Venue Display

1. Create `src/components/venue-section.tsx` — server component for RSVP form page
   - Venue name, address, welcome message
   - OSM iframe embed (computed bbox from lat/lng)
   - "Open in Maps" + "Navigate with Waze" buttons
2. Update `src/components/landing-page.tsx` — add venue info overlay (name, date, welcome message, no map)
3. Update public page server components to fetch venue columns
4. Wire props through to components

### Phase 5: Testing

1. Write E2E tests for User Story 1 (admin sets venue details)
2. Write E2E tests for User Story 2 (guest sees venue on landing page)
3. Write E2E tests for User Story 3 (guest sees map on RSVP form)
4. Write E2E tests for User Story 4 (autocomplete UX)
5. Run full suite: `npm run test && npm run test:e2e -- --workers=1`

## Complexity Tracking

No violations — no entries needed.
