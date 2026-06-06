# Feature Specification: Speed Up Playwright E2E Suite

**Feature Branch**: `014-e2e-speedup`
**Created**: 2026-06-06
**Status**: Draft
**Input**: User pain point: "Playwright is taking up a lot of the time during development."

## User Scenarios & Testing

### User Story 1 - Faster dev-loop test runs (Priority: P1)

**Description**: As a developer iterating on a feature, I want `npm run test:e2e` (or a filtered subset) to finish in a small fraction of its current wall time so I can use it as part of my red-green loop, not as a separate "I have time to run the full suite" task.

**Why this priority**: Test latency is the single biggest reason engineers skip running tests during development. A test suite that takes ~15-20 minutes is essentially gated to "run before merging." A suite that runs in 3-4 minutes can be re-run after every meaningful change.

**Independent Test**: Run `time npx playwright test --project=chromium --grep <a representative spec>` locally on a clean dev server and confirm the result. Compare against the baseline.

**Acceptance Scenarios**:
1. **Given** a developer has made a change to a single feature, **When** they run `npx playwright test <feature>.spec.ts --project=chromium`, **Then** the run completes in a small fraction of the time the equivalent command takes today, with the same pass/fail outcome.
2. **Given** the full suite is run on CI (where `Mobile Chrome` is also required), **When** the run finishes, **Then** total wall time is dominated by actual interaction time, not by repeated setup.

### User Story 2 - Auth state reused across tests (P1, 32 specs) (Priority: P1)

**Description**: As a maintainer, I want admin and couple sign-in to happen once per Playwright run (not once per test), so that suites with 32 specs that need auth (out of 37 E2E spec files) stop paying for ~32 server-side session-cookie round-trips and ~32 dashboard renders behind a fresh login.

**Why this priority**: Auditing `tests/e2e/*.spec.ts`, every spec that touches the admin or couple dashboard opens `/auth/login`, fills credentials, submits, and waits for the post-login redirect. That is the largest single source of test latency and it is pure duplication.

**Independent Test**: Run the suite with Playwright's `--debug` or a one-line trace and count the number of POSTs to the Supabase auth endpoint. Should be `1` (or a small constant) instead of `~30`.

**Acceptance Scenarios**:
1. **Given** the Playwright config is updated with a `setup` project, **When** any spec that needs admin/couple auth runs, **Then** the spec does not need to log in via the UI - it picks up a storageState file written once by the setup project.
2. **Given** a spec that intentionally tests the login flow (e.g. `rsvp-flow.spec.ts`, `invalid-login.spec.ts`), **When** that spec runs, **Then** it uses its own explicit login (or no storageState) and is not affected by the shared state.

### User Story 3 - Configurable browser projects (Priority: P2)

**Description**: As a developer, I want the default local run to use a single project (Desktop Chrome) and the mobile project to be opt-in (default: on for CI, off for local), so I am not paying for a Pixel 5 boot on every change.

**Why this priority**: The mobile project doubles spec count in the local dev loop. `playwright.config.ts` already has a comment calling this out, but the toggle is missing.

**Independent Test**: Compare wall time of `npx playwright test` with `Mobile Chrome` enabled vs. disabled locally.

**Acceptance Scenarios**:
1. **Given** I am running tests locally (no `CI` env var), **When** I run `npx playwright test`, **Then** only the `chromium` project runs.
2. **Given** CI is running the suite (`CI=1` is set), **When** the suite runs, **Then** both `chromium` and `Mobile Chrome` projects run.

### User Story 4 - Test against a production build locally (Priority: P3)

**Description**: As a developer, I want an opt-in command to run the E2E suite against a built-and-served production build (`next build && next start`) instead of the Turbopack dev server, so I can avoid the "stale 404" / on-demand-compile cost that AGENTS.md already flags as a recurring gotcha.

**Why this priority**: Smaller win than #1 and #2 but it removes a known source of flake + slow first-hit compilation that AGENTS.md documents. P3 because it changes the "default" command and needs careful rollout.

**Independent Test**: Run `time npx playwright test <subset>` once with `npm run dev` and once with `npm run build && npm run start` on the same machine. Compare wall time and stability.

**Acceptance Scenarios**:
1. **Given** the user runs `npm run test:e2e:prod` (or an equivalent script added in this feature), **When** tests execute, **Then** they target `next start` output on a stable port and a clean Playwright `webServer` config.
2. **Given** `npm run test:e2e` (dev mode) still works, **When** a developer uses it, **Then** the experience is unchanged from today.

## Spec inventory

- 37 E2E spec files total.
- 32 perform inline `/auth/login` (in scope for refactor, listed in T006-T036 in [tasks.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/tasks.md)).
- 3 do not log in and are out of scope for the refactor: `duplicate-rsvp.spec.ts`, `landing-page.spec.ts`, `lighthouse-audit.spec.ts` (the last uses `chrome-launcher` directly).
- 2 use a higher-level helper (`admin-lock.spec.ts`, `rsvp-flow.spec.ts`): the helper itself is preserved with the login block kept inside, so the refactor for those files is "do nothing" plus a clarifying comment.

## Clarifications

### Session 2026-06-06

- Q: Baseline wall-time gate for SC-001 (option)? -> A: A - Pin baseline + target. SC-001 becomes "wall time <= 4 min on the dev machine, AND <= 40% of the captured baseline of X min." Two concrete numbers, one ratio sanity check. (Integration pending baseline measurement.)

- Q: Default storageState per project? -> A: A - `chromium=admin`, `Mobile Chrome=couple`. Matches the role skew of each project (desktop ~85% admin, mobile skews couple/public). `couple-dashboard.spec.ts` and `couple-mobile.spec.ts` add `test.use({ storageState: "playwright/.auth/couple.json" })` to opt in. Every other spec uses the project default.

- Q: `test:e2e:prod` build policy? -> A: B - Reuse existing build when present. Script runs `next build` only if `.next/BUILD_ID` is missing or older than `package.json` mtime; otherwise starts the server. Matches the project's existing `reuseExistingServer` pattern in playwright.config.ts.

- Q: Baseline capture policy? -> A: A - New task added to tasks.md. Owner (the user, or whoever runs the implementation) runs `time npx playwright test --project=chromium` against a clean dev server, records the wall time, and commits the number to plan.md Performance Goals block. Result becomes SC-001's denominator. Required before Phase 1 of implementation begins; Phase 1 cannot start until the baseline is recorded.

## Edge Cases

- **Flaky from storageState**: If the auth state file is stale (e.g. user was deleted in seed reset) the suite will fail in confusing ways. The setup project must run before specs that depend on it, and CI must re-run setup whenever the DB is reseeded.
- **Login flow tests**: A small number of specs intentionally cover the login UI. They must opt out of the shared storageState (use a fresh context) so they still hit `/auth/login` and exercise the form.
- **Logout tests**: `logout.spec.ts` invalidates the session. It must run with its own fresh context and must not be ordered before specs that depend on the shared state.
- **Mobile parity gap**: If `Mobile Chrome` is disabled locally, regressions to the mobile UI will not be caught until CI. This trade-off must be visible in the spec/PR description, not hidden in config.
- **Test data isolation**: AGENTS.md's "Test data isolation" rule is unchanged. Some admin specs mutate shared seed data; the speedup work must not make their flakiness worse.

## Requirements

### Functional

- **FR-001**: Add a `setup` project to `playwright.config.ts` that signs in as `admin@example.com` (admin) and `alex@example.com` (couple) once per run, writing `playwright/.auth/admin.json` and `playwright/.auth/couple.json` to disk.
- **FR-002**: Configure `chromium` to load `playwright/.auth/admin.json` by default and `Mobile Chrome` to load `playwright/.auth/couple.json` by default. Both projects depend on the `setup` project. Per-spec opt-out is `test.use({ storageState: "playwright/.auth/{role}.json" })` for the non-default role, or `test.use({ storageState: { cookies: [], origins: [] } })` for fresh-context specs (login flow, logout, invalid login).
- **FR-003**: Refactor every spec in `tests/e2e/` that performs a UI login to use the shared storageState by default. Specs that need a fresh context (login UI, logout, invalid login) must call `test.use({ storageState: { cookies: [], origins: [] } })`.
- **FR-004**: Make the `Mobile Chrome` project conditional on `process.env.CI`. When unset, the project is excluded from `playwright.config.ts`'s `projects` array.
- **FR-005**: Add an opt-in script `test:e2e:prod` to `package.json` that runs `playwright test` with `PW_USE_PROD=1`. The Playwright `webServer` block runs `next build` only when `.next/BUILD_ID` is missing or older than `package.json` mtime; otherwise it runs `next start` directly. This matches the project's existing `webServer.reuseExistingServer` pattern.
- **FR-006**: Add `playwright/.auth/` to `.gitignore` so generated storage state is never committed.
- **FR-007**: Document the new dev workflow in `AGENTS.md` (run-filter pattern, when to enable mobile, when to use prod build).

### Non-Functional

- **NFR-001 - Same pass/fail outcome**: Every spec that passes today must still pass after the refactor, with the same semantic assertions. No test is allowed to be deleted, skipped, or have its assertions weakened as part of this work.
- **NFR-002 - Constitution compliance**: All work follows the speckit workflow. The unit/component tier is unaffected.
- **NFR-003 - Workers**: `workers: 1` is preserved for any spec file that depends on shared seed-data state. `fullyParallel: true` is allowed only for specs that opt in via `test.describe.configure({ mode: "parallel" })` and that AGENTS.md's "Test data isolation" notes confirm as safe.
- **NFR-004 - Determinism**: The `setup` project must use a fixed wait for the post-login redirect (`waitForURL`) so the storageState captures a fully bootstrapped session, not a mid-redirect one.

### Key Entities

- **Playwright Project**: a named browser configuration (chromium, Mobile Chrome, setup). Defined in `playwright.config.ts`.
- **StorageState**: a JSON file on disk holding cookies + localStorage for one logged-in user. Re-used across tests in a run.
- **Setup Project**: a Playwright project that runs once per run (no `testMatch` against specs) and writes StorageState files that dependents consume.

## Success Criteria

- **SC-001 (Speed)**: `time npx playwright test --project=chromium` on the developer machine completes in **<= 4 minutes wall time AND <= 40% of the captured baseline**. The baseline (T-pending, to be captured in Phase 1) is the wall time of the same command on this branch *before* any code change from feature 014 lands. The primary savings come from one login per run instead of ~32, and from skipping Turbopack dev on local runs that don't need it.
- **SC-002 (Coverage unchanged)**: All 37 E2E spec files and their scenarios are preserved. No spec is dropped or weakened. The 32 specs that currently perform inline login continue to cover the same flows via storageState; the 5 that do not log in are unchanged.
- **SC-003 (CI parity)**: With `CI=1`, both `chromium` and `Mobile Chrome` projects run. Mobile project is not silently disabled.
- **SC-004 (Auth reuse)**: During a single `npx playwright test` invocation, the number of `POST` requests to the Supabase auth endpoint is `<= 4` (one per role per context, plus any login-flow specs that explicitly opt out).
- **SC-005 (Prod build path)**: `npm run test:e2e:prod` is wired up and produces the same pass/fail as `npm run test:e2e` on a representative subset.
