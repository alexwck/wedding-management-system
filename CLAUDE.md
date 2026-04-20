# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding management system built with Next.js 16 (App Router) and Supabase. Couples can create wedding landing pages with RSVP forms; admins manage all weddings and couples. Uses a specification-driven development workflow via speckit skills.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests (tests/unit/)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests (tests/e2e/, requires Supabase + dev server running)
supabase db reset    # Reset local DB, re-run migrations + seed data
```

## Architecture

```
src/
├── app/
│   ├── (public)/           # Public route group (no auth required)
│   │   ├── auth/login/     # Login page
│   │   └── w/[slug]/       # Wedding landing pages (+ /rsvp sub-route)
│   ├── (auth)/             # Authenticated route group
│   │   ├── admin/          # Admin: manage weddings, couples
│   │   │   └── weddings/[id]/floor-plan/  # Admin floor plan editor
│   │   └── dashboard/      # Couple: manage own RSVPs
│   │       └── floor-plan/ # Couple floor plan editor
│   ├── actions/            # Server actions (admin.ts, auth.ts, rsvp.ts, upload.ts, floor-plan.ts)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Tailwind v4 via @import
│   ├── error.tsx / not-found.tsx
├── components/
│   ├── floor-plan/         # Konva canvas floor plan editor (all client components)
│   │   ├── floor-plan-canvas.tsx    # Main canvas wrapper (Stage/Layer, controls)
│   │   ├── floor-plan-toolbar.tsx   # Undo/redo, zoom controls
│   │   ├── item-catalog.tsx         # Sidebar of placeable items
│   │   ├── items/                   # Konva shape components (round-table, long-table, chair, etc.)
│   │   └── hooks/                   # use-floor-plan-state, use-auto-save, use-collision-detection, etc.
│   ├── ui/                 # shadcn/ui components (button, card, dialog, etc.)
│   ├── landing-page.tsx    # Wedding landing page component
│   ├── rsvp-form.tsx       # RSVP form with react-hook-form + zod
│   └── ...                 # Other app components
├── lib/
│   ├── floor-plan/         # Floor plan utilities (constants, collision, serializers)
│   ├── supabase/           # Supabase clients: client.ts, server.ts, admin.ts
│   ├── utils.ts            # cn() helper and utilities
│   └── validations/        # Zod schemas (admin.ts, rsvp.ts, floor-plan.ts)
├── proxy.ts                # Auth middleware (NOT middleware.ts — renamed for Next.js 16 compat)
├── types/
│   └── floor-plan.ts       # Floor plan type definitions
supabase/
├── migrations/             # 5 migrations: users, weddings, rsvps, storage, floor_plans
├── seed.sql                # Dev seed data (includes sample floor plan for wedding 1)
├── config.toml             # Supabase local config
```

## Speckit Workflow

Specification-driven development via slash-command skills:

1. `/speckit-constitution` → `.specify/memory/constitution.md`
2. `/speckit-specify` → `specs/###-feature-name/spec.md`
3. `/speckit-clarify` → Clarify spec ambiguities
4. `/speckit-plan` → Implementation plan in `specs/###-feature-name/`
5. `/speckit-tasks` → Dependency-ordered tasks
6. `/speckit-analyze` → Check spec/plan/tasks consistency
7. `/speckit-implement` → Execute tasks in dependency order
8. `/speckit-checklist` → Validate requirements quality

Git hooks in `.specify/extensions.yml` auto-commit at each stage.

Constitution at `.specify/memory/constitution.md` (v1.1.0) defines 8 enforceable principles including Security by Default (atomic upserts, server-side role checks), Mobile Parity (`onTap` + `onClick`), and Data Integrity (validate at serialization boundaries, no blind casts).

## Key Technologies

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 (CSS-based config in globals.css, no tailwind.config file) + shadcn/ui (Nova theme)
- **Canvas**: react-konva + konva for interactive 2D floor plan editor
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth (email-based, admin/couple roles)
- **Storage**: Supabase Storage (`wedding-templates` bucket)
- **Forms**: react-hook-form + zod
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile Chrome)
- **TypeScript**: Strict mode, path alias `@/*` → `src/*`

## Git Hooks

Shared git hooks live in `.githooks/` and are committed to the repo. Each collaborator needs to run once:

```bash
git config core.hooksPath .githooks
```

| Hook | Purpose |
|------|---------|
| `prepare-commit-msg` | Strips `Co-Authored-By` lines from commit messages |

## Gotchas

- **proxy.ts, not middleware.ts**: Auth middleware is named `src/proxy.ts` because Next.js 16 has a conflict with `middleware.ts` naming
- **Tailwind v4**: No `tailwind.config.js` — configuration lives in `globals.css` using `@theme` blocks
- **RSVP deduplication**: Unique constraint on `(wedding_id, LOWER(guest_name))` plus application-level checks
- **Server components by default**: Most components are RSCs; only form components and canvas components use `"use client"`
- **Supabase client variants**: Three separate clients — `client.ts` (browser), `server.ts` (server components), `admin.ts` (service role, bypasses RLS)
- **Floor plan item IDs**: Arbitrary strings (e.g. `"fp-rt-1"`), not UUIDs — Zod schema validates `z.string().min(1)`
- **Chair count max**: Round tables use `maxChairs` (already includes +1); long tables use `maxChairs` directly (equals default count) — `getMaxChairCount` returns `getMaxChairs()` for both
- **Floor plan server actions**: Use `adminClient` for reads/writes (bypasses RLS); `saveFloorPlan` uses atomic `upsert` on `wedding_id` — no read-then-write
- **Konva interactive nodes**: Every interactive shape must have `id` (for `findOne` lookups) and `onTap` alongside `onClick` (for mobile touch) — but `onTap` is Konva-only, not for regular HTML elements
- **Root page redirects**: `src/app/page.tsx` is a server component that reads auth session and redirects to `/auth/login`, `/dashboard`, or `/admin` — proxy.ts handles the same logic as middleware defense-in-depth
- **Logout**: Nav component calls both client-side `supabase.auth.signOut()` and server action `signOut()` in `src/app/actions/auth.ts`

## Active Technologies
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19, Supabase Auth + Storage, react-konva, Tailwind CSS v4, shadcn/ui, react-hook-form, zod (003-ux-polish-floorplan-fixes)
- Supabase PostgreSQL (floor_plans table), Supabase Storage (wedding-templates bucket) (003-ux-polish-floorplan-fixes)

## Recent Changes
- 003-ux-polish-floorplan-fixes: Added TypeScript (strict mode) with Next.js 16 (App Router) + React 19, Supabase Auth + Storage, react-konva, Tailwind CSS v4, shadcn/ui, react-hook-form, zod
