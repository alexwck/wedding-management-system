# Testing And QA

## Testing Pyramid

The project follows a 3-tier testing pyramid enforced by
`.specify/memory/constitution.md` and documented per feature under
`specs/<feature>/qa/testing-strategy.md`.

| Layer | Tool | Time budget | Use for |
|---|---|---|---|
| Unit | Vitest | 1-50 ms | Pure functions, validators, business rules, edge cases. |
| Component / Integration | Vitest, RTL, jsdom | 50-500 ms | Component rendering, controlled state, form input, prop plumbing. |
| E2E | Playwright | 1-5 s+ | Critical user journeys, real browser behavior, real Supabase flows. |

Push tests down. If a lower layer can prove a behavior fully, do not duplicate it at a
higher layer unless it is part of a critical journey.

## Commands

- `npm run test` runs Vitest.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run test:e2e` runs Playwright.
- `npm run test:e2e:prod` runs Playwright against a production server.
- `npx playwright install` downloads browser binaries after Playwright updates.

## QA Review Skill

Use the `qa-review` skill when planning or reviewing test coverage. It should read this
file, the constitution, existing tests, and the relevant feature spec/plan before
producing Unit, Component, and E2E recommendations.

## Unit And Component Rules

- Shared helpers live in `tests/unit/helpers/`: use `mockFrom()` and factories such as
  `makeFloorPlanItem()` and `makeRsvp()` instead of duplicating Supabase mocks or data.
- React 19 component tests require explicit `cleanup()` in `beforeEach` or `afterEach`.
- Prefer `getBy*` queries over `getAllBy*` unless the test explicitly needs multiples.
- Use `fireEvent` in fake-timer tests; `userEvent` can conflict with fake timers.
- File upload component tests need a synchronous `FileReader` mock that immediately calls
  `onload` in `readAsDataURL`.
- For file inputs in jsdom, set `input.files` via `Object.defineProperty()` and fire a
  change event.
- Unit test mocks for `getAuthAndVerifyAccess` must include `{ user, isLocked, error }`.

## Playwright E2E Rules

- `playwright.config.ts` keeps `workers: 1`; parallel workers cause auth/session cookie
  races.
- The setup project signs in once via `tests/e2e/auth.setup.ts` and stores auth JSON under
  `playwright/.auth/`.
- Desktop Chromium defaults to admin storage state; specs that need couple or anonymous
  state opt in with `test.use({ storageState: ... })`.
- Mobile Chrome is gated by config; run with `CI=1` locally when mobile coverage is needed.
- After `page.goto()`, use `await page.waitForLoadState("networkidle")` before interacting
  with hydrated client components or file inputs.
- Use specific locators or `.first()` for repeated text to avoid strict mode violations.
- Mobile nav can intercept sidebar/catalog clicks; use `{ force: true }` only when a known
  fixed overlay blocks the intended mobile target.
- Desktop `ResponsiveTable` renders sortable table headers; mobile renders card-style
  items without sorting. Skip sort assertions below `768px`.
- Read-only venue tests should assert stable fields because admin venue tests modify seed
  data.
- After RSVP submission, token cookies trigger a server-rendered `RsvpConfirmationCard`
  with heading `Your RSVP` on revisit.

## E2E Speedup Context

Feature `014-e2e-speedup` documents the current Playwright speedup work in
`specs/014-e2e-speedup/plan.md`. The important preserved constraints are:

- `workers: 1` stays global.
- Auth reuse must not weaken login, logout, or access-control coverage.
- `npm run build` uses webpack; Turbopack production builds are avoided.
- Dev-server stale routes can appear after route or migration changes. Verify pages with
  `curl` before debugging a Playwright failure as an app bug.
