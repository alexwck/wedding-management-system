<!--
  Sync Impact Report:
  Version change: N/A → 1.0.0
  Modified principles: N/A (initial ratification)
  Added sections:
    - Core Principles (5): I. Spec-Driven Development, II. Type Safety,
      III. Component-First Architecture, IV. User Experience First,
      V. Simplicity
    - Technology Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (generic)
    - .specify/templates/spec-template.md ✅ no changes needed (generic)
    - .specify/templates/tasks-template.md ✅ no changes needed (generic)
  Follow-up TODOs: None
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

### V. Simplicity

Start with the simplest solution that delivers the required value. YAGNI
applies: do not build for hypothetical future requirements. Prefer
platform-native features (Vercel for hosting/deploy, Supabase for
auth/database/storage) over self-built alternatives. Avoid premature
abstraction — three similar lines of code are better than a wrong
abstraction. Add complexity only when the current simple approach has
been proven insufficient.

## Technology Constraints

- **Framework**: Next.js (App Router) with TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) — schema managed via migrations
- **Auth**: Prefer Vercel-native auth features where available; fall back
  to Supabase Auth for database-backed auth operations
- **Hosting**: Vercel — leverage edge functions, serverless APIs, and
  preview deployments
- **Styling**: Tailwind CSS (utility-first, no custom CSS frameworks)
- **Testing**: Vitest + React Testing Library (unit/TDD), Playwright
  (E2E/BDD acceptance tests)
- **Package Manager**: npm (or pnpm if preferred — pick one and stay
  consistent)

## Development Workflow

1. **Specify** — Write feature spec with user stories and acceptance
   criteria (Given/When/Then)
2. **Plan** — Research technical approach, define data model and API
   contracts
3. **Test First** — Write BDD acceptance tests for user stories; write
   TDD unit tests for internal logic. Tests MUST fail (Red).
4. **Implement** — Write the minimum code to make tests pass (Green).
5. **Refactor** — Clean up while keeping tests green.
6. **Review** — Verify against constitution principles before merge.

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

**Version**: 1.0.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-13
