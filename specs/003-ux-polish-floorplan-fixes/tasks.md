# Tasks: UX Polish & Floor Plan Fixes

**Input**: Design documents from `specs/003-ux-polish-floorplan-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Per Constitution §I (TDD), test tasks are included for each user story. Write tests FIRST, ensure they FAIL before implementation.

**Organization**: Tasks grouped by user story priority (P1 → P2 → P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Data Reset)

**Purpose**: Clear existing floor plan data to ensure consistency with new chair dimensions (FR-016)

- [x] T001 Reset all existing floor plan data in Supabase database — truncate `floor_plans` table via `supabase db` or admin server action in `src/app/actions/floor-plan.ts`
- [x] T002 [P] Update seed data in `supabase/seed.sql` — remove sample floor plan JSON for wedding 1 (no longer valid with new chair dimensions)

---

## Phase 2: Foundational (Chair Constants)

**Purpose**: Update chair defaults that multiple user stories depend on. MUST complete before US5 and US6.

**⚠️ CRITICAL**: US5 and US6 cannot begin until this phase is complete.

- [x] T003 Update `DEFAULT_CHAIR_SIZE` from `{ width: 2, height: 2 }` to `{ width: 1, height: 1 }` in `src/lib/floor-plan/constants.ts`
- [x] T004 Remove `"chair"` from `DIMENSION_EDITABLE_TYPES` array in `src/components/floor-plan/floor-plan-canvas.tsx`

**Checkpoint**: Chair defaults updated — US5 and US6 can now proceed

---

## Phase 3: User Story 7 — Null Error Fix (Priority: P1)

**Goal**: Fix the "Cannot read properties of null (reading 'id')" crash when adding items from the catalog to the floor plan

**Independent Test**: Open floor plan editor, click any catalog item, verify no crash and item appears on canvas

### Tests for User Story 7

> **Write these FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US7] Unit test: verify `handleSelectItem` does not crash when `addItem` returns null — test in `tests/unit/floor-plan/floor-plan-canvas.test.tsx`, mock `addItem` to return null, assert no error thrown and no selection made

### Implementation for User Story 7

- [x] T006 [US7] Add null guard in `handleSelectItem` callback in `src/components/floor-plan/floor-plan-canvas.tsx` — if `addItem` returns null, skip `setSelectedItemId` and return early

**Checkpoint**: Floor plan editor no longer crashes when adding items

---

## Phase 4: User Story 1 — Root Redirect (Priority: P1)

**Goal**: Unauthenticated users visiting "/" redirect to login; authenticated users redirect to their role-appropriate page

**Independent Test**: Navigate to "/" as each user type (unauthenticated, couple, admin) and verify correct redirect

> **Note**: Root redirect is implemented in both `page.tsx` (server component) and `proxy.ts` (middleware) for defense-in-depth — the middleware catches the request before rendering, and page.tsx handles it as a fallback.

### Tests for User Story 1

> **Write these FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] E2E test: verify root "/" redirects unauthenticated users to `/auth/login` — test in `tests/e2e/root-redirect.spec.ts`
- [x] T008 [P] [US1] E2E test: verify root "/" redirects couple users to `/dashboard` and admin users to `/admin` — test in `tests/e2e/root-redirect.spec.ts`

### Implementation for User Story 1

- [x] T009 [US1] Replace `src/app/page.tsx` with a server component that reads Supabase session from cookies and calls `redirect()` — unauthenticated → `/auth/login`, couple → `/dashboard`, admin → `/admin` (use `createServerClient` from `@supabase/ssr` + `cookies()` from `next/headers` + `redirect` from `next/navigation`)
- [x] T010 [P] [US1] Add root "/" redirect logic to `src/proxy.ts` — in the existing `proxy` function, add a check for `request.nextUrl.pathname === "/"` after the user check: if authenticated with admin role → redirect to `/admin`, if authenticated non-admin → redirect to `/dashboard`, if unauthenticated → redirect to `/auth/login`

**Checkpoint**: Root URL "/" correctly redirects for all user types

---

## Phase 5: User Story 2 — Logout (Priority: P1)

**Goal**: Any authenticated user can log out and be redirected to the login page

**Independent Test**: Log in, click logout in nav, verify session ends and user lands on login page

### Tests for User Story 2

> **Write these FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US2] E2E test: verify couple user can log out and is redirected to `/auth/login`, then cannot access `/dashboard` — test in `tests/e2e/logout.spec.ts`
- [x] T012 [P] [US2] E2E test: verify admin user can log out — test in `tests/e2e/logout.spec.ts`

### Implementation for User Story 2

- [x] T013 [US2] Create signOut server action in `src/app/actions/auth.ts` — create Supabase server client, call `supabase.auth.signOut()`, return `{ success: boolean }`. Handle missing session idempotently (return success even if no session).
- [x] T014 [US2] Add logout button to `src/components/nav.tsx` — create a client component (or client wrapper) that calls both client-side `supabase.auth.signOut()` and the server action, then redirects to `/auth/login`. Include both `onClick` and `onTap` handlers per Mobile Parity principle. Button should be visible for all authenticated users.

**Checkpoint**: Users can log out from any page via the nav

---

## Phase 6: User Story 3 — Admin Access Control (Priority: P2)

**Goal**: Admins blocked from "/dashboard" routes, couples blocked from "/admin" routes

**Independent Test**: Log in as admin, navigate to "/dashboard", verify redirect to "/admin". Log in as couple, navigate to "/admin", verify redirect to "/dashboard".

### Tests for User Story 3

> **Write these FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US3] E2E test: verify admin is redirected from `/dashboard` to `/admin`, and couple is redirected from `/admin` to `/dashboard` — test in `tests/e2e/access-control.spec.ts`

### Implementation for User Story 3

- [x] T016 [US3] Add role-based cross-route blocking to `src/proxy.ts` — after existing auth checks, add: if admin user hits `/dashboard` routes → redirect to `/admin`; if non-admin user hits `/admin` routes → redirect to `/dashboard`

**Checkpoint**: Cross-role access is fully blocked at the middleware level

---

## Phase 7: User Story 4 — File Upload Constraints (Priority: P2)

**Goal**: Upload limit is 5MB; only JPG and PNG accepted with clear error messages

**Independent Test**: Upload a 6MB file → rejected. Upload a GIF → rejected. Upload a 4MB JPG → accepted.

### Tests for User Story 4

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US4] Unit test: verify upload action rejects files >5MB and non-JPG/PNG formats — test in `tests/unit/actions/upload.test.ts`, test both file size and file type rejection with appropriate error messages
- [ ] T018 [P] [US4] E2E test: verify client-side upload validation shows error for oversized and wrong-format files — test in `tests/e2e/upload.spec.ts`

### Implementation for User Story 4

- [ ] T019 [US4] Update upload constraints in `src/app/actions/upload.ts` — change `MAX_FILE_SIZE` from `10 * 1024 * 1024` to `5 * 1024 * 1024`, change `ALLOWED_TYPES` from `["image/png", "image/jpeg", "image/jpg"]` to `["image/png", "image/jpeg"]`, update error message to say "5MB"
- [ ] T020 [P] [US4] Add client-side file validation in the upload form component — add `accept="image/png,image/jpeg"` attribute on the file input, add JS validation for file size (≤5MB) before submitting to server action, show user-friendly error messages matching server-side messages

**Checkpoint**: Upload constraints enforced on both client and server

---

## Phase 8: User Story 5 — Chair Rendering & Spacing (Priority: P2)

**Goal**: Chairs render as 1x1 ft circles with no overlap, and are not user-configurable

**Independent Test**: Place a table with max chairs, verify circles render with visible gaps between them, verify no dimension editor appears when selecting a chair

**Depends on**: Phase 2 (T003, T004)

### Tests for User Story 5

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US5] Unit test: verify chair spacing calculations produce >= 0.25 ft gap between adjacent chairs for round tables — test in `tests/unit/floor-plan/use-chair-generation.test.ts`
- [ ] T022 [P] [US5] Unit test: verify chair spacing calculations produce >= 0.25 ft gap for long tables — test in `tests/unit/floor-plan/use-chair-generation.test.ts`
- [ ] T023 [P] [US5] Unit test: verify chairs render with Circle geometry (radius = 0.5 * FEET_TO_PIXELS) — test in `tests/unit/floor-plan/chair.test.tsx`
- [ ] T024 [P] [US5] Unit test: verify chair type is excluded from DIMENSION_EDITABLE_TYPES — test in `tests/unit/floor-plan/floor-plan-canvas.test.tsx`

### Implementation for User Story 5

- [ ] T025 [US5] Convert Chair component from Rect to Circle in `src/components/floor-plan/items/chair.tsx` — replace `Rect` with `Circle` from react-konva, use center-anchor positioning: `x={(x + 0.5) * FEET_TO_PIXELS}`, `y={(y + 0.5) * FEET_TO_PIXELS}`, `radius={0.5 * FEET_TO_PIXELS}`, preserve `id`, `fill`, `stroke`, `strokeWidth`, `cornerRadius` removal, keep all event handlers
- [ ] T026 [US5] Fix round table chair spacing in `src/components/floor-plan/hooks/use-chair-generation.ts` `generateRoundTableChairs()` — increase offset to account for chair radius: `offset = radius + 0.75` to ensure 0.25ft gap between adjacent chairs
- [ ] T027 [P] [US5] Fix long table chair spacing in `src/components/floor-plan/hooks/use-chair-generation.ts` `generateLongTableChairs()` — change spacing to distribute chairs evenly with gap: position at slot centers `chairX = table.x + (table.width / halfCount) * (i + 0.5) - DEFAULT_CHAIR_SIZE.width / 2`, increase `chairOffset` from `0.5` to `0.75` to create gap between table edge and chair
- [ ] T028 [US5] Update out-of-bounds rendering for chair items in `src/components/floor-plan/floor-plan-canvas.tsx` — in the `renderCanvasItem` out-of-bounds indicator section, add a Circle variant for `item.type === "chair"` to match the new rendering (currently only has `Circle` for `round_table` and `Rect` for everything else)

**Checkpoint**: Chairs render as non-overlapping circles; dimension editor hidden for chairs

---

## Phase 9: User Story 6 — Long Table Max Chairs (Priority: P3)

**Goal**: Long table max chairs equals recommended count (not +1); round table max unchanged

**Independent Test**: Select a 6ft long table → max is 7 (not 8). Select a 5ft round table → max is still 8 (recommended 7 + 1).

**Depends on**: Phase 8 (US5 — same file `use-chair-generation.ts`)

### Tests for User Story 6

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T029 [P] [US6] Unit test: verify long table max chair count equals recommended count (6ft → max 7, 7ft → max 9), and round table max equals recommended + 1 — test in `tests/unit/floor-plan/use-chair-generation.test.ts`

### Implementation for User Story 6

- [ ] T030 [US6] Change `getMaxChairCount()` in `src/components/floor-plan/hooks/use-chair-generation.ts` — make the `+ 1` conditional: for `long_table` return `getMaxChairs(table.type, size)` directly (no +1), for `round_table` keep `getMaxChairs(table.type, size) + 1`

**Checkpoint**: Long table max equals recommended count; round table max preserved

---

## Phase 10: Polish & Cross-Cutting

**Purpose**: Final validation and cleanup across all user stories

- [ ] T031 [P] Run `npm run lint` and fix any lint errors introduced by changes
- [ ] T032 [P] Run `npm run build` and verify production build succeeds
- [ ] T033 [P] Update `src/app/page.tsx` reference in `CLAUDE.md` if root page behavior changed significantly
- [ ] T034 Manual smoke test: log in as couple → verify redirect to /dashboard, verify logout works, verify floor plan editor works with new chairs, verify upload rejects oversized files
- [ ] T035 Manual smoke test: log in as admin → verify redirect to /admin, verify /dashboard is blocked, verify logout works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: After Phase 1 — BLOCKS US5 and US6
- **US7 (Phase 3)**: No dependencies — can start immediately (standalone bug fix)
- **US1 (Phase 4)**: No dependencies — can start immediately
- **US2 (Phase 5)**: No dependencies on US1 — can start in parallel
- **US3 (Phase 6)**: Ideally after US1 and US2 (auth context) but technically independent
- **US4 (Phase 7)**: No dependencies — can start immediately
- **US5 (Phase 8)**: Depends on Phase 2 (T003, T004)
- **US6 (Phase 9)**: Depends on US5 (same file `use-chair-generation.ts`)
- **Polish (Phase 10)**: After all user stories complete

### Parallel Opportunities

```
Phase 1 (T001, T002) ─┐
                       ├─→ Phase 2 (T003, T004) ──→ US5 ──→ US6
                       │
Phase 3 (US7, T005-T006) ────┤
Phase 4 (US1, T007-T010) ────┤
Phase 5 (US2, T011-T014) ────┤──→ Phase 10 (Polish)
Phase 6 (US3, T015-T016) ────┤
Phase 7 (US4, T017-T020) ────┘
```

- US7, US1, US2, US3, US4 can all proceed in parallel (different files)
- US5 must wait for Phase 2
- US6 must wait for US5
- All test tasks within a user story should be written and failing before implementation tasks begin

### Suggested MVP Scope

**Minimum viable increment**: Phase 1 + Phase 2 + Phase 3 (US7 null fix) + Phase 8 (US5 chair rendering)
- Delivers the most user-visible floor plan fixes first
- The null crash fix and chair rendering are the highest-impact changes for the floor plan editor

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to spec user story for traceability
- US5 and US6 modify the same file (`use-chair-generation.ts`) — must be sequential
- Tests (T005, T007-T008, T011-T012, T015, T017-T018, T021-T024, T029) MUST fail before their paired implementation tasks
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
