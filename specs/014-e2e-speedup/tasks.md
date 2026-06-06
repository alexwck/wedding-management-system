# Tasks: Speed Up Playwright E2E Suite

**Input**: Design documents from `/specs/014-e2e-speedup/`
**Prerequisites**: plan.md (required), spec.md (required)
**Tests**: E2E suite itself is the thing we are modifying; we verify via the same suite passing in full after each change.
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to. Format is `[US1]`, `[US2]`, etc. (US1 = Faster dev loop, US2 = Auth reused, US3 = Configurable projects, US4 = Prod build opt-in). US1 and US2 ship in the same phase (the 30 refactor tasks); the spec uses `[US1]` as the parent label for those tasks and the phase heading calls out that US1+US2 ship together.
- Include exact file paths in descriptions

---

## Phase 0: Baseline (Blocking Pre-Setup)

**Purpose**: Capture the SC-001 baseline before any code change so the success criterion is measurable.

**CRITICAL**: Phase 1 cannot start until this phase is complete.

- [x] T000 [P] Capture baseline wall time: on a clean dev server (Supabase up, `npm run dev` running), run `time npx playwright test --project=chromium` and record the wall-clock result. Commit the number in minutes to [plan.md Performance Goals](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md) (replace the `<TBD>` placeholder). The number is SC-001's denominator. Baseline: **7m24s (444s) for 160 tests, 157 pass / 3 fail**. The 3 failures break down as 2 caused by the new default-admin storageState (will be fixed by Phase 3 per-spec opt-outs: T012 for couple-dashboard, and the floor-plan.spec.ts:95 case via test.use({ storageState: empty })) and 1 pre-existing snapshot drift in design/admin-dashboard-audit.test.ts unrelated to feature 014. SC-001 target: <= 4 min AND <= 40% of 444s = <= 178s. The 4-min wall time target may need revisiting after Phase 3 if the suite as a whole doesn't drop that far (auth reuse is the dominant win; the 2 forced-failure cases should drop right back to passing once their specs opt out).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create `tests/e2e/auth.setup.ts` with two `setup()` blocks: one for `admin@example.com` writing `playwright/.auth/admin.json`, one for `alex@example.com` writing `playwright/.auth/couple.json`. Each block does the existing inline login flow + `waitForURL` + `waitForLoadState("networkidle")` + `context.storageState({ path })`. File begins with `test.use({ storageState: { cookies: [], origins: [] } })`.
- [x] T002 [P] Add `playwright/.auth/` to `.gitignore` so generated storage state is never committed.
- [x] T003 [P] Add `test:e2e:prod` script to `package.json` that sets `PW_USE_PROD=1` and re-runs `playwright test`.

**Checkpoint**: Helper file in place, gitignore updated, prod script wired.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core config change in `playwright.config.ts` that the spec work depends on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Rewrite `playwright.config.ts`:
  - Add a `setup` project with `testMatch: /.*\.setup\.ts/`.
  - Add `dependencies: ["setup"]` to both `chromium` and `Mobile Chrome`.
  - Default `chromium` to `storageState: "playwright/.auth/admin.json"`.
  - Default `Mobile Chrome` to `storageState: "playwright/.auth/couple.json"`.
  - Conditionally include `Mobile Chrome` in `projects` only when `process.env.CI` is set.
  - Conditionally swap `webServer.command` to `npm run build && npm run start` when `process.env.PW_USE_PROD` is set; bump `webServer.timeout` to 180_000 in that branch.
- [x] T005 [P] Create the empty `playwright/.auth/` directory with a `.gitkeep` so the directory exists in a clean checkout (the .gitignore entry above prevents content from being committed).

**Checkpoint**: Config change compiles. `npx playwright test --list` shows `setup`, `chromium`, and (with `CI=1`) `Mobile Chrome`.

---

## Phase 3: User Story 1 + User Story 2 (Priority: P1) - Faster runs + Auth reused

**Goal**: Specs no longer perform inline login; they consume `storageState`. Login-flow specs opt out.

**Independent Test**: `time npx playwright test --project=chromium` finishes substantially faster than the baseline, with the same specs passing.

### Refactor: remove inline login from each spec

For each file below: delete the inline `page.goto('/auth/login')` + fill + submit + `waitForURL` block. If the spec also has role-specific helpers (e.g. `ensureWeddingUnlocked` in `admin-lock.spec.ts`), keep the helper but rewrite its first 4 lines to either (a) no-op if `chromium` already has admin storage, or (b) explicitly call `loginAs()` only when the helper is invoked from a non-storageState context.

- [ ] T006 [P] [US1] Refactor `tests/e2e/access-control.spec.ts`
- [ ] T007 [P] [US1] Refactor `tests/e2e/accessibility-audit.spec.ts`
- [ ] T008 [P] [US1] Refactor `tests/e2e/admin-lock.spec.ts` (preserve `ensureWeddingUnlocked` helper)
- [ ] T009 [P] [US1] Refactor `tests/e2e/admin-manage.spec.ts`
- [ ] T010 [P] [US1] Refactor `tests/e2e/admin-mobile.spec.ts`
- [ ] T011 [P] [US1] Refactor `tests/e2e/admin-seat-view.spec.ts`
- [x] T012 [P] [US1] Refactor `tests/e2e/couple-dashboard.spec.ts` (this one needs couple storage; add `test.use({ storageState: "playwright/.auth/couple.json" })` at top)
- [x] T013 [P] [US1] Refactor `tests/e2e/couple-mobile.spec.ts` (couple storage)
- [ ] T014 [P] [US1] Refactor `tests/e2e/dashboard-layout.spec.ts`
- [ ] T015 [P] [US1] Refactor `tests/e2e/editable-couple-name.spec.ts`
- [ ] T016 [P] [US1] Refactor `tests/e2e/floor-plan-catalog-disable.spec.ts`
- [ ] T017 [P] [US1] Refactor `tests/e2e/floor-plan-fixes.spec.ts`
- [ ] T018 [P] [US1] Refactor `tests/e2e/floor-plan-item-placement.spec.ts`
- [x] T019 [P] [US1] Refactor `tests/e2e/floor-plan-save-oob.spec.ts`
- [ ] T020 [P] [US1] Refactor `tests/e2e/floor-plan.spec.ts`
- [ ] T021 [P] [US1] Refactor `tests/e2e/guest-panel.spec.ts`
- [ ] T022 [P] [US1] Refactor `tests/e2e/guest-rsvp-mobile.spec.ts`
- [ ] T023 [P] [US1] Refactor `tests/e2e/item-resize.spec.ts`
- [ ] T024 [P] [US1] Refactor `tests/e2e/rsvp-dashboard-seats.spec.ts`
- [ ] T025 [P] [US1] Refactor `tests/e2e/rsvp-flow.spec.ts` (most of this spec is public-page work; only the optional admin pre-flight uses login)
- [ ] T026 [P] [US1] Refactor `tests/e2e/rsvp-single-page.spec.ts`
- [ ] T027 [P] [US1] Refactor `tests/e2e/rsvp-sorting.spec.ts`
- [ ] T028 [P] [US1] Refactor `tests/e2e/seat-assignment.spec.ts`
- [ ] T029 [P] [US1] Refactor `tests/e2e/template-crop.spec.ts`
- [ ] T030 [P] [US1] Refactor `tests/e2e/template-focal-point.spec.ts`
- [ ] T031 [P] [US1] Refactor `tests/e2e/template-image-refresh.spec.ts`
- [ ] T032 [P] [US1] Refactor `tests/e2e/undo-redo-audit.spec.ts`
- [ ] T033 [P] [US1] Refactor `tests/e2e/upload.spec.ts`
- [ ] T034 [P] [US1] Refactor `tests/e2e/venue-details.spec.ts`
- [ ] T035 [P] [US1] Refactor `tests/e2e/wedding-date.spec.ts`
- [ ] T036 [P] [US1] Refactor `tests/e2e/xlsx-export.spec.ts`

### Opt-out: specs that must keep a fresh context

- [ ] T037 [P] [US2] `tests/e2e/rsvp-flow.spec.ts` (the public-page half is fine, but if it has a `ensureWeddingUnlocked` style helper for the admin unlock pre-flight, that helper keeps its own login block; document with a comment)
- [ ] T038 [P] [US2] `tests/e2e/invalid-login.spec.ts` - add `test.use({ storageState: { cookies: [], origins: [] } })` at top
- [ ] T039 [P] [US2] `tests/e2e/logout.spec.ts` - add `test.use({ storageState: "playwright/.auth/admin.json" })` so the spec starts logged in, then exercises the logout button
- [ ] T040 [P] [US2] `tests/e2e/root-redirect.spec.ts` - keep as-is; the spec intentionally visits `/auth/login` to test redirects. Add a comment explaining why storageState is not used here.

**Checkpoint**: `npx playwright test --project=chromium` runs and passes with the same scenarios as before.

---

## Phase 4: User Story 3 (Priority: P2) - Mobile Chrome gated on CI

**Goal**: Default local run is `chromium` only; `CI=1` adds `Mobile Chrome`.

**Independent Test**: With `CI` unset, `npx playwright test --list` shows only `setup` + `chromium`. With `CI=1`, it also shows `Mobile Chrome`.

- [x] T041 [US3] Confirm the conditional in `playwright.config.ts` works (T004 should already cover this). Run `npx playwright test --list` and assert output.
- [x] T042 [P] [US3] Run `CI=1 npx playwright test --list` and assert `Mobile Chrome` is in the output.

**Checkpoint**: Local default is single project; CI default is both.

---

## Phase 5: User Story 4 (Priority: P3) - Production build opt-in

**Goal**: `PW_USE_PROD=1 npm run test:e2e` runs against `next start`.

**Independent Test**: Run `PW_USE_PROD=1 npm run test:e2e -- --grep "RSVP submission flow"` and confirm same pass/fail as dev mode.

- [ ] T043 [US4] Run `PW_USE_PROD=1 npm run test:e2e -- --grep "RSVP submission flow"` and confirm same pass/fail as dev mode.
- [ ] T044 [US4] If the prod webServer fails to start, adjust `playwright.config.ts` `webServer` block in the `isProd` branch. Common fix: increase `webServer.timeout` to 240_000 for first build.

**Checkpoint**: `test:e2e:prod` works end-to-end on a representative subset.

---

## Phase 6: Polish - Docs (AGENTS.md)

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

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (Baseline)**: No dependencies. Must complete before Phase 1 starts.
- **Phase 1 (Setup)**: Depends on Phase 0. Can run after baseline is recorded.
- **Phase 2 (Foundational)**: Depends on Phase 1. **BLOCKS all user stories** - the new
  `playwright.config.ts` shape is required before any spec refactor.
- **Phase 3 (US1 + US2)**: Depends on Phase 2. The 30 spec refactors are independent of
  each other and can be parallelized across workers.
- **Phase 4 (US3)**: Depends on Phase 2 (config change). Verification only - no new code.
- **Phase 5 (US4)**: Depends on Phase 2 (config change). Verification only - no new code.
- **Phase 6 (Docs)**: Depends on Phase 3, 4, 5 (documents the new workflow).
- **Cross-cutting verification (T047-T053)**: Depends on all phases.

### User Story Dependencies

- **US1 (Faster dev loop)**: Can start after Phase 2. No dependency on US2-US4.
- **US2 (Auth reused)**: Ships together with US1 (same refactor). No dependency on US3/US4.
- **US3 (Configurable projects)**: Pure config change in Phase 2. Verified in Phase 4.
- **US4 (Prod build opt-in)**: Pure config + script in Phase 2. Verified in Phase 5.

### Within Each Phase

- US1+US2 refactor tasks (T006-T036) are all `[P]` - they touch 30 different spec files and
  have no inter-spec dependencies. Run them in any order, or in parallel up to worker count.
- US1+US2 opt-out tasks (T037-T040) are `[P]` for the same reason.
- The 3 out-of-scope verification tasks (T052) and the 2 helper-doc tasks (T053) are `[P]`.

---

## Parallel Opportunities

- All Phase 1 tasks (T001-T003) are `[P]`.
- All 30 US1+US2 refactor tasks (T006-T036) are `[P]` and can be parallelized.
- All 4 US1+US2 opt-out tasks (T037-T040) are `[P]`.
- The 3 out-of-scope verification tasks (T052) and 2 helper-doc tasks (T053) are `[P]`.
- The 2 docs tasks (T045, T046) are `[P]`.

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 0: Baseline (T000) - record current wall time.
2. Complete Phase 1: Setup (T001-T003) - 3 independent infra files.
3. Complete Phase 2: Foundational (T004-T005) - the config rewrite. This is the riskiest
   step. **STOP and VALIDATE here**: `npx playwright test --list` shows the new project
   shape; a smoke test (one spec) passes under the new config.
4. Complete Phase 3: US1+US2 (T006-T040) - 35 refactor tasks. Run them in any order.
5. **STOP and VALIDATE**: `npx playwright test --project=chromium` finishes, all 37 spec
   files still execute, wall time drops below the SC-001 gate.
6. The MVP delivers the bulk of the speedup. US3 (mobile gating) and US4 (prod build) are
   smaller wins and can ship in the same release or a follow-up.

### Incremental Delivery

1. Phase 0 + Phase 1 + Phase 2 (T000-T005) - foundation ready; speedup not yet visible.
2. Phase 3 (T006-T040) - 32 specs refactored; auth reuse working; **MVP**.
3. Phase 4 (T041-T042) - mobile gated on CI; visible change in dev-loop command.
4. Phase 5 (T043-T044) - prod build opt-in; opt-in command available.
5. Phase 6 (T045-T046) - AGENTS.md updated; workflow documented.
6. Cross-cutting verification (T047-T053) - SC-001..SC-005 measured; feature complete.

### Pause / Checkpoint Plan

- After Phase 2: run `npx playwright test tests/e2e/access-control.spec.ts --project=chromium`
  as a smoke test. If it fails, debug the config before touching 30 specs.
- After Phase 3 (every ~10 specs): run `npx playwright test --project=chromium` to catch
  regressions early.
- After Phase 6: run the full SC verification matrix in
  [quickstart.md §"Verify all success criteria"](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/quickstart.md).


---

## Traceability: FR / SC / US -> Task map

This table makes the spec-to-tasks mapping explicit so a reviewer can verify
coverage at a glance. The mapping is also enforced by [checklists/requirements-quality.md §CHK003](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/checklists/requirements-quality.md).

| Spec ID | Description | Task IDs |
|---|---|---|
| FR-001 | Add `setup` project that signs in as admin + couple, writes storageState | T001, T002, T005 |
| FR-002 | Per-project default storageState (chromium=admin, mobile=couple) with opt-out | T004 (config), T012, T013 (opt-in for couple specs) |
| FR-003 | Refactor 32 specs to remove inline login | T006-T036 (in-scope) + T037-T040 (opt-out) |
| FR-004 | Mobile Chrome conditional on `CI=1` | T004 (config) |
| FR-005 | `test:e2e:prod` opt-in with build-reuse | T003 (package.json) + T004 (webServer branch) |
| FR-006 | Gitignore `playwright/.auth/` | T002 |
| FR-007 | AGENTS.md docs update | T045, T046 |
| SC-001 | Wall time <= 4 min AND <= 40% of baseline | T000 (capture) + T047 (verify) |
| SC-002 | All 37 spec files preserved | T049 (grep audit) + T052 (5 out-of-scope) + T053 (2 helpers) |
| SC-003 | CI=1 includes both projects | T004 (config) + T041, T042 (verify) + T048 (CI run) |
| SC-004 | <= 4 POSTs to Supabase auth per run | T049 (grep audit) + post-run network trace |
| SC-005 | `test:e2e:prod` same pass/fail as dev | T003 + T043 (prod run) + T044 (debug if needed) |
| US1 | Faster dev-loop test runs | T000, T003, T004, T006-T036, T047 |
| US2 | Auth state reused across tests | T001, T004, T006-T036, T037-T040 |
| US3 | Configurable browser projects | T004, T041, T042 |
| US4 | Production build opt-in | T003, T004, T043, T044 |
