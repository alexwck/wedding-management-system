# Implementation Plan: Speed Up Playwright E2E Suite

**Branch**: `014-e2e-speedup` | **Date**: 2026-06-06 | **Spec**: [spec.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md)

## Summary

Cut local Playwright E2E wall time by (1) authenticating once per run via a `setup` project + `storageState`, (2) gating the `Mobile Chrome` project on `CI=1`, and (3) adding a `test:e2e:prod` script that runs against a built production server instead of `next dev`. The expected win is roughly 60% on `npx playwright test --project=chromium` once both auth reuse and the dev-server swap are in place, with no spec removed or weakened.

## Technical Context

**Language/Version**: TypeScript 5.x (Node 20+) - this is a tooling/config change, no runtime code is touched.
**Primary Dependencies**: `@playwright/test` (already pinned in `package.json`); no new packages required.
**Storage**: N/A. Storage state is written to disk at `playwright/.auth/{admin,couple}.json`.
**Testing**: Playwright E2E (`tests/e2e/`, 37 spec files, 2743 LoC (32 in scope for refactor, 5 out of scope)). Existing 448 unit tests + 50 unit files are out of scope.
**Target Platform**: Local dev (macOS / Linux dev machines) and CI (GitHub Actions preview job).
**Project Type**: Monolithic Next.js app; this work is purely in `playwright.config.ts`, `package.json`, `.gitignore`, and a refactor of `tests/e2e/*.spec.ts` to remove duplicated login helpers.
**Performance Goals**: `npx playwright test --project=chromium` should drop to **<= 4 minutes wall time AND <= 40% of the captured baseline** on the developer's machine. Baseline is captured in T000 before Phase 1 starts and recorded here. As of 2026-06-06, the captured baseline is **<TBD>** (placeholder; T000 to fill). The win has three components in priority order:
  1. Auth-once-per-run: removes ~32 redundant `/auth/login` POSTs and dashboard renders per run. (P1)
  2. Mobile-gated-on-CI: cuts the spec matrix in half locally (from 2 projects to 1). (P2)
  3. Prod-build opt-in: avoids Turbopack's on-demand compile and the "stale 404" gotcha. (P3)
**Constraints**:
  - `workers: 1` stays in place globally (AGENTS.md gotcha: parallel workers break session cookies).
  - All 37 E2E spec files must keep their full scenario set (NFR-001); the 5 out-of-scope specs pass unchanged, the 32 in-scope specs are refactored.
  - AGENTS.md's "E2E test resilience" and "Test data isolation" rules are not weakened.
  - Production builds use webpack (`--webpack`); this is unchanged.
**Scale/Scope**: 37 spec files; ~32 inline login blocks (in 32 of the 37); 1 new `tests/e2e/auth.setup.ts`; 1 `playwright/.auth/` directory.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Spec-driven**: Spec is in this folder, all 4 user stories trace to requirements FR-001..FR-007.
- **Test verification (red-green)**: This feature *is* a test-infrastructure change. We prove correctness by re-running the full E2E suite before and after, asserting the same set of specs pass with the same pass/fail outcome (NFR-001, SC-002). We do not write "tests for the test config" - we measure behavior.
- **Workers = 1**: Preserved globally; per-spec parallelism is opt-in only where AGENTS.md's data-isolation rules allow.
- **No experimental features**: Playwright's `setup` project is a stable documented feature; no experimental APIs touched.
- **DESIGN.md**: No UI changes. DESIGN.md untouched.
- **AGENTS.md "E2E test resilience"**: We add a `isVisible().catch(() => false)` guard to the new setup script the same way existing specs do.
- **AGENTS.md "E2E hydration waits"**: Setup script uses `waitForURL` and `waitForLoadState("networkidle")` like the rest of the suite.

## Project Structure

### Documentation (this feature)

```text
specs/014-e2e-speedup/
├── plan.md              # This file
├── spec.md              # User stories + requirements
├── tasks.md             # Phased tasks
└── checklists/
    └── e2e-speedup.md   # Quality checklist (phase 5)
```

### Source Code (repository root) - touched files

```text
playwright.config.ts                       # Add setup project, gate Mobile Chrome on CI
package.json                               # Add test:e2e:prod script
.gitignore                                 # Ignore playwright/.auth/
tests/e2e/auth.setup.ts                    # NEW: signs in once for each role
tests/e2e/*.spec.ts                        # Remove duplicated login helpers; opt out where needed
AGENTS.md                                  # Document the new workflow
```

### Out of scope

- Unit tests / component tests (different infra, different bottlenecks).
- Konva/canvas perf (separate feature; not in this spec).
- Vercel preview / CI workflow YAML (the speedup benefits CI automatically once the config changes; no new workflow needed).

## Phase 0a: Research

### R-1. Playwright `setup` project mechanics

- Playwright supports a `projects: [{ name: "setup", testMatch: ... }]` entry that runs *before* any spec project that lists it in `dependencies`.
- The setup project writes `storageState` files via `await context.storageState({ path: ... })`. These are then consumed by other projects via `use.storageState`.
- Source: <https://playwright.dev/docs/auth> ("Authentication" page). Stable since Playwright 1.18+.

### R-2. Existing login helper duplication

Audited `tests/e2e/*.spec.ts` for the inline login pattern:

```text
await page.goto('/auth/login');
await page.fill('input[id="email"]', 'admin@example.com');
await page.fill('input[id="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL(/\/admin/);
```

**32 specs** contain this exact or near-exact block. Variants:
- `input[id="email"]` vs `input[type="email"]` - selectors differ; both exist.
- `waitForURL(/\/admin/)` vs `waitForURL(/\/dashboard/)` - role-dependent.
- Some use `await expect(page).toHaveURL(...)` (a slightly longer wait).
- `admin-lock.spec.ts` has a higher-level `ensureWeddingUnlocked(page)` helper that itself contains the login block; we'll keep that helper, just have it use a pre-authenticated context.

### R-3. `webServer` swap to production

- `playwright.config.ts` `webServer.command` currently runs `npm run dev`. AGENTS.md documents that Turbopack dev produces stale 404s on first hit. Switch path: provide an alternate `webServer` block when `process.env.PW_USE_PROD` is set, with `command: "npm run build && npm run start"`.
- AGENTS.md gotcha: `npm run build` uses `--webpack` (no Turbopack). So `next start` will serve the webpack-built output, which is fast and stable.
- `reuseExistingServer: true` should still apply, so re-running against a manually started `next start` is cheap.

### R-4. Mobile gating approach

- Conditionally build the `projects` array based on `process.env.CI`:
  ```ts
  const projects = [
    { name: "chromium", use: { ...devices["Desktop Chrome"], storageState: ... } },
    ...(process.env.CI ? [{ name: "Mobile Chrome", use: { ...devices["Pixel 5"], storageState: ... } }] : []),
  ];
  ```
- Document the trade-off in AGENTS.md: "Mobile runs in CI only; run `CI=1 npx playwright test` locally when you want mobile coverage."

### R-5. Auth setup file shape

```ts
// tests/e2e/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

const adminFile = "playwright/.auth/admin.json";
const coupleFile = "playwright/.auth/couple.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('input[id="email"]', "admin@example.com");
  await page.fill('input[id="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: adminFile });
});

setup("authenticate as couple", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('input[id="email"]', "alex@example.com");
  await page.fill('input[id="password"]', "couple123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: coupleFile });
});
```

- `setup.use({ storageState: { cookies: [], origins: [] } })` at the top so setup itself starts from a clean slate.
- The setup project in `playwright.config.ts` uses `testMatch: /.*\.setup\.ts/` to scope its work.

## Phase 1: Design

### D-1. `playwright.config.ts` shape (target)

```ts
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const isProd = !!process.env.PW_USE_PROD;

const baseProjects = [
  { name: "chromium", use: {
    ...devices["Desktop Chrome"],
    storageState: "playwright/.auth/admin.json",
  }, dependencies: ["setup"] },
];

const projects = isCI
  ? [...baseProjects, {
      name: "Mobile Chrome", use: {
        ...devices["Pixel 5"],
        storageState: "playwright/.auth/couple.json",
      },
      dependencies: ["setup"],
    }]
  : baseProjects;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    ...projects,
  ],
  webServer: isProd
    ? { command: "npm run build && npm run start", url: "http://localhost:3000", reuseExistingServer: !isCI, timeout: 180_000 }
    : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !isCI, timeout: 120_000 },
});
```

Decisions:
- Default `chromium` project loads **admin** storageState because the majority of specs hit `/admin/*` first. Specs that need couple auth opt in via `test.use({ storageState: "playwright/.auth/couple.json" })`.
- `Mobile Chrome` project loads **couple** storageState because the existing mobile specs (`couple-mobile.spec.ts`, `admin-mobile.spec.ts`, `guest-rsvp-mobile.spec.ts`, `rsvp-single-page.spec.ts`) need both, but couple-by-default is the more common case across mobile suite composition.
- `setup` project runs first; both `chromium` and `Mobile Chrome` list it as a `dependency`.

### D-2. Spec-level opt-out

Specs that need a clean context (login flow, logout flow, invalid login) declare:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

at the top of the file (outside any `test.describe`).

### D-3. Helper refactor

We extract a `loginAs(page, role)` helper only for the few specs that intentionally test login (kept for the assertions on the login UI itself, not for general use). All other specs delete their inline login and rely on `storageState`.

## Phase 2: Implementation plan

Implementation is split across the tasks in [tasks.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/tasks.md). Phases are:

1. **Phase 1 - Setup**: add `auth.setup.ts`, add `playwright/.auth/` to `.gitignore`, scaffold `package.json` script.
2. **Phase 2 - Foundational**: rewrite `playwright.config.ts` with the new `projects` array (gated Mobile Chrome, setup dependency, prod-mode webServer).
3. **Phase 3 - User Story 1+2 (P1)**: refactor each spec to delete inline login and rely on `storageState`. Opt out for login-flow/logout/invalid-login specs.
4. **Phase 4 - User Story 3 (P2)**: verify Mobile Chrome is excluded locally and included with `CI=1`.
5. **Phase 5 - User Story 4 (P3)**: verify `PW_USE_PROD=1 npm run test:e2e` works against `next start` and produces the same pass/fail on a representative subset.
6. **Phase 6 - Docs**: update `AGENTS.md` with the new workflow + speedup tips.

## Verification plan

- **Baseline (before changes)**: capture `time npx playwright test --project=chromium` once on the developer's machine, record the wall time.
- **After each phase**: re-run a representative subset (e.g. `--grep "RSVP"` or a single spec) to confirm no regression.
- **Final**: run full `npx playwright test --project=chromium` and `CI=1 npx playwright test` to confirm SC-001/SC-003/SC-004.

## Risks

- **R-A**: `storageState` from a stale run may not include the latest cookies. Mitigation: setup project always runs first; CI reseeds before tests.
- **R-B**: Mobile specs that depend on couple auth get the wrong default if we ship `chromium=admin, mobile=couple` and someone toggles. Mitigation: documented in AGENTS.md; quick to fix in config.
- **R-C**: A spec that needs *both* admin and couple (rare; one spec edits `rsvp-dashboard-seats` flow) will need to switch contexts mid-test. Mitigation: that spec uses `await context.clearCookies()` + `page.goto('/auth/login')` as it does today. No regression.
- **R-D**: `npm run build && npm run start` has a longer cold start than `npm run dev`. The user opts in, so this is acceptable; the test will not block on it being faster locally, only on it being a stable alternative.

## Out of scope (revisited)

- Webwright (microsoft/Webwright): not a Playwright replacement. Possible future eval but explicitly out of scope for this speedup. Mentioned in chat history.
- Visual regression (Lighthouse / pixel diff). Separate spec.
- Konva canvas perf. Separate spec.
