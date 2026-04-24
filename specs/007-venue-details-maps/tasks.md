# Tasks: Venue Details with Embedded Maps

**Input**: Design documents from `/specs/007-venue-details-maps/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Per Constitution §I (Spec-Driven Development), TDD is mandatory. Unit tests written Red-Green. E2E tests cover each user story.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Database + Validation)

**Purpose**: Schema migration and validation layer — the data foundation for all user stories

- [ ] T001 Create migration adding venue columns to weddings table in `supabase/migrations/20260424000001_add_venue_columns.sql` — add `venue` (text), `venue_address` (text), `venue_lat` (double precision), `venue_lng` (double precision), `welcome_message` (text) with CHECK constraint for welcome_message <= 500 chars
- [ ] T002 [P] Write unit tests for wedding validation schema (Red) in `tests/unit/validations/wedding.test.ts` — test valid/invalid venue fields, coordinate pair integrity (lat+lng both present or both null), lat range -90/90, lng range -180/180, welcome_message max 500, venue max 200, venue_address max 500, clearing address clears coordinates
- [ ] T003 [P] Write unit tests for geocoding client (Red) in `tests/unit/lib/geocoding.test.ts` — test searchAddress returns formatted results, handles empty query (< 3 chars returns nothing), handles API error, handles timeout, handles no results, includes User-Agent header
- [ ] T004 Run `supabase db reset` to apply migration and verify seed data loads

---

## Phase 2: Foundational (Geocoding + Server Action)

**Purpose**: Core infrastructure that MUST complete before any user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create Zod validation schema in `src/lib/validations/wedding.ts` — make T002 pass. Export `weddingUpdateSchema` with venue, venue_address, venue_lat, venue_lng, welcome_message. Add `.refine()` for coordinate pair integrity.
- [ ] T006 Create geocoding client in `src/lib/geocoding.ts` — make T003 pass. Export `searchAddress(query: string)` function using Nominatim API with 1000ms debounce, 5000ms timeout, User-Agent header. Export `GeocodingResult` type with display_name, lat, lon.
- [ ] T007 Write unit tests for updateWeddingDetails server action (Red) in `tests/unit/actions/admin-wedding-update.test.ts` — test successful update with all fields, update with partial fields (venue name only), authorization check (admin vs couple vs unauthorized), coordinate pair validation, welcome_message length rejection
- [ ] T008 Add `updateWeddingDetails` server action to `src/app/actions/admin.ts` — make T007 pass. Validate input with weddingUpdateSchema. Verify user is admin or wedding owner (FR-016). Atomic update of all venue fields. Use adminClient. Return updated wedding data.

**Checkpoint**: Foundation ready — venue data can be written to/read from DB via validated server action

---

## Phase 3: User Story 1 — Admin Sets Venue Details (Priority: P1) 🎯 MVP

**Goal**: Admins and couples can set venue name, address (with autocomplete), and welcome message on the wedding detail page

**Independent Test**: Navigate to admin wedding detail page, fill venue fields using autocomplete, save, reload — all fields persisted

### Implementation for User Story 1

- [ ] T009 [US1] Create venue editor client component in `src/components/venue-editor.tsx` — react-hook-form with: venue name input (max 200), address search with Nominatim autocomplete dropdown (debounced via T006, min 3 chars, loading indicator per FR-018, "No results found" state, "Unable to search" error state, manual text entry fallback), welcome message textarea (max 500, char counter), save button calling updateWeddingDetails action. On save success show confirmation toast. Glass-panel styled.
- [ ] T010 [P] [US1] Integrate venue editor into admin wedding detail page in `src/app/(auth)/admin/weddings/[id]/page.tsx` — add "Venue Details" section with VenueEditor component, pass weddingId and current venue data as props. Fetch venue columns in existing Supabase query.
- [ ] T011 [P] [US1] Integrate venue editor into couple dashboard in `src/app/(auth)/dashboard/page.tsx` — add venue editor section for the couple's own wedding. Same component as admin (FR-004: couples edit same as admin). Fetch venue columns in existing Supabase query.

**Checkpoint**: Admin/couple can set all venue fields, autocomplete works, data persists on reload — US1 complete

---

## Phase 4: User Story 2 — Guest Sees Venue on Landing Page (Priority: P1)

**Goal**: Guests see couple name, wedding date, venue name, and welcome message in a glass-panel section on the landing page to drive RSVP clicks

**Independent Test**: Visit public wedding page with venue data — glass-panel shows venue info above RSVP button. Visit without venue data — page renders as today.

### Implementation for User Story 2

- [ ] T012 [US2] Update landing page server component to fetch venue columns in `src/app/(public)/w/[slug]/page.tsx` — extend Supabase select to include `venue, welcome_message, wedding_date`. Pass as new props to LandingPage component.
- [ ] T013 [US2] Add venue info glass-panel section to landing page component in `src/components/landing-page.tsx` — add optional props: venueName, weddingDate, welcomeMessage. When any prop present, render glass-panel section in bottom gradient area above RSVP button showing: couple name, formatted wedding date, venue name, welcome message (plain text per FR-019). Text wraps naturally. When no venue props, render exactly as today.

**Checkpoint**: Landing page shows venue info when data exists, hides gracefully when not — US2 complete

---

## Phase 5: User Story 3 — Guest Sees Venue Map on RSVP Form (Priority: P1)

**Goal**: Guests see venue address, embedded OSM map, navigation buttons, and welcome message above the RSVP form

**Independent Test**: Visit RSVP form for wedding with full venue data — map renders, nav buttons link correctly. Visit without venue data — form displays normally.

### Implementation for User Story 3

- [ ] T014 [US3] Create venue section server component in `src/components/venue-section.tsx` — accepts venueName, venueAddress, venueLat, venueLng, welcomeMessage props. When coordinates present: render OSM iframe embed (computed bbox ±0.005 around point, marker pin), "Open in Maps" button (Google Maps URL), "Navigate with Waze" button (Waze URL). When no coordinates but address present: render address text, hide map and buttons. Welcome message shown as plain text (FR-019). Navigation buttons: side-by-side desktop, stacked mobile (FR-008). Map: responsive width, min 200px height (FR-009). Glass-panel styled.
- [ ] T015 [US3] Update RSVP page to fetch venue data and render venue section in `src/app/(public)/w/[slug]/rsvp/page.tsx` — extend Supabase select to include `venue, venue_address, venue_lat, venue_lng, welcome_message`. Render VenueSection above RSVPForm when venue data exists.

**Checkpoint**: RSVP form page shows venue section with map when data exists — US3 complete

---

## Phase 6: User Story 4 — Address Autocomplete UX (Priority: P2)

**Goal**: Smooth autocomplete experience with debounced results and graceful error handling

**Independent Test**: Type partial address in venue editor, verify suggestions appear, can be selected, rate limiting respected

### Implementation for User Story 4

No separate implementation tasks — autocomplete UX is built into the venue editor component (T009). The autocomplete behavior (debounce, min 3 chars, loading indicator, error handling, manual entry fallback) is all part of T009.

**Checkpoint**: US4 acceptance criteria verified as part of US1 E2E testing — no standalone work needed

---

## Phase 7: E2E Testing & Polish

**Purpose**: End-to-end verification and cross-cutting quality checks

- [ ] T016 Write E2E tests for venue feature in `tests/e2e/venue-details.spec.ts` — cover all 4 user stories: (1) admin edits venue with autocomplete and saves, (2) guest sees venue info on landing page, (3) guest sees map + nav buttons on RSVP form, (4) autocomplete shows results after 3+ chars. Test partial data states (name only, name+address no coords). Test empty state (no venue data — sections hidden). Desktop + mobile Chrome projects.
- [ ] T017 Run `npm run test` and verify all unit tests pass (validation, geocoding, server action)
- [ ] T018 Run `npm run test:e2e --workers=1` and verify all E2E tests pass across all projects (desktop + mobile) — per Constitution §I, E2E failures MUST be fixed, not deferred
- [ ] T019 Run `npm run lint` and fix any lint errors
- [ ] T020 Run `npm run build` and verify production build succeeds
- [ ] T021 Update CLAUDE.md with venue feature gotchas and architecture notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — venue editor needs server action + geocoding client
- **US2 (Phase 4)**: Depends on Setup only (needs migration for venue columns in DB) — can start in parallel with Phase 2/3
- **US3 (Phase 5)**: Depends on Setup only — can start in parallel with Phase 2/3/4
- **US4 (Phase 6)**: No tasks — covered by US1
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. No dependency on other stories.
- **US2 (P1)**: Depends on Phase 1 only (migration). Independent of US1 — can be developed in parallel.
- **US3 (P1)**: Depends on Phase 1 only (migration). Independent of US1 — can be developed in parallel.
- **US4 (P2)**: No separate tasks — covered by US1's venue editor.

### Parallel Opportunities

```
Phase 1: T002 + T003 (different test files, parallel)
Phase 2: T005 + T006 (different source files, parallel after their respective tests)
         Then T007 → T008 (sequential — action depends on schema)
Phase 3: T010 + T011 (different page files, parallel after T009)
Phase 4: T012 → T013 (sequential — page fetch before component update)
Phase 5: T014 + T015 (can start together — component and page are different files)
```

### Maximum Parallelism

After Phase 1 completes:
- Stream A: Phase 2 → Phase 3 (US1: server action → venue editor → pages)
- Stream B: Phase 4 (US2: landing page — independent)
- Stream C: Phase 5 (US3: RSVP page — independent)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (admin/couple can set venue details)
4. **STOP and VALIDATE**: Run unit tests, manually test venue editor on admin page
5. At this point, venue data can be entered but not yet displayed publicly

### Full Feature Delivery

1. Setup + Foundational → foundation ready
2. US1 → admin/couple venue editing (MVP)
3. US2 → landing page venue display (conversion hook)
4. US3 → RSVP form map + nav (conversion closer)
5. Phase 7 → E2E tests, lint, build verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Per Constitution §I: write tests first (Red), implement to pass (Green), then refactor
- Per Constitution §VII: E2E tests must cover mobile Chrome
- Per Constitution §IX: venue sections use `.glass-panel` class
- Per Constitution §VI: server action must verify auth + role before mutation
- US4 is covered by US1 implementation — no standalone tasks needed
- Total: 21 tasks across 7 phases
