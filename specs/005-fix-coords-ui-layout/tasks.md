# Tasks: Coordinate System Fix and UI Layout Overhaul

**Input**: Design documents from `specs/005-fix-coords-ui-layout/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Constitution §I mandates BDD and TDD as non-negotiable for every feature. Test tasks included per constitution requirement.

**Organization**: Tasks grouped by user story (P1 → P2 → P3) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Clean up dev data and verify baseline

- [ ] T001 Clean up existing floor plan data (dev-only) by deleting saved floor plans in local Supabase so tests start with clean state

---

## Phase 2: Foundational

**Purpose**: No blocking prerequisites — coordinate fixes and UI changes are independent

No foundational tasks required. Existing project structure, types, and utilities are sufficient.

---

## Phase 3: User Story 1 - Chairs Circle Correctly Around Round Tables (Priority: P1) 🎯 MVP

**Goal**: Fix round table rendering so Circle renders at center of bounding box, and drag handlers convert center back to top-left for storage.

**Independent Test**: Place a 5ft round table → chairs circle table correctly → drag table → chairs stay centered → change chair count → new chairs at correct positions.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Red phase)**

- [ ] T002 [P] [US1] Write TDD unit test for center-to-top-left coordinate conversion (round table) — test that `(x + width/2) * FEET_TO_PIXELS` produces correct center, and `node.x() / FEET_TO_PIXELS - width/2` recovers top-left — in `tests/unit/floor-plan/coordinate-conversion.test.ts`
- [ ] T003 [P] [US1] Write BDD acceptance test for US1 scenarios: place round table → chairs centered within 2px; drag → chairs stay centered; change chair count → new chairs correct — in `tests/e2e/floor-plan-round-table.spec.ts`

### Implementation for User Story 1

- [ ] T004 [US1] Fix round table Circle rendering to compute center from top-left coordinates: change `pixelX = x * FEET_TO_PIXELS` to `centerX = (x + width / 2) * FEET_TO_PIXELS` (and same for Y) in `src/components/floor-plan/items/round-table.tsx`
- [ ] T005 [US1] Fix `handleDragEnd` in `src/components/floor-plan/floor-plan-canvas.tsx` to convert center pixels back to top-left feet for round tables: `newX = node.x() / FEET_TO_PIXELS - item.width / 2` when item type is `round_table`
- [ ] T006 [US1] Fix `handleDragMove` in `src/components/floor-plan/floor-plan-canvas.tsx` to use center coordinates for snap-back logic when item type is `round_table` — set `node.x()` and `node.y()` back to center pixel values, and convert child chair deltas using center-based math
- [ ] T007 [US1] Fix out-of-bounds indicator Rect for round tables in `src/components/floor-plan/floor-plan-canvas.tsx` to use the same center-to-top-left rendering as the actual round table Circle

**Checkpoint**: Run `npm run test` — unit tests pass (Green). Place round table → chairs circle correctly → drag → chairs follow → change chair count → new chairs correct. Long tables and other items unaffected.

---

## Phase 4: User Story 2 - Tables Rotate Around Their Center (Priority: P1)

**Goal**: Fix long table rendering to use Konva offset for center-based rotation, and update drag handlers accordingly.

**Independent Test**: Place long table → rotate 90° → table spins around center → chairs follow → drag rotated table → moves together. Repeat with round table.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Red phase)**

- [ ] T008 [P] [US2] Write TDD unit test for long table center+offset coordinate conversion — verify offset calculation and center-to-top-left recovery for long table type — in `tests/unit/floor-plan/coordinate-conversion.test.ts`
- [ ] T009 [P] [US2] Write BDD acceptance test for US2 scenarios: rotate long table 90° → spins within 2px of center; rotate round table → chairs follow; drag rotated table → moves together; change chair count on rotated table → correct positions — in `tests/e2e/floor-plan-rotation.spec.ts`

### Implementation for User Story 2

- [ ] T010 [US2] Fix long table Rect rendering to use center positioning with offset: set `x = (item.x + item.width / 2) * FEET_TO_PIXELS`, `offsetX = pixelWidth / 2`, `offsetY = pixelHeight / 2` in `src/components/floor-plan/items/long-table.tsx`
- [ ] T011 [US2] Fix `handleDragEnd` in `src/components/floor-plan/floor-plan-canvas.tsx` to convert center pixels back to top-left feet for long tables: `newX = node.x() / FEET_TO_PIXELS - item.width / 2` when item type is `long_table`
- [ ] T012 [US2] Fix `handleDragMove` in `src/components/floor-plan/floor-plan-canvas.tsx` to use center coordinates for snap-back logic when item type is `long_table` — same center-to-top-left conversion as round tables
- [ ] T013 [US2] Fix out-of-bounds indicator Rect for long tables in `src/components/floor-plan/floor-plan-canvas.tsx` to use the same center+offset rendering as the actual long table Rect

**Checkpoint**: Run `npm run test` — unit tests pass (Green). Place long table → rotate → spins around center → chairs follow → drag rotated table → moves together. Verify `handleRotationEnd` chair math (`tableCx = item.x + item.width / 2`) still produces correct center (no code change expected — just verify). Round table rotation still works from US1 fix. Both table types pass all US1+US2 acceptance scenarios.

---

## Phase 5: User Story 3 - Floor Plan Editor Uses Canvas Space Efficiently (Priority: P2)

**Goal**: Floor plan canvas fills all available space, item catalog is collapsible, toolbar floats as overlay, no horizontal scrollbar at 768px+.

**Independent Test**: Open floor plan editor → canvas fills viewport below breadcrumbs → collapse catalog → canvas expands → no horizontal scrollbar → toolbar floats.

### Implementation for User Story 3

- [ ] T014 [US3] Remove page heading and wrap floor plan editor in full-height container `h-[calc(100vh-3rem)]` in `src/app/(auth)/dashboard/floor-plan/page.tsx` and `src/app/(auth)/admin/weddings/[id]/floor-plan/page.tsx`
- [ ] T015 [US3] Add collapse/expand toggle to item catalog sidebar in `src/components/floor-plan/item-catalog.tsx` — when collapsed show narrow icon strip (`w-12`), when expanded show full catalog (`w-64`), state in component state
- [ ] T016 [US3] Move floor plan toolbar controls (zoom, undo/redo, dimensions) into absolute-positioned overlays on the canvas in `src/components/floor-plan/floor-plan-canvas.tsx` instead of consuming vertical space above
- [ ] T017 [US3] Ensure no horizontal scrollbar at 768px+ viewport in floor plan editor by constraining canvas and sidebar widths with overflow-hidden in `src/app/(auth)/dashboard/floor-plan/page.tsx`

**Checkpoint**: Floor plan editor fills viewport → catalog collapses/expands → toolbar floats → no horizontal scroll at 768px.

---

## Phase 6: User Story 4 - All Pages Have Balanced Content Density (Priority: P2)

**Goal**: Every page uses at least 60% of viewport for content (text, forms, tables, interactive elements) at 1280x800. Wider forms, compact errors, side-by-side layouts where appropriate.

**Independent Test**: Navigate every page → each uses ≥60% viewport content → no excessive whitespace.

### Implementation for User Story 4

- [ ] T018 [P] [US4] Widen login card from `max-w-sm` to `max-w-lg` (32rem) and reduce vertical centering whitespace in `src/app/(public)/auth/login/page.tsx`
- [ ] T019 [P] [US4] Widen RSVP form from `max-w-md` to `max-w-xl` (36rem to meet FR-012) in `src/components/rsvp-form.tsx`
- [ ] T020 [P] [US4] Make error page compact — change from `min-h-screen` centered to `min-h-[60vh]` with content in upper portion in `src/app/error.tsx`
- [ ] T021 [P] [US4] Make 404 page compact — change from `min-h-screen` centered to `min-h-[60vh]` with content in upper portion in `src/app/not-found.tsx`
- [ ] T022 [P] [US4] Change admin couples page to side-by-side layout with `grid grid-cols-1 lg:grid-cols-2 gap-6` for form and table on wide screens in `src/app/(auth)/admin/couples/page.tsx`
- [ ] T023 [P] [US4] Add max-width constraint `max-w-4xl mx-auto` and use compact sections with visual dividers (not tabs) instead of long vertical scroll in `src/app/(auth)/admin/weddings/[id]/page.tsx`
- [ ] T024 [P] [US4] Add max-width constraint `max-w-4xl mx-auto` to dashboard pages for readability on ultra-wide screens in `src/app/(auth)/dashboard/page.tsx` and `src/app/(auth)/dashboard/rsvps/page.tsx`
- [ ] T025 [P] [US4] Add max-width constraint `max-w-5xl mx-auto` to admin pages (dashboard, weddings) for readability on ultra-wide screens in `src/app/(auth)/admin/page.tsx` and `src/app/(auth)/admin/weddings/page.tsx`
- [ ] T026 [P] [US4] Adjust landing page component to reduce excessive whitespace — widen content containers to `max-w-3xl` and reduce section padding to fill viewport in `src/components/landing-page.tsx`

**Checkpoint**: Every page has ≥60% content density at 1280x800. Forms are wide enough (login ≥32rem, RSVP ≥36rem). Errors compact at 60vh. Admin couples side-by-side on wide screens. Admin wedding detail uses compact sections.

---

## Phase 7: User Story 5 - Visual Mockups Reviewed Before Implementation (Priority: P3)

**Goal**: Create HTML mockups for all pages rendered to screenshots for designer review. At least two layout options per page.

**Independent Test**: Open mockups folder → visual mockups exist for all 12+ pages → at least 2 options per page.

### Implementation for User Story 5

- [ ] T027 [US5] Create mockup HTML files for all pages (login, dashboard, RSVPs, floor plan, admin dashboard, admin couples, admin weddings, wedding detail, landing page, RSVP form, error, 404) with at least two layout options each in `specs/005-fix-coords-ui-layout/mockups/`
- [ ] T028 [US5] Render mockup HTML files to screenshots using Playwright and save as PNG files in `specs/005-fix-coords-ui-layout/mockups/screenshots/`

**Checkpoint**: Mockups folder contains visual screenshots of all pages with layout options for designer comparison.

---

## Phase 8: Edge Case Verification

**Purpose**: Verify edge cases from spec are handled correctly

- [ ] T029 Verify round table dragged near canvas edge does not produce NaN/Infinity in coordinate conversion, and chairs stay attached — test in `tests/unit/floor-plan/coordinate-conversion.test.ts`
- [ ] T030 Verify long table rotated 180° keeps chairs on correct sides (top/bottom) — manual verification in floor plan editor
- [ ] T031 Verify table rotated then dragged handles combined transform correctly (coordinate conversion) — test in `tests/unit/floor-plan/coordinate-conversion.test.ts`
- [ ] T032 Verify pages remain usable without horizontal scrolling at 320px viewport (all pages except floor plan editor) — test in E2E with mobile viewport

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and cleanup across all user stories

- [ ] T033 Run `npm run test` and verify all unit tests pass
- [ ] T034 Run `npm run test:e2e -- --workers=1` and verify all E2E tests pass across all projects (desktop + mobile) — per Constitution §I, E2E failures MUST be fixed, not deferred
- [ ] T035 Run `npm run lint` and fix any lint errors
- [ ] T036 Run `npm run build` and verify production build succeeds
- [ ] T037 Run quickstart.md validation — manually verify all 5 test scenarios from `specs/005-fix-coords-ui-layout/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: None required — skip
- **US1 (Phase 3)**: Depends on T001 (clean data) — can start after setup
- **US2 (Phase 4)**: Depends on US1 (Phase 3) completion — shares `floor-plan-canvas.tsx` drag handlers
- **US3 (Phase 5)**: Independent of US1/US2 — can start in parallel (different files mostly)
- **US4 (Phase 6)**: Independent of US1/US2/US3 — all page files are different
- **US5 (Phase 7)**: Independent — mockup creation can happen anytime
- **Edge Cases (Phase 8)**: Depends on US1+US2 completion
- **Polish (Phase 9)**: Depends on all user stories and edge cases being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — MVP
- **US2 (P1)**: Depends on US1 — both modify `floor-plan-canvas.tsx` drag handlers, US2 builds on US1's center-convention pattern
- **US3 (P2)**: Independent — only touches floor plan page and item-catalog
- **US4 (P2)**: Independent — only touches non-floor-plan pages
- **US5 (P3)**: Independent — mockup creation

### Within Each User Story

- Tests written FIRST and confirmed FAILING (Red phase)
- Rendering fix first (round-table or long-table component)
- Then drag handler fix (floor-plan-canvas.tsx)
- Then drag-move snap-back fix (floor-plan-canvas.tsx)
- Then OOB indicator fix (floor-plan-canvas.tsx)
- Run tests to confirm PASSING (Green phase)

### Parallel Opportunities

- US3 + US4 + US5 can all run in parallel after setup (different files)
- Within US4: T018–T026 are all marked [P] (different page files)
- Within US1: T002 and T003 can run in parallel (different test files)
- Within US2: T008 and T009 can run in parallel (different test files)
- US1 and US2 are sequential (same file: floor-plan-canvas.tsx)

---

## Parallel Example: Phase 6 (US4)

```text
# All US4 tasks can run in parallel (different page files):
T018 — login page
T019 — RSVP form
T020 — error page
T021 — 404 page
T022 — admin couples
T023 — admin wedding detail
T024 — dashboard pages
T025 — admin pages
T026 — landing page
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (clean dev data)
2. Write tests for US1 (T002, T003) — confirm they FAIL (Red)
3. Complete Phase 3: US1 implementation (T004–T007)
4. Run tests — confirm they PASS (Green)
5. **STOP and VALIDATE**: Place round table → chairs circle → drag → chairs follow
6. This fixes the most visible bug — deploy/demo if ready

### Incremental Delivery

1. Setup → US1 tests (Red) → US1 implementation (Green) → Test independently (MVP)
2. US2 tests (Red) → US2 implementation (Green) → Test independently (rotation fix)
3. US3 → Test independently (floor plan canvas space)
4. US4 → Test independently (all pages density)
5. US5 → Mockups for designer review (can happen anytime)
6. Edge cases → Verify boundary conditions
7. Polish → Full verification

---

## Notes

- [P] tasks = different files, no dependencies
- US1 and US2 are sequential because they both modify `floor-plan-canvas.tsx`
- US3, US4, US5 are all independent and can run in parallel
- Clean dev data before starting (T001)
- Constitution §I requires Red-Green TDD — tests written first, confirmed failing, then implementation makes them pass
- Constitution §I requires E2E tests pass with `--workers=1`
- No database migrations needed
- Commit after each task or logical group
