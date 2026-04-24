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
│   ├── actions/            # Server actions (admin.ts, auth.ts, rsvp.ts, upload.ts, floor-plan.ts, export.ts)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Tailwind v4 via @import
│   ├── error.tsx / not-found.tsx
├── components/
│   ├── floor-plan/         # Konva canvas floor plan editor (all client components)
│   │   ├── floor-plan-canvas.tsx    # Main canvas wrapper (Stage/Layer, compact top bar, label tracking)
│   │   ├── floor-plan-toolbar.tsx   # Undo/redo, zoom controls (inlined into top bar)
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
│   └── validations/        # Zod schemas (admin.ts, rsvp.ts, floor-plan.ts, upload.ts)
├── proxy.ts                # Auth middleware (NOT middleware.ts — renamed for Next.js 16 compat)
├── types/
│   └── floor-plan.ts       # Floor plan type definitions
supabase/
├── migrations/             # 7 migrations: users, weddings, rsvps, storage, floor_plans, seat_assignments, oauth_tokens
├── seed.sql                # Dev seed data (weddings, RSVPs, users — no floor plan data)
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

Constitution at `.specify/memory/constitution.md` (v2.0.0) defines 9 enforceable principles including Test Verification (Red-Green proven by execution), Security by Default (atomic upserts), Mobile Parity (`onTap` + `onClick`), Data Integrity (validate at serialization boundaries), and Glassmorphism Design System.

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
- **Chair count max**: Round tables use `maxChairs` (already includes +1); long tables use `maxChairs` directly — `getMaxChairCount` returns `getMaxChairs()` for both. Long table 6ft: default 7, max 8. Long table 7ft: default 9, max 10.
- **Floor plan server actions**: Use `adminClient` for reads/writes (bypasses RLS); `saveFloorPlan` uses atomic `upsert` on `wedding_id` — no read-then-write
- **Konva interactive nodes**: Every interactive shape must have `id` (for `findOne` lookups) and `onTap` alongside `onClick` (for mobile touch) — but `onTap` is Konva-only, not for regular HTML elements
- **Root page redirects**: `src/app/page.tsx` is a server component that reads auth session and redirects to `/auth/login`, `/dashboard`, or `/admin` — proxy.ts handles the same logic as middleware defense-in-depth
- **Logout**: Nav `LogoutButton` calls server action `signOut()` in `src/app/actions/auth.ts` (signOut is idempotent — no session guard needed)
- **Server action body size limit**: `next.config.ts` sets `serverActions.bodySizeLimit: "6mb"` — required because the default 1MB limit blocks template uploads before the 5MB app-level validation in `upload.ts` can run
- **Konva label tracking**: Labels are siblings (not children) of draggable shapes due to React Fragment wrapping. During drag-move, labels are found via `stage.findOne(`#${itemId}-label`)` and moved by the same pixel delta as the shape. All item components pass `id={`${id}-label`}` to `ItemLabel`.
- **Konva coordinate conventions**: Circle uses (x,y) as center; Rect uses (x,y) as top-left. The data model stores top-left for all items. Round tables and long tables compute center at render time; drag handlers convert back to top-left for storage. Both use `centerPixelsToTopLeftFeet()`.
- **Chair rotation**: Chairs (circles) don't independently rotate — only reposition (x/y) when their parent table rotates. `handleRotationEnd` applies rotation delta to chair positions via trig but omits `rotation` from the update.
- **Compact top bar**: Floor plan editor uses a single `glass-panel` bar at top (W/H inputs, undo/redo, zoom, save). No floating overlays at top of canvas. `containerRef` is on the inner canvas-area div so Stage dimensions exclude the 40px bar.
- **Canvas auto-centering**: `handleFitToScreen()` runs once on mount via `useEffect` with `hasFittedRef` guard, triggered when ResizeObserver reports actual container dimensions.
- **Glassmorphism design system**: The app uses a `.glass-panel` CSS utility class defined in `globals.css` with `backdrop-filter: blur(16px)`, `background: rgba(255,255,255,0.3)`, `border: 1px solid rgba(255,255,255,0.2)`, and `box-shadow: 0 8px 32px rgba(0,0,0,0.08)`. All card-like surfaces (forms, overlays, toolbars, modals) should use this pattern. CSS variables: `--glass-bg`, `--glass-bg-heavy`, `--glass-border`, `--glass-shadow`, `--glass-blur`, `--radius-glass`. Dark backgrounds make glass panels pop.
- **Turbopack stale routes**: After migrations or route changes, the dev server may serve 404 for routes it hasn't compiled. Fix: touch a file in the route directory (`touch src/app/\(public\)/w/\[slug\]/rsvp/page.tsx`) or restart the dev server. Always `curl` a page before debugging E2E failures.
- **E2E mobile click interception**: The mobile nav (`md:hidden fixed z-50`) overlays sidebar buttons on small viewports. Use `{ force: true }` on Playwright clicks for floor plan catalog items when targeting Mobile Chrome.
- **Undo history**: `canUndo` is true only after 2+ pushes (index > 0). Adding one item pushes the pre-add state but index stays at 0. Tests verifying undo must add at least 2 items before asserting `canUndo=true`.
- **Test infrastructure**: Shared helpers in `tests/unit/helpers/` — `mockFrom()` for Supabase chains, `factories.ts` for test data (`makeFloorPlanItem`, `makeRsvp`, etc.). New tests MUST use these instead of duplicating mocks. Current: 249 unit tests, 16 E2E spec files (90 tests across desktop + mobile).

## Active Technologies
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-konva, konva, Tailwind CSS v4, shadcn/ui (Nova theme), react-hook-form, zod (005-fix-coords-ui-layout)
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-konva, konva, shadcn/ui, zod, react-hook-form, @supabase/supabase-js (006-guest-seat-assignment)
- Supabase PostgreSQL — new `seat_assignments` table + existing `rsvps`, `floor_plans` (006-guest-seat-assignment)
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-hook-form, zod, Supabase JS, Tailwind CSS v4, shadcn/ui (007-venue-details-maps)
- Supabase PostgreSQL — new columns on existing `weddings` table (007-venue-details-maps)

## Recent Changes
- 005-fix-coords-ui-layout: Fixed Konva coordinate system (Circle center vs Rect top-left), added compact glass-panel top bar, real-time label tracking during drag, canvas auto-centering on load, chair rotation removal (chairs follow parent table only)
- 004-app-wide-ux-redesign: App-wide content density improvements across all pages
- 003-ux-polish-floorplan-fixes: Floor plan editor UX polish, Supabase Auth + Storage integration
