# Tasks: Admin Lock, Floor Plan Polish & RSVP Redesign

**Input**: Design documents from `/specs/010-ux-polish-admin-rsvp/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Constitution Principle I mandates Red-Green TDD for every feature. Unit tests are written before implementation; E2E tests verify complete user flows after implementation. Test tasks included per plan.md testing strategy.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- File paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Database schema change for wedding lock

- [x] T001 Create migration `supabase/migrations/XXXXXXXX_add_wedding_lock.sql` adding `is_locked BOOLEAN NOT NULL DEFAULT false` to weddings table per data-model.md
- [x] T002 Run `supabase db reset` and verify `is_locked` column exists with default `false` per quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side lock enforcement infrastructure — MUST complete before ANY user story work begins

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `verifyWeddingNotLocked(weddingId)` helper to `src/lib/auth-guards.ts` returning `{ ok: true } | { ok: false, error: string }` per contracts/server-actions.md and research.md R2
- [x] T004 [P] Add lock check to `submitRSVP` (after wedding lookup ~L46) and `updateRsvpStatus` (~L102) in `src/app/actions/rsvp.ts` per contracts/server-actions.md
- [x] T005 [P] Add lock check (after access verification ~L85) and OOB validation with `isItemOutOfBounds` to `saveFloorPlan` in `src/app/actions/floor-plan.ts` per contracts/server-actions.md
- [x] T006 [P] Add lock check (~L33) and cache-bust `?t=${Date.now()}` to `uploadTemplateImage` in `src/app/actions/upload.ts` per contracts/server-actions.md and research.md R5
- [x] T007 Add lock checks to `updateWeddingDetails` (~L388), `updateWeddingDate` (~L452), `updateWeddingTimezone` (~L486), `updateTemplateFocalPoint` (~L524) in `src/app/actions/admin.ts` per contracts/server-actions.md
- [x] T008 Add `toggleWeddingLock(weddingId)` admin-only server action in `src/app/actions/admin.ts` — flips `is_locked`, the only mutation allowed on a locked wedding per contracts/server-actions.md
- [x] T009 Add `updateCoupleName(weddingId, coupleName)` server action in `src/app/actions/admin.ts` with Zod schema `z.string().min(1).max(100)` in `src/lib/validations/admin.ts` per contracts/server-actions.md and data-model.md
- [x] T010 [P] Unit test for `verifyWeddingNotLocked` in `tests/unit/lib/auth-guards.test.ts` — verify returns `{ ok: true }` for unlocked wedding and `{ ok: false, error }` for locked wedding

**Checkpoint**: All mutation server actions now enforce the lock. `toggleWeddingLock` and `updateCoupleName` are available. Auth guard tested. User story implementation can begin.

---

## Phase 3: User Story 1 — Admin Lock UI (Priority: P1)

**Goal**: Admin can lock/unlock weddings; locked weddings are read-only for couple, admin, and guests

**Independent Test**: Admin locks wedding via toggle → couple dashboard shows locked banner and disabled edits → guest sees "RSVP is closed" → admin unlocks → all editing restored

### Tests for User Story 1

> **Red phase**: Write these tests first, confirm they FAIL, then implement.

- [x] T011 [P] [US1] Unit tests for lock toggle and lock enforcement on mutation actions in `tests/unit/actions/admin-lock.test.ts` — verify toggleWeddingLock flips state, all guarded actions reject when locked, unlock restores access
- [x] T012 [P] [US1] Unit tests for RSVP submission blocked when locked in `tests/unit/actions/rsvp-lock.test.ts` — verify submitRSVP returns error when `is_locked=true`

### Implementation for User Story 1

- [x] T013 [US1] Create `LockToggle` component in `src/components/lock-toggle.tsx` — toggle button showing locked/unlocked state, calls `toggleWeddingLock`, includes ARIA attributes per FR-027
- [x] T014 [US1] Add `<LockToggle>` and lock-aware read-only state to admin wedding detail page in `src/app/(auth)/admin/weddings/[id]/page.tsx` — disable all edit forms when locked per FR-002
- [x] T015 [US1] Add lock banner and read-only mode to couple dashboard in `src/app/(auth)/dashboard/page.tsx` — show "Locked by admin" banner, disable date picker, venue editor, template upload per FR-002
- [x] T016 [P] [US1] Fetch and pass `isLocked` state to floor plan editor in `src/app/(auth)/admin/weddings/[id]/floor-plan/page.tsx`
- [x] T017 [P] [US1] Fetch and pass `isLocked` state to floor plan editor in `src/app/(auth)/dashboard/floor-plan/page.tsx`
- [x] T018 [US1] Add `enabled` prop to auto-save in `src/components/floor-plan/hooks/use-auto-save.ts` — set `enabled=false` when wedding is locked per FR-025
- [x] T019 [US1] Make floor plan canvas view-only when locked in `src/components/floor-plan/floor-plan-canvas.tsx` — disable drag, rotate, resize, catalog placement, chair count changes, guest assignments, canvas dimension edits, undo/redo controls per FR-025 and FR-026

### E2E Verification for User Story 1

- [x] T020 [US1] E2E test for admin lock/unlock flow in `tests/e2e/admin-lock.spec.ts` — admin locks wedding → couple can't edit → guest sees "RSVP is closed" → verify existing RSVP data preserved (FR-004) → admin unlocks → all editing restored

**Checkpoint**: Admin lock/unlock works end-to-end. Couple cannot edit when locked. Floor plan editor is view-only when locked. Data preserved through lock/unlock cycle.

---

## Phase 4: User Story 2 — Catalog Collision Blocking (Priority: P1)

**Goal**: Catalog items are disabled when no valid non-overlapping in-bounds position exists

**Independent Test**: Fill small canvas with tables until full → table catalog items grayed out → remove a table → items become clickable again

**Note**: T024 in this phase modifies `floor-plan-canvas.tsx`, which T019 (Phase 3) also modifies. Execute T019 before T024 to avoid file-level conflicts.

### Tests for User Story 2

> **Red phase**: Write these tests first, confirm they FAIL, then implement.

- [x] T021 [P] [US2] Unit tests for `canPlaceItem()` availability check in `tests/unit/lib/placement.test.ts` — verify returns true when space available, false when canvas full, correct per item type

### Implementation for User Story 2

- [x] T022 [US2] Create `canPlaceItem()` availability check in `src/lib/floor-plan/placement.ts` — runs existing spiral placement algorithm in dry-run mode, returns boolean per item type per research.md R3
- [x] T023 [US2] Update item catalog to consume availability map and disable unavailable items with tooltip "No space available" in `src/components/floor-plan/item-catalog.tsx` — add `opacity-50 pointer-events-none` styling and ARIA disabled state per FR-007 and FR-028
- [x] T024 [US2] Compute and pass availability map on every canvas state change in `src/components/floor-plan/floor-plan-canvas.tsx` — re-evaluate on item add/remove/move and canvas resize per FR-008

### E2E Verification for User Story 2

- [x] T025 [US2] E2E test for catalog disable when canvas full in `tests/e2e/floor-plan-catalog-disable.spec.ts` — fill canvas → items disabled → remove item → items re-enabled

**Checkpoint**: Catalog items are correctly disabled/enabled based on available canvas space.

---

## Phase 5: User Story 3 — Save UX with OOB Prevention (Priority: P1)

**Goal**: Clear save status labels; save blocked when items are out of bounds with actionable guidance

**Independent Test**: Drag item outside canvas → "N item(s) outside canvas" warning appears and save blocked → move item back → auto-save resumes

### Implementation for User Story 3

- [ ] T026 [US3] Implement 5-state save model (`unsaved`/`saving`/`saved`/`error`/`blocked`) in `src/components/floor-plan/hooks/use-auto-save.ts` — add OOB guard using `isItemOutOfBounds`, block save with item count when OOB per FR-009/FR-010/FR-011/FR-012 and research.md R4. Builds on `enabled` prop from T018 (lock-aware).
- [ ] T027 [US3] Update save status UI in `src/components/floor-plan/floor-plan-canvas.tsx` — replace ambiguous labels with clear states: "Unsaved changes" + save button, "Saving...", "All changes saved" + timestamp, "Save failed — try again", "N item(s) outside canvas" per FR-009 and research.md R4. Add ARIA live region for status announcements per FR-029

### E2E Verification for User Story 3

- [ ] T028 [US3] E2E test for OOB save blocking in `tests/e2e/floor-plan-save-oob.spec.ts` — drag item OOB → save blocked with message → move in bounds → save succeeds

**Checkpoint**: Save states are clear and unambiguous. OOB items block save with actionable message.

---

## Phase 6: User Story 4 — RSVP Single-Page Redesign (Priority: P1)

**Goal**: Wedding invitation is a single scrollable page (hero → venue → RSVP) with CTA hierarchy

**Independent Test**: Navigate to wedding URL → see hero with couple name + date → click RSVP CTA → smooth scroll to form → submit RSVP → inline success. No page transitions.

### Implementation for User Story 4

- [ ] T029 [US4] Merge hero + venue + RSVP sections into single page in `src/app/(public)/w/[slug]/page.tsx` — server component fetching all wedding data, rendering landing-page component + venue section + RSVP form, smooth scroll anchor `#rsvp` per research.md R6
- [ ] T030 [US4] Update landing page component in `src/components/landing-page.tsx` — add RSVP CTA button with smooth scroll to `#rsvp`, add gradient fallback hero for weddings without template image (use glassmorphism CSS variables per research.md R7), remove separate RSVP page link per FR-013/FR-014/FR-015
- [ ] T031 [US4] Update RSVP form for inline success state and `isLocked` prop in `src/components/rsvp-form.tsx` — show "RSVP is now closed" when locked per FR-003, show inline confirmation after submit per US4 scenario 4
- [ ] T032 [US4] Delete `src/app/(public)/w/[slug]/rsvp/` directory entirely per FR-016

### E2E Verification for User Story 4

- [ ] T033 [US4] E2E test for single-page RSVP experience in `tests/e2e/rsvp-single-page.spec.ts` — hero with couple name → smooth scroll to RSVP via CTA → submit RSVP → inline success. Fallback hero for no-image wedding. Locked wedding shows "RSVP is closed."

**Checkpoint**: Full single-page RSVP experience working. Fallback hero for no-image weddings. Locked weddings show "RSVP is closed."

---

## Phase 7: User Story 5 — Undo/Redo Completeness (Priority: P2)

**Goal**: All 10 canvas actions tracked correctly in undo history with exact state restoration

**Independent Test**: Place item, drag it, rotate it, change chair count, assign guest → undo each → verify exact state restoration at each step → redo all → verify final state

### Implementation for User Story 5

- [ ] T034 [US5] Audit all 10 canvas actions against `pushHistory()` calls in `src/components/floor-plan/floor-plan-canvas.tsx` and state restoration in `src/components/floor-plan/hooks/use-undo-redo.ts` — verify: catalog placement, delete, drag, rotate/resize, canvas dims, chair count, guest assign/unassign, label edit, dimension edit per research.md R8
- [ ] T035 [US5] Fix any undo/redo gaps found during audit — ensure one entry per gesture (not per intermediate state), full state restoration (items + dims + assignmentMap + unassignedGuests), 20-entry cap per FR-022/FR-023/FR-024

### E2E Verification for User Story 5

- [ ] T036 [US5] E2E test for undo/redo state restoration in `tests/e2e/undo-redo-audit.spec.ts` — place item, drag, rotate, change chair count → undo each step → verify exact state at each point → redo all → verify final state

**Checkpoint**: All canvas actions produce exactly one undo entry and restore complete state correctly.

---

## Phase 8: User Story 6 — Editable Couple Name (Priority: P3)

**Goal**: Couple name is editable inline above the date/time picker on both admin and couple pages

**Independent Test**: Edit couple name → save → verify updated name on public landing page

### Implementation for User Story 6

- [ ] T037 [US6] Create inline editable couple name component in `src/components/editable-couple-name.tsx` — click to edit, blur/Enter to save, Escape to cancel, calls `updateCoupleName`, read-only when locked per FR-017/FR-018
- [ ] T038 [P] [US6] Add `<EditableCoupleName>` above date/time picker in `src/app/(auth)/admin/weddings/[id]/page.tsx`
- [ ] T039 [P] [US6] Add `<EditableCoupleName>` above date/time picker in `src/app/(auth)/dashboard/page.tsx`

### E2E Verification for User Story 6

- [ ] T040 [US6] E2E test for editable couple name in `tests/e2e/editable-couple-name.spec.ts` — edit couple name → save → verify updated name on public landing page

**Checkpoint**: Couple name is editable on both admin and couple pages, reflected on public landing page.

---

## Phase 9: User Story 7 — Template Image Fix (Priority: P3)

**Goal**: Template preview always shows latest upload; button renamed to "Adjust Crop"

**Independent Test**: Upload image A → preview shows A → upload image B → preview immediately shows B

### Implementation for User Story 7

- [ ] T041 [P] [US7] Rename template preview button to "Adjust Crop" and dialog title to "Adjust Image Crop" in `src/components/template-preview.tsx` per FR-020a
- [ ] T042 [P] [US7] Refresh template preview after upload in `src/components/template-upload.tsx` — ensure component re-fetches `template_image_url` (now with cache-bust param from T006) per FR-019/FR-020

### E2E Verification for User Story 7

- [ ] T043 [US7] E2E test for template image refresh in `tests/e2e/template-image-refresh.spec.ts` — upload image A → preview shows A → upload image B → preview and landing page show B immediately

**Checkpoint**: Template preview always reflects latest upload. Button correctly labeled "Adjust Crop."

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Verify everything works together; update documentation

- [ ] T044 Run `npm run build` and fix any TypeScript errors
- [ ] T045 Run `npm run test` and fix any failing unit tests
- [ ] T046 Run `npm run test:e2e` (requires dev server + Supabase) and fix any failing E2E tests
- [ ] T047 Update `CLAUDE.md` with 010 feature changes: new `is_locked` column, lock toggle component, editable couple name, RSVP single-page, canPlaceItem availability check, 5-state save model

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 Lock UI)**: Depends on Phase 2
- **Phase 4 (US2 Catalog)**: Depends on Phase 2 + T019 in Phase 3 (both T024 and T019 modify `floor-plan-canvas.tsx`)
- **Phase 5 (US3 Save UX)**: Depends on Phase 2 + Phase 3 (lock-aware auto-save builds on T018)
- **Phase 6 (US4 RSVP Redesign)**: Depends on Phase 2 only (locked RSVP state is in server actions, not UI)
- **Phase 7 (US5 Undo/Redo)**: Depends on Phase 2 only (audits existing code)
- **Phase 8 (US6 Couple Name)**: Depends on Phase 2 + Phase 3 (read-only when locked builds on T015)
- **Phase 9 (US7 Template Fix)**: Depends on Phase 2 only (cache-bust is in T006)
- **Phase 10 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Migration)
    └── Phase 2 (Server Lock Infrastructure)
            ├── Phase 3 (US1: Lock UI) ──┬── Phase 4 (US2: Catalog)*
            │                            ├── Phase 5 (US3: Save UX)
            │                            └── Phase 8 (US6: Couple Name)
            ├── Phase 6 (US4: RSVP)     ← independent
            ├── Phase 7 (US5: Undo)     ← independent
            └── Phase 9 (US7: Template) ← independent
                    └── Phase 10 (Polish)

* Phase 4 depends on T019 completing first (same file: floor-plan-canvas.tsx)
```

### Within Each User Story

- Unit tests written first (Red phase) — confirm FAIL before implementation
- Components before page integration
- Server actions before UI that calls them
- Core logic before edge cases
- E2E tests after implementation (Green/verification phase)

### Parallel Opportunities

- T004, T005, T006, T010 (different files) — parallel in Phase 2
- T011, T012 (different test files) — parallel in Phase 3
- T016, T017 (different floor plan pages) — parallel in Phase 3
- T029, T030 can be parallel with T031 (different files: page vs form component)
- T038, T039 (different dashboard pages) — parallel in Phase 8
- T041, T042 (different template components) — parallel in Phase 9
- Phases 6, 7, 9 (US4, US5, US7) — all independent of each other after Phase 2

---

## Parallel Example: Phase 2 (Foundational)

```
Sequential: T003 (auth-guards.ts)
Then parallel: T004 + T005 + T006 + T010 (different files)
Then sequential: T007 + T008 + T009 (same file: admin.ts)
```

## Parallel Example: Post-Phase-3

```
After Phase 3 completes:
  Developer A: Phase 4 (US2: Catalog) → Phase 5 (US3: Save UX)
  Developer B: Phase 6 (US4: RSVP Redesign)
  Developer C: Phase 7 (US5: Undo/Redo) + Phase 9 (US7: Template Fix)
  Then: Phase 8 (US6: Couple Name)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1 + Phase 2 (Foundation + tests)
2. Complete Phase 3 (US1: Lock + tests)
3. Complete Phase 4 (US2: Catalog + tests)
4. Complete Phase 5 (US3: Save UX + tests)
5. **STOP and VALIDATE**: Run full test suite for lock + catalog + save
6. This delivers the core admin control and floor plan reliability

### Incremental Delivery

1. Setup + Foundational → Server-side lock infrastructure ready + auth guard tested
2. Add US1 → Lock/unlock works end-to-end + unit + E2E tests → Validate
3. Add US2 + US3 → Floor plan editor polished + tests → Validate
4. Add US4 → Single-page RSVP live + E2E test → Validate
5. Add US5 → Undo/redo verified + E2E test → Validate
6. Add US6 + US7 → Couple name editable, template fixed + E2E tests → Validate
7. Polish → Full feature complete with all tests green

---

## Notes

- [P] tasks touch different files with no shared dependencies
- [Story] labels map tasks to spec.md user stories for traceability
- T006 (cache-bust) and T042 (preview refresh) together solve US7 — server-side in Phase 2, client-side in Phase 9
- T034/T035 (undo audit) is verification-focused — may produce zero code changes if all actions are already correct per research.md R8
- Phase 6 (RSVP redesign) deletes the `/rsvp/` route — no backward compatibility per spec assumptions
- T019 (canvas view-only) is the largest single implementation task — it touches drag, rotate, resize, catalog, chair count, guest assignments, canvas dims, and undo/redo disabling
- T020 (admin-lock E2E) verifies FR-004 (data preservation through lock/unlock cycle) in addition to lock/unlock flow
- Constitution requires Red-Green TDD: write unit tests first (confirm fail), implement, confirm pass. E2E tests verify complete flows post-implementation.
