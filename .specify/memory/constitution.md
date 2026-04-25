# Wedding Management System Constitution

## Core Principles

### I. Spec-Driven Development

All features MUST be specified before implementation. The development cycle
follows a strict sequence: specification → acceptance criteria → tests →
implementation. Tests are written first and MUST fail before any
implementation code is written (Red-Green-Refactor).

Behavioral tests (BDD) define user-facing acceptance criteria using
Given/When/Then scenarios from the spec. Unit tests (TDD) cover internal
logic and edge cases. Both types are non-negotiable for every feature.

#### Test Verification (Red-Green must be proven, not declared)

Writing a test file is not sufficient. Every test MUST be executed to prove
its lifecycle:

- **Red phase**: The test MUST be run and confirmed to fail for the correct
  reason (missing feature, wrong assertion) — not a syntax error or missing
  import. A test that passes before implementation is a false test.
- **Green phase**: After implementation, the test MUST be run and confirmed
  to pass. Both unit tests (`npm run test`) and E2E tests (`npm run
  test:e2e`) MUST pass across all configured projects (desktop and mobile).

E2E tests MUST be run with `--workers=1` to avoid false failures from
session cookie race conditions across parallel browser contexts. If E2E
tests cannot be run (Supabase or dev server unavailable), the task MUST be
marked blocked — not marked complete.

#### Testing Tiers

Every feature MUST use all applicable testing tiers. The tiers cover
different concerns — omitting a tier leaves gaps that code review often
catches too late.

| Tier | What it covers | Tool | When required |
|------|----------------|------|---------------|
| Unit | Pure logic: Zod schemas, server actions, utility functions, API clients | Vitest | Always — every module with logic |
| Component | UI rendering and interaction: conditional states, loading/error/empty states, user input handling | Vitest + React Testing Library | Every Client Component with 2+ visual states |
| E2E | Full user flows: page navigation, form submission, cross-page behavior | Playwright | Every user story in the spec |

**Unit tests** verify that logic functions produce correct outputs for given
inputs. They run in isolation with mocked dependencies. Every Zod schema,
server action, and utility module MUST have unit tests.

**Component tests** verify that Client Components render the correct UI for
each visual state and respond correctly to user interactions. A component
with multiple states (e.g., idle, loading, error, empty, populated) MUST
have a test for each state. Component tests catch bugs that unit tests
miss (wrong conditional rendering, missing error states, broken loading
indicators) and that E2E tests only cover for the happy path.

**E2E tests** verify complete user journeys end-to-end across pages. Every
user story in the specification MUST have at least one E2E test covering
its primary acceptance scenario.

#### Unit Testing Conventions

- **Shared test infrastructure**: Reusable mock helpers and factory functions
  MUST live in `tests/unit/helpers/`. The `mockFrom()` pattern for Supabase
  query chains and factory functions (`makeFloorPlanItem`, `makeRsvp`, etc.)
  prevent mock duplication across test files. New test files MUST use shared
  helpers instead of duplicating mock setup.
- **Supabase mock chains**: Mock Supabase query builders with both chainable
  methods and a `then` property (e.g., `chain.then = (resolve) =>
  resolve(value)`). This correctly handles both `await` and `Promise.all`
  — simpler mocks break on parallel queries.
- **React 19 + jsdom**: React 19 double-renders components in jsdom. Use
  `getAllByRole`/`getAllByText` instead of `getBy*` variants, or test via
  structural assertions rather than counting elements.
- **Timers and async state**: `vi.useFakeTimers()` conflicts with React
  Testing Library's `waitFor` and React async state updates. For
  timer-dependent hooks (auto-save, debounce), test via synchronous methods
  (e.g., `saveNow()`) rather than advancing fake timers through async
  callbacks.

#### Component Testing Conventions

- **Test every visual state**: If a component has conditional rendering
  (loading spinner, error message, empty state, populated state), each
  branch MUST have a test. Untested states are the most common source of
  UI bugs that survive code review.
- **Mock external API clients**: When testing components that call external
  APIs (geocoding, fetch), mock the API module to return controlled
  responses. Use the API client's return type (e.g., discriminated unions)
  to simulate success, error, and empty states without mocking `fetch`
  directly.
- **Render with `@testing-library/react`**: Use `render()` and
  `screen.getByRole()` / `screen.getByText()` queries. Prefer role-based
  queries over test IDs — they verify accessibility as a side effect.
- **Radix UI and cmdk components**: Radix UI primitives (Dialog, Command,
  Popover) and cmdk components resist component testing due to extensive
  DOM API mocking requirements (ResizeObserver, PointerEvent,
  setPointerCapture). For these components, prefer E2E tests. Focus
  component tests on application-level components that compose Radix
  primitives, not the primitives themselves.
- **React 19 cleanup requirement**: Explicit `cleanup()` in
  `beforeEach`/`afterEach` is required for component tests. RTL's
  auto-cleanup does NOT handle React 19's double-rendering in jsdom —
  omitting `cleanup()` causes DOM element leaks between tests.
- **fireEvent for timer-dependent tests**: When tests use
  `vi.useFakeTimers()`, use `fireEvent` instead of `userEvent` for DOM
  interactions. `userEvent`'s internal event loop conflicts with fake
  timers.

#### E2E Testing Conventions

- **E2E test resilience**: E2E tests MUST use
  `if (await element.isVisible().catch(() => false))` guards so they pass
  regardless of whether specific seed data exists. Hard-coded data
  assumptions cause flaky failures across environments.
- **Test data isolation**: Tests that modify seed data (e.g., admin editing
  venue name) affect tests running in other Playwright projects. Assert
  stable fields (couple name, address, welcome message) rather than fields
  that mutation tests change.

### II. Type Safety

TypeScript strict mode is enabled at all times. End-to-end type safety MUST
be maintained from the database schema (Supabase/Prisma types) through the
API layer to the frontend components. Any `any` type requires explicit
justification in code review. Generated types from the database schema are
the single source of truth for data shapes.

### III. Component-First Architecture

UI is built as composable React components following Next.js App Router
conventions. Each component MUST have a single responsibility. Server
Components are the default; Client Components are used only when
interactivity requires it. Shared state lives in the route layer or a
dedicated store — never in deeply nested components.

### IV. User Experience First

Wedding planning is inherently stressful. The system MUST reduce cognitive
load, not add to it. Every interaction MUST have clear feedback. Forms MUST
validate inline and save progress automatically. Navigation MUST be
intuitive for non-technical users. Performance targets: page loads under
2 seconds, interactions under 200ms perceived response time.

Undo history MUST capture meaningful state transitions — commit events like
blur, form submit, or drag-end — not intermediate input keystrokes. A user
pressing undo should feel like they reversed an action, not a single
keystroke.

### V. Simplicity

Start with the simplest solution that delivers the required value. YAGNI
applies: do not build for hypothetical future requirements. Prefer
platform-native features (Vercel for hosting/deploy, Supabase for
auth/database/storage) over self-built alternatives. Avoid premature
abstraction — three similar lines of code are better than a wrong
abstraction. Add complexity only when the current simple approach has
been proven insufficient.

### VI. Security by Default

Every authenticated route MUST verify the user's role server-side. Client-
side routing is a convenience, not a security boundary. Server actions
MUST re-verify authorization before mutating data. Write operations on
singleton records (e.g., one floor plan per wedding) MUST use atomic
database operations (upsert) rather than read-then-write patterns that are
vulnerable to race conditions. Never trust that a prior check still holds
by the time a write executes.

### VII. Mobile Parity

All interactive elements MUST support both mouse and touch events. If a
component handles `onClick`, it MUST also handle `onTap` (and vice versa
for touch-only handlers). Every interactive canvas node (Konva or
equivalent) MUST include both event types. Mobile viewports MUST be
tested as part of the development workflow — mobile is not an afterthought.

### VIII. Data Integrity

Serialization boundaries — where data crosses from one layer to another
(e.g., database to application, API response to state) — MUST validate
data shapes rather than casting blindly. The `as` keyword in TypeScript
is a hint to the compiler, not a runtime guarantee. When converting
between database and application types, validate the `type` field or
use Zod schemas to catch malformed data. Concurrent writes to the same
resource MUST be guarded (in-flight flags, atomic operations, or
optimistic locking) to prevent silent data loss.

### IX. Glassmorphism Design System

All card-like surfaces (forms, overlays, toolbars, modals, panels)
MUST use the glassmorphism design system defined in `globals.css`. The
`.glass-panel` utility class provides the canonical styling: `backdrop-filter:
blur(16px)`, `background: rgba(255,255,255,0.3)`, `border: 1px solid
rgba(255,255,255,0.2)`, and `box-shadow: 0 8px 32px rgba(0,0,0,0.08)`.

CSS variables (`--glass-bg`, `--glass-bg-heavy`, `--glass-border`,
`--glass-shadow`, `--glass-blur`, `--radius-glass`) are the single
source of truth for glass styling — no hardcoded values in components.
Glass panels are visually effective against dark or image-rich
backgrounds; layout decisions should ensure sufficient contrast.

## Technology Constraints

- **Framework**: Next.js (App Router) with TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) — schema managed via migrations
- **Auth**: Prefer Vercel-native auth features where available; fall back
  to Supabase Auth for database-backed auth operations
- **Hosting**: Vercel — leverage edge functions, serverless APIs, and
  preview deployments
- **Styling**: Tailwind CSS (utility-first, no custom CSS frameworks)
- **Testing**: Vitest + React Testing Library (unit/TDD), Playwright
  (E2E/BDD acceptance tests). E2E tests MUST cover each user story in
  the spec, not just the first. Each user story's acceptance scenarios
  should have at least one corresponding E2E test. All E2E tests MUST
  pass across every configured Playwright project (desktop and mobile)
  before a feature branch is considered complete.
- **Package Manager**: npm
- **Test Infrastructure**: Shared mock helpers in `tests/unit/helpers/`
  (Supabase `mockFrom()` pattern, factory functions). Supabase mocks
  MUST include `then` property for Promise.all compatibility. React 19
  double-renders in jsdom — use `getAllBy*` queries. Prefer E2E tests
  for Radix UI/cmdk components; unit-test pure logic (hooks, actions,
  utilities). Avoid `vi.useFakeTimers()` with React async state.

## Development Workflow

1. **Specify** — Write feature spec with user stories and acceptance
   criteria (Given/When/Then)
2. **Plan** — Research technical approach, define data model and API
   contracts
3. **Test First** — Write BDD acceptance tests for user stories; write
   TDD unit tests for internal logic. Run tests and confirm they fail
   (Red). Use shared test helpers from `tests/unit/helpers/`.
4. **Implement** — Write the minimum code to make tests pass (Green).
   Run tests to confirm.
5. **Refactor** — Clean up while keeping tests green.
6. **Verify** — Run full test suite: `npm run test` (unit) and
   `npm run test:e2e --workers=1` (E2E across all projects). All tests
   MUST pass. E2E failures MUST be investigated and fixed — not
   deferred.
7. **Review** — Verify against constitution principles before merge.

Branch naming: `###-feature-name` (sequential numbering from speckit).
Each feature gets its own branch. Commits are granular and reference the
task ID.

## Governance

This constitution supersedes all other development practices and
preferences. Amendments require:
1. Documentation of the proposed change with rationale
2. Review of impact on existing features and in-progress work
3. Approval before merging

All PRs and code reviews MUST verify compliance with these principles.
When a principle conflicts with a practical need, the principle is
changed through the amendment process — not ignored.

**Version**: 2.2.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-24
