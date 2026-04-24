# Tasks: Dashboard UX Redesign & Bug Fixes

**Input**: Design documents from `/specs/008-dashboard-ux-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per constitution (Red-Green-Refactor): unit tests for logic modules, component tests for client components with 2+ visual states, E2E tests for each user story.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Phase 1: Setup (Migrations & Cleanup)

**Purpose**: Database changes and dead code removal — no UI dependencies

- [x] T001 Create migration `supabase/migrations/<timestamp>_add_timezone_focal_point.sql` adding `timezone TEXT DEFAULT 'Asia/Kuala_Lumpur'`, `template_focal_x DECIMAL(5,2)`, `template_focal_y DECIMAL(5,2)` columns to `public.weddings` with CHECK constraints per data-model.md
- [x] T002 Create migration `supabase/migrations/<timestamp>_drop_oauth_tokens.sql` to `DROP TABLE IF EXISTS public.oauth_tokens CASCADE`
- [x] T003 Add `timezone`, `templateFocalX`, `templateFocalY` fields to `weddingUpdateSchema` in `src/lib/validations/wedding.ts` per data-model.md
- [x] T004 [P] Add `template_focal_x: number | null`, `template_focal_y: number | null`, `timezone: string | null` to `WeddingRow` interface in `src/types/database.ts`
- [x] T005 [P] Delete `src/types/oauth.ts` entirely
- [x] T006 Update `supabase/seed.sql` to include `timezone = 'Asia/Kuala_Lumpur'` for all existing wedding records
- [x] T007 Run `supabase db reset` and verify migrations apply cleanly with no errors

---

## Phase 2: User Story 4 - Fix XLSX Export (Priority: P1)

**Goal**: XLSX downloads produce valid files that open in Excel and Google Sheets

**Independent Test**: Download XLSX from admin page → open in Excel → verify no errors, all data present

### Tests for User Story 4

- [x] T008 [US4] Write unit test for filename sanitization in `tests/unit/actions/export.test.ts`: test `&` → "and", parentheses removal, consecutive hyphens collapse, leading/trailing trim, empty name fallback to "wedding"

### Implementation for User Story 4

- [x] T009 [US4] In `src/app/actions/export.ts`: convert `workbook.xlsx.writeBuffer()` result to base64 string before returning; update return type to `{ success: true, data: string (base64), filename: string }`
- [x] T010 [US4] In `src/app/actions/export.ts`: implement filename sanitization function — `&` → "and", remove `()`, spaces → hyphens, collapse consecutive hyphens, trim leading/trailing hyphens, fallback to "wedding" if empty
- [x] T011 [US4] In `src/components/export-buttons.tsx`: convert base64 response to Blob with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and trigger download
- [x] T012 [US4] Run `npm run test` to verify filename sanitization tests pass (Green)

**Checkpoint**: XLSX downloads are valid. Download and open in Excel to verify.

---

## Phase 3: User Stories 6 & 7 - Floor Plan Bug Fixes (Priority: P2)

**Goal**: Item catalog stays in viewport on toggle; chair count controls appear on table selection

**Independent Test**: Open floor plan editor → collapse/expand catalog 20+ times → verify no overflow. Select a table → verify chair count controls visible.

### Tests for User Stories 6 & 7

- [x] T013 [P] [US6] Write unit test in `tests/unit/components/item-catalog.test.tsx` verifying catalog renders within constrained height after collapse/expand toggle
- [x] T014 [P] [US7] Write unit test in `tests/unit/components/floor-plan-canvas-chair-count.test.tsx` verifying chair count controls render when `selectedItem.type` is `round_table` or `long_table`

### Implementation for User Story 6 (Catalog Overflow)

- [x] T015 [US6] In `src/components/floor-plan/item-catalog.tsx`: add `h-[calc(100vh-40px)]` to the catalog container div (alongside existing `overflow-y-auto`) to constrain height to viewport minus top bar
- [x] T016 [US6] Verify catalog collapse/expand stays within viewport with internal scrolling when items exceed viewport height (FR-013). Run relevant floor plan E2E tests to confirm no regressions.

### Implementation for User Story 7 (Chair Count Editing)

- [x] T017 [US7] In `src/components/floor-plan/floor-plan-canvas.tsx`: debug why chair count controls don't appear on table selection. Root cause: stale Turbopack cache from earlier export.ts compilation error — no code bug found. Chair count logic is correct.
- [x] T018 [US7] No code fix needed — the chair count overlay code is correct (z-20, isTableType check, proper state management). The issue was a dev server compilation error preventing the page from rendering.
- [x] T019 [US7] Verify chair count controls appear for both round and long tables, and that chair positions around the table update correctly after increment/decrement (FR-015). Confirmed via Playwright: round table 7→8→7, long table 7 max 8.

**Checkpoint**: Floor plan catalog and chair editing work correctly. No regressions.

---

## Phase 4: User Story 1 - Set Wedding Date (Priority: P1)

**Goal**: Admin and couple can set/edit wedding date and time; landing page displays in configured timezone

**Independent Test**: Set wedding date on admin page → verify appears on landing page with correct timezone formatting

### Tests for User Story 1

- [x] T020 [P] [US1] Write unit tests in `tests/unit/validations/wedding.test.ts`: valid date strings, invalid dates, null, leap year Feb 29; timezone validation — valid IANA strings accepted, invalid rejected; focal point validation — 0-100 range, null, both-or-neither, edge values
- [x] T021 [P] [US1] Write unit tests in `tests/unit/actions/admin.test.ts` for `updateWeddingDate` and `updateWeddingTimezone` server actions — verify auth checks, validation, and DB update calls

### Implementation for User Story 1

- [x] T022 [US1] Create `src/components/wedding-date-picker.tsx` — client component with native `datetime-local` input styled with Tailwind using `.glass-panel` class per Constitution IX; accepts `weddingId`, `currentDate`, `timezone`, `isAdmin` props; shows timezone selector only when `isAdmin=true` — use a searchable input (e.g., `<input>` + `<datalist>` with IANA zones from `Intl.supportedValuesOf('timeZone')`) so users can type city/region name to filter; calls server action on change
- [x] T023 [US1] In `src/app/actions/admin.ts`: add `updateWeddingDate(weddingId, weddingDate)` server action — validates via Zod, converts datetime-local string to UTC TIMESTAMPTZ, atomic UPDATE on `weddings.wedding_date`
- [x] T024 [US1] In `src/app/actions/admin.ts`: add `updateWeddingTimezone(weddingId, timezone)` server action — admin-only (role check), validates IANA string, atomic UPDATE on `weddings.timezone`
- [x] T025 [US1] In `src/app/actions/admin.ts`: update `getWeddingRSVPs` to return `weddingDate`, `timezone`, `templateFocalX`, `templateFocalY` in the wedding data object
- [x] T026 [US1] In `src/app/(public)/w/[slug]/page.tsx`: update wedding date display to use `timezone` column for conversion, format as "Month Day, Year at HH:MM (UTC+offset)" — hide section when `wedding_date` is null
- [x] T027 [US1] Run `npm run test` to verify all new unit tests pass (Green)

**Checkpoint**: Wedding date can be set via admin/couple dashboards and displays correctly on landing page.

---

## Phase 5: User Story 5 - Remove Google Sheets Export (Priority: P2)

**Goal**: All Google Sheets code and database artifacts removed

**Independent Test**: Search codebase for "google", "oauth_tokens", "googleapis" — zero results. XLSX download still works.

### Implementation for User Story 5

- [x] T028 [US5] In `src/app/actions/export.ts`: remove functions `createOAuth2Client`, `getGoogleAuthUrl`, `handleGoogleCallback`, `getGoogleAuthStatus`, `exportToGoogleSheets`; remove `import { google } from "googleapis"`; keep only `getRsvpsWithAssignments` and `exportToXlsx`
- [x] T029 [US5] In `src/components/export-buttons.tsx`: remove Google Sheets button, `isGoogleExporting` state, `handleGoogleExport` function, Google auth check logic; keep only XLSX download button
- [x] T030 [US5] Run `npm uninstall googleapis` to remove the dependency
- [x] T031 [US5] Search codebase with `grep -r "google\|oauth_tokens\|googleapis" src/` to confirm zero remaining references (only google.com/maps URL in venue-section and next/font/google)
- [x] T032 [US5] Verify XLSX download still works after Google Sheets removal (manual test or existing E2E test)

**Checkpoint**: Google Sheets fully removed. XLSX export still functional.

---

## Phase 6: User Story 2 - Side-by-Side Dashboard Layout (Priority: P1)

**Goal**: Admin and couple pages use two-column layout (template left, event details right) on desktop, stacking on mobile

**Independent Test**: Load admin page at 1440px → verify two columns; resize to 1023px → verify vertical stack

### Implementation for User Story 2

- [ ] T033 [US2] In `src/app/(auth)/admin/weddings/[id]/page.tsx`: restructure to two-column grid layout using `lg:grid-cols-3` — left column (`lg:col-span-1`) contains `TemplateUpload` with `object-fit: contain` on preview; right column (`lg:col-span-2`) contains `WeddingDatePicker` → `VenueEditor` → RSVP summary cards → RSVP responses with export button. Right column order: date/timezone → venue → summary → responses.
- [ ] T034 [US2] In `src/app/(auth)/dashboard/page.tsx`: restructure to same two-column layout — left column contains template upload (add `TemplateUpload` component); right column contains `WeddingDatePicker` → `VenueEditor` → RSVP summary with "View All RSVPs" link. Right column order: date → venue → summary → link.
- [ ] T035 [US2] Verify layout at 1440px (two columns visible, no scrolling for up to 50 RSVPs), 1024px (breakpoint boundary — no overlap), and 768px (stacked vertically). Check both admin and couple pages.

**Checkpoint**: Both pages display side-by-side on desktop, stacked on mobile. Wedding date picker integrated.

---

## Phase 7: User Story 3 - Collapsible RSVP Responses Table (Priority: P2)

**Goal**: RSVP responses shown in sortable table with collapse/expand toggle, empty state, and scrolling for 200+ rows

**Independent Test**: View RSVP section → verify table with sort arrows → click collapse → verify header with count → click expand

### Tests for User Story 3

- [ ] T036 [P] [US3] Write component tests in `tests/unit/components/rsvp-section.test.tsx`: expanded by default, collapses on toggle, shows response count, empty state message when zero RSVPs
- [ ] T037 [P] [US3] Write component tests in `tests/unit/components/rsvp-table.test.tsx`: sort indicators visible on sortable columns, default sort is submitted date descending, clicking column header toggles ascending/descending, null values sort to end

### Implementation for User Story 3

- [ ] T038 [US3] In `src/components/rsvp-table.tsx`: add client-side sort state with `useState` — default sort by `createdAt` descending; add sort click handlers for guest name, status, submitted date, table name columns; add ascending/descending arrow indicators (`↑`/`↓`) on sortable column headers; null/empty values sort to end. Verify table columns match FR-007 exactly (guest name, status, dietary notes, vegetarian, baby chair, table name, seat, submitted date). Sorting performance should be under 200ms for datasets up to 500 rows (SC-007).
- [ ] T039 [US3] Create `src/components/rsvp-section.tsx` — client component wrapping RSVPTable with collapsible section header showing "RSVP Responses (count)" and chevron toggle; expanded by default; shows empty state "No RSVP responses yet" when `rsvps.length === 0`; applies max height with internal scroll for overflow; use `.glass-panel` class per Constitution IX
- [ ] T040 [US3] In `src/app/(auth)/admin/weddings/[id]/page.tsx`: replace inline RSVP response cards with `RSVPSection` component containing `RSVPTable`
- [ ] T041 [US3] In `src/app/(auth)/dashboard/rsvps/page.tsx`: wrap existing `RSVPTable` in `RSVPSection` for collapsibility
- [ ] T042 [US3] Run `npm run test` to verify RSVP section and table sorting tests pass (Green)

**Checkpoint**: RSVP table is sortable, collapsible, shows empty state, and scrolls for large datasets.

---

## Phase 8: User Story 8 - Template Preview & Focal Point (Priority: P2)

**Goal**: Full-size image preview with click-to-set focal point; landing page uses focal point for image positioning

**Independent Test**: Upload template → click preview → set focal point → verify landing page centers on that point

### Tests for User Story 8

- [ ] T043 [P] [US8] Write component tests in `tests/unit/components/template-preview.test.tsx`: dialog opens on click, crosshair appears on image click, existing focal point shown on reopen, close on Escape/backdrop click

### Implementation for User Story 8

- [ ] T044 [US8] Create `src/components/template-preview.tsx` — client component using shadcn/ui Dialog with `.glass-panel` styling per Constitution IX; shows uploaded image at full size; on click/tap calculates percentage coordinates and displays crosshair indicator; calls `updateTemplateFocalPoint` server action on click; loads existing focal point on open; closes on backdrop click, Escape key, or close button
- [ ] T045 [US8] In `src/app/actions/upload.ts`: update `uploadTemplateImage` to also set `template_focal_x = NULL, template_focal_y = NULL` when saving a new image (reset focal point on image replace)
- [ ] T046 [US8] In `src/app/actions/admin.ts`: add `updateTemplateFocalPoint(weddingId, focalX, focalY)` server action — validates both are 0-100 decimals via Zod, atomic UPDATE on `weddings.template_focal_x/y`
- [ ] T047 [US8] In `src/components/template-upload.tsx`: add "Preview" button that opens `TemplatePreview` dialog; show small focal point indicator dot on thumbnail if focal point is set
- [ ] T048 [US8] In `src/app/(public)/w/[slug]/page.tsx`: update template image rendering to use CSS `object-position: {focalX}% {focalY}%` when focal point is set, defaulting to `50% 50%` when null
- [ ] T049 [US8] Run `npm run test` to verify template preview component tests pass (Green)

**Checkpoint**: Template preview with focal point picker works. Landing page renders with correct positioning.

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: E2E tests, CLAUDE.md updates, and final verification

- [ ] T050 [P] Write E2E test for wedding date flow in `tests/e2e/wedding-date.spec.ts`: admin sets date/time → landing page shows date in timezone; admin changes timezone → landing page updates; couple dashboard shows date picker without timezone selector
- [ ] T051 [P] Write E2E test for dashboard layout in `tests/e2e/dashboard-layout.spec.ts`: admin page shows two columns at 1440px; stacks at 768px; couple dashboard same pattern
- [ ] T052 [P] Write E2E test for RSVP table sorting in `tests/e2e/rsvp-sorting.spec.ts`: default sort is newest first; click guest name header → alphabetical; click status → grouped; click table name → alphabetical; sort indicators visible
- [ ] T053 [P] Write E2E test for template focal point in `tests/e2e/template-focal-point.spec.ts`: upload image → open preview → set focal point → landing page centers on focal point; replace image → focal point resets
- [ ] T054 [P] Write E2E test for floor plan fixes in `tests/e2e/floor-plan-fixes.spec.ts`: catalog collapse/expand 20+ times stays in viewport; table selection shows chair controls for round and long tables
- [ ] T055 Run `npm run test` — all unit and component tests pass
- [ ] T056 Run `npm run test:e2e` — all E2E tests pass across desktop and mobile projects
- [ ] T057 Update `CLAUDE.md` Gotchas section with new learnings: datetime-local input for date picking, base64 buffer transfer for XLSX, `object-position` for focal point, `h-[calc(100vh-40px)]` for catalog constraint, UTC+offset display format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US4 (Phase 2)**: No dependencies on Phase 1 — can run in parallel with migrations
- **US6 & US7 (Phase 3)**: No dependencies on other phases — independent bug fixes
- **US1 (Phase 4)**: Depends on Phase 1 migrations (timezone column)
- **US5 (Phase 5)**: No dependencies — code removal only
- **US2 (Phase 6)**: Depends on US1 (WeddingDatePicker component must exist to place in layout)
- **US3 (Phase 7)**: Depends on US2 (RSVP section integrates into new layout)
- **US8 (Phase 8)**: Depends on Phase 1 migrations (focal point columns) and US2 (preview button in left column)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup) ──┬──→ US1 (Wedding Date) ──→ US2 (Layout) ──→ US3 (RSVP Table)
                   │                                    │
                   ├──→ US8 (Focal Point) ──────────────┘
                   │
Phase 2 (US4 XLSX) ──── independent
Phase 3 (US6+US7) ────── independent
Phase 5 (US5 Remove) ─── independent
```

### Parallel Opportunities

- Phase 1 + Phase 2 + Phase 3 + Phase 5 can all run simultaneously
- US6 and US7 within Phase 3 can run simultaneously (different files)
- Within US1: T020 and T021 (tests) can run in parallel
- Within US3: T036 and T037 (tests) can run in parallel
- All E2E tests in Phase 9 can run in parallel (different spec files)

---

## Parallel Example: Setup + Independent Bug Fixes

```bash
# These can all run simultaneously:
Task T001-T007: "Setup migrations and cleanup"
Task T008-T012: "Fix XLSX export"
Task T013-T019: "Fix floor plan bugs"
Task T028-T032: "Remove Google Sheets"
```

---

## Implementation Strategy

### MVP First (US4 + US1 + US2)

1. Complete Phase 1: Setup (migrations)
2. Complete Phase 2: US4 (XLSX fix — immediate trust restoration)
3. Complete Phase 4: US1 (Wedding date — foundational data)
4. Complete Phase 6: US2 (Dashboard layout — primary UX improvement)
5. **STOP and VALIDATE**: All P1 stories working. Deploy/demo if ready.

### Incremental Delivery

1. Setup + US4 → XLSX fixed, trust restored
2. Add US1 + US2 → Wedding date + new layout (MVP complete)
3. Add US6 + US7 → Floor plan bugs fixed
4. Add US5 → Google Sheets removed
5. Add US3 → Sortable collapsible RSVP table
6. Add US8 → Template preview with focal point
7. Polish → All E2E tests passing, CLAUDE.md updated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Constitution requires Red-Green-Refactor: write tests first, confirm they fail, then implement
- Run `supabase db reset` after Phase 1 to apply migrations
- Run `npm run test` after each story's implementation tasks
- Run `npm run test:e2e` only in Phase 9 (requires running dev server + Supabase)
- Commit after each completed task or logical group
- Existing E2E tests must continue passing — regression check at each checkpoint
