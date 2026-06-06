# AGENTS.md

Concise entry point for coding agents in this repository. Keep this file small and
universally useful; task-specific context lives under `docs/agent/`.

## Start Here

1. Read the user's request, then inspect `git status --short` before editing.
2. Run `find docs/agent -name "*.md" | sort` and read only the docs relevant to the task.
3. Prefer source-of-truth files (`package.json`, `tsconfig.json`, `src/*`, `supabase/*`,
   `tests/*`) over copied snippets when details may have changed.
4. Keep `AGENTS.md` and `CLAUDE.md` synchronized when changing entry-point guidance.

## Project Snapshot

Wedding management system built with Next.js 16 App Router, React 19, TypeScript,
Tailwind CSS v4, and Supabase. Couples have public single-page wedding sites at
`/w/[slug]` with venue details and RSVP; admins manage weddings and couples; couples
manage RSVPs and floor plans.

Main code lives in `src/app`, `src/components`, `src/lib`, `src/types`, `supabase`,
`tests`, and `specs`.

## Core Commands

- `npm run dev` - start Next.js on `http://localhost:3000`
- `npm run build` - production build using webpack
- `npm run lint` - ESLint
- `npm run test` - Vitest unit/component tests
- `npm run test:e2e` - Playwright E2E tests
- `npm run test:e2e:prod` - Playwright against a production server
- `supabase db reset` - reset local DB, migrations, and seed data

## Documentation Map

- `docs/agent/README.md` - how agent docs are organized and maintained
- `docs/agent/project-map.md` - architecture, commands, stack, source-of-truth files
- `docs/agent/workflows.md` - Speckit, git hooks, and documentation workflow
- `docs/agent/testing.md` - test pyramid, QA-review expectations, Playwright gotchas
- `docs/agent/data-auth-rsvp.md` - Supabase, auth, RSVP, venue, upload, lock rules
- `docs/agent/floor-plan.md` - Konva floor-plan editor behavior and invariants
- `docs/agent/ui-design.md` - UI/design guidance and links to `DESIGN.md`
- `docs/agent/deployment.md` - production deployment notes and links to `DEPLOYMENT.md`

## Operating Rules

- Follow existing local patterns before adding new abstractions.
- Server components are the default; use `"use client"` only for browser state, forms, or canvas.
- Auth middleware is `src/proxy.ts`, not `middleware.ts`.
- Validate at serialization and action boundaries with Zod; keep service-role Supabase access server-only.
- Run the narrowest meaningful tests first, then broader checks when shared workflows are touched.
- Do not let session lessons accrete here; update the smallest relevant `docs/agent/*.md`.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/014-e2e-speedup/plan.md (Speed Up Playwright E2E Suite)
<!-- SPECKIT END -->
