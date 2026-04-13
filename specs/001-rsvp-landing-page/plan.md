# Implementation Plan: RSVP Landing Page & Form

**Branch**: `001-rsvp-landing-page` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-rsvp-landing-page/spec.md`

## Summary

Build a wedding RSVP system where admins upload Canva-designed invitation
templates as landing pages with shareable links. Guests view the landing page
and submit RSVPs (status, dietary notes, vegetarian, baby chair) without
authentication. Duplicate RSVPs are prevented by guest name per wedding.
Couples log in to view their RSVP responses. Admins manage all weddings,
couples, and templates.

Technical approach: Next.js App Router with Supabase (Auth, PostgreSQL,
Storage). shadcn/ui + react-hook-form + zod for forms. RLS for data
isolation. Server Components for data fetching; Client Components for
interactive forms only.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router), Supabase JS Client, shadcn/ui, react-hook-form, zod, Tailwind CSS
**Storage**: Supabase PostgreSQL (database), Supabase Storage (image uploads)
**Testing**: Vitest + React Testing Library (unit/TDD), Playwright (E2E/BDD)
**Target Platform**: Web (mobile-first responsive), deployed on Vercel
**Project Type**: Web application (SSR + API routes)
**Performance Goals**: Landing page < 3s load on mobile, RSVP submission < 2s, < 200ms perceived interaction response
**Constraints**: Mobile-responsive 320px-2560px, 10MB max file upload, 500 char dietary notes limit
**Scale/Scope**: Small — tens of weddings, hundreds of RSVPs per wedding, 3 user roles (admin, couple, guest)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec written, clarified, and approved before planning |
| II. Type Safety | PASS | TypeScript strict mode, zod schemas shared client/server, generated Supabase types |
| III. Component-First Architecture | PASS | Next.js App Router, Server Components default, Client Components for forms only |
| IV. User Experience First | PASS | Mobile-first, inline form validation, clear feedback on submit, < 3s load target |
| V. Simplicity | PASS | Supabase for auth+DB+storage (platform-native), shadcn/ui for UI components, no premature abstraction |

**Post-Phase 1 re-check**: All gates still pass. Data model uses simple
relational tables (no over-normalization). API contracts use Server Actions
(simplest Next.js pattern for mutations). No unnecessary abstractions.

## Project Structure

### Documentation (this feature)

```text
specs/001-rsvp-landing-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                    # Root layout with Supabase providers
│   ├── globals.css                   # Tailwind + shadcn/ui CSS variables
│   ├── (public)/
│   │   ├── w/[slug]/
│   │   │   ├── page.tsx              # Landing page (Server Component)
│   │   │   └── rsvp/
│   │   │       └── page.tsx          # RSVP form page
│   │   └── auth/
│   │       └── login/
│   │           └── page.tsx          # Login page
│   ├── (auth)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard nav layout
│   │   │   ├── page.tsx              # Couple dashboard overview
│   │   │   └── rsvps/
│   │   │       └── page.tsx          # RSVP list with summary
│   │   └── admin/
│   │       ├── layout.tsx            # Admin nav layout
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── weddings/
│   │       │   ├── page.tsx          # Wedding list
│   │       │   └── [id]/
│   │       │       └── page.tsx      # Manage wedding + upload template
│   │       └── couples/
│   │           └── page.tsx          # Create/manage couple accounts
│   └── actions/
│       ├── rsvp.ts                   # RSVP submission server action
│       ├── upload.ts                 # Image upload server action
│       └── admin.ts                  # Admin server actions
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── landing-page.tsx              # Landing page with CTA (Server Component)
│   ├── rsvp-form.tsx                 # RSVP form (Client Component)
│   ├── rsvp-summary.tsx              # RSVP summary cards
│   ├── rsvp-table.tsx                # RSVP response table
│   ├── template-upload.tsx           # Image upload component (Client Component)
│   ├── create-couple-form.tsx        # Admin: create couple form
│   └── nav.tsx                       # Navigation component
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client
│   │   └── admin.ts                  # Admin Supabase client (service role)
│   ├── validations/
│   │   ├── rsvp.ts                   # Zod schema for RSVP form
│   │   └── admin.ts                  # Zod schema for admin forms
│   └── utils.ts                      # Utility functions (cn, etc.)
├── middleware.ts                      # Auth middleware for protected routes
└── types/
    └── database.ts                   # Supabase generated types

supabase/
├── config.toml
├── migrations/
│   ├── 001_create_users.sql
│   ├── 001_create_weddings.sql
│   └── 001_create_rsvps.sql
└── seed.sql

tests/
├── e2e/
│   ├── rsvp-flow.spec.ts             # BDD: Guest submits RSVP
│   ├── duplicate-rsvp.spec.ts        # BDD: Duplicate name prevention
│   ├── landing-page.spec.ts          # BDD: Landing page renders
│   ├── couple-dashboard.spec.ts      # BDD: Couple views RSVPs
│   └── admin-manage.spec.ts          # BDD: Admin manages weddings
└── unit/
    ├── validations.test.ts           # Zod schema tests
    └── rsvp-form.test.tsx            # RSVP form component tests
```

**Structure Decision**: Single Next.js project using App Router with route
groups `(public)` and `(auth)` to separate access levels. Supabase migrations
at repo root. Tests in `tests/` directory. This is the simplest structure for
a full-stack web app per constitution principle V (Simplicity).

## Complexity Tracking

No constitution violations. No entries needed.
