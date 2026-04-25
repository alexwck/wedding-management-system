# Tasks: UX Polish & Bugfixes

**Input**: Design documents from `/specs/009-ux-polish-bugfixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per project constitution (Spec-Driven Development principle — TDD is non-negotiable).

**Organization**: Tasks grouped by user story, ordered by practical dependency (quickstart.md ordering).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Path Conventions

- Source: `src/` at repository root
- Unit tests: `tests/unit/`
- E2E tests: `tests/e2e/`
- Floor plan components: `src/components/floor-plan/`
- Validations: `src/lib/validations/`

---

## Phase 1: User Story 4 - Undo Bug Fix (Priority: P1)

**Goal**: Fix the undo double-step bug so each undo reverts exactly one state change

**Independent Test**: Add 3 items to the canvas, click undo once, verify exactly 1 item is removed (2 remain)

### Tests for User Story 4

- [x] T001 [US4] Write failing unit test assertions in `tests/unit/hooks/use-undo-redo.test.ts` verifying that a single undo after adding one item returns to the pre-add state (not two steps back)

### Implementation for User Story 4

- [x] T002 [US4] Fix duplicate `pushState` in `handleSelectItem` in `src/components/floor-plan/floor-plan-canvas.tsx` — remove the separate `pushHistory()` call before `state.addItem()` and ensure state is pushed atomically within `addItem` in `src/components/floor-plan/hooks/use-floor-plan-state.ts`

**Checkpoint**: Undo button reverts exactly one action. Add 3 items, undo once → 2 items remain.

---

## Phase 2: User Story 5 - Password Confirmation (Priority: P2)

**Goal**: Add confirm password field to couple account creation form with client-side validation

**Independent Test**: Fill couple creation form with mismatched passwords → form rejects with "Passwords do not match". Matching passwords → account created.

### Tests for User Story 5

- [x] T003 [US5] Write failing unit tests in `tests/unit/components/create-couple-form.test.tsx` for password mismatch error, empty confirm field error, and matching passwords success

### Implementation for User Story 5

- [x] T004 [P] [US5] Add `confirmPassword` field with `.refine()` match validation to `createCoupleSchema` in `src/lib/validations/admin.ts` — strip `confirmPassword` from the data before submitting to the server action
- [x] T005 [US5] Add confirm password input field to `src/components/create-couple-form.tsx` with `autoComplete="new-password"`, wire into react-hook-form, and display "Passwords do not match" error inline below the field

**Checkpoint**: Admin cannot submit couple creation form with mismatched passwords.

---

## Phase 3: User Story 1 - Template Image Crop & Reposition (Priority: P1)

**Goal**: Replace click-to-set focal point with drag-to-crop interaction. Preview frame matches landing page container exactly. Supports mouse and touch drag.

**Independent Test**: Upload a portrait photo (800x1200), drag to choose visible portion, save → landing page shows the same crop position.

### Tests for User Story 1

- [x] T006 [US1] Write failing component tests in `tests/unit/components/template-crop.test.tsx` for: portrait image drag (vertical only), landscape image drag (horizontal only), exact-match image (no drag needed), save triggers action, new image resets crop

### Implementation for User Story 1

- [x] T007 [US1] Refactor `src/components/template-preview.tsx` — replace click-to-set focal point handler with mouse and touch drag handler (touchstart/touchmove/touchend for mobile parity) that computes percentage offset (0–100) from drag delta, clamped to 0–100 bounds; save via existing `updateTemplateFocalPoint` action; handle browser resize during drag by preserving crop position relative to image; show error toast on save failure with retry option
- [x] T008 [US1] Update `src/components/landing-page.tsx` — change template image from `object-contain` to `object-cover` with `object-position: ${focalX}% ${focalY}%`; add graceful fallback when image is deleted from storage (ignore crop offset, show default no-image state)
- [x] T009 [US1] Add E2E test in `tests/e2e/template-crop.spec.ts` for the full flow: upload image → drag to crop position → save → verify landing page renders crop

**Checkpoint**: Template images can be repositioned via drag (mouse + touch), and the landing page shows the exact crop the user chose.

---

## Phase 4: User Story 2 - Floor Plan Guest Panel (Priority: P1)

**Goal**: Replace `unassigned-guests-panel.tsx` with `guest-panel.tsx` containing two collapsible sections (unassigned expanded by default, assigned collapsed). Assigned guests show "Name — Table N". Prerequisite for US3 (canvas stats).

**Independent Test**: Assign a guest → guest moves from unassigned to assigned section. Collapse/expand both sections. Unassigned starts expanded, assigned starts collapsed.

### Tests for User Story 2

- [x] T010 [US2] Write failing component tests in `tests/unit/components/floor-plan/guest-panel.test.tsx` for: default expand/collapse state, toggle behavior, guest moves on assign/unassign, loading state, empty states, table number display

### Implementation for User Story 2

- [x] T011 [US2] Create `src/components/floor-plan/guest-panel.tsx` with two collapsible sections using shadcn/ui `Collapsible` — unassigned section (expanded by default) and assigned section (collapsed by default), each with chevron toggle and guest count in header
- [x] T012 [US2] Add table number derivation logic: compute sequential table numbers from table-type items on canvas (first table = Table 1, etc.), map each assigned guest to their parent table's number — implement as a computed function in `src/components/floor-plan/guest-panel.tsx` (depends on T011)
- [x] T013 [US2] Update `src/components/floor-plan/floor-plan-canvas.tsx` to replace `UnassignedGuestsPanel` import with new `GuestPanel`, passing both `unassignedGuests` and `assignmentMap`/`items` props
- [x] T014 [US2] Add loading state to guest panel sections (spinner while fetching), independent scroll per section (`overflow-y-auto` with max-height), and "No guests yet" / "All guests are seated!" empty states
- [x] T015 [US2] Add keyboard accessibility (Enter/Space to toggle collapse) and ARIA attributes to collapsible section headers
- [x] T016 [US2] Handle guest-to-unassigned cascade: when a table item is deleted from the canvas, return all guests assigned to that table's chairs back to the unassigned section
- [x] T017 [US2] Add E2E test in `tests/e2e/guest-panel.spec.ts` for: load floor plan, verify unassigned expanded, assign guest, verify guest in assigned section with table number, delete table → verify guests return to unassigned

**Checkpoint**: Both assigned and unassigned guests visible in collapsible sections. Assignment changes update lists in real-time. Table deletion cascades guests back to unassigned.

---

## Phase 5: User Story 3 - Floor Plan Canvas Statistics (Priority: P2)

**Goal**: Add always-visible stats component pinned at top of guest panel showing table counts, chair counts, and assignment breakdown.

**Independent Test**: Place 2 round tables + 1 long table on canvas, assign 7 of 10 guests → stats show "2 Round Tables, 1 Long Table", "10 chairs", "7 assigned, 3 empty".

### Tests for User Story 3

- [ ] T018 [US3] Write failing component tests in `tests/unit/components/floor-plan/canvas-stats.test.tsx` for: mixed tables, all assigned with surplus chairs, empty canvas, stats update on item add/remove

### Implementation for User Story 3

- [ ] T019 [US3] Add `computeStats(items, assignmentMap)` function in `src/lib/floor-plan/stats.ts` that returns `{ roundTableCount, longTableCount, totalChairs, assignedChairs, emptyChairs }`
- [ ] T020 [US3] Create `src/components/floor-plan/canvas-stats.tsx` component — glass-panel styled, always visible, showing "Round Tables: N | Long Tables: N" and "Chairs: N total | N assigned | N empty", with zero-state for empty canvas
- [ ] T021 [US3] Integrate `canvas-stats.tsx` into `src/components/floor-plan/guest-panel.tsx` pinned at top of panel (above collapsible sections), passing computed stats as props

**Checkpoint**: Canvas statistics visible at top of guest panel, updating in real-time as items change.

---

## Phase 6: User Story 6 - Configurable Item Resize (Priority: P3)

**Goal**: Add resize handles for non-table items (Stage, Pillar, Walkway, Misc) on the canvas. Tables show no resize controls. Resize respects per-type min/max bounds and is undoable.

**Independent Test**: Select a Stage → drag resize handle → dimensions change. Select a round table → no resize handles visible.

### Tests for User Story 6

- [ ] T022 [US6] Write failing E2E test in `tests/e2e/item-resize.spec.ts` for: resize a Stage via dimension inputs, verify round table shows no resize handles, undo a resize, verify collision indicator on resize into another item

### Implementation for User Story 6

- [ ] T023 [P] [US6] Add per-item resize bounds (`minWidth`, `maxWidth`, `minHeight`, `maxHeight`) to `FLOOR_PLAN_ITEMS` entries in `src/lib/floor-plan/constants.ts` for Stage, Pillar, Walkway, and Misc types (per spec table in US6)
- [ ] T024 [US6] Modify `src/components/floor-plan/canvas-item.tsx` (or the Transformer wrapper) to conditionally enable resize handles via Konva `Transformer` only when item type is Stage, Pillar, Walkway, or Misc — round tables and long tables must not show resize anchors; Konva `Transformer` provides built-in touch support for resize handles (no separate `onTap`/`onClick` needed on individual handles)
- [ ] T025 [US6] Implement `transformend` handler in `src/components/floor-plan/canvas-item.tsx` that clamps new dimensions to per-type min/max bounds, converts pixel delta to feet using `FEET_TO_PIXELS`, updates item `width`/`height`, pushes pre-resize state to undo history, and snaps to venue boundary if dimensions exceed canvas limits

**Checkpoint**: Non-table items can be resized on the canvas. Tables are fixed. Resize is undoable and respects bounds.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and cleanup

- [ ] T026 Update `CLAUDE.md` with new components (guest-panel, canvas-stats), updated file paths, and new gotchas (crop offset semantics, table numbering rule, per-item resize bounds, guest cascade on table deletion)
- [ ] T027 Delete `src/components/floor-plan/unassigned-guests-panel.tsx` if fully replaced by `guest-panel.tsx` and no imports remain
- [ ] T028 Run full verification: `npm run build && npm run lint && npm run test && npm run test:e2e` — all pass across desktop and mobile projects

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US4)**: No dependencies — start immediately
- **Phase 2 (US5)**: No dependencies — can run parallel with Phase 1
- **Phase 3 (US1)**: No dependencies — can run parallel with Phase 1/2
- **Phase 4 (US2)**: No dependencies — can run parallel with Phase 1/2/3
- **Phase 5 (US3)**: Depends on Phase 4 (US2) — needs guest-panel.tsx to exist
- **Phase 6 (US6)**: No dependencies — can run parallel with Phase 1–4
- **Phase 7 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US4 (Undo Fix)**: Independent
- **US5 (Password Confirm)**: Independent
- **US1 (Template Crop)**: Independent
- **US2 (Guest Panel)**: Independent
- **US3 (Canvas Stats)**: Depends on US2 (guest panel must exist)
- **US6 (Item Resize)**: Independent

### Within Each User Story

- **Tests first (Red-Green-Refactor per constitution)**: Write test → confirm it fails → implement → confirm it passes
- Core logic before UI integration
- Commit after each task or logical group

### Parallel Opportunities

- **Phases 1, 2, 3, 4, 6** can all run in parallel (completely independent stories, different files)
- Within Phase 4: T011 must complete before T012 (T012 adds logic to the file T011 creates)
- Within Phase 6: T023 is independent of T024 (constants vs canvas-item)
- **Phase 5 must wait for Phase 4**

---

## Parallel Example: Maximum Concurrency

```text
# Phase 1+2+3+4+6 can all start simultaneously:
Developer A: Phase 1 (US4 Undo Fix) → then Phase 5 (US3 Stats)
Developer B: Phase 2 (US5 Password) → then Phase 7 (Polish)
Developer C: Phase 3 (US1 Template Crop)
Developer D: Phase 4 (US2 Guest Panel) → Phase 5 can start after US2 done
Developer E: Phase 6 (US6 Item Resize)
```

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Phase 1: Fix undo bug (broken interaction)
2. Phase 2: Add password confirmation (prevents account errors)
3. Phase 3: Template crop repositioning (high-visibility landing page improvement)
4. **STOP and VALIDATE**: All three P1/P2 stories work independently

### Incremental Delivery

1. Phases 1–3 → Core fixes and template improvement
2. Phase 4 → Guest panel with assigned guests (seating visibility)
3. Phase 5 → Canvas statistics (planning context)
4. Phase 6 → Item resize (flexibility enhancement)
5. Phase 7 → Polish and final verification

---

## Notes

- No database migrations needed — all features use existing columns or client-side computed state
- The undo bug is in `floor-plan-canvas.tsx` (caller), not in `use-undo-redo.ts` (hook)
- Template crop repurposes `template_focal_x`/`template_focal_y` columns — no schema change
- Guest panel refactor replaces `unassigned-guests-panel.tsx` with `guest-panel.tsx`
- All new UI surfaces use `.glass-panel` class per glassmorphism design system
- Konva Transformer provides built-in touch support for resize handles — no separate `onTap`/`onClick` handlers needed on individual resize anchors
- Stats computation lives in `src/lib/floor-plan/stats.ts` as a pure function (separate from hooks for clean separation)
- Deleting a table from the canvas must cascade assigned guests back to the unassigned section
