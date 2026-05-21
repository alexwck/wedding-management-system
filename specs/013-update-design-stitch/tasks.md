# Tasks: Update Design Based on Stitch Redesign

**Input**: Design documents from `/specs/013-update-design-stitch/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md  
**Tests**: E2E tests REQUIRED per constitution (all 5 user stories must have E2E coverage)  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify project structure matches plan.md (Next.js 16 App Router, src/app organization)
- [X] T002 [P] Install lucide-react if not already present (`npm install lucide-react`)
- [X] T003 [P] Verify DESIGN.md exists at project root and passes lint (`npx @google/design.md lint DESIGN.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Update `globals.css` to export CSS variables matching DESIGN.md token names (--glass-surface, --shadow-outer, --hover-transform, --active-transform, --duration-standard, --easing)
- [X] T005 [P] Add motion tokens to `globals.css` (@theme block: --hover-transform: translateY(-2px), --active-transform: scale(0.98), --duration-standard: 300ms, --easing: cubic-bezier(0.4, 0, 0.2, 1))
- [X] T006 [P] Create database migration to drop layout_preset column: `supabase/migrations/20260517000000_drop_layout_preset_column.sql`
- [X] T007 Run migration locally (`supabase db push`) and verify weddings table no longer has layout_preset column

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Consistent Glassmorphic Layout (Priority: P1) 🎯 MVP

**Goal**: Apply DESIGN.md glassmorphic tokens consistently across all 5 pages (login, admin dashboard, weddings table, floor plan editor, RSVP experience)

**Independent Test**: Verify each page renders with consistent glass panels (backdrop blur 16px, rgba(255,255,255,0.25) light mode, dual-shadow depth) and motion (translateY(-2px) hover, scale(0.98) click, 300ms transitions)

### E2E Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T008 [P] [US1] E2E test: Glassmorphic token consistency across all pages in `tests/e2e/design/glassmorphic-consistency.test.ts`
- [X] T009 [P] [US1] E2E test: Motion design audit (hover, active, focus states) in `tests/e2e/design/motion-audit.test.ts`

### Implementation for User Story 1

- [X] T010 [P] [US1] Audit all component files for hardcoded glassmorphic values (grep for rgba, backdrop-blur, box-shadow) and create replacement list
- [X] T011 [P] [US1] Update `src/app/globals.css` .glass-panel class to use DESIGN.md token values (backdrop blur 16px, background rgba(255,255,255,0.25), shadow 0 8px 32px rgba(0,0,0,0.08))
- [X] T012 [P] [US1] Update `src/app/globals.css` .glass-panel--heavy and .glass-panel--light variants with correct opacity values
- [X] T013 [US1] Replace hardcoded glassmorphic values in `src/components/floor-plan/floor-plan-canvas.tsx` with CSS variables (already using .glass-panel class)
- [X] T014 [US1] Replace hardcoded glassmorphic values in `src/components/floor-plan/guest-panel.tsx` with CSS variables (already using .glass-panel class)
- [X] T015 [US1] Replace hardcoded glassmorphic values in `src/components/floor-plan/item-catalog.tsx` with CSS variables (already using .glass-panel class)
- [X] T016 [US1] Add motion classes to `globals.css` (.motion-hover: translateY(-2px), .motion-active: scale(0.98), transition: 300ms cubic-bezier(0.4, 0, 0.2, 1))
- [X] T017 [US1] Apply motion classes to all interactive buttons across login, admin, dashboard pages (GlassButton updated)
- [X] T018 [US1] Verify zero hardcoded glassmorphic values remain (grep audit, SC-001 compliance)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (all pages use consistent glass tokens and motion)

---

## Phase 4: User Story 2 - Preset Layout Removal (Priority: P2)

**Goal**: Remove legacy layout preset system (bento/minimalist/cinematic) in favor of single glassmorphic layout

**Independent Test**: Verify layout_preset column dropped, preset components deleted, preset CSS files deleted, no TypeScript errors from removed references

### E2E Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] E2E test: Verify no preset selector UI appears on admin wedding pages in `tests/e2e/preset-removal.test.ts`

### Implementation for User Story 2

- [X] T020 [P] [US2] Delete `src/lib/design-system/preset-loader.ts`
- [X] T021 [P] [US2] Delete `src/lib/design-system/layout-preset-props.ts`
- [X] T022 [P] [US2] Delete `src/components/preset-wrapper.tsx`
- [X] T023 [P] [US2] Delete `src/components/preset-selector.tsx`
- [X] T024 [P] [US2] Delete `src/components/layout-presets/` directory (7 preset component files)
- [X] T025 [P] [US2] Delete `src/styles/presets/` directory (7 preset CSS files)
- [X] T026 [US2] Remove layout_preset from select queries in `src/app/actions/admin.ts` (search for 'layout_preset' in SELECT)
- [X] T027 [US2] Remove layoutPreset from return objects in `src/app/actions/admin.ts` (search for 'layoutPreset' in return)
- [X] T028 [US2] Delete updateWeddingPreset function from `src/app/actions/admin.ts` (search for 'updateWeddingPreset')
- [X] T029 [US2] Remove preset imports and logic from `src/app/(public)/w/[slug]/page.tsx` (search for 'preset' imports and layout_preset)
- [X] T030 [US2] Remove PresetSelector import and component from `src/app/(auth)/admin/weddings/[id]/page.tsx` (search for 'PresetSelector')
- [X] T031 [P] [US2] Delete `tests/unit/actions/admin-preset.test.ts`
- [X] T032 [P] [US2] Delete `tests/component/layout-presets/preset-rendering.test.tsx`
- [X] T033 [P] [US2] Delete `tests/component/preset-selector.test.tsx`
- [X] T034 [P] [US2] Delete `tests/unit/lib/design-system/preset-loader.test.ts`
- [X] T035 [US2] Run TypeScript compilation and fix any remaining layout_preset reference errors

**Checkpoint**: At this point, preset system fully removed, codebase simplified, no TypeScript errors

---

## Phase 5: User Story 3 - Page-Specific Design Implementation (Priority: P3)

**Goal**: Implement specific Stitch redesign details for each of 5 pages (login, admin dashboard, weddings table, floor plan editor, RSVP experience)

**Independent Test**: Each page matches Stitch screenshot within ±4px spacing/sizing tolerance, colors match DESIGN.md tokens exactly

### E2E Tests for User Story 3 ⚠️

- [X] T036 [P] [US3] E2E test: Login page visual audit vs Stitch screenshot in `tests/e2e/design/login-page-audit.test.ts`
- [X] T037 [P] [US3] E2E test: Admin dashboard visual audit vs Stitch screenshot in `tests/e2e/design/admin-dashboard-audit.test.ts`
- [X] T038 [P] [US3] E2E test: Weddings table visual audit vs Stitch screenshot in `tests/e2e/design/weddings-table-audit.test.ts`
- [X] T039 [P] [US3] E2E test: Floor plan editor visual audit vs Stitch screenshot in `tests/e2e/design/floor-plan-audit.test.ts`
- [X] T040 [P] [US3] E2E test: RSVP experience visual audit vs Stitch screenshot in `tests/e2e/design/rsvp-audit.test.ts`

### Implementation: Login Page (US3-Login)

- [X] T041 [P] [US3] Update `src/app/(public)/auth/login/page.tsx` with recessed input styling (inner shadow inset 0 2px 4px rgba(0,0,0,0.05), backdrop blur 8px)
- [X] T042 [US3] Add focus glow effect to login inputs (1px border transition to gold/cyan, 4px outer glow)
- [X] T043 [US3] Replace login page icons with lucide-react (import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react')
- [X] T044 [US3] Apply glass-panel card styling to login form container

### Implementation: Admin Dashboard (US3-Admin)

- [X] T045 [P] [US3] Update admin dashboard stats cards with glass-panel styling in `src/app/(auth)/admin/page.tsx`
- [X] T046 [US3] Replace admin dashboard icons with lucide-react (import { Search, Bell, Calendar, Users, DollarSign, TrendingUp, MoreVertical, Plus, Settings, LogOut } from 'lucide-react')
- [X] T047 [US3] Apply consistent elevation hierarchy to admin action buttons

### Implementation: Weddings Table (US3-Table)

- [X] T048 [P] [US3] Update weddings table rows with glass hover states in `src/app/(auth)/admin/weddings/page.tsx`
- [X] T049 [US3] Replace table action icons with lucide-react (import { Filter, Plus, Pencil, Trash2, ChevronDown, ExternalLink, Download } from 'lucide-react')
- [X] T050 [US3] Apply glass-panel styling to table container and action buttons

### Implementation: Floor Plan Editor (US3-FloorPlan)

- [X] T051 [P] [US3] Update CanvasStats to use glass-panel--light in `src/components/floor-plan/canvas-stats.tsx`
- [X] T052 [US3] Update FloorPlanToolbar buttons to use GlassButton variant in `src/components/floor-plan/floor-plan-toolbar.tsx`
- [X] T053 [US3] Replace floor plan toolbar icons with lucide-react (import { LayoutGrid, ZoomIn, ZoomOut, Undo, Redo, Save, RotateCw, Trash2, Move, Lock, Unlock } from 'lucide-react')
- [X] T054 [US3] Create FurnitureIcons.tsx with inline SVG for round table and rectangle table icons
- [X] T055 [US3] Verify both admin (`/admin/weddings/[id]/floor-plan/`) and couple (`/dashboard/floor-plan/`) editors use identical glass styling

### Implementation: RSVP Experience (US3-RSVP)

- [X] T056 [P] [US3] Update RSVP form fields with recessed glass styling in `src/components/rsvp-form.tsx`
- [X] T057 [US3] Add smooth border transitions to RSVP inputs (300ms transition on border-color)
- [X] T058 [US3] Replace RSVP icons with lucide-react (import { CheckCircle, User, Mail, Utensils, Wine, Music, Heart, ArrowLeft, Info } from 'lucide-react')
- [X] T059 [US3] Update RsvpConfirmationCard with glass-panel styling

**Checkpoint**: All 5 pages match Stitch screenshots within ±4px tolerance, colors match DESIGN.md exactly

---

## Phase 6: Accessibility & Responsive (Cross-Cutting)

**Purpose**: Implement FR-009 to FR-015 (accessibility, responsive design)

- [X] T060 [P] Add keyboard navigation (Tab/Enter/Escape) to all interactive elements (FR-009)
- [X] T061 [P] Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 UI) using devtools audit (FR-010)
- [X] T062 [P] Ensure touch targets are minimum 44x44 CSS pixels for mobile (< 768px) (FR-011)
- [X] T063 [P] Add aria-label to all non-text icons (FR-012)
- [X] T063a [P] Run axe-core audit (`npx axe-core@latest`) on all 5 pages, fix violations (SC-006, FR-009 to FR-012)
- [X] T064 [P] Verify mobile viewport functionality down to 320px width (iPhone SE) (FR-013)
- [X] T065 [P] Implement hamburger menu pattern for screen widths < 768px (FR-014)
- [X] T066 [P] Update floor plan editor to single-column layout on mobile (catalog → canvas → panels stacked) (FR-015)

---

## Phase 7: Error Handling, Recovery, Zero-States, Loading (Cross-Cutting)

**Purpose**: Implement FR-016 to FR-026 (error handling, recovery, zero-states, loading)

- [X] T067 [P] Add image load failure fallback (gradient hero for wedding templates) per FR-016 in `src/components/landing-page.tsx` and `src/components/template-preview.tsx`
- [X] T068 [P] Add geocoding API failure state ("Unable to search" with retry) per FR-017
- [X] T069 [P] Add network timeout handling (> 10s error UI with retry) per FR-018
- [X] T070 [P] Verify floor plan undo works for all design changes (placement, movement, rotation, resize, deletion) per FR-019
- [X] T070a [P] Implement undo tracking for rotation, resize, deletion in `src/components/floor-plan/hooks/use-floor-plan-state.ts` (FR-019)
- [X] T071 [P] Add localStorage autosave for form inputs on navigation per FR-020 in `src/components/rsvp-form.tsx` and `src/components/venue-editor.tsx`
- [X] T072 [P] Add "No weddings yet" empty state with CTA to admin dashboard per FR-021
- [X] T073 [P] Add "No weddings found" empty state to weddings table per FR-022
- [X] T074 [P] Add "No items placed" hint to empty floor plan canvas per FR-023
- [X] T075 [P] Add skeleton loaders matching final layout structure per FR-024
- [X] T076 [P] Ensure design tokens applied within 100ms (no FOUC) per FR-025
- [X] T077 [P] Add loading spinner to floor plan canvas during Konva Stage init per FR-026

---

## Phase 8: Browser Support, Bundle, SEO (Cross-Cutting)

**Purpose**: Implement FR-027 to FR-035 (browser support, bundle size, SEO)

- [X] T078 [P] Test on Chrome 120+, Safari 17+, Firefox 121+ and document any issues per FR-027
- [X] T079 [P] Test on mobile Chrome and Safari (iOS 16+, Android 13+) per FR-028
- [X] T080 [P] Verify no custom font files added (system fonts only) per FR-030
- [X] T081 [P] Run bundle analyzer to verify lucide-react tree-shaking per FR-031
- [X] T082 [P] Optimize inline SVG icons with SVGO (< 2KB each) per FR-032
- [X] T083 [P] Add meta title, description, Open Graph tags to public wedding pages per FR-033 (use Next.js 16 metadata export pattern)
- [X] T084 [P] Verify semantic HTML (header, main, footer, h1-h6 hierarchy) on public pages per FR-034
- [X] T085 [P] Add alt text to template images (derived from couple name) per FR-035

---

## Phase 9: Reduced Motion & Polish (Final)

**Purpose**: Cross-cutting polish and reduced motion support

- [X] T086 [P] Add prefers-reduced-motion media query support (disable entrance animations, hover lift, maintain glass styling)
- [X] T087 [P] Run full E2E test suite (`npm run test:e2e --workers=1`) and fix all failures
- [X] T088 [P] Run bundle analyzer and verify no regressions
- [X] T089 [P] Update DEPLOYMENT.md with any new environment requirements (optional polish)
- [X] T090 [P] Run quickstart.md validation checklist (optional polish)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational completion
  - Can run in parallel if team capacity allows
  - Or sequentially in priority order (P1 → P2 → P3)
- **Cross-Cutting (Phase 6-8)**: Can start after any user story completes
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- E2E tests (marked [P]) MUST be written and FAIL before implementation
- CSS/globals.css updates before component updates
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational completes, all user stories can start in parallel
- All E2E tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all E2E tests for User Story 1 together:
Task: "E2E test: Glassmorphic token consistency in tests/e2e/design/glassmorphic-consistency.test.ts"
Task: "E2E test: Motion design audit in tests/e2e/design/motion-audit.test.ts"

# Launch all component updates for User Story 1 together (different files):
Task: "Update floor-plan-canvas.tsx with CSS variables"
Task: "Update guest-panel.tsx with CSS variables"
Task: "Update item-catalog.tsx with CSS variables"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (consistent glassmorphic layout)
4. **STOP and VALIDATE**: Run E2E tests T008, T009 - verify all pages use consistent glass tokens and motion
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (glassmorphic consistency) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (preset removal) → Test independently → Deploy/Demo
4. Add User Story 3 (page-specific details) → Test independently → Deploy/Demo
5. Add Phases 6-8 (accessibility, error handling, browser support) → Full feature complete
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (glassmorphic consistency)
   - Developer B: User Story 2 (preset removal)
   - Developer C: User Story 3 (page-specific implementation)
3. Stories complete and integrate independently
4. Team reconvenes for Phases 6-9 (cross-cutting concerns)

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2], [US3] labels map task to specific user story for traceability
- Each user story should be independently completable and testable
- E2E tests MUST be run with `--workers=1` to avoid session cookie race conditions
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requires ALL E2E tests pass across desktop AND mobile Chrome before merge
