# Tasks: Homepage Redesign for Mobile Conversion

**Input**: Design documents from `specs/011-homepage-redesign/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/ui-api.md, quickstart.md

**Tests**: Included per project constitution (Test Verification principle). All component and E2E tests written first (Red-Green).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema updates and project initialization for the redesign

- [ ] T001 Create database migrations: `supabase/migrations/013_add_theme_to_weddings.sql`, `014_create_rsvp_tokens.sql`, `015_create_platform_settings.sql`
- [ ] T002 Reset local Supabase database and verify migrations apply cleanly

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core design system that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Extend `src/app/globals.css` with glassmorphism CSS variables (`--glass-bg`, `--glass-bg-heavy`, `--glass-border`, `--glass-shadow`, `--glass-blur`, `--radius-glass`) and bento grid utilities
- [ ] T004 [P] Create theme TypeScript types in `src/types/theme.ts` (ThemeConfiguration, ThemeContextValue)
- [ ] T005 Create Zod theme validation schema in `src/lib/validations/theme.ts` (primaryColor, accentColor, glassBlurRadius, borderOpacity, borderRadius, fontFamily)
- [ ] T013 [P] Write unit tests for theme Zod validation in `tests/unit/validations/theme.test.ts` (must FAIL before T005 is considered complete)
- [ ] T006 Create theme provider and `useTheme` hook in `src/lib/design-system/theme.ts` (merged global + per-wedding theme, DEFAULT_THEME constant)
- [ ] T015 [P] Write component tests for glassmorphism primitives in `tests/component/glassmorphism/` (GlassCard, GlassPanel, GlassButton — must FAIL before T007–T009)
- [ ] T007 [P] Create GlassCard component in `src/components/glassmorphism/glass-card.tsx` (variant: default/heavy/light, @supports fallback)
- [ ] T008 [P] Create GlassPanel component in `src/components/glassmorphism/glass-panel.tsx` (padding: none/sm/md/lg, radius: sm/md/lg/glass)
- [ ] T009 [P] Create GlassButton component in `src/components/glassmorphism/glass-button.tsx` (variant: primary/secondary/ghost, size: sm/md/lg, 44x44px touch target)
- [ ] T016 [P] Write component tests for bento primitives in `tests/component/bento/` (BentoGrid, BentoItem — must FAIL before T010–T011)
- [ ] T010 [P] Create BentoGrid component in `src/components/bento/bento-grid.tsx` (cols: 1/2/3/4, gap: sm/md/lg, mobile always grid-cols-1)
- [ ] T011 [P] Create BentoItem component in `src/components/bento/bento-item.tsx` (colSpan, rowSpan, renders inside GlassCard)
- [ ] T014 [P] Write unit tests for preset loader in `tests/unit/lib/design-system/preset-loader.test.ts` (must FAIL before T012)
- [ ] T012 Create preset loader in `src/lib/design-system/preset-loader.ts` (PRESET_REGISTRY, loadPreset, preloadAllPresets)

**Checkpoint**: Foundation ready — glassmorphism primitives, bento grid, theme system, and preset loader are all implemented and tested

---

## Phase 3: User Story 1 - Guest RSVPs on Mobile (Priority: P1) 🎯 MVP

**Goal**: Deliver a mobile-first wedding landing page with bento/minimalist/magazine presets, optimized RSVP form, venue section with map fallback, and returning guest inline edit flow

**Independent Test**: Open a wedding landing page on a mobile device (375px viewport) and complete an RSVP submission in under 60 seconds without assistance

### Tests for User Story 1 (Write FIRST — ensure they FAIL before implementation)

- [ ] T017 [P] [US1] Write E2E test skeleton for guest RSVP mobile flow in `tests/e2e/guest-rsvp-mobile.spec.ts` (hero visible, RSVP submission, confirmation card, map fallback, edit RSVP)
- [ ] T018 [P] [US1] Write component tests for RSVP form mobile in `tests/component/rsvp-form.test.tsx` (touch targets 44x44px, inline validation, conditional fields)
- [ ] T019 [P] [US1] Write component tests for venue section map fallback in `tests/component/venue-section.test.tsx` (timeout handling, retry button, graceful degradation)

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create MVP preset CSS files (minimalist, bento, magazine) in `src/styles/presets/preset-minimalist.css`, `preset-bento.css`, `preset-magazine.css`
- [ ] T021 [P] [US1] Create MVP layout preset components in `src/components/layout-presets/preset-minimalist.tsx`, `preset-bento.tsx`, `preset-magazine.tsx` (conform to LayoutPresetProps contract)
- [ ] T022 [US1] Implement preset rendering and theme application in `src/app/(public)/w/[slug]/page.tsx` (lazy-load active preset CSS, merge theme, pass to preset component)
- [ ] T023 [US1] Refactor RSVP form for mobile optimization in `src/components/rsvp-form.tsx` (full-width inputs, 44px min-height, stacked layout, inline validation below fields)
- [ ] T024 [US1] Create RSVP confirmation card with inline edit integration in `src/components/rsvp-confirmation-card.tsx` and update `src/components/rsvp-section.tsx` (replaces form when token valid, edit button swaps back to pre-filled form)
- [ ] T025 [US1] Refactor venue section with map fallback in `src/components/venue-section.tsx` (5s timeout detection, glassmorphism card with address + nav buttons, retry button + auto-retry)
- [ ] T026 [US1] Implement returning guest token system in `src/app/actions/rsvp.ts` (generate random token, set Secure/HttpOnly/SameSite=Lax cookie, rate-limit 5 attempts per 15min). Validate token server-side on every request; if expired mid-session, show "Please submit again" without losing form data (FR-038).
- [ ] T068 [P] [US1] Implement network interruption detection and retry in RSVP form submission in `src/components/rsvp-form.tsx` and `src/app/actions/rsvp.ts` (detect offline/mid-submit, preserve form data, display retry option) (FR-033)
- [ ] T073 [P] [US1] Add token cookie attribute validation test in `tests/e2e/guest-rsvp-mobile.spec.ts` (verify Secure, HttpOnly, SameSite=Lax flags are set correctly)
- [ ] T027 [US1] Redesign root homepage in `src/app/(public)/page.tsx` (glassmorphism hero, mobile-first)
- [ ] T028 [US1] Redesign login page in `src/app/(public)/auth/login/page.tsx` (glassmorphism card, mobile-optimized inputs)
- [ ] T029 [P] [US1] Write component tests for layout presets in `tests/component/layout-presets/` (rendering, theme application, mobile stacking)
- [ ] T030 [US1] Run and fix E2E tests for guest RSVP mobile flow in `tests/e2e/guest-rsvp-mobile.spec.ts`

**Checkpoint**: User Story 1 is fully functional — guests can view a wedding landing page, RSVP on mobile, see map fallback, and edit their RSVP via token

---

## Phase 4: User Story 2 - Admin Manages Weddings on Mobile (Priority: P2)

**Goal**: Deliver mobile-optimized admin dashboard with card-grid wedding list, bento detail tabs, responsive tables, mobile modals, hamburger navigation, and floor plan small-screen blocking

**Independent Test**: An admin can view wedding list, edit a wedding, toggle lock, check RSVP counts, and use floor plan editor on tablet entirely on mobile without assistance

### Tests for User Story 2 (Write FIRST — ensure they FAIL before implementation)

- [ ] T031 [P] [US2] Write E2E test skeleton for admin mobile management in `tests/e2e/admin-mobile.spec.ts` (card grid, tabs, floor plan blocking, pagination, lock toggle)
- [ ] T032 [P] [US2] Write component tests for MobileNav in `tests/component/navigation.test.tsx` (hamburger collapse <768px, active state, touch targets)
- [ ] T033 [P] [US2] Write component tests for ResponsiveTable in `tests/component/responsive-table.test.tsx` (mobile card grid, desktop table, pagination)
- [ ] T034 [P] [US2] Write component tests for MobileModal in `tests/component/mobile-modal.test.tsx` (full-screen <640px, centered ≥640px, close action, keyboard-aware)

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create MobileNav component in `src/components/navigation/mobile-nav.tsx` (hamburger <768px, full-screen glassmorphism overlay, active border-left accent)
- [ ] T036 [P] [US2] Create AdminSidebar mobile navigation in `src/components/navigation/admin-sidebar.tsx` (collapses to MobileNav on mobile, touch-friendly links)
- [ ] T037 [P] [US2] Create ResponsiveTable component in `src/components/responsive-table.tsx` (desktop table element, mobile card grid with key-value pairs, pagination always visible)
- [ ] T038 [P] [US2] Create MobileModal component in `src/components/mobile-modal.tsx` (full-screen/bottom-sheet <640px, centered modal ≥640px, keyboard-aware scroll)
- [ ] T039 [US2] Refactor admin wedding list to card grid in `src/app/(auth)/admin/weddings/page.tsx` (glassmorphism cards, couple name/date/RSVP count/lock status, pagination for 50+ weddings)
- [ ] T040 [US2] Refactor wedding detail page with bento tabs in `src/app/(auth)/admin/weddings/[id]/page.tsx` (details, venue, floor plan, RSVPs — each tab bento layout, thumb-sized inputs)
- [ ] T041 [US2] Implement floor plan editor small-screen blocking in `src/app/(auth)/admin/weddings/[id]/floor-plan/page.tsx` (device-not-supported message <640px, read-only preview below)
- [ ] T042 [US2] Refactor template upload and preview for mobile in `src/components/template-upload.tsx` and `src/components/template-preview.tsx` (touch-friendly crop, file validation inline errors)
- [ ] T043 [US2] Refactor lock toggle for glassmorphism in `src/components/lock-toggle.tsx` (glass-panel styling, clear state indication)
- [ ] T069 [P] [US2] Implement template image optimization pipeline in `src/app/actions/upload.ts` (WebP conversion, max 1200px width, 80% quality, inline error display) (FR-035)
- [ ] T070 [P] [US2] Verify admin preview renders identically to guest view in `src/app/(auth)/admin/weddings/[id]/page.tsx` (preset, theme, responsive breakpoints match guest `/w/[slug]`) (FR-012)
- [ ] T072 [P] [US2] Redesign couple creation form `/admin/weddings/create` with glassmorphism styling and mobile-optimized inputs
- [ ] T044 [US2] Run and fix E2E tests for admin mobile flow in `tests/e2e/admin-mobile.spec.ts`

**Checkpoint**: User Stories 1 AND 2 are independently functional

---

## Phase 5: User Story 3 - Couple Manages Their Wedding on Mobile (Priority: P3)

**Goal**: Deliver mobile-optimized couple dashboard with bento RSVP summary, paginated RSVP table, mobile venue editor, tablet floor plan editor, and public page preview

**Independent Test**: A couple can view RSVP summary, edit venue, preview public page, and use floor plan editor on tablet entirely on mobile without assistance

### Tests for User Story 3 (Write FIRST — ensure they FAIL before implementation)

- [ ] T045 [P] [US3] Write E2E test skeleton for couple mobile dashboard in `tests/e2e/couple-mobile.spec.ts` (bento summary, venue edit, pagination, floor plan blocking, modal keyboard)
- [ ] T046 [P] [US3] Write component tests for couple dashboard in `tests/component/landing-page.test.tsx` (bento grid RSVP summary, glassmorphism cards)
- [ ] T047 [P] [US3] Write component tests for RSVP table pagination in `tests/component/rsvp-table.test.tsx` (25 rows/page, search/filter visible, no horizontal overflow)

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create CoupleSidebar mobile navigation in `src/components/navigation/couple-sidebar.tsx` (collapses to MobileNav on mobile)
- [ ] T049 [US3] Refactor couple dashboard with bento RSVP summary in `src/app/(auth)/dashboard/page.tsx` (attending, declining, vegetarian, baby chair counts in glassmorphism cards)
- [ ] T050 [US3] Refactor RSVP table with mobile pagination in `src/components/rsvp-table.tsx` (25 rows/page on mobile, search/filter always visible, readable column widths 80-300px)
- [ ] T051 [US3] Refactor venue editor for mobile touch targets in `src/components/venue-editor.tsx` (44x44px inputs, touch-friendly autocomplete dropdown, map preview)
- [ ] T052 [US3] Refactor floor plan editor for couple tablet in `src/app/(auth)/dashboard/floor-plan/page.tsx` (768px+ usability, small-screen blocking <640px)
- [ ] T053 [US3] Implement public page preview for couple in `src/app/(auth)/dashboard/page.tsx` (renders identically to guest view)
- [ ] T054 [US3] Run and fix E2E tests for couple mobile flow in `tests/e2e/couple-mobile.spec.ts`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, security, and error-handling improvements across all user stories

- [ ] T055 [P] Update error boundary components with glassmorphism styling in `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/loading.tsx`
- [ ] T056 [P] Add `prefers-reduced-motion` support across all animations in `src/app/globals.css` (disables parallax, fade-ins, 3D depth transitions, all CSS transitions)
- [ ] T057 [P] Implement Open Graph metadata generation in `src/app/(public)/w/[slug]/page.tsx` (title, description, image from couple name and template)
- [ ] T058 [P] Add empty states and loading states across all data-dependent screens (skeletons/spinners for loading, actionable guidance for empty)
- [ ] T059 [P] Implement CSP header for inline styles in `next.config.ts` (`style-src 'self' 'unsafe-inline'`)
- [ ] T060 [P] Add ARIA live regions for dynamic content updates in `src/components/rsvp-section.tsx`, `src/components/venue-section.tsx` (`aria-live="polite"`)
- [ ] T061 [P] Implement focus management for modals and RSVP inline edit in `src/components/mobile-modal.tsx` and `src/components/rsvp-section.tsx` (focus to close button on modal open, focus to first field on edit)
- [ ] T062 [P] Add color blindness simulation tests for theme palette in `tests/unit/lib/design-system/theme.test.ts` (protanopia, deuteranopia, tritanopia)
- [ ] T063 [P] Create stretch-goal preset CSS and components (storytelling, card-stack, asymmetric, cinematic) in `src/styles/presets/` and `src/components/layout-presets/` (optional — post-MVP)
- [ ] T071 [P] Verify tablet viewport layouts (640px–768px) across all user stories in E2E tests (`tests/e2e/`) — ensure distinct layouts from mobile (<640px) and desktop (>768px) (FR-031)
- [ ] T064 Run full test suite (`npm run test && npm run test:e2e --workers=1`)
- [ ] T065 Run Lighthouse audit for mobile performance targets (FCP <2.5s on 4G throttling, 375px viewport)
- [ ] T066 Run axe-core accessibility audit for WCAG 2.1 AA compliance (contrast 4.5:1, keyboard navigation, name/role/value)
- [ ] T067 Update `specs/011-homepage-redesign/quickstart.md` with final testing commands and deployment checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (migrations applied) — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if team capacity allows)
  - Or sequentially in priority order: P1 → P2 → P3
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Integrates with US1 components (glassmorphism primitives, MobileNav, ResponsiveTable) but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Integrates with US1/US2 components but is independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- E2E skeletons first, then component tests
- Shared/new components before page integration
- Core implementation before E2E validation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational is done, all 3 user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (must fail before implementation):
Task: "Write E2E test skeleton for guest RSVP mobile flow in tests/e2e/guest-rsvp-mobile.spec.ts"
Task: "Write component tests for RSVP form mobile in tests/component/rsvp-form.test.tsx"
Task: "Write component tests for venue section map fallback in tests/component/venue-section.test.tsx"

# Launch all preset work in parallel:
Task: "Create MVP preset CSS files in src/styles/presets/"
Task: "Create MVP layout preset components in src/components/layout-presets/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migrations)
2. Complete Phase 2: Foundational (design system — CRITICAL, blocks all stories)
3. Complete Phase 3: User Story 1 (guest RSVP with bento/minimalist/magazine presets)
4. **STOP and VALIDATE**: Test mobile RSVP flow end-to-end, run Lighthouse, verify accessibility
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Complete Polish phase → Full test suite + audits → Production deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (guest landing page + RSVP)
   - Developer B: User Story 2 (admin dashboard + mobile nav)
   - Developer C: User Story 3 (couple dashboard + RSVP table)
3. Stories complete and integrate independently
4. Team reconvenes for Polish phase (accessibility, performance, audits)

---

## Notes

- [P] tasks = different files, no dependencies
- Preset naming convention: descriptive names (`minimalist`, `bento`, `magazine`, etc.) used throughout; letter-based aliases (`preset-a` through `preset-g`) are plan-level shorthand only
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Stretch-goal presets (storytelling, card-stack, asymmetric, cinematic) are T063 and can be deferred post-MVP
- Total tasks: 73 | Setup: 2 | Foundational: 14 | US1: 16 | US2: 17 | US3: 10 | Polish: 14
