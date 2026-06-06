# Research: Speed Up Playwright E2E Suite

**Branch**: `014-e2e-speedup` | **Date**: 2026-06-06 | **Spec**: [spec.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md)

This file is Phase 0 output for the `/speckit-plan` workflow. Each entry follows the
**Decision / Rationale / Alternatives considered** format.

## R-1. Playwright `setup` project + `storageState` reuse

**Decision**: Add a `setup` project to `playwright.config.ts` whose only spec is
[`tests/e2e/auth.setup.ts`](/Users/alexabelle/Documents/Development/wedding-management-system/tests/e2e/auth.setup.ts)
(detailed shape in [plan.md §R-5](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md)).
`chromium` and `Mobile Chrome` list the `setup` project in `dependencies` so it runs first
once per invocation. The setup project writes `playwright/.auth/admin.json` and
`playwright/.auth/couple.json`; dependents load them via `use.storageState`.

**Rationale**: This is the documented stable Playwright pattern for cross-test auth reuse
(<https://playwright.dev/docs/auth>, stable since Playwright 1.18+). It is a pure config +
one setup file change; no production code touched. Without it, every spec re-pays the
`/auth/login` POST + redirect + dashboard-render cost (~32 of 37 specs do this today per
the audit in [plan.md §R-2](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md)).

**Alternatives considered**:
- **Per-spec `beforeAll` sign-in**: still pays the cost N times; only difference is the
  sign-in lives in test code, not config. No win.
- **Custom `globalSetup` script**: also valid, but `globalSetup` runs *before* the webServer
  starts, so the setup would either need to start its own browser session against a manually
  started server, or sign in via a non-UI path (Supabase admin API). The `setup` project
  pattern is simpler and uses real cookies the way a user would.
- **Skip the optimization entirely and rely on per-spec speedups**: rejected because the
  win would be a fraction of what auth reuse gives us.

## R-2. Storage state defaults per project

**Decision**: `chromium` loads `playwright/.auth/admin.json` by default; `Mobile Chrome`
loads `playwright/.auth/couple.json` by default. Specs that need the non-default role add
`test.use({ storageState: "playwright/.auth/{role}.json" })` at the top of the file.
Spec-level opt-out for fresh-context specs is `test.use({ storageState: { cookies: [], origins: [] } })`.

**Rationale**: Desktop spec mix is roughly 28 admin-leaning specs and 1-2 couple specs.
Mobile mix is 3-4 couple/public specs and 1 admin spec. Matching each project to its
modal role means almost no per-spec opt-in is needed (just the two couple specs).
Confirmed in [clarification Q2](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md).

**Alternatives considered**:
- **One unified storageState containing both admin + couple cookies**: breaks Playwright's
  "one storageState per project" convention; the active session would depend on which
  cookie was set last. Rejected.
- **Default both projects to admin storage**: would force every couple/mobile spec to opt
  in, which is a larger spec change. Rejected.

## R-3. `webServer` swap to production build

**Decision**: When `PW_USE_PROD=1` is set, the `webServer.command` becomes a small
bash wrapper:
```bash
[ -f .next/BUILD_ID ] && [ .next/BUILD_ID -nt package.json ] && echo "build up to date" || npm run build
npm run start
```
Playwright's `webServer` already runs the command and waits on the `url` health check,
so this is a self-contained swap. The dev server remains the default for `npm run test:e2e`.

**Rationale**: AGENTS.md documents Turbopack's "stale 404" gotcha and mandates
`npm run build --webpack` for production. Reusing an existing build when fresh is the
same idempotency pattern the project already uses for `webServer.reuseExistingServer`.
Confirmed in [clarification Q3](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md).

**Alternatives considered**:
- **Always `next build && next start`**: simpler script, no staleness guard, but the build
  cost (~30-90s on this codebase) gets paid on every run, even when source hasn't changed.
  Rejected per the user's Q3 answer.
- **Use `next start` against the dev server's `.next/` artifacts**: dev mode's `.next/` is
  a different shape (Turbopack emits differently). Mixing them is brittle. Rejected.

## R-4. Mobile project gating on `CI=1`

**Decision**: Build the `projects` array conditionally:
```ts
const baseProjects = [/* chromium, depends on setup, admin storage */];
const projects = process.env.CI
  ? [...baseProjects, /* Mobile Chrome, depends on setup, couple storage */]
  : baseProjects;
```

**Rationale**: AGENTS.md notes the mobile project doubles the local wall time; the
config's own comment ("Running multiple projects doubles the total time. Consider
commenting out Mobile while debugging timeouts") already calls for a toggle. Keying off
`process.env.CI` matches GitHub Actions' default behavior and is the same convention
`playwright.config.ts` already uses for `forbidOnly` and `retries`.

**Alternatives considered**:
- **Toggle via a separate `MOBILE=1` env var**: also valid, but requires contributors to
  know about it. `CI=1` is universal. Rejected.
- **Always run both projects**: what we have today; the user explicitly asked for the
  speedup. Rejected.

## R-5. Baseline capture (T000)

**Decision**: T000 is a parallel task that must complete before Phase 1 starts. The
implementer runs `time npx playwright test --project=chromium` on a clean dev server
(Supabase up, `npm run dev` running) and records the result in [plan.md Performance Goals
§17](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md)
(replacing the `<TBD>` placeholder). The recorded number becomes SC-001's denominator.

**Rationale**: SC-001's "<= 4 min AND <= 40% of baseline" gate is unmeasurable without
the baseline. Confirmed in [clarification Q4](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md).
Catching "<= 4 min already" before doing the refactor is also a useful early-out.

**Alternatives considered**:
- **Capture on CI only**: would let us land the refactor without a local measurement, but
  CI runners are slower than the dev machine; ratio comparison is muddier. Rejected.
- **Drop the baseline, target a single number**: less rigorous, but the user explicitly
  asked for both. Rejected.

## R-6. Spec inventory and out-of-scope list

**Decision**: 37 E2E spec files total. 32 perform inline `/auth/login` and are in scope
for the refactor (tasks T006-T036). 5 are out of scope:
- `duplicate-rsvp.spec.ts` - public page, no login.
- `landing-page.spec.ts` - public page, no login.
- `lighthouse-audit.spec.ts` - uses `chrome-launcher` directly, not Playwright's
  `page.goto` flow.
- `admin-lock.spec.ts` and `rsvp-flow.spec.ts` - use the `ensureWeddingUnlocked`
  helper which keeps its own login block by design (T053 documents this).

**Rationale**: Verified by `grep -c "page.goto.*auth/login\|signInWithPassword" tests/e2e/*.spec.ts`
on this branch. The 5 out-of-scope specs must continue to pass unchanged per NFR-001.

**Alternatives considered**:
- **Refactor the lighthouse spec to use the new `storageState` flow**: possible, but it
  launches Chrome itself and does not depend on the `chromium` project's storageState.
  No win. Rejected.

## Open questions for planning phase

- None. All `NEEDS CLARIFICATION` items were resolved in `/speckit-clarify`.
