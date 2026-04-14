# Tasks: RSVP Landing Page & Form

**Input**: Design documents from `specs/001-rsvp-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Constitution mandates TDD + BDD. Tests included for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `src/app/`, `src/components/`, `src/lib/`
- **Supabase**: `supabase/migrations/`, `supabase/seed.sql`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and Supabase configuration

- [x] T001 Initialize Next.js project with TypeScript, Tailwind, ESLint, App Router, src directory using `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
- [x] T002 [P] Install runtime dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `@hookform/resolvers`, `zod`, `nanoid`
- [x] T003 [P] Initialize shadcn/ui with `npx shadcn@latest init`
- [x] T004 [P] Add shadcn/ui components: `button`, `input`, `textarea`, `checkbox`, `label`, `card`, `form`, `select`, `table`, `badge`, `dialog`, `sheet`
- [x] T005 [P] Initialize Supabase with `npx supabase init` and start local instance with `npx supabase start`
- [x] T006 Configure environment variables in `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Checkpoint**: Project scaffolded, dependencies installed, Supabase running locally

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create users table migration in `supabase/migrations/<timestamp>_create_users.sql` with id (UUID PK), role (admin/couple check constraint), display_name, created_at, and RLS policy for self-read
- [x] T008 [P] Create weddings table migration in `supabase/migrations/<timestamp>_create_weddings.sql` with id (bigint identity PK), slug (unique), user_id (FK to users), couple_name, template_image_url, wedding_date, created_at, updated_at, index on user_id, and RLS policy for couple access
- [x] T009 [P] Create rsvps table migration in `supabase/migrations/<timestamp>_create_rsvps.sql` with id (bigint identity PK), wedding_id (FK to weddings), guest_name, status (attending/declining check), dietary_notes (max 500), is_vegetarian, needs_baby_chair, created_at, unique index on (wedding_id, LOWER(guest_name)), index on wedding_id, and RLS policies for couple read and public INSERT
- [x] T010 [P] Create seed file in `supabase/seed.sql` with admin user, 2 couple users with weddings, and sample RSVP responses
- [x] T11 Create Supabase Storage bucket `wedding-templates` with public read policy and admin-only upload policy
- [x] T012 [P] Create browser Supabase client in `src/lib/supabase/client.ts`
- [x] T013 [P] Create server Supabase client in `src/lib/supabase/server.ts` using cookie-based session
- [x] T014 [P] Create admin Supabase client in `src/lib/supabase/admin.ts` using service role key
- [x] T015 [P] Create utility functions in `src/lib/utils.ts` (cn helper for Tailwind class merging)
- [x] T016 Create RSVP zod validation schema in `src/lib/validations/rsvp.ts` with guestName (min 1), status (enum attending/declining), dietaryNotes (max 500, optional), isVegetarian (boolean), needsBabyChair (boolean)
- [x] T017 [P] Create admin zod validation schema in `src/lib/validations/admin.ts` with createCouple schema (email, password min 8, displayName, coupleName)
- [x] T018 Generate Supabase database types in `src/types/database.ts` using `npx supabase gen types typescript`
- [x] T019 Create auth middleware in `src/middleware.ts` that protects `/dashboard/*` and `/admin/*` routes, redirects unauthenticated users to `/auth/login`
- [x] T020 Create root layout in `src/app/layout.tsx` with Supabase providers and global styles

**Checkpoint**: Foundation ready — database tables, Supabase clients, middleware, and shared utilities are in place. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Admin Uploads Wedding Invitation (Priority: P1)

**Goal**: Admin can log in, upload a Canva template image, preview the landing page with CTA button, and get a shareable link.

**Independent Test**: Admin logs in, uploads an image, sees the landing page rendered with the CTA button, copies a shareable public link.

### Tests for User Story 1 (TDD/BDD)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Create E2E test for admin login and template upload flow in `tests/e2e/admin-manage.spec.ts` — Given admin is logged in, When they upload a Canva template, Then the landing page is created with a CTA button and shareable link
- [x] T022 [P] [US1] Create E2E test for landing page rendering in `tests/e2e/landing-page.spec.ts` — Given a wedding with a template image, When a guest visits `/w/{slug}`, Then the landing page renders the image with CTA button on mobile and desktop

### Implementation for User Story 1

- [x] T023 [P] [US1] Create login page in `src/app/(public)/auth/login/page.tsx` with email/password form using shadcn/ui Form components
- [x] T024 [US1] Create image upload server action in `src/app/actions/upload.ts` implementing `uploadTemplateImage` — validate file type (PNG/JPG) and size (10MB max), upload to Supabase Storage `wedding-templates` bucket, update wedding record with image URL
- [x] T025 [P] [US1] Create template upload component in `src/components/template-upload.tsx` — Client Component with file input, preview, and upload button using shadcn/ui Button and Dialog
- [x] T026 [P] [US1] Create admin layout in `src/app/(auth)/admin/layout.tsx` with navigation sidebar for Weddings and Couples
- [x] T027 [US1] Create admin dashboard page in `src/app/(auth)/admin/page.tsx` — Server Component listing all weddings with links to manage each
- [x] T028 [US1] Create wedding list page in `src/app/(auth)/admin/weddings/page.tsx` — Server Component showing all weddings in a shadcn/ui Table with slug, couple name, template status
- [x] T029 [US1] Create manage wedding page in `src/app/(auth)/admin/weddings/[id]/page.tsx` — Server Component showing wedding details with template upload component and shareable link display
- [x] T030 [P] [US1] Create landing page component in `src/components/landing-page.tsx` — Server Component displaying Canva template image full-width with overlaid CTA button linking to RSVP form, mobile-responsive layout
- [x] T031 [US1] Create public landing page route in `src/app/(public)/w/[slug]/page.tsx` — Server Component fetching wedding by slug, rendering LandingPage component or 404 if not found
- [x] T032 [US1] Create admin server actions in `src/app/actions/admin.ts` implementing `getWeddingRSVPs` for fetching wedding data with RSVP summary

**Checkpoint**: At this point, admin can log in, upload a template, and the public landing page with CTA button is accessible via shareable link. User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Guest Submits RSVP (Priority: P1)

**Goal**: A guest clicks the CTA button on the landing page, fills out the RSVP form (name, status, dietary notes, vegetarian, baby chair), submits, and sees a confirmation. Duplicate names are rejected.

**Independent Test**: Guest opens shareable link, clicks CTA, fills form, submits, sees confirmation. Submitting again with same name shows duplicate error.

### Tests for User Story 2 (TDD/BDD)

- [x] T033 [P] [US2] Create E2E test for RSVP submission flow in `tests/e2e/rsvp-flow.spec.ts` — Given guest has the landing page link, When they click CTA, fill the form, and submit, Then they see a confirmation message
- [x] T034 [P] [US2] Create E2E test for duplicate RSVP prevention in `tests/e2e/duplicate-rsvp.spec.ts` — Given a guest has already submitted, When the same name is submitted again, Then the system shows a duplicate name error message
- [x] T035 [P] [US2] Create unit test for RSVP zod validation in `tests/unit/validations.test.ts` — test valid and invalid inputs for the RSVP schema
- [x] T036 [P] [US2] Create unit test for RSVP form component in `tests/unit/rsvp-form.test.tsx` — test form renders all fields, validates input, and calls submit action

### Implementation for User Story 2

- [x] T037 [US2] Create RSVP submission server action in `src/app/actions/rsvp.ts` implementing `submitRSVP` — validate input with zod schema, lookup wedding by slug, check for duplicate guest name (case-insensitive), insert into rsvps table, return success or duplicate_name error
- [x] T038 [US2] Create RSVP form component in `src/components/rsvp-form.tsx` — Client Component with shadcn/ui Form, Input for guest name, Select for RSVP status (attending/declining), Textarea for dietary notes, Checkbox for vegetarian and baby chair, submit Button with loading state, success and error message display
- [x] T039 [US2] Create RSVP form page route in `src/app/(public)/w/[slug]/rsvp/page.tsx` — Server Component fetching wedding by slug, passing wedding data to RSVP form component, or showing 404

**Checkpoint**: At this point, guests can view the landing page, click CTA, submit RSVPs, and see confirmations. Duplicate names are rejected. User Stories 1 AND 2 together form the MVP.

---

## Phase 5: User Story 3 - Couple Views RSVP Responses (Priority: P2)

**Goal**: A couple logs in and sees their wedding's RSVP responses with summary counts (attending, declining, vegetarian, baby chairs).

**Independent Test**: Couple logs in, sees dashboard with RSVP list and summary. Cannot access another couple's data.

### Tests for User Story 3 (TDD/BDD)

- [ ] T040 [P] [US3] Create E2E test for couple dashboard in `tests/e2e/couple-dashboard.spec.ts` — Given a couple is logged in with existing RSVPs, When they view their dashboard, Then they see all RSVPs and summary counts, and cannot access another couple's data

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create dashboard layout in `src/app/(auth)/dashboard/layout.tsx` with navigation for Overview and RSVPs
- [ ] T042 [US3] Create couple dashboard page in `src/app/(auth)/dashboard/page.tsx` — Server Component calling `getWeddingRSVPs` action, rendering summary cards
- [ ] T043 [P] [US3] Create RSVP summary component in `src/components/rsvp-summary.tsx` — displaying cards with total, attending, declining, vegetarian, baby chair counts using shadcn/ui Card
- [ ] T044 [P] [US3] Create RSVP table component in `src/components/rsvp-table.tsx` — displaying all RSVP responses in a shadcn/ui Table with guest name, status badge, dietary notes, vegetarian, baby chair columns
- [ ] T045 [US3] Create RSVP list page in `src/app/(auth)/dashboard/rsvps/page.tsx` — Server Component fetching RSVPs, rendering RSVPTable component

**Checkpoint**: Couples can log in and view their RSVP responses with summary. Data isolation enforced by RLS.

---

## Phase 6: User Story 4 - Admin Manages All Weddings (Priority: P2)

**Goal**: Admin can view all weddings, create couple accounts, and manage any wedding's landing page and RSVP data.

**Independent Test**: Admin logs in, sees all weddings, creates a couple account, and manages any wedding.

### Tests for User Story 4 (TDD/BDD)

- [ ] T046 [US4] Extend admin E2E test in `tests/e2e/admin-manage.spec.ts` — Given admin is logged in, When they create a couple account, Then the couple user and wedding are created; When they view any wedding, Then they see all RSVP data

### Implementation for User Story 4

- [ ] T047 [US4] Add `createCoupleAccount` server action in `src/app/actions/admin.ts` — create auth user via Supabase admin API, insert into users table with role 'couple', create wedding with auto-generated slug using nanoid
- [ ] T048 [P] [US4] Create couple creation form component in `src/components/create-couple-form.tsx` — Client Component with email, password, display name, couple name fields using shadcn/ui Form
- [ ] T049 [US4] Create couples management page in `src/app/(auth)/admin/couples/page.tsx` — rendering CreateCoupleForm and list of existing couples in a Table
- [ ] T050 [US4] Add `updateTemplateImage` server action in `src/app/actions/upload.ts` — same as upload but replaces existing image, preserves RSVPs, updates wedding record

**Checkpoint**: All user stories are independently functional. Admin has full management access.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T051 [P] Add not-found page in `src/app/not-found.tsx` for invalid wedding slugs
- [ ] T052 [P] Add error page in `src/app/error.tsx` with user-friendly error messaging
- [ ] T053 [P] Add loading states in `src/app/(public)/w/[slug]/loading.tsx` and `src/app/(auth)/dashboard/loading.tsx` using shadcn/ui Skeleton components
- [ ] T054 [P] Add mobile-responsive navigation component in `src/components/nav.tsx` with hamburger menu using shadcn/ui Sheet for mobile
- [ ] T055 Update `.env.example` with all required environment variables documented
- [ ] T056 [P] Configure `next.config.ts` with Supabase image domain in `remotePatterns` for Next.js Image optimization
- [ ] T057 Run all tests to verify complete feature functionality (`npm run test` and `npm run test:e2e`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — Admin uploads template + landing page
- **User Story 2 (Phase 4)**: Depends on US1 landing page (CTA button links to RSVP form)
- **User Story 3 (Phase 5)**: Depends on Foundational — Couple views RSVPs
- **User Story 4 (Phase 6)**: Depends on US1 (admin manages weddings) — Admin creates couples
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on other stories
- **US2 (P2)**: Light dependency on US1 — RSVP form page needs the landing page CTA link target, but the RSVP server action and form component can be built independently
- **US3 (P2)**: Can start after Foundational — independently testable (couples viewing RSVPs)
- **US4 (P2)**: Can start after Foundational — extends admin actions from US1

### Within Each User Story

1. Tests written FIRST and must FAIL (Red)
2. Server actions / data layer
3. UI components
4. Route pages connecting components to data
5. Story complete — verify independently

### Parallel Opportunities

- T007, T008, T009 (migrations) can run in parallel
- T012, T013, T014, T015, T017 (lib files) can run in parallel
- T021, T022 (US1 E2E tests) can run in parallel
- T033, T034, T035, T036 (US2 tests) can run in parallel
- T041, T043, T044 (US3 dashboard components) can run in parallel
- US3 and US4 can be worked on in parallel after US1+US2

---

## Parallel Example: User Story 2 (RSVP Form)

```text
# Launch all tests for US2 together:
Task: "Create E2E test for RSVP submission flow in tests/e2e/rsvp-flow.spec.ts"
Task: "Create E2E test for duplicate RSVP prevention in tests/e2e/duplicate-rsvp.spec.ts"
Task: "Create unit test for RSVP zod validation in tests/unit/validations.test.ts"
Task: "Create unit test for RSVP form component in tests/unit/rsvp-form.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Admin uploads template + landing page)
4. Complete Phase 4: User Story 2 (Guest submits RSVP)
5. **STOP and VALIDATE**: Test US1 + US2 together as MVP
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Landing page live
3. Add US2 → Test independently → RSVP flow complete (MVP!)
4. Add US3 → Test independently → Couple dashboard
5. Add US4 → Test independently → Admin full management
6. Polish → Final cleanup and optimization

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 → User Story 4
   - Developer B: User Story 2
   - Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
