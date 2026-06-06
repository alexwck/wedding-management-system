# Testing Strategy: Speed Up Playwright E2E Suite (Feature 014)

**Author**: QA / Software Architect review
**Date**: 2026-06-06
**Branch**: `014-e2e-speedup`
**Scope**: A 3-tier test plan (Unit / Component / E2E) for the feature that introduced
`auth.setup.ts`, the rewritten `playwright.config.ts`, the `test:e2e:prod` script, and the
per-spec `test.use({ storageState: ... })` opt-in pattern applied to `couple-dashboard.spec.ts`
and `floor-plan.spec.ts`.

## Test pyramid / trophy applied

| Layer | Tool | Time budget per test | Network | Browser | DB |
|---|---|---|---|---|---|
| Unit | Vitest + jsdom-free | 1-50 ms | mocked | none | mocked |
| Component / Integration | Vitest + jsdom + RTL | 50-500 ms | mocked at module boundary | none | mocked |
| E2E | Playwright | 1-5 s+ | real (Supabase local) | real Chromium / Mobile Chrome | real (local Supabase) |

The current pyramid is **healthy**: 50 unit files, 16 component files, 37 E2E spec files. The
E2E layer is the largest, which is expected for a feature whose primary purpose is "wire up
the test infrastructure correctly." Where possible, behaviors that are currently only E2E
should be **pushed down** into Unit or Component layers; that's the explicit optimization
target for this feature and any follow-ups.

## Coverage of existing code paths

The tables below name every new and existing behavior and pin it to the lowest layer that
can still prove it. **Tests at higher layers are listed only if the behavior cannot be
trusted at a lower one** (e.g. the behavior crosses a network boundary or a browser API that
jsdom does not model).

Each test is one sentence: the test name + why it lives at that layer.

---

## Tier 1 — Unit Tests (Vitest, mocked everything)

Pure functions, schema validators, business rules, branch coverage, edge cases.
No React. No network. No Supabase. Target: every test runs in **1-50 ms**.

### 1.1 `tests/e2e/auth.setup.ts` — sign-in flow logic

The setup file is two near-identical Playwright `setup()` blocks. The *what* (admin vs couple)
is a config decision; the *how* (fill, click, waitForURL, networkidle, write storageState) is
Playwright API. The Playwright API calls themselves can't be unit-tested without Playwright
itself. **No unit tests added for `auth.setup.ts` — that is E2E coverage territory.** A unit
test would be a Playwright reimplementation and would be redundant with the E2E smoke run.

### 1.2 `playwright.config.ts` — config-shape logic

Two pieces of logic in the config warrant a unit test:

- **T-UNIT-01**: `isCI` is `!!process.env.CI`. — Pure function over a string env var. **Belongs in Unit.**
  Reason: it's the single source of truth for "is mobile enabled" and the cost of a regression
  is "every contributor on a Mac loses the mobile project without knowing why."
- **T-UNIT-02**: `isProd` is `!!process.env.PW_USE_PROD`. — Same shape as T-UNIT-01. **Belongs in Unit.**
  Reason: gates the build-vs-reuse shell command; a typo here silently changes `next start` to
  `next dev` in the prod build path.
- **T-UNIT-03**: `webServer.command` for the prod branch correctly emits a bash one-liner that
  rebuilds only when `.next/BUILD_ID` is missing or older than `package.json`. — The decision
  *what* the command should be is documented; the test should pin that the literal string
  contains the right condition (`! -f .next/BUILD_ID`, `-ot package.json`, `npm run build`,
  `npm run start`). **Belongs in Unit.** Reason: a refactor that drops the `-ot package.json`
  clause would silently rebuild on every test run, regressing the SC-005 wall time by 30-90s.
- **T-UNIT-04**: The `projects` array contains exactly `[setup]` when `!isCI` and
  `[setup, chromium]` (since the default projects array in the source adds chromium via
  `baseProjects`) when `!isCI`, plus `Mobile Chrome` only when `isCI`. — **Belongs in Unit.**
  Reason: this is the entire FR-004 contract; a regression here silently disables mobile CI.
- **T-UNIT-05**: The `chromium` project's `use.storageState` points to
  `playwright/.auth/admin.json`; the `Mobile Chrome` project's points to
  `playwright/.auth/couple.json`. — **Belongs in Unit.** Reason: FR-002 per-project default
  is a contract; verifying it as a string is cheap and prevents the wrong file from being loaded.
- **T-UNIT-06**: When `process.env.CI` is set, both `forbidOnly: true` and `retries: 2` flip on;
  when unset, `forbidOnly: false` and `retries: 0`. — **Belongs in Unit.** Reason: a regression
  here either suppresses `.only` in CI (allowed to merge broken tests) or runs N×3 retries locally
  (slows the dev loop).

The test file lives at `tests/unit/lib/playwright-config-shape.test.ts` and reads the config
module from disk (the config is a `defineConfig` call, so the easiest approach is to import
the config and call it with a stubbed `process.env`). Five assertions, no Playwright, <50 ms.

### 1.3 Per-spec opt-in (`test.use({ storageState: ... })`) — pattern coverage

The pattern itself is Playwright behavior. A unit test would test Playwright, not our code.
**No unit test.** The pattern is covered by Component / E2E tests in 2.1 and 3.1.

### 1.4 `.gitignore` entry for `playwright/.auth/`

Static config; no logic. **No unit test.** The companion `playwright/.auth/.gitkeep` trick is
documented in plan.md; a future regression would show up as a "file accidentally committed" in
a code review.

### 1.5 `test:e2e:prod` npm script

Static string. **No unit test.** The script's `PW_USE_PROD=1` is exercised by the E2E
verification in 3.3.

### 1.6 Existing unit tests that this feature SHOULD add coverage for (gap audit)

The broad Phase 3 refactor surfaced that the codebase has shallow Unit coverage in some areas.
Per the gap audit, the following behaviors are tested only in E2E and should be pushed down:

- **T-UNIT-07**: `playwright/.auth/*.json` round-trips through Playwright's `context.storageState()`.
  — Actually untestable without Playwright; **no Unit.** (Covered in 3.1.)
- **T-UNIT-08**: The setup project's `testMatch: /.*\.setup\.ts/` correctly excludes regular
  specs. — Pure regex over a glob. **Belongs in Unit.** Reason: a refactor that broadens the
  glob to `/.*\.ts/` would cause Playwright to run regular specs under the `setup` project
  without a storageState, silently producing "Logged out" failures.
- **T-UNIT-09**: AGENTS.md's "workers=1" gotcha is still enforced in the config.
  `workers: 1` is the only valid value. — **Belongs in Unit.** Reason: a future PR that
  "optimizes" workers to 4 will reintroduce the parallel-worker session-cookie race that the
  gotcha was created to prevent.

The new test file `tests/unit/lib/playwright-config-shape.test.ts` should cover
T-UNIT-01..T-UNIT-06 + T-UNIT-08 + T-UNIT-09 — eight assertions total.

### 1.7 Unit test layer — summary

Total new Unit tests for this feature: **9** (8 in `playwright-config-shape.test.ts` + 1
shell-glob test for `testMatch`). All run in <50 ms each, no network, no browser. Total layer
cost: **<500 ms for the new tests, on top of the existing 50 unit files' ~3 s**.

---

## Tier 2 — Component / Integration Tests (Vitest + jsdom + RTL)

Component rendering, controlled state transitions, form input, accessible labels, prop
plumbing. Network and Supabase are mocked at the module boundary. Target: **50-500 ms per
test**.

### 2.1 `playwright.config.ts` is not a React component — no Component test

The feature introduces zero new React components. The only client-side code is `auth.setup.ts`
(a Playwright file, not a React component) and the per-spec `test.use` annotations. **No new
Component tests are needed for the feature itself.**

### 2.2 Existing Component tests that this feature SHOULD add coverage for (gap audit)

The broad Phase 3 refactor surfaced 7 pre-existing E2E failures. None of them are React-rendering
bugs; they are data-state and Konva-canvas bugs. So no Component test gap is introduced by
this feature. The existing 16 Component files cover the rendered shapes of `LoginPage`,
`RsvpForm`, `RsvpTable`, `ItemCatalog`, `TemplateCrop`, `VenueEditor`, etc. — those continue to
gate the visual contract of the auth + form flows that the E2E suite then exercises.

- **T-COMP-01** *(new)*: `LoginPage` component test should assert that the form does **not**
  redirect to `/dashboard` for an unauthenticated user when the page is rendered with
  `cookies: []` storageState. — **Belongs in Component, not E2E.** Reason: this is the exact
  invariant the per-spec `test.use({ storageState: { cookies: [], origins: [] } })` opt-out is
  trying to protect. Asserting it in Component makes the regression test live next to the
  component code, not buried in an E2E spec.
  Test name suggestion: `LoginPage › with empty storageState, form does not auto-submit`.
- **T-COMP-02** *(new)*: `RsvpForm` component test with a mock `fetch` that always returns 401
  should render the error state and call the onError prop. — **Belongs in Component.** Reason:
  the E2E `rsvp-flow` spec covers happy path + duplicate; the 401 / error path is not
  component-tested today. With the new storageState model, the 401 path is more important
  (it would fire if the storageState expired mid-session).

The two new Component tests are 80-100 lines of RTL each, ~150 ms each. Total layer cost
addition: **~300 ms**.

### 2.3 Component test layer — summary

Total new Component tests for this feature: **2** (T-COMP-01, T-COMP-02). On top of the
existing 16 component files' ~5 s. Total new cost: **<500 ms**.

---

## Tier 3 — E2E Tests (Playwright, real network, real browser, real DB)

The actual sign-in flow, the actual storageState file emission, the actual `test.use` opt-in
behavior, the actual mobile gating, the actual prod-build webServer swap. This is where
the feature's *primary* contract is verified: that the infra works end-to-end.

### 3.1 `auth.setup.ts` and the storageState JSON files (already partially in place)

- **T-E2E-01** *(already done by the setup project's existence)*: Running the `setup` project
  alone produces `playwright/.auth/admin.json` and `playwright/.auth/couple.json` and exits 0.
  — **Belongs in E2E.** Reason: this is the entire feature. Setup project is a Playwright
  construct; nothing in Unit can run a real browser context. Already verified in this
  branch by `node_modules/.bin/playwright test --project=setup`.
- **T-E2E-02** *(new, but needs a re-run)*: The storageState JSONs are syntactically valid
  Playwright format — `cookies` is an array of `{name, value, domain, ...}` and `origins` is
  an array. — **Belongs in E2E.** Reason: a real Playwright run already produces the files;
  the assertion is `JSON.parse(fs.readFileSync(...))` doesn't throw, and the resulting shape
  matches the Playwright `StorageState` type. This can be a one-line shell check that runs
  as part of `--list` verification.
- **T-E2E-03** *(new, **critical**)*: A spec that uses the new `test.use({ storageState: "..." })`
  pattern does **not** trigger an `/auth/login` page visit. — **Belongs in E2E.** Reason: this
  is the *primary* contract of the feature. Asserted indirectly by the speedup, but a hard
  check is "trace the network panel during a refactored spec and confirm zero POSTs to the
  Supabase auth endpoint." Already passing for couple-dashboard + floor-plan; needs to be
  documented in `tests/e2e/auth.setup.uses-storage-state.spec.ts` as a one-shot test.
- **T-E2E-04** *(new)*: A spec that uses `test.use({ storageState: { cookies: [], origins: [] } })`
  DOES visit `/auth/login` if it tries to access a protected route. — **Belongs in E2E.**
  Reason: this is the per-spec opt-out contract. Couples nicely with T-COMP-01.

### 3.2 Mobile gating on `CI=1` (already verified)

- **T-E2E-05** *(done)*: `npx playwright test --list` without `CI` shows `[setup, chromium]`
  only. — **Belongs in E2E.** Already passing on `014-e2e-speedup`. Should be wrapped in a
  dedicated spec `tests/e2e/config-projects-list.spec.ts` so the assertion is in the suite,
  not in a one-off shell check. Estimated runtime: <2 s.
- **T-E2E-06** *(done)*: `CI=1 npx playwright test --list` shows `[setup, chromium, Mobile Chrome]`.
  — Same file as T-E2E-05, with `process.env.CI = "1"` set. **Belongs in E2E.**

### 3.3 `test:e2e:prod` path (not measured)

- **T-E2E-07** *(new)*: `PW_USE_PROD=1 npm run test:e2e -- --grep "RSVP submission flow"` produces
  the same pass/fail as dev mode. — **Belongs in E2E.** Reason: this is the SC-005 verification
  and the prod-build code path. Estimated runtime: ~3 min (single grep).
- **T-E2E-08** *(new)*: When `.next/BUILD_ID` is older than `package.json`, the prod webServer
  rebuilds. — **Belongs in E2E.** Reason: this is the build-reuse policy from clarification
  Q3. To verify, the test would: (1) `touch -d "1 day ago" .next/BUILD_ID`, (2) run with
  `PW_USE_PROD=1`, (3) assert that the rebuild log appears in the webServer output. (4) Reset
  `BUILD_ID` to "now" and re-run, (5) assert no rebuild log. ~6 min.
- **T-E2E-09** *(new)*: When `.next/BUILD_ID` is newer than `package.json`, the prod webServer
  does NOT rebuild. — **Same file as T-E2E-08**, second assertion.

### 3.4 The 2 refactored specs (already passing, but should be regression-locked)

- **T-E2E-10** *(done)*: `tests/e2e/couple-dashboard.spec.ts` passes 6/6 with the new
  `test.use({ storageState: couple })`. — **Belongs in E2E.** Already verified; this is the
  regression lock. The existing spec file IS the test.
- **T-E2E-11** *(done)*: `tests/e2e/floor-plan.spec.ts` passes 9/9 with the new couple +
  per-test admin / empty storageState overrides. — **Belongs in E2E.** Same.

### 3.5 The 30 non-refactored specs (regression baseline)

- **T-E2E-12** *(done)*: The 30 specs that did NOT adopt storageState continue to pass on a
  fresh DB. — **Belongs in E2E.** Reason: the project's NFR-001 ("same pass/fail outcome")
  contract. The full suite run in this branch measured 153 pass / 7 fail (7 fails are
  pre-existing design/data flakes, NOT regressions). The full suite is the regression lock.

### 3.6 E2E test layer — summary

Total new E2E tests for this feature: **8** (T-E2E-02, T-E2E-03, T-E2E-04, T-E2E-07,
T-E2E-08, T-E2E-09, plus a one-line wrapper spec around T-E2E-05/06). On top of the existing
37 spec files. Total new wall-time cost: **~10 min** for the prod-path tests (3.3);
**~3 min** for the others. The two critical regression locks (T-E2E-10, T-E2E-11) cost
nothing — they ARE the existing refactored specs.

---

## Net new test count for this feature

| Layer | New tests | Cumulative count | Per-run cost (added) |
|---|---|---|---|
| Unit | 9 | 59 | <500 ms |
| Component | 2 | 18 | <500 ms |
| E2E | 8 | 45 | ~13 min (mostly the prod build) |
| **Total** | **19** | **122** | **~14 min** |

Of the ~14 min, **10 min is the prod build (3.3) which is itself the SC-005 verification and
only runs in CI / opt-in.** Local dev loop: **~4 min added** to the 9 min suite — a 44%
overhead for the test infra, but a permanent 100% safety net against the regressions this
feature could introduce.

## Pyramid health check

Before this feature: 50 unit / 16 component / 37 E2E.
After this feature:   59 unit / 18 component / 45 E2E.

Ratio shift: unit gained +9, component +2, E2E +8. **Unit grew more than E2E for the first
time on this branch**, which is the right direction per the testing pyramid / trophy
principle. The new E2E tests are guards (regression locks) and not behaviors that could be
pushed down.

## What I deliberately did NOT add

- **No E2E test for "the auth.setup.ts uses the correct password."** The credentials are
  pinned by `supabase/seed.sql`; a regression would fail the setup project itself with a
  30-second timeout and a "Failed to fetch" error. The signal is built into Playwright's
  setup project.
- **No test for `playwright/.auth/.gitkeep` existence.** Trivial; the test would assert the
  file system. Skip.
- **No Lighthouse / a11y audit in this feature.** The codebase already has
  `tests/e2e/accessibility-audit.spec.ts` (axe-core) and `tests/e2e/lighthouse-audit.spec.ts`.
  Both are out of scope for this feature.
- **No snapshot test for the wedding-page venue/date display.** Those are covered by
  `tests/e2e/venue-details.spec.ts` and `tests/e2e/wedding-date.spec.ts`; the pre-existing
  flakes are documented and out of scope.

## Cross-references

- Spec: [spec.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md)
- Plan: [plan.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md)
- Research: [research.md §R-7](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/research.md) (empirical outcome)
- Tasks: [tasks.md Final state](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/tasks.md) (per-task tick-off)
- Constitution: see the addendum below.
