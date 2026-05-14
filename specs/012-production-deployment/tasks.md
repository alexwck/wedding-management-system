# Tasks: Production Deployment

**Branch**: `012-production-deployment`  
**Input**: Design documents from `/specs/012-production-deployment/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: NOT included — this is an infrastructure deployment feature, not application code.

**Organization**: Tasks are grouped by user story to enable independent deployment and validation of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create `.github/workflows/` directory for CI/CD workflows
- [ ] T002 [P] Create Sentry configuration files at repository root (client, server, edge)
- [ ] T003 [P] Update `.env.example` with all required environment variables and `<PLACEHOLDER>` syntax
- [ ] T004 Install Sentry SDK: `npm install @sentry/nextjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create `DEPLOYMENT.md` in repository root with complete admin bootstrap documentation
- [ ] T006 [P] Create `.github/workflows/ci.yml` with GitHub Actions CI/CD pipeline
- [ ] T007 Update `spec.md` with any remaining gap resolutions from checklist

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Production Infrastructure Provisioning (Priority: P1) 🎯 MVP

**Goal**: Administrator sets up production Supabase and Vercel projects so application is live

**Independent Test**: Navigate to production URL and verify login page loads correctly

### Implementation for User Story 1

- [ ] T008 [US1] Create Supabase production project via supabase.com dashboard (manual step — documented in DEPLOYMENT.md)
- [ ] T009 [US1] Run `supabase link --project-ref <PROJECT_REF>` to link local CLI to production
- [ ] T010 [US1] Run `supabase db push` to apply all migrations to production database
- [ ] T011 [US1] Verify production schema matches local: `supabase db diff --use-migra`
- [ ] T012 [US1] Create Vercel production project: `vercel --prod` (link to GitHub repository)
- [ ] T013 [US1] Configure Vercel environment variables in Dashboard → Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL` (all envs)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (all envs)
  - `SUPABASE_SERVICE_ROLE_KEY` (production only)
  - `DATABASE_URL` (production only, direct connection port 5432)
- [ ] T014 [US1] Deploy to production: `vercel --prod`
- [ ] T015 [US1] Verify production deployment: navigate to `https://<project>.vercel.app` and confirm login page loads
- [ ] T016 [US1] Test wedding page: navigate to `/w/[slug]` and verify venue details + RSVP form render

**Checkpoint**: At this point, User Story 1 should be fully functional — production is live and accessible

---

## Phase 4: User Story 2 - CI/CD Pipeline with Quality Gates (Priority: P2)

**Goal**: Every push and PR triggers automated checks (lint, type-check, test); merges to main auto-deploy

**Independent Test**: Open a PR, observe all checks run, merge, confirm production URL reflects the change

### Implementation for User Story 2

- [ ] T017 [US2] Verify `.github/workflows/ci.yml` includes all required jobs: `lint`, `type-check`, `test`
- [ ] T018 [US2] Push workflow to GitHub: `git add .github/workflows/ci.yml && git push`
- [ ] T019 [US2] Verify GitHub Actions runs on next push — check Actions tab for workflow execution
- [ ] T020 [US2] Configure GitHub branch protection (manual step):
  - Settings → Branches → Add branch protection rule
  - Branch pattern: `main`
  - Enable: "Require a pull request before merging"
  - Enable: "Require status checks to pass before merging"
  - Select checks: `lint`, `type-check`, `test`
- [ ] T021 [US2] Test branch protection: open a PR with a failing test — verify merge is blocked
- [ ] T022 [US2] Test auto-deploy: merge a passing PR to main — verify Vercel auto-deploys within 5 minutes
- [ ] T023 [US2] Verify CI failure messages include: job name, link to Actions run, first 10 lines of error

**Checkpoint**: At this point, User Story 2 is complete — CI/CD pipeline enforces quality gates

---

## Phase 5: User Story 3 - Error Monitoring with Sentry (Priority: P3)

**Goal**: Production runtime errors captured and reported to Sentry within 30 seconds

**Independent Test**: Trigger a deliberate error in production; verify it appears in Sentry dashboard with stack trace

### Implementation for User Story 3

- [ ] T024 [US3] Create Sentry account and project at [sentry.io](https://sentry.io) (manual step)
- [ ] T025 [US3] Run Sentry wizard: `npx @sentry/wizard@latest -i nextjs` — follow prompts to auto-configure
- [ ] T026 [US3] Verify `sentry.client.config.ts` exists with correct DSN and `enabled: NODE_ENV === "production"`
- [ ] T027 [US3] Verify `sentry.server.config.ts` exists with correct DSN and production-only enabled
- [ ] T028 [US3] Verify `sentry.edge.config.ts` exists (for future edge function support)
- [ ] T029 [US3] Add `SENTRY_DSN` to Vercel environment variables (production only)
- [ ] T030 [US3] Deploy Sentry configuration: `vercel --prod`
- [ ] T031 [US3] Test error monitoring: temporarily add `throw new Error("test")` to a server action
- [ ] T032 [US3] Trigger test error in production — navigate to affected page
- [ ] T033 [US3] Verify error appears in Sentry Dashboard → Issues within 30 seconds
- [ ] T034 [US3] Revert test error and redeploy
- [ ] T035 [US3] Verify local development does NOT send errors to Sentry (check console for warning)

**Checkpoint**: At this point, User Story 3 is complete — production errors are monitored and reported

---

## Phase 6: User Story 4 - First Admin Account Bootstrapping (Priority: P1)

**Goal**: New administrator can create first admin account and log in following documented steps

**Independent Test**: Follow DEPLOYMENT.md on fresh deployment; successfully create admin and access admin dashboard

### Implementation for User Story 4

- [ ] T036 [US4] Verify `DEPLOYMENT.md` Section 6 includes step-by-step admin account creation instructions
- [ ] T037 [US4] Verify `DEPLOYMENT.md` includes both options:
  - Option A: Email signup via Supabase magic link
  - Option B: Manual creation via Supabase Dashboard → Authentication → Users
- [ ] T038 [US4] Verify `DEPLOYMENT.md` includes admin role grant instructions:
  - Supabase Dashboard → Users → Edit user metadata → `{"role": "admin"}`
- [ ] T039 [US4] Test bootstrap: follow DEPLOYMENT.md on production deployment — create admin account
- [ ] T040 [US4] Verify admin can log in and access admin dashboard at `/admin`
- [ ] T041 [US4] Verify admin can create additional admin and couple accounts from admin panel
- [ ] T042 [US4] Verify local development setup works: copy `.env.example` to `.env.local`, run `npm run dev`, create local admin

**Checkpoint**: At this point, User Story 4 is complete — admin bootstrap is documented and tested

---

## Phase 7: User Story 5 - Environment Configuration Management (Priority: P2)

**Goal**: Environment variables managed consistently between local and production with clear documentation

**Independent Test**: Compare `.env.example` against Vercel env vars; verify all required keys documented with placeholders

### Implementation for User Story 5

- [ ] T043 [US5] Verify `.env.example` documents all 10+ required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `SENTRY_DSN`
  - `SENTRY_ORG` (optional)
  - `SENTRY_PROJECT` (optional)
  - `SENTRY_AUTH_TOKEN` (optional)
  - `VERCEL_TOKEN` (optional)
- [ ] T044 [US5] Verify `.env.example` uses `<PLACEHOLDER>` syntax for all sensitive values (no real secrets)
- [ ] T045 [US5] Verify `.env.example` includes comments describing:
  - Where to get each value (dashboard path)
  - Which environments apply (local/production/all)
  - Free plan connection string format (port 5432)
- [ ] T046 [US5] Audit Vercel environment variables: confirm no development-only values in production
- [ ] T047 [US5] Verify secrets are encrypted at rest in Vercel (Dashboard → Settings → Environment Variables)
- [ ] T048 [US5] Verify no `.env.local` or secrets committed to git: `git ls-files | grep -i env`

**Checkpoint**: At this point, User Story 5 is complete — environment config is documented and secure

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T049 [P] Verify all Free plan monitoring requirements documented in DEPLOYMENT.md:
  - Supabase: 500MB DB, 2GB bandwidth, 50K MAU, 60 connections
  - Vercel: 100GB bandwidth, personal use only
  - Sentry: 10K errors/month, 7-day retention
- [ ] T050 [P] Verify rollback procedure documented in DEPLOYMENT.md: Vercel "Promote to Production"
- [ ] T051 [P] Verify monthly backup procedure documented (Supabase Free plan limitation)
- [ ] T052 [P] Add weekly usage monitoring reminder to DEPLOYMENT.md (calendar invite suggestion)
- [ ] T053 [P] Run full checklist validation: `specs/012-production-deployment/checklists/deployment.md`
- [ ] T054 [P] Update CLAUDE.md with plan reference (already done via /speckit-plan)
- [ ] T055 [P] Verify all spec clarifications integrated and consistent

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Dependencies | Notes |
|-------|--------------|-------|
| **Phase 1: Setup** | None | Can start immediately |
| **Phase 2: Foundational** | Phase 1 complete | BLOCKS all user stories |
| **Phase 3: US1** | Phase 2 complete | MVP — production live |
| **Phase 4: US2** | Phase 2 complete | Can run parallel to US1 |
| **Phase 5: US3** | Phase 2 complete | Can run parallel to US1/US2 |
| **Phase 6: US4** | Phase 3 complete | Requires production live |
| **Phase 7: US5** | Phase 2 complete | Can run parallel to US3/US4 |
| **Phase 8: Polish** | All phases complete | Final validation |

### User Story Dependencies

| User Story | Priority | Depends On | Independent Test |
|------------|----------|------------|------------------|
| **US1: Infrastructure** | P1 | Foundational (T005-T007) | Production URL loads login |
| **US2: CI/CD** | P2 | Foundational (T005-T007) | PR checks run, merge deploys |
| **US3: Sentry** | P3 | Foundational (T005-T007) | Test error appears in Sentry |
| **US4: Bootstrap** | P1 | US1 complete | Admin can create account |
| **US5: Env Config** | P2 | Foundational (T005-T007) | `.env.example` complete |

### Within Each User Story

1. Manual steps first (account creation, dashboard config)
2. Configuration files second (Sentry configs, workflows)
3. Verification steps last (test error, validate deployment)

### Parallel Opportunities

| Parallel Group | Tasks | Can Run Together |
|----------------|-------|------------------|
| **Setup** | T001, T002, T003, T004 | All 4 tasks — different files |
| **Foundational** | T005, T006, T007 | All 3 tasks — different files |
| **US1** | T008-T016 | Sequential (deployment pipeline) |
| **US2** | T017-T023 | T017-T019 parallel, T020 manual, T021-T023 sequential |
| **US3** | T024-T035 | T024-T028 parallel, T029-T035 sequential |
| **US4** | T036-T042 | Sequential (documentation validation) |
| **US5** | T043-T048 | T043-T045 parallel, T046-T048 parallel |
| **Polish** | T049-T055 | All 7 tasks — different files |

---

## Parallel Example: Setup Phase

```bash
# All 4 Setup tasks can run in parallel (different files, no dependencies):
Task: "Create .github/workflows/ directory"
Task: "Create Sentry config files (client, server, edge)"
Task: "Update .env.example with placeholders"
Task: "npm install @sentry/nextjs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: User Story 1 (T008-T016)
4. **STOP and VALIDATE**: Navigate to production URL, verify login loads
5. Deploy/demo if ready

### Incremental Delivery

| Phase | Deliverable | Validate |
|-------|-------------|----------|
| Setup + Foundational | CI/CD pipeline + DEPLOYMENT.md | Workflow runs, docs complete |
| + US1 | Production deployment live | Login page loads |
| + US2 | Automated quality gates | PR checks run, merge deploys |
| + US3 | Error monitoring | Test error in Sentry |
| + US4 | Admin bootstrap documented | Admin account created |
| + US5 | Environment config secure | `.env.example` complete |
| + Polish | Full deployment ready | Checklist validation |

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (production deployment)
   - Developer B: User Story 2 (CI/CD verification)
   - Developer C: User Story 3 (Sentry setup)
3. US4 and US5 can be assigned to any developer after US1 complete
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual steps (account creation, dashboard config) cannot be automated — follow DEPLOYMENT.md
- Free plan limits require weekly monitoring — set calendar reminders
