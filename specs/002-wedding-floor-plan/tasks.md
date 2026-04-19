# Tasks: Wedding Floor Plan Designer

**Input**: Design documents from `/specs/002-wedding-floor-plan/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Per constitution (Principle I), BDD acceptance tests and TDD unit tests are non-negotiable. Tests are written FIRST and MUST FAIL before implementation.

**Organization**: Tasks grouped by user story (P1–P5) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths included in each task

---

## Phase 1: Setup

**Purpose**: Install dependencies and create shared types/constants

- [X] T001 Install konva and react-konva dependencies via npm
- [X] T002 [P] Create TypeScript types for floor plan entities in `src/types/floor-plan.ts`
- [X] T003 [P] Create Zod validation schemas for floor plan data in `src/lib/validations/floor-plan.ts`
- [X] T004 [P] Create item catalog constants (table sizes, chair capacities, default dimensions) in `src/lib/floor-plan/constants.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, server actions, and core utility functions that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create database migration for `floor_plans` table (with JSONB items column, RLS policies, updated_at trigger) in `supabase/migrations/20260419000001_create_floor_plans.sql`
- [X] T006 [P] Create serializer utilities (state to/from DB format) in `src/lib/floor-plan/serializers.ts`
- [X] T007 Create server actions (`getFloorPlan`, `saveFloorPlan`) with auth checks and RLS-aware queries in `src/app/actions/floor-plan.ts`
- [X] T008 Create `use-floor-plan-state` hook (items array CRUD, dimension management, label incrementing) in `src/components/floor-plan/hooks/use-floor-plan-state.ts`
- [X] T009 Create `use-auto-save` hook (debounced save via server action) in `src/components/floor-plan/hooks/use-auto-save.ts`

**Checkpoint**: Foundation ready — database, server actions, and core hooks exist. User story implementation can begin.

---

## Phase 3: User Story 1 — Create and Configure a Floor Plan (P1) 🎯 MVP

**Goal**: Authenticated users can set venue width/height and see an empty canvas that persists

**Independent Test**: Navigate to floor plan page, enter dimensions, verify canvas renders and state persists on reload

### Tests for User Story 1 (RED — write first, must fail)

- [X] T010 [P] [US1] Write BDD/E2E test: couple can navigate to floor plan page, set dimensions, reload and verify persistence in `tests/e2e/floor-plan.spec.ts`

### Implementation for User Story 1

- [X] T011 [US1] Create couple floor plan page (loads floor plan, passes to canvas) in `src/app/(auth)/dashboard/floor-plan/page.tsx`
- [X] T012 [US1] Create admin floor plan page (loads floor plan by wedding ID) in `src/app/(auth)/admin/weddings/[id]/floor-plan/page.tsx`
- [X] T013 [US1] Create main canvas wrapper component (Konva Stage/Layer, dimension inputs, scale from feet-to-pixels) in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T014 [US1] Add dimension input controls (width/height fields) that resize the canvas and trigger auto-save in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T015 [US1] Add dimension change validation — flag items that fall outside new smaller bounds with visual warning in `src/components/floor-plan/hooks/use-floor-plan-state.ts`

**Checkpoint**: User Story 1 complete — canvas renders, dimensions are configurable and persisted. E2E test passes (GREEN).

---

## Phase 4: User Story 2 — Place and Arrange Items (P2)

**Goal**: Users can place items from a catalog, drag-drop, rotate, and see labels — with collision detection and boundary constraints

**Independent Test**: Select item from catalog, place on canvas, drag to reposition, rotate freely — verify collision detection prevents overlap (snap-back) and boundary constraints work

### Tests for User Story 2 (RED — write first, must fail)

- [X] T016 [P] [US2] Write unit tests for collision detection (SAT rotated rects, circle-circle, circle-rect, boundary constraint) in `tests/unit/floor-plan/collision.test.ts`
- [X] T017 [P] [US2] Write unit tests for serializer utilities (state to/from DB format) in `tests/unit/floor-plan/serializers.test.ts`

### Implementation for User Story 2

- [X] T018 [P] [US2] Create item catalog sidebar component (list of placeable items with size variants) in `src/components/floor-plan/item-catalog.tsx`
- [X] T019 [P] [US2] Create item label component (Konva Text with inline editing via double-click) in `src/components/floor-plan/items/item-label.tsx`
- [X] T020 [P] [US2] Create round table Konva shape (Circle + label) in `src/components/floor-plan/items/round-table.tsx`
- [X] T021 [P] [US2] Create long table Konva shape (Rect + label) in `src/components/floor-plan/items/long-table.tsx`
- [X] T022 [P] [US2] Create stage Konva shape (Rect + label, user-configurable dimensions) in `src/components/floor-plan/items/stage-item.tsx`
- [X] T023 [P] [US2] Create pillar Konva shape (Rect + label, user-configurable dimensions) in `src/components/floor-plan/items/pillar-item.tsx`
- [X] T024 [P] [US2] Create walkway Konva shape (Rect + label, user-configurable dimensions) in `src/components/floor-plan/items/walkway-item.tsx`
- [X] T025 [P] [US2] Create misc item Konva shape (Rect + label, user-configurable dimensions and custom type) in `src/components/floor-plan/items/misc-item.tsx`
- [X] T026 [US2] Create collision detection utility (SAT for rotated rectangles, circle-circle, circle-rect, plus item-boundary constraint per FR-016) in `src/lib/floor-plan/collision.ts`
- [X] T027 [US2] Create `use-collision-detection` hook (runs on drag move, prevents overlap by snapping back, enforces boundary constraint) in `src/components/floor-plan/hooks/use-collision-detection.ts`
- [X] T028 [US2] Integrate catalog → canvas: clicking catalog item adds it to canvas at default position with auto-incrementing label in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T029 [US2] Add drag-and-drop repositioning with collision snap-back and boundary enforcement in canvas items
- [X] T030 [US2] Add free rotation via Konva Transformer (drag rotate handle, any angle) with boundary constraint in canvas items
- [X] T031 [US2] Add inline label editing (double-click to edit, updates item label) via `item-label.tsx`
- [X] T032 [US2] Add dimension editing UI for stage/pillar/walkway/misc items (popover or sidebar with width/height inputs)
- [X] T033 [US2] Create `use-undo-redo` hook (history stack of last 20 state snapshots, undo/redo functions) in `src/components/floor-plan/hooks/use-undo-redo.ts`
- [X] T034 [US2] Integrate undo/redo into canvas actions (place, move, rotate, remove, resize, label edit push to history) in `src/components/floor-plan/floor-plan-canvas.tsx`

**Checkpoint**: User Story 2 complete — full item placement, movement, rotation, labeling, collision detection, and undo/redo working. Unit tests pass (GREEN).

---

## Phase 5: User Story 3 — Automatic Chair Population (P3)

**Goal**: Tables auto-generate chairs when placed; chairs move with tables; users can adjust chair count 0 to max+1

**Independent Test**: Place each table type, verify chairs appear at correct positions, adjust chair count, move table and verify chairs follow

### Tests for User Story 3 (RED — write first, must fail)

- [X] T035 [P] [US3] Write unit tests for chair generation (round table positioning, long table positioning, chair count ranges) in `tests/unit/floor-plan/chair-generation.test.ts`

### Implementation for User Story 3

- [X] T036 [US3] Create chair Konva shape (small Rect/Circle + label, linked to parent table) in `src/components/floor-plan/items/chair.tsx`
- [X] T037 [US3] Create `use-chair-generation` hook (generates chair items for round and long tables based on catalog capacities) in `src/components/floor-plan/hooks/use-chair-generation.ts`
- [X] T038 [US3] Integrate chair generation into table placement — when a table is added, chairs auto-generate at correct positions in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T039 [US3] Add group movement — dragging a table repositions all child chairs relative to table center in canvas drag handler
- [X] T040 [US3] Add group deletion — removing a table removes all child chairs
- [X] T041 [US3] Add chair count adjustment UI per table (input or +/- buttons, range 0 to max+1) with even redistribution of chairs
- [X] T042 [US3] Add dimension editing UI for chair items (width/height inputs, default 2ft x 2ft) in chair shape component or via dimension editing from T032

**Checkpoint**: User Story 3 complete — chairs auto-populate, follow tables, count is adjustable, and chair dimensions are configurable. Unit tests pass (GREEN).

---

## Phase 6: User Story 4 — Canvas Navigation and Zoom (P4)

**Goal**: Users can pan and zoom the canvas with mouse and touch gestures

**Independent Test**: Load a floor plan with items, scroll to zoom, drag empty space to pan, verify touch gestures work on mobile

- [X] T043 [P] [US4] Add Konva Stage zoom (wheel/pinch zoom centered on cursor) in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T044 [P] [US4] Add Konva Stage pan (drag on empty space) in `src/components/floor-plan/floor-plan-canvas.tsx`
- [X] T045 [US4] Create toolbar component with undo/redo buttons and zoom controls (zoom in, zoom out, fit to screen) in `src/components/floor-plan/floor-plan-toolbar.tsx`
- [X] T046 [US4] Add touch gesture support (pinch-to-zoom, two-finger pan) via Konva touch events in `src/components/floor-plan/floor-plan-canvas.tsx`

**Checkpoint**: User Story 4 complete — canvas is fully navigable with mouse and touch.

---

## Phase 7: User Story 5 — Access Control (P5)

**Goal**: Role-based access — couples see only their floor plan, admins see all, unauthenticated users are blocked

**Independent Test**: Log in as couple (see own plan only), admin (see all), and unauthenticated (redirected to login)

- [X] T047 [US5] Add floor plan link to couple dashboard nav in `src/components/nav.tsx` and `src/app/(auth)/dashboard/layout.tsx`
- [X] T048 [US5] Add floor plan link to admin wedding detail view (e.g., button on `/admin/weddings/[id]`) in `src/app/(auth)/admin/weddings/[id]/page.tsx`
- [X] T049 [US5] Verify existing auth proxy (`src/proxy.ts`) protects `/dashboard/floor-plan` and `/admin/weddings/*/floor-plan` routes — add if not covered
- [X] T050 [US5] Add RLS-validated server action checks: couple can only load/save their own wedding's floor plan in `src/app/actions/floor-plan.ts`

**Checkpoint**: User Story 5 complete — access control enforced at route and data level.

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Visual polish, edge cases, and end-to-end validation

- [X] T051 [P] Add empty state and loading state for floor plan page (no floor plan yet, loading indicator)
- [X] T052 [P] Add visual feedback for out-of-bounds items (red highlight when item exceeds floor plan boundary)
- [X] T053 Run `supabase db reset` and verify seed data includes a sample floor plan for testing in `supabase/seed.sql`
- [X] T054 Run quickstart.md validation — verify all routes load, items place and save, dimensions persist, auto-save recovers after page reload, and collision detection prevents overlaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 3 (needs canvas from US1)
- **Phase 5 (US3)**: Depends on Phase 4 (needs table items from US2)
- **Phase 6 (US4)**: Depends on Phase 3 (needs canvas, independent of US2/US3)
- **Phase 7 (US5)**: Depends on Phase 3 (needs pages, independent of US2/US3/US4)
- **Phase 8 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — foundation only
- **US2 (P2)**: Depends on US1 (canvas must exist to place items)
- **US3 (P3)**: Depends on US2 (needs table items to generate chairs)
- **US4 (P4)**: Depends on US1 only (pan/zoom works on any canvas content)
- **US5 (P5)**: Depends on US1 only (access control wraps existing pages)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Red-Green-Refactor per constitution)
- Models before services
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel
- **Phase 2**: T006 can run in parallel with T005
- **Phase 4 tests**: T016, T017 can run in parallel
- **Phase 4 shapes**: T018–T025 (all item components) can run in parallel
- **Phase 5**: T035 test can run in parallel with T036
- **Phase 6**: T043, T044 can run in parallel
- **Phase 7**: T047, T048 can run in parallel
- **Phase 8**: T051, T052 can run in parallel
- **US4 and US5**: Can run in parallel after US1 completes

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together (RED phase):
Task: "Write unit tests for collision detection in tests/unit/floor-plan/collision.test.ts"
Task: "Write unit tests for serializers in tests/unit/floor-plan/serializers.test.ts"

# Then launch all item shape components together (after tests written):
Task: "Create round table shape in src/components/floor-plan/items/round-table.tsx"
Task: "Create long table shape in src/components/floor-plan/items/long-table.tsx"
Task: "Create stage shape in src/components/floor-plan/items/stage-item.tsx"
Task: "Create pillar shape in src/components/floor-plan/items/pillar-item.tsx"
Task: "Create walkway shape in src/components/floor-plan/items/walkway-item.tsx"
Task: "Create misc item shape in src/components/floor-plan/items/misc-item.tsx"
Task: "Create item label in src/components/floor-plan/items/item-label.tsx"
Task: "Create item catalog in src/components/floor-plan/item-catalog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T009)
3. Write test for US1 (T010) — must FAIL
4. Complete Phase 3: User Story 1 implementation (T011–T015) — test passes GREEN
5. **STOP and VALIDATE**: Navigate to floor plan page, set dimensions, reload and verify persistence
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Canvas with dimensions (MVP!)
3. Add US2 → Full item placement with drag/rotate/collision/undo-redo
4. Add US3 → Chair auto-generation with adjustable count
5. Add US4 → Pan/zoom navigation
6. Add US5 → Access control
7. Add Polish → Visual polish, seed data, full validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Tests written FIRST per constitution Principle I (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
