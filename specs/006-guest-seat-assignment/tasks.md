# Tasks: Guest Seat Assignment

**Input**: Design documents from `/specs/006-guest-seat-assignment/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/server-actions.md, research.md

**Tests**: Constitution §I mandates Red-Green-Refactor. Test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema, TypeScript types, Zod validations, and shadcn component installation — the foundation all user stories depend on.

- [x] T001 Create database migration for `seat_assignments` table in `supabase/migrations/` — table with columns (id, wedding_id, rsvp_id, chair_item_id, table_item_id, created_at, updated_at), unique constraints on rsvp_id and (wedding_id, chair_item_id), foreign keys to weddings and rsvps with CASCADE deletes, indexes on wedding_id and (wedding_id, table_item_id), RLS policies for couple/admin access, updated_at trigger
- [x] T002 Create database migration for `oauth_tokens` table in `supabase/migrations/` — table with columns (id, user_id, provider, access_token, refresh_token, scope, expires_at, created_at, updated_at), unique on (user_id, provider), FK to auth.users with CASCADE, RLS policies, updated_at trigger
- [x] T003 [P] Run `supabase db reset` to apply migrations and verify both tables created
- [x] T004 [P] Create TypeScript types for SeatAssignment, RsvpWithAssignment, and SeatAssignmentMap in `src/types/seat-assignment.ts` — per data-model.md Application Types section
- [x] T005 [P] Create TypeScript types for OAuthToken in `src/types/oauth.ts` — per data-model.md oauth_tokens section
- [x] T006 [P] Create Zod validation schemas for seat assignment inputs (assignSeat, unassignSeat) in `src/lib/validations/seat-assignment.ts` — validate weddingId (positive int), rsvpId (positive int), chairItemId (non-empty string), tableItemId (non-empty string)
- [x] T007 [P] Create Zod validation schemas for export inputs in `src/lib/validations/export.ts` — validate weddingId (positive int)
- [x] T008 [P] Install shadcn Command component — run `npx shadcn@latest add command` to add `src/components/ui/command.tsx`
- [x] T009 [P] Install `googleapis` and `exceljs` npm packages — `npm install googleapis exceljs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server actions that all user stories depend on — must be complete before any UI work begins.

- [x] T010 Implement `assignSeat` server action in `src/app/actions/seat-assignment.ts` — validates auth + wedding ownership (adminClient), checks RSVP exists with status "attending", checks RSVP not already assigned, checks chair not already occupied, checks chair/table item IDs exist in floor plan JSONB, atomic INSERT with ON CONFLICT handling
- [x] T011 Implement `unassignSeat` server action in `src/app/actions/seat-assignment.ts` — validates auth + wedding ownership, single DELETE with WHERE wedding_id AND chair_item_id
- [x] T012 Implement `getSeatAssignments` server action in `src/app/actions/seat-assignment.ts` — validates auth + wedding ownership, returns all assignments for wedding as flat array
- [x] T013 Implement `getUnassignedGuests` server action in `src/app/actions/seat-assignment.ts` — LEFT JOIN rsvps with seat_assignments, WHERE assignment IS NULL AND status = "attending"
- [x] T014 Implement `cleanupOrphanedAssignments` server action in `src/app/actions/seat-assignment.ts` — validates auth + wedding ownership, compares assignment chair_item_id/table_item_id against current floor plan items JSONB, deletes orphans, returns deletedCount
- [x] T015 Modify `saveFloorPlan` in `src/app/actions/floor-plan.ts` — after successful upsert, call cleanupOrphanedAssignments to remove assignments for deleted items
- [x] T016 Add `updateRsvpStatus` server action in `src/app/actions/rsvp.ts` — validates auth + wedding ownership, updates RSVP status, if status changes to "declining" then deletes the seat_assignment row for that rsvp_id (per FR-012). Run assignment cleanup AFTER the RSVP update is confirmed.
- [x] T017 [P] Implement Google OAuth server actions in `src/app/actions/export.ts` — `getGoogleAuthUrl` (generates OAuth consent URL with spreadsheets + drive.file scopes), `handleGoogleCallback` (exchanges code for tokens, upserts oauth_tokens row), `getGoogleAuthStatus` (checks if user has valid Google tokens)
- [x] T018 [P] Create Google OAuth callback API route in `src/app/api/auth/google/callback/route.ts` — receives OAuth callback, calls handleGoogleCallback action, redirects back to RSVP dashboard with success/error query param

**Checkpoint**: Server actions complete — all assignment CRUD and export operations are functional. User story UI work can now begin.

---

## Phase 3: User Story 1 + 2 - Assign / Reassign / Unassign Guests (Priority: P1) 🎯 MVP

**Goal**: Users can click any chair to assign an attending guest, reassign to a different guest, or unassign entirely. Occupied chairs show a teal/green fill with guest name label.

**Independent Test**: Place chairs on floor plan, have attending RSVPs, click empty chair → select guest → chair shows name/color. Click occupied chair → unassign → chair returns to empty state.

### Tests for User Stories 1 & 2

- [x] T019 [US1] Write unit tests for seat assignment server actions in `tests/unit/actions/seat-assignment.test.ts` — test `assignSeat` (successful assignment, double-assignment prevention, non-attending RSVP rejection, already-occupied chair rejection, auth verification) and `unassignSeat` (successful unassign, unassign non-existent, reassign flow). Run `npm run test` and confirm all tests FAIL (Red phase).

### Implementation for User Stories 1 & 2

- [x] T020 [US1] Create `use-seat-assignments.ts` hook in `src/components/floor-plan/hooks/` — fetches assignments via getSeatAssignments on mount, builds SeatAssignmentMap (chairItemId → { guestName, rsvpId }), exposes assign/unassign functions that call server actions and update local state optimistically, fetches unassigned guests list, refreshes map after each mutation
- [x] T021 [US1] Modify chair component `src/components/floor-plan/items/chair.tsx` — accept optional `assignment` prop (guestName or null), render with teal/green fill color when assigned vs default purple `#f3e8ff`, render guest name label via existing ItemLabel pattern (truncated to 15 chars), support both `onClick` and `onTap` for chair click (Constitution §VII Mobile Parity)
- [x] T022 [US1] Create `guest-assignment-dialog.tsx` in `src/components/floor-plan/` — shadcn Dialog + Command component (research R2), glass-panel styling using CSS variables (Constitution §IX), shows current assignment (if occupied) with Unassign button, searchable guest list filtered from unassigned guests, select guest → call assign action, Unassign button → call unassign action, empty state messages for no-guests scenarios (US1.3, US1.4), dismiss via Escape key and close button
- [x] T023 [US1] Modify `floor-plan-canvas.tsx` in `src/components/floor-plan/` — integrate use-seat-assignments hook, pass assignment data to chair components, handle chair click/tap to open guest-assignment-dialog (determine if empty or occupied), close dialog on assignment completion or dismissal, swap item catalog to right sidebar (research R6), leave left sidebar empty for US3 panel
- [x] T024 [US2] Add `seat_assignment` cleanup to floor plan `removeItem` and `updateItem` flows in `src/components/floor-plan/hooks/use-floor-plan-state.ts` — (a) when user removes a table or chair from the canvas, call unassignSeat for affected chair_item_ids (if server call fails, the orphaned assignment is cleaned up on next save via cleanupOrphanedAssignments); (b) when a chair's parentItemId changes (chair moved between tables), update the table_item_id in the assignment by calling a new `updateAssignmentTable` action or by unassigning + reassigning with the new tableItemId
- [x] T025 [US1] Run `npm run test` and confirm T019 tests now PASS (Green phase)

**Checkpoint**: Users can assign, reassign, and unassign guests. Occupied chairs are visually distinct. MVP complete. Tests pass.

---

## Phase 4: User Story 3 - View Unassigned Guests Panel (Priority: P2)

**Goal**: A left sidebar panel shows all attending guests without a seat, updating within 1 second via optimistic client updates.

**Independent Test**: View the panel alongside the floor plan — it lists exactly the attending guests not currently in any seat. Assigning a guest removes them from the panel without page reload.

### Implementation for User Story 3

- [x] T026 [US3] Create `unassigned-guests-panel.tsx` in `src/components/floor-plan/` — glass-panel styling using CSS variables (Constitution §IX), receives unassigned guests list from use-seat-assignments hook, displays guest names as scrollable list, shows completion message "All guests are seated!" when empty (US3.3), shows count header (e.g., "12 Unassigned"), responsive for mobile viewports
- [x] T027 [US3] Integrate unassigned-guests-panel into `floor-plan-canvas.tsx` — place in left sidebar (research R6), receives data from shared use-seat-assignments hook (already created in T020), panel re-renders within 1 second when assignments change via optimistic state updates (no browser page navigation per US3.2)

**Checkpoint**: Unassigned guests panel is visible and updates within 1 second. US1+2+3 all work together.

---

## Phase 5: User Story 4 - View Seat Assignments in RSVP Dashboard (Priority: P2)

**Goal**: The RSVP list on the dashboard shows each guest's assigned table name (from item label) and seat position (chairIndex + 1 among siblings).

**Independent Test**: After making assignments on the floor plan, view the RSVP dashboard and verify each row shows correct table/seat info.

### Implementation for User Story 4

- [x] T028 [US4] Modify dashboard RSVP page `src/app/(auth)/dashboard/rsvps/page.tsx` — extend RSVP query to LEFT JOIN seat_assignments, derive tableName from floor plan item label (match table_item_id to items JSONB), derive seatLabel from chair's chairIndex + 1 metadata, add "Table" and "Seat" columns to the RSVP table, show dash (—) for guests without assignment (US4.2)
- [x] T029 [P] [US4] Modify admin wedding detail page `src/app/(auth)/admin/weddings/[id]/page.tsx` — same table/seat columns as dashboard (per FR-016 admin parity)

**Checkpoint**: Both dashboard and admin views show seat assignment data.

---

## Phase 6: User Story 5 - Export RSVP Data with Seat Assignments (Priority: P3)

**Goal**: Google Sheets export creates a new spreadsheet with RSVP + seat assignment data. XLSX fallback for users without Google auth.

**Independent Test**: Click "Export to Google Sheets" → OAuth flow → spreadsheet created with correct columns. Click "Download as XLSX" → file downloads with same columns.

### Tests for User Story 5

- [x] T030 [P] [US5] Write unit test for `exportToXlsx` in `tests/unit/actions/export.test.ts` — test XLSX generation with mixed assigned/unassigned guests, column headers, data accuracy. Run `npm run test` and confirm test FAILS (Red phase).

### Implementation for User Story 5

- [x] T031 [US5] Implement `exportToGoogleSheets` server action in `src/app/actions/export.ts` — refresh token if expired, query RSVPs with LEFT JOIN seat_assignments, derive tableName/seatLabel from floor plan items, create new spreadsheet via Google Sheets API, populate with columns (Guest Name, Status, Vegetarian, Dietary Notes, Baby Chair, Table, Seat, Submitted At), "Unassigned" for empty Table/Seat, return spreadsheet URL
- [x] T032 [US5] Implement `exportToXlsx` server action in `src/app/actions/export.ts` — same query and column structure as Google Sheets export, generate XLSX buffer via exceljs, return buffer and filename
- [x] T033 [US5] Add export buttons to RSVP dashboard `src/app/(auth)/dashboard/rsvps/page.tsx` — "Export to Google Sheets" button (calls getGoogleAuthStatus, if connected calls exportToGoogleSheets, if not redirects to OAuth), "Download as XLSX" button (calls exportToXlsx, triggers browser download), glass-panel styling for button container
- [x] T034 [P] [US5] Add export button to admin wedding detail page `src/app/(auth)/admin/weddings/[id]/page.tsx` — same export options as dashboard (per FR-021 admin access parity)
- [x] T035 [US5] Run `npm run test` and confirm T030 test now PASSES (Green phase)

**Checkpoint**: All 5 user stories complete. Google Sheets and XLSX exports work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and cleanup across all user stories.

- [ ] T036 Run `npm run test` and verify all unit tests pass
- [ ] T037 Run `npm run test:e2e --workers=1` and verify all E2E tests pass across all projects (desktop + mobile) — per Constitution §I, E2E failures MUST be fixed, not deferred
- [ ] T038 Run `npm run lint` and fix any lint errors
- [ ] T039 Run `npm run build` and verify production build succeeds
- [ ] T040 Verify glass-panel styling on all new components (dialog, panel, export buttons) — no hardcoded glass values, uses CSS variables per Constitution §IX
- [ ] T041 Verify mobile parity — chair tap opens dialog on mobile, dialog is usable on small screens, unassigned panel is responsive, XLSX download works on mobile per Constitution §VII
- [ ] T042 Run quickstart.md validation — walk through the implementation order and confirm all files exist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories 1+2 (Phase 3)**: Depends on Phase 2 — MVP
- **User Story 3 (Phase 4)**: Depends on T020 (use-seat-assignments hook) from Phase 3
- **User Story 4 (Phase 5)**: Depends on Phase 2 only — can start in parallel with Phase 3
- **User Story 5 (Phase 6)**: Depends on Phase 2 + Phase 1 (oauth migration) — can start in parallel with Phase 3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: Depends on Phase 2. No dependencies on other stories. This IS the MVP.
- **US3 (P2)**: Depends on use-seat-assignments hook (T020) from US1.
- **US4 (P2)**: Depends on Phase 2 only. Can run in parallel with US1+2.
- **US5 (P3)**: Depends on Phase 2 only. Can run in parallel with US1+2.

### Within Each User Story (Constitution §I — TDD)

- Tests MUST be written first and confirmed to FAIL (Red phase)
- Implementation follows to make tests PASS (Green phase)
- Run `npm run test` to verify Green phase

### Parallel Opportunities

- T004, T005, T006, T007, T008, T009 can all run in parallel (different files, independent)
- T017 and T018 can run in parallel with each other (different files)
- T019 covers all seat assignment tests in a single file (assign, unassign, reassign)
- After T020 is complete: T021 and T022 can run in parallel (different component files, both depend on T020's interface)
- T028 and T029 can run in parallel (different page files)
- T033 and T034 can run in parallel (different page files)
- US4 (Phase 5) and US5 (Phase 6) can run in parallel with US1+2 (Phase 3)

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (migrations, types, validations, dependencies)
2. Complete Phase 2: Foundational (server actions)
3. Complete Phase 3: US1+US2 (assign, reassign, unassign + visual indicators + tests)
4. **STOP and VALIDATE**: Run `npm run test` — all tests must pass. Test assignment flow on the floor plan.
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1+US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3 → Unassigned guests panel → Deploy/Demo
4. Add US4 → Dashboard RSVP columns → Deploy/Demo
5. Add US5 → Google Sheets + XLSX export → Deploy/Demo
6. Polish → Final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are combined into Phase 3 because they share the same dialog and chair click interaction — separating them would create an awkward half-state
- T021 and T022 both depend on T020 (the hook) being complete first — they can be parallel AFTER T020
- T016 adds a NEW `updateRsvpStatus` action to `src/app/actions/rsvp.ts` (the file currently only has `submitRSVP`)
- Chair component changes (T022) must support both onClick and onTap per Constitution §VII
- Google OAuth requires environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
