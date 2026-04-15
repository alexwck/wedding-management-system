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
npm run test:e2e     # Playwright E2E tests (tests/e2e/)
```

## Local Development Setup

1. Start Supabase locally: `npx supabase start` (requires Supabase CLI + Podman)
2. Copy `.env.example` to `.env.local` and fill in values from `npx supabase start` output
3. Run `npm run dev`
4. Seed data: `supabase/seed.sql` provides 3 users, 2 weddings, 6 RSVPs

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `GLM_AUTH_TOKEN` — Auth token for glm-claude.sh launch script

## Architecture

```
src/
├── app/
│   ├── (public)/           # Public route group (no auth required)
│   │   ├── auth/login/     # Login page
│   │   └── w/[slug]/       # Wedding landing pages (+ /rsvp sub-route)
│   ├── (auth)/             # Authenticated route group
│   │   ├── admin/          # Admin: manage weddings, couples
│   │   └── dashboard/      # Couple: manage own RSVPs
│   ├── actions/            # Server actions (admin.ts, rsvp.ts, upload.ts)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Tailwind v4 via @import
│   ├── error.tsx / not-found.tsx
├── components/
│   ├── ui/                 # shadcn/ui components (button, card, dialog, etc.)
│   ├── landing-page.tsx    # Wedding landing page component
│   ├── rsvp-form.tsx       # RSVP form with react-hook-form + zod
│   └── ...                 # Other app components
├── lib/
│   ├── supabase/           # Supabase clients: client.ts, server.ts, admin.ts
│   ├── utils.ts            # cn() helper and utilities
│   └── validations/        # Zod schemas (admin.ts, rsvp.ts)
├── proxy.ts                # Auth middleware (NOT middleware.ts — renamed for Next.js 16 compat)
├── types/                  # TypeScript type definitions
supabase/
├── migrations/             # 4 migrations: users, weddings, rsvps, storage policies
├── seed.sql                # Dev seed data
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

## Key Technologies

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 (CSS-based config in globals.css, no tailwind.config file) + shadcn/ui (Nova theme)
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth (email-based, admin/couple roles)
- **Storage**: Supabase Storage (`wedding-templates` bucket)
- **Forms**: react-hook-form + zod
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile Chrome)
- **TypeScript**: Strict mode, path alias `@/*` → `src/*`

## Gotchas

- **proxy.ts, not middleware.ts**: Auth middleware is named `src/proxy.ts` because Next.js 16 has a conflict with `middleware.ts` naming
- **Tailwind v4**: No `tailwind.config.js` — configuration lives in `globals.css` using `@theme` blocks
- **RSVP deduplication**: Unique constraint on `(wedding_id, LOWER(guest_name))` plus application-level checks
- **Server components by default**: Most components are RSCs; only form components use `"use client"`
- **Supabase client variants**: Three separate clients — `client.ts` (browser), `server.ts` (server components), `admin.ts` (service role, bypasses RLS)

## Launching Claude

Use `./glm-claude.sh` from repo root. Sets `ANTHROPIC_BASE_URL` and auth token from `.env.local`, maps model overrides (Haiku → glm-4.5-air, Sonnet/Opus → glm-5.1).
