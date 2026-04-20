<!--
  Sync Impact Report:
  Version change: 1.1.0 → 1.2.0
  Modified principles:
    - I. Spec-Driven Development: added Test Verification principle
  Modified sections:
    - Technology Constraints: strengthened E2E testing requirements
    - Development Workflow: added test execution gates
  Templates requiring updates:
    - .specify/templates/tasks-template.md — add E2E execution task
      to Polish phase
  Follow-up TODOs:
    - Update tasks-template.md to include "Run full E2E suite" as a
      mandatory Polish phase task
-->

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

## Development Workflow

1. **Specify** — Write feature spec with user stories and acceptance
   criteria (Given/When/Then)
2. **Plan** — Research technical approach, define data model and API
   contracts
3. **Test First** — Write BDD acceptance tests for user stories; write
   TDD unit tests for internal logic. Run tests and confirm they fail
   (Red).
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

**Version**: 1.2.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-20
