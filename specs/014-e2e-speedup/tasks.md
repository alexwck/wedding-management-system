# Tasks: Speed Up Playwright E2E Suite

**Input**: Design documents from `/specs/014-e2e-speedup/`
**Prerequisites**: plan.md (required), spec.md (required)
**Tests**: E2E suite itself is the thing we are modifying; we verify via the same suite passing in full after each change.
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create `tests/e2e/auth.setup.ts` with two `setup()` blocks: one for `admin@example.com` writing `playwright/.auth/admin.json`, one for `alex@example.com` writing `playwright/.auth/couple.json`. Each block does the existing inline login flow + `waitForURL` + `waitForLoadState("networkidle")` + `context.storageState({ path })`. File begins with `test.use({ storageState: { cookies: [], origins: [] } })`.
- [ ] T002 [P] Add `playwright/.auth/` to `.gitignore` so generated storage state is never committed.
- [ ] T003 [P] Add `test:e2e:prod` script to `package.json` that sets `PW_USE_PROD=1` and re-runs `playwright test`.

**Checkpoint**: Helper file in place, gitignore updated, prod script wired.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core config change in `playwright.config.ts` that the spec work depends on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Rewrite `playwright.config.ts`:
  - Add a `setup` project with `testMatch: /.*\.setup\.ts/`.
  - Add `dependencies: ["setup"]` to both `chromium` and `Mobile Chrome`.
  - Default `chromium` to `storageState: "playwright/.auth/admin.json"`.
  - Default `Mobile Chrome` to `storageState: "playwright/.auth/couple.json"`.
  - Conditionally include `Mobile Chrome` in `projects` only when `process.env.CI` is set.
  - Conditionally swap `webServer.command` to `npm run build && npm run start` when `process.env.PW_USE_PROD` is set; bump `webServer.timeout` to 180_000 in that branch.
- [ ] T005 [P] Create the empty `playwright/.auth/` directory with a `.gitkeep` so the directory exists in a clean checkout (the .gitignore entry above prevents content from being committed).

**Checkpoint**: Config change compiles. `npx playwright test --list` shows `setup`, `chromium`, and (with `CI=1`) `Mobile Chrome`.

---

## Phase 3: User Story 1+2 - Faster runs + Auth reused (Priority: P1)

**Goal**: Specs no longer perform inline login; they consume `storageState`. Login-flow specs opt out.

**Independent Test**: `time npx playwright test --project=chromium` finishes substantially faster than the baseline, with the same specs passing.

### Refactor: remove inline login from each spec

For each file below: delete the inline `page.goto('/auth/login')` + fill + submit + `waitForURL` block. If the spec also has role-specific helpers (e.g. `ensureWeddingUnlocked` in `admin-lock.spec.ts`), keep the helper but rewrite its first 4 lines to either (a) no-op if `chromium` already has admin storage, or (b) explicitly call `loginAs()` only when the helper is invoked from a non-storageState context.

- [ ] T006 [P] [US1/US2] Refactor `tests/e2e/access-control.spec.ts`
- [ ] T007 [P] [US1/US2] Refactor `tests/e2e/accessibility-audit.spec.ts`
- [ ] T008 [P] [US1/US2] Refactor `tests/e2e/admin-lock.spec.ts` (preserve `ensureWeddingUnlocked` helper)
- [ ] T009 [P] [US1/US2] Refactor `tests/e2e/admin-manage.spec.ts`
- [ ] T010 [P] [US1/US2] Refactor `tests/e2e/admin-mobile.spec.ts`
- [ ] T011 [P] [US1/US2] Refactor `tests/e2e/admin-seat-view.spec.ts`
- [ ] T012 [P] [US1/US2] Refactor `tests/e2e/couple-dashboard.spec.ts` (this one needs couple storage; add `test.use({ storageState: "playwright/.auth/couple.json" })` at top)
- [ ] T013 [P] [US1/US2] Refactor `tests/e2e/couple-mobile.spec.ts` (couple storage)
- [ ] T014 [P] [US1/US2] Refactor `tests/e2e/dashboard-layout.spec.ts`
- [ ] T015 [P] [US1/US2] Refactor `tests/e2e/editable-couple-name.spec.ts`
- [ ] T016 [P] [US1/US2] Refactor `tests/e2e/floor-plan-catalog-disable.spec.ts`
- [ ] T017 [P] [US1/US2] Refactor `tests/e2e/floor-plan-fixes.spec.ts`
- [ ] T018 [P] [US1/US2] Refactor `tests/e2e/floor-plan-item-placement.spec.ts`
- [ ] T019 [P] [US1/US2] Refactor `tests/e2e/floor-plan-save-oob.spec.ts`
- [ ] T020 [P] [US1/US2] Refactor `tests/e2e/floor-plan.spec.ts`
- [ ] T021 [P] [US1/US2] Refactor `tests/e2e/guest-panel.spec.ts`
- [ ] T022 [P] [US1/US2] Refactor `tests/e2e/guest-rsvp-mobile.spec.ts`
- [ ] T023 [P] [US1/US2] Refactor `tests/e2e/item-resize.spec.ts`
- [ ] T024 [P] [US1/US2] Refactor `tests/e2e/rsvp-dashboard-seats.spec.ts`
- [ ] T025 [P] [US1/US2] Refactor `tests/e2e/rsvp-flow.spec.ts` (most of this spec is public-page work; only the optional admin pre-flight uses login)
- [ ] T026 [P] [US1/US2] Refactor `tests/e2e/rsvp-single-page.spec.ts`
- [ ] T027 [P] [US1/US2] Refactor `tests/e2e/rsvp-sorting.spec.ts`
- [ ] T028 [P] [US1/US2] Refactor `tests/e2e/seat-assignment.spec.ts`
- [ ] T029 [P] [US1/US2] Refactor `tests/e2e/template-crop.spec.ts`
- [ ] T030 [P] [US1/US2] Refactor `tests/e2e/template-focal-point.spec.ts`
- [ ] T031 [P] [US1/US2] Refactor `tests/e2e/template-image-refresh.spec.ts`
- [ ] T032 [P] [US1/US2] Refactor `tests/e2e/undo-redo-audit.spec.ts`
- [ ] T033 [P] [US1/US2] Refactor `tests/e2e/upload.spec.ts`
- [ ] T034 [P] [US1/US2] Refactor `tests/e2e/venue-details.spec.ts`
- [ ] T035 [P] [US1/US2] Refactor `tests/e2e/wedding-date.spec.ts`
- [ ] T036 [P] [US1/US2] Refactor `tests/e2e/xlsx-export.spec.ts`

### Opt-out: specs that must keep a fresh context

- [ ] T037 [P] [US2] `tests/e2e/rsvp-flow.spec.ts` (the public-page half is fine, but if it has a `ensureWeddingUnlocked` style helper for the admin unlock pre-flight, that helper keeps its own login block; document with a comment)
- [ ] T038 [P] [US2] `tests/e2e/invalid-login.spec.ts` - add `test.use({ storageState: { cookies: [], origins: [] } })` at top
- [ ] T039 [P] [US2] `tests/e2e/logout.spec.ts` - add `test.use({ storageState: "playwright/.auth/admin.json" })` so the spec starts logged in, then exercises the logout button
- [ ] T040 [P] [US2] `tests/e2e/root-redirect.spec.ts` - keep as-is; the spec intentionally visits `/auth/login` to test redirects. Add a comment explaining why storageState is not used here.

**Checkpoint**: `npx playwright test --project=chromium` runs and passes with the same scenarios as before.

---

## Phase 4: User Story 3 - Mobile Chrome gated on CI (Priority: P2)

**Goal**: Default local run is `chromium` only; `CI=1` adds `Mobile Chrome`.

**Independent Test**: With `CI` unset, `npx playwright test --list` shows only `setup` + `chromium`. With `CI=1`, it also shows `Mobile Chrome`.

- [ ] T041 [US3] Confirm the conditional in `playwright.config.ts` works (T004 should already cover this). Run `npx playwright test --list` and assert output.
- [ ] T042 [P] [US3] Run `CI=1 npx playwright test --list` and assert `Mobile Chrome` is in the output.

**Checkpoint**: Local default is single project; CI default is both.

---

## Phase 5: User Story 4 - Production build path (Priority: P3)

**Goal**: `PW_USE_PROD=1 npm run test:e2e` runs against `next start`.

**Independent Test**: Run `PW_USE_PROD=1 npm run test:e2e -- --grep "RSVP submission flow"` and confirm same pass/fail as dev mode.

- [ ] T043 [US4] Run `PW_USE_PROD=1 npm run test:e2e -- --grep "RSVP submission flow"` and confirm same pass/fail as dev mode.
- [ ] T044 [US4] If the prod webServer fails to start, adjust `playwright.config.ts` `webServer` block in the `isProd` branch. Common fix: increase `webServer.timeout` to 240_000 for first build.

**Checkpoint**: `test:e2e:prod` works end-to-end on a representative subset.

---

## Phase 6: Docs (AGENTS.md)

**Goal**: Future contributors know the new dev workflow and the trade-offs.

- [ ] T045 [P] Add a "E2E speed tips" section to `AGENTS.md`:
  - Use `--project=chromium` for day-to-day dev.
  - Run with `CI=1` to include mobile.
  - Use `PW_USE_PROD=1 npm run test:e2e` to test against a webpack production build.
  - Auth state lives in `playwright/.auth/`. Re-run `npx playwright test` (the setup project re-creates it on every invocation) if sessions look stale.
  - The `setup` project writes a new storage state on every run; do not commit it.
- [ ] T046 [P] Add a one-line gotcha: "If `Mobile Chrome` is not configured, you are running the dev-loop config. Mobile parity is only enforced in CI by default."

**Checkpoint**: AGENTS.md updated; the speedup story is documented at the same level as the other gotchas.

---

## Cross-cutting verification

- [ ] T047 Run `npm run test:e2e -- --project=chromium` end-to-end on a clean dev server. Record wall time; compare to baseline.
- [ ] T048 Run `CI=1 npm run test:e2e` end-to-end. Confirm both projects run and pass.
- [ ] T049 Spot-check: `grep -rn "page.goto.*auth/login" tests/e2e/ | wc -l` should drop from ~30 to a small number (only login-flow specs + a couple of helpers).
- [ ] T050 Verify with `npx playwright test --list` that the projects array is what we expect.
- [ ] T051 Run `npm run test` (unit tests) to confirm no incidental breakage. Unit suite is untouched but we want a clean CI run.

### Inventory alignment with spec

- [ ] T052 [P] Verify the 3 specs that do not log in (`duplicate-rsvp.spec.ts`, `landing-page.spec.ts`, `lighthouse-audit.spec.ts`) still pass without any change. They consume the default `chromium` storageState but never hit an authed route, so they should be green.
- [ ] T053 [P] In `tests/e2e/admin-lock.spec.ts` and `tests/e2e/rsvp-flow.spec.ts`, add a one-line comment above the `ensureWeddingUnlocked` / inline-login block noting that the helper intentionally keeps its own login block because some flows need to log in as a different role mid-test.

**Checkpoint**: All success criteria in spec.md (SC-001..SC-005) measured and met.
