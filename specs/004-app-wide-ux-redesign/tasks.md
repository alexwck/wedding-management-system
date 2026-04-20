# Tasks: Floor Plan UX Redesign and App-Wide Design System

**Input**: Design documents from `/specs/004-app-wide-ux-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Constitution §I requires Red-Green TDD. Tests are included per the Test Verification principle.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared constants, glassmorphism tokens, and utility classes needed by multiple user stories.

- [x] T001 Add HIT_PADDING (8px) and ROTATION_SNAPS (0-345 in 15° increments) constants to `src/lib/floor-plan/constants.ts`
- [x] T002 [P] Add glassmorphism CSS custom properties to `:root` in `src/app/globals.css` (--glass-bg, --glass-bg-heavy, --glass-bg-light, --glass-border, --glass-shadow, --glass-blur, --radius-glass)
- [x] T003 [P] Add glassmorphism theme tokens to `@theme inline` block in `src/app/globals.css` (--color-glass-*, --blur-glass, --shadow-glass mapping to CSS vars)
- [x] T004 [P] Add `.glass-panel` and `.glass-panel-heavy` utility classes with `@supports (backdrop-filter)` fallback in `@layer utilities` in `src/app/globals.css`
- [x] T005 [P] Add blob keyframe animations (@keyframes blob, blob-reverse) and animation theme tokens (--animate-blob, --animate-blob-reverse) in `src/app/globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared components needed before user story implementation can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create `src/components/gradient-backdrop.tsx` — fixed-position gradient background (rose-50 → white → violet-50) with 3 semi-transparent blob circles using blur-3xl and blob animations; variant prop for "default" vs "landing" (no blobs)
- [x] T007 [P] Create `src/components/breadcrumbs.tsx` — parse `usePathname()` into breadcrumb trail with path-segment-to-label mapping (dashboard, admin, couples, weddings, floor-plan); render Links with `>` separators; glassmorphism styling via `.glass-panel`
- [x] T008 [P] Create `src/components/floor-plan/rotation-transformer.tsx` — Konva Transformer wrapper with `rotateEnabled={true}`, `resizeEnabled={false}`, `enabledAnchors={[]}`, `rotationSnaps` from constants, `rotationSnapTolerance={5}`, `rotateAnchorOffset={30}`, `onTransformEnd` callback to persist rotation angle; handles node attachment via `useEffect` watching `selectedItemId`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Clean Item Labels (Priority: P1) 🎯 MVP

**Goal**: Chair labels show only numbers; table labels show only "Table N" — no type prefixes.

**Independent Test**: Place a round table with 6 chairs. Verify labels: chairs show "1"-"6", table shows "Table N".

### Tests for User Story 1

> **Red phase**: Write tests FIRST, confirm they FAIL before implementation.

- [x] T009 [P] [US1] Unit test: verify `generateChairsForRoundTable` produces labels as numbers only ("1", "2", etc.) in `tests/unit/use-chair-generation.test.ts`
- [x] T010 [P] [US1] Unit test: verify `generateChairsForLongTable` produces labels as numbers only in `tests/unit/use-chair-generation.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Change chair label generation from `"Chair ${i + 1}"` to `"${i + 1}"` in `src/components/floor-plan/hooks/use-chair-generation.ts` — update both `generateChairsForRoundTable` and `addChairRow` (long table)
- [x] T012 [US1] Change table label generation from `"Round Table ${n}"` / `"Long Table ${n}"` to `"Table ${n}"` — find and update item creation logic in `src/components/floor-plan/hooks/use-floor-plan-state.ts` or wherever new items are created with default labels
- [x] T012a [US1] Add label truncation logic in `src/components/floor-plan/items/item-label.tsx` — truncate display text exceeding 15 characters with ellipsis (`…`), preserve full text for editing via double-click (EC-005)
- [x] T013 [US1] Green phase: run `npm run test` and confirm US1 tests now pass

**Checkpoint**: Labels are clean — chairs show numbers, tables show "Table N". Custom label editing still works via double-click.

---

## Phase 4: User Story 2 - Evenly Spaced Chairs Around Round Tables (Priority: P1)

**Goal**: All chairs around round tables are equidistant at equal angular intervals.

**Independent Test**: Place round tables of all sizes (3ft–7ft) with default and max chair counts. Verify visual symmetry — all chairs equidistant.

### Tests for User Story 2

- [x] T014 [P] [US2] Unit test: for each round table size (3ft–7ft) with default and max chairs, verify all angular distances between adjacent chairs are equal in `tests/unit/chair-spacing.test.ts`
- [x] T015 [P] [US2] Unit test: verify edge cases — 1 chair, 2 chairs, and max+1 (should clamp) produce valid positions in `tests/unit/chair-spacing.test.ts`

### Implementation for User Story 2

- [x] T016 [US2] Refactor `generateChairsForRoundTable` in `src/components/floor-plan/hooks/use-chair-generation.ts` — separate chair center-point calculation (`cx + cos(angle) * offset`, `cy + sin(angle) * offset`) from top-left offset (`- chairWidth/2`, `- chairHeight/2`); ensure the angular formula `(2π * i) / count - π/2` produces even spacing for all table sizes and counts
- [x] T017 [US2] Green phase: run `npm run test` and confirm US2 spacing tests pass

**Checkpoint**: All round tables have perfectly symmetrical chair arrangements at every valid count.

---

## Phase 5: User Story 3 - Precise Item Dragging (Priority: P1)

**Goal**: Clicking near an item grabs the item, not the canvas. Only truly empty space pans.

**Independent Test**: Place 3 items densely. Try dragging near each item's edge — item should move, not canvas. Click empty space — canvas pans.

### Tests for User Story 3

- [x] T018 [P] [US3] Unit test: verify hitFunc for Rect items expands hit region by HIT_PADDING px in `tests/unit/hit-area.test.ts`
- [x] T019 [P] [US3] Unit test: verify hitFunc for Circle items expands hit region by HIT_PADDING px in `tests/unit/hit-area.test.ts`

### Implementation for User Story 3

- [x] T020 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/round-table.tsx` — draw expanded circle in hitFunc context
- [x] T021 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/long-table.tsx` — draw expanded rect in hitFunc context
- [x] T022 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/stage-item.tsx`
- [x] T023 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/pillar-item.tsx`
- [x] T024 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/walkway-item.tsx`
- [x] T025 [P] [US3] Add `hitFunc` with 8px padding to `src/components/floor-plan/items/misc-item.tsx`
- [x] T026 [US3] Green phase: run `npm run test` and confirm US3 hit area tests pass

**Checkpoint**: Items are easy to grab — 8px invisible padding around each shape. Canvas only pans when clicking truly empty space.

---

## Phase 6: User Story 4 - Item Rotation (Priority: P2)

**Goal**: Selected items can be rotated via a handle. 15-degree snap + free rotation. Child chairs rotate with parent table.

**Independent Test**: Place a long table with chairs. Select it. Grab rotation handle. Rotate 90°. Verify table + chairs rotated. Verify collision detection works.

### Tests for User Story 4

- [x] T027 [P] [US4] Unit test: verify rotation persists to item state on transformEnd in `tests/unit/rotation-transformer.test.ts`
- [x] T028 [P] [US4] Unit test: verify rotation snap rounds to nearest 15° within tolerance in `tests/unit/rotation-transformer.test.ts`

### Implementation for User Story 4

- [x] T029 [US4] Add `RotationTransformer` to the items Layer in `src/components/floor-plan/floor-plan-canvas.tsx` — wire `selectedItemId` state to Transformer node attachment via `useEffect`; handle `onRotationEnd` to persist `rotation` to item state via `state.updateItem()`; push undo history entry on rotation commit
- [x] T030 [US4] Verify existing collision detection in `src/lib/floor-plan/collision.ts` correctly handles rotated items — test with manually rotated item data; explicitly test a long table rotated 45° near venue edge to verify out-of-bounds detection accounts for rotated bounding box (EC-002); fix if collision math doesn't account for rotation angle
- [x] T031 [US4] Green phase: run `npm run test` and confirm US4 rotation tests pass

**Checkpoint**: Any selected item can be rotated. Rotation handle appears above selected shape. Child chairs rotate with parent. Collision detection works with rotated items.

---

## Phase 7: User Story 5 - App-Wide Glassmorphism Design System (Priority: P2)

**Goal**: Every page uses consistent frosted-glass panels on a gradient backdrop — login, dashboard, admin, landing, RSVP, floor plan editor, error pages.

**Independent Test**: Navigate through every page. Verify all cards, panels, forms, and navigation show translucent frosted-glass effect with backdrop blur.

### Implementation for User Story 5

- [x] T032 [US5] Add `GradientBackdrop` to `src/app/layout.tsx` — render with `variant="default"` behind all content; verify it renders on all pages via dev server
- [ ] T032a [P] [US5] E2E test: verify `.glass-panel` class is present on login card, dashboard cards, admin cards, error page, floor plan toolbar, and RSVP form in `tests/e2e/glassmorphism.spec.ts`
- [ ] T032b [P] [US5] E2E test: verify gradient backdrop renders with blobs on authenticated pages, and `variant="landing"` renders gradient fallback on wedding landing page without background image (EC-007) in `tests/e2e/glassmorphism.spec.ts`
- [x] T033 [P] [US5] Apply `.glass-panel` to login card in `src/app/(public)/auth/login/page.tsx`
- [x] T034 [P] [US5] Apply `.glass-panel` to RSVP summary cards and containers in `src/app/(auth)/dashboard/page.tsx`
- [x] T035 [P] [US5] Apply `.glass-panel` to RSVP list table container in `src/app/(auth)/dashboard/rsvps/page.tsx`
- [x] T036 [P] [US5] Apply `.glass-panel` to admin dashboard cards in `src/app/(auth)/admin/page.tsx`
- [x] T037 [P] [US5] Apply `.glass-panel` to couples form + table containers in `src/app/(auth)/admin/couples/page.tsx`
- [x] T038 [P] [US5] Apply `.glass-panel` to weddings table container in `src/app/(auth)/admin/weddings/page.tsx`
- [x] T039 [P] [US5] Apply `.glass-panel` to wedding detail cards in `src/app/(auth)/admin/weddings/[id]/page.tsx`
- [x] T040 [P] [US5] Apply `.glass-panel` to error display in `src/app/error.tsx`
- [x] T041 [P] [US5] Apply `.glass-panel` to not-found display in `src/app/not-found.tsx`
- [x] T042 [P] [US5] Apply `.glass-panel` to RSVP button/overlay on wedding landing page in `src/components/landing-page.tsx` — use `GradientBackdrop` with `variant="landing"` so couple's background image replaces gradient; verify fallback to default gradient when no background image is set (EC-007)
- [x] T043 [P] [US5] Apply `.glass-panel` to RSVP form card in `src/components/rsvp-form.tsx`
- [x] T044 [P] [US5] Apply `.glass-panel` to floor plan toolbar in `src/components/floor-plan/floor-plan-toolbar.tsx`
- [x] T045 [P] [US5] Apply `.glass-panel` to floor plan item catalog sidebar in `src/components/floor-plan/item-catalog.tsx`
- [x] T046 [US5] Verify glassmorphism renders correctly on all pages via dev server — check login, dashboard, admin pages, landing page, RSVP form, floor plan editor, error pages; verify mobile responsiveness; check fallback on browsers without backdrop-filter support

**Checkpoint**: Every page in the application has consistent frosted-glass panels on a gradient backdrop. Mobile responsive. Graceful degradation.

---

## Phase 8: User Story 6 - App-Wide Intuitive Interaction Design (Priority: P3)

**Goal**: Full navigation redesign with icons, sections, breadcrumbs. Clear affordances, contextual feedback, and intuitive UX across all pages.

**Independent Test**: A new user can navigate to any page, understand where they are (breadcrumbs), find what they need (grouped nav with icons), and complete their task without guidance.

### Implementation for User Story 6

- [ ] T046a [P] [US6] E2E test: verify nav sidebar shows section headers ("Planning", "Management", "Overview") and each nav item has a lucide-react icon in `tests/e2e/navigation.spec.ts`
- [ ] T046b [P] [US6] E2E test: verify breadcrumbs render correct segments on admin pages (Admin > Weddings > [Name] > Floor Plan) and active nav item is highlighted in `tests/e2e/navigation.spec.ts`
- [x] T047 [US6] Redesign sidebar navigation in `src/components/nav.tsx` — add section grouping with headers ("Planning", "Management", "Overview"), add lucide-react icons (LayoutDashboard, Users, Grid, Heart, UserPlus) to each nav item, add glassmorphism styling via `.glass-panel`, add active-item highlighting based on current pathname; update mobile Sheet menu to match
- [x] T048 [US6] Add `Breadcrumbs` component to dashboard layout in `src/app/(auth)/dashboard/layout.tsx` (if exists) or to individual dashboard pages — render breadcrumb trail above page content
- [x] T049 [US6] Add `Breadcrumbs` component to admin layout or individual admin pages — render trail for all admin paths: Admin, Admin > Couples, Admin > Weddings, Admin > Weddings > [Wedding Name] (fetch name from data), Admin > Weddings > [Wedding Name] > Floor Plan
- [x] T050 [P] [US6] Add visual affordances to floor plan editor empty state in `src/components/floor-plan/floor-plan-canvas.tsx` — enhance the welcome message with a clear call-to-action pointing to the item catalog
- [x] T051 [P] [US6] Verify and enhance form validation feedback across login, RSVP, and admin forms — ensure inline error messages are visible and consistent with glassmorphism styling
- [x] T052 [P] [US6] Add consistent loading indicators to async operations — enumerate and verify: floor plan auto-save status, RSVP form submission, admin couple creation, wedding detail data loading; add inline spinners (small animated circle matching glassmorphism theme) where missing (FR-014)
- [x] T053 [US6] Verify all touch interactions work on mobile — test floor plan drag, rotation, zoom, nav hamburger menu, breadcrumbs, AND all form submissions (login, RSVP, admin couple creation) on mobile viewport

**Checkpoint**: Navigation is intuitive with icons and sections. Breadcrumbs show location. Forms give clear feedback. Mobile works. First-time users can complete tasks without guidance.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories.

- [x] T054 Run `npm run test` and verify all unit tests pass (US1–US4 tests)
- [ ] T055 Run `npm run test:e2e --workers=1` and verify all E2E tests pass across all projects (desktop + mobile) — per Constitution §I, E2E failures MUST be fixed, not deferred
- [x] T056 Run `npm run lint` and fix any lint errors
- [x] T057 Run `npm run build` and verify production build succeeds
- [ ] T058 [P] Verify glassmorphism performance and resilience — (1) check for frame drops during backdrop-blur rendering on mobile; reduce blur complexity for mobile breakpoints if needed; (2) verify floor plan labels remain readable at extreme zoom levels (0.25x and 4x) per FR-013; (3) verify `@supports` fallback renders solid backgrounds on browsers without backdrop-filter support per FR-016; (4) verify panels remain readable at 200% browser zoom (EC-008)
- [ ] T059 [P] Verify Konva canvas items with "refined colors" complement the glassmorphism panels (FR-008: HTML panels only, canvas items keep solid fills) — adjust fill/stroke colors if visual clash exists
- [ ] T060 Run quickstart.md validation — follow each step to verify development guide is accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1–US3 (Phases 3–5)**: Depend on Phase 2; can proceed in parallel (different files)
- **US4 (Phase 6)**: Depends on Phase 2 (RotationTransformer component)
- **US5 (Phase 7)**: Depends on Phase 1–2 (glassmorphism tokens + gradient backdrop)
- **US6 (Phase 8)**: Depends on US5 (glassmorphism must be applied before nav redesign)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Labels)**: Independent — after Phase 2
- **US2 (Chair Spacing)**: Depends on US1 — same file (`use-chair-generation.ts`)
- **US3 (Drag Fix)**: Independent — after Phase 2
- **US4 (Rotation)**: Independent — after Phase 2
- **US5 (Glassmorphism)**: Independent — after Phase 2
- **US6 (Intuitive UX)**: Depends on US5 (nav needs glassmorphism styling)

### Parallel Opportunities

**Phase 1**: T002, T003, T004, T005 can all run in parallel (all in globals.css but different sections)

**Phase 2**: T006, T007, T008 can all run in parallel (different files)

**After Phase 2**: US1, US3, US4, US5 can start in parallel; US2 must wait for US1 (same file):
- US1: T011, T012 (label format changes) — complete first
- US2: T016 (spacing math) — after US1 (same file: use-chair-generation.ts)
- US3: T020–T025 (hitFunc on 6 item files — all parallel)
- US4: T029 (Transformer wiring)
- US5: T033–T045 (glass on 13 page/component files — most parallel)

**US6**: Must wait for US5 completion

---

## Parallel Example: After Phase 2

```text
# Launch US1 + US2 + US3 + US4 + US5 in parallel (5 independent tracks):

Track US1: "Change chair label format in use-chair-generation.ts"
Track US2: "Fix chair spacing math in use-chair-generation.ts"
Track US3: "Add hitFunc to round-table.tsx, long-table.tsx, stage-item.tsx, pillar-item.tsx, walkway-item.tsx, misc-item.tsx"
Track US4: "Wire RotationTransformer in floor-plan-canvas.tsx"
Track US5: "Apply glass-panel to login, dashboard, admin, landing, RSVP, error pages"
```

Note: US1 and US2 both modify `use-chair-generation.ts` — they are NOT truly parallel. **US1 (T011) MUST complete before US2 (T016)** to avoid merge conflicts in the same file. If a single developer, combine T011 + T016 into one pass through the file.

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (constants, tokens)
2. Complete Phase 2: Foundational (components)
3. Complete Phases 3–5: US1 (labels) + US2 (spacing) + US3 (drag fix)
4. **STOP and VALIDATE**: Test all three P1 stories independently
5. Deploy/demo if ready — floor plan editor is now significantly improved

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 + US3 → Floor plan bugs fixed (MVP!)
3. Add US4 → Rotation capability
4. Add US5 → Glassmorphism across entire app
5. Add US6 → Navigation redesign + UX polish
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 both touch `use-chair-generation.ts` — coordinate or combine
- US3 touches 6 item files in parallel — no conflicts between them
- US5 touches 13 page/component files in parallel — no conflicts between them
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
