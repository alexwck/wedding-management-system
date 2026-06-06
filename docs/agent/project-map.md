# Project Map

## Purpose

Wedding management system for couples and admins. Couples can publish a public wedding
page, collect RSVPs, and manage floor plans. Admins manage all weddings, couples, RSVP
data, venue details, template images, and locks.

## Stack

| Area | Tooling |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript strict mode |
| Styling | Tailwind CSS v4 configured in `src/app/globals.css`, shadcn/ui, Nova Glass |
| Data | Supabase PostgreSQL with RLS, Supabase Auth, Supabase Storage |
| Forms | react-hook-form and Zod |
| Canvas | Konva and react-konva |
| Tests | Vitest, React Testing Library, Playwright |
| Monitoring | Sentry Next.js SDK |

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server at `http://localhost:3000`. |
| `npm run build` | Build production output with webpack via `next build --webpack`. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint flat config. |
| `npm run test` | Run Vitest once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run Playwright E2E. |
| `npm run test:e2e:prod` | Run Playwright with `PW_USE_PROD=1`. |
| `supabase db reset` | Reset local DB, migrations, and seed data. |

## Source Of Truth

- Commands and dependencies: `package.json`
- Path alias: `tsconfig.json` maps `@/*` to `src/*`
- App routes: `src/app`
- Auth middleware: `src/proxy.ts`
- Server actions: `src/app/actions`
- Supabase clients: `src/lib/supabase`
- Validation schemas: `src/lib/validations`
- Migrations and seed data: `supabase/migrations`, `supabase/seed.sql`
- Tests: `tests/unit`, `tests/e2e`
- Design system: `DESIGN.md`, `src/app/globals.css`, `src/components/glassmorphism`
- Deployment guide: `DEPLOYMENT.md`

## Directory Shape

```text
src/
  app/
    (public)/auth/login/
    (public)/w/[slug]/
    (auth)/admin/
    (auth)/dashboard/
    actions/
  components/
    floor-plan/
    glassmorphism/
    ui/
  lib/
    design-system/
    floor-plan/
    supabase/
    validations/
  types/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  e2e/
specs/
```

## Route Notes

- Public wedding pages are single-page routes at `/w/[slug]`: hero, venue, RSVP.
- There is no separate `/w/[slug]/rsvp` route.
- Root `src/app/page.tsx` redirects by auth state to `/auth/login`, `/dashboard`, or `/admin`.
- `src/proxy.ts` mirrors auth protections as defense in depth; do not rename it to
  `middleware.ts` unless Next.js compatibility is re-verified.

## Implementation Defaults

- Server components by default; mark components `"use client"` only for browser-only state,
  forms, hooks, file input, or Konva canvas work.
- Use existing shadcn/ui, glassmorphism, and local helper APIs before adding new primitives.
- For structured data, prefer existing Zod schemas and serializers over ad hoc parsing.
- Keep service-role Supabase calls on the server only.
