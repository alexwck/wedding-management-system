# Implementation Plan: UX Polish & Floor Plan Fixes

**Branch**: `003-ux-polish-floorplan-fixes` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-ux-polish-floorplan-fixes/spec.md`

## Summary

Seven fixes and enhancements: root redirect to dashboard, logout feature, admin/dashboard cross-role access control, file upload constraints (5MB, JPG/PNG only), chair rendering as 1x1 ft circles with spacing fix, long table max chair count correction, and null reference crash fix in floor plan item selection.

## Technical Context

**Language/Version**: TypeScript (strict mode) with Next.js 16 (App Router)
**Primary Dependencies**: React 19, Supabase Auth + Storage, react-konva, Tailwind CSS v4, shadcn/ui, react-hook-form, zod
**Storage**: Supabase PostgreSQL (floor_plans table), Supabase Storage (wedding-templates bucket)
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
**Target Platform**: Web — modern browsers (desktop + mobile Chrome)
**Project Type**: Web application
**Performance Goals**: Page loads under 2s, interactions under 200ms
**Constraints**: Must preserve round table max chair behavior (recommended + 1)
**Scale/Scope**: Small — dev-stage system, <100 users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec complete with 7 user stories, 16 FRs, 6 SCs |
| II. Type Safety | PASS | All changes in TypeScript strict mode; Zod schemas for validation |
| III. Component-First Architecture | PASS | Logout added to shared Nav component; Chair shape change is rendering-only |
| IV. User Experience First | PASS | Logout provides clear session feedback; redirect reduces confusion |
| V. Simplicity | PASS | No new abstractions — modifying existing components and middleware |
| VI. Security by Default | PASS | Access control enforced server-side in proxy.ts; logout terminates Supabase session; upload validation server-side |
| VII. Mobile Parity | PASS | Logout button needs both onClick and onTap; Chair rendering is visual-only |
| VIII. Data Integrity | PASS | Floor plan reset via direct DB operation (not read-then-write); upload validation at serialization boundary |

**Result**: PASS — no violations. Pre-Phase 0 and post-Phase 1 checks both pass.

### Post-Phase 1 Re-check

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| VI. Security by Default | PASS | Logout uses dual signOut (server + client); access control in proxy.ts is server-side |
| VII. Mobile Parity | PASS | Logout button will include both onClick and onTap handlers |
| VIII. Data Integrity | PASS | Chair position calculations use center-anchor math; stored as top-left coordinates consistently |

**Result**: PASS — design maintains all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/003-ux-polish-floorplan-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   │   └── auth/login/page.tsx        # Logout redirect target
│   ├── (auth)/
│   │   ├── admin/                     # Admin-only routes (FR-006 blocks couples)
│   │   └── dashboard/                 # Couple-only routes (FR-007 blocks admins)
│   ├── actions/
│   │   ├── upload.ts                  # Update: 5MB limit, JPG/PNG only
│   │   └── floor-plan.ts             # Floor plan reset action
│   ├── page.tsx                       # Replace: redirect to dashboard/admin/login
│   └── layout.tsx
├── components/
│   ├── floor-plan/
│   │   ├── floor-plan-canvas.tsx      # Fix: null guard on handleSelectItem
│   │   ├── items/chair.tsx            # Change: Rect → Circle, 1x1 ft
│   │   ├── item-catalog.tsx           # May need client-side file validation
│   │   └── hooks/
│   │       ├── use-chair-generation.ts # Fix: spacing, long table max
│   │       └── use-floor-plan-state.ts # Remove chair from DIMENSION_EDITABLE_TYPES
│   ├── nav.tsx                        # Add: logout button
│   └── ui/
├── lib/
│   ├── floor-plan/
│   │   └── constants.ts              # Update: chair defaults, long table max
│   └── supabase/
│       └── server.ts                  # Logout uses existing server client
└── proxy.ts                           # Update: root redirect, role-based access control
```

## Complexity Tracking

> No violations — table not needed.
