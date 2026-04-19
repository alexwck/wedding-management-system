# Implementation Plan: Wedding Floor Plan Designer

**Branch**: `002-wedding-floor-plan` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-wedding-floor-plan/spec.md`

## Summary

Build an interactive 2D floor plan designer where admin and couples can define venue dimensions, place furniture items (tables, chairs, stage, etc.) with drag-and-drop, free rotation, collision detection, and automatic chair population around tables. Uses Konva.js via react-konva for the interactive canvas, persisted to Supabase.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: react-konva + konva (canvas), zod (validation), react-hook-form
**Storage**: Supabase PostgreSQL (new `floor_plans` and `floor_plan_items` tables)
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E/BDD)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application (Next.js 16 App Router)
**Performance Goals**: Smooth drag/zoom for 50+ items, interactions under 200ms perceived response
**Constraints**: Touch support required, collision detection in real-time, auto-save every 5s
**Scale/Scope**: One floor plan per wedding, max 300ft x 300ft venue

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec completed with clarifications, acceptance criteria defined |
| II. Type Safety | PASS | All entities typed, strict mode enforced |
| III. Component-First Architecture | PASS | Floor plan is a client component (requires canvas interactivity), composed from item primitives |
| IV. User Experience First | PASS | Auto-save, collision feedback, inline label editing, touch support |
| V. Simplicity | PASS | Single library (Konva) for all canvas needs, extends existing auth/routing patterns |

No violations detected. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-wedding-floor-plan/
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
│   ├── (auth)/
│   │   ├── admin/weddings/[id]/floor-plan/page.tsx   # Admin floor plan view
│   │   └── dashboard/floor-plan/page.tsx              # Couple floor plan view
│   └── actions/
│       └── floor-plan.ts                              # Server actions for CRUD
├── components/
│   ├── floor-plan/
│   │   ├── floor-plan-canvas.tsx       # Main canvas wrapper (client component)
│   │   ├── floor-plan-canvas.tsx       # Konva Stage/Layer setup
│   │   ├── item-catalog.tsx            # Sidebar catalog of placeable items
│   │   ├── floor-plan-toolbar.tsx      # Undo/redo, zoom controls
│   │   ├── items/
│   │   │   ├── round-table.tsx         # Round table Konva shape
│   │   │   ├── long-table.tsx          # Viking/long table Konva shape
│   │   │   ├── chair.tsx               # Chair Konva shape
│   │   │   ├── stage-item.tsx          # Stage Konva shape
│   │   │   ├── pillar-item.tsx         # Pillar Konva shape
│   │   │   ├── walkway-item.tsx        # Walkway Konva shape
│   │   │   ├── misc-item.tsx           # Misc item Konva shape
│   │   │   └── item-label.tsx          # Editable label Konva text
│   │   └── hooks/
│   │       ├── use-floor-plan-state.ts # Canvas state management
│   │       ├── use-collision-detection.ts
│   │       ├── use-chair-generation.ts
│   │       ├── use-undo-redo.ts
│   │       └── use-auto-save.ts
│   └── ui/                             # Existing shadcn/ui components
├── lib/
│   ├── validations/
│   │   └── floor-plan.ts               # Zod schemas for floor plan data
│   └── floor-plan/
│       ├── constants.ts                # Item catalog definitions, chair capacities
│       ├── collision.ts                # Collision detection algorithms
│       └── serializers.ts              # State ↔ DB format conversion
├── types/
│   └── floor-plan.ts                   # TypeScript type definitions
supabase/
└── migrations/
    └── 20260419000001_create_floor_plans.sql
tests/
├── unit/
│   └── floor-plan/
│       ├── collision.test.ts
│       ├── chair-generation.test.ts
│       └── serializers.test.ts
└── e2e/
    └── floor-plan.spec.ts
```

**Structure Decision**: Extends the existing project structure. Floor plan pages slot into existing `(auth)` route groups. New `components/floor-plan/` directory holds all canvas-related code. Follows the same pattern as RSVP form components (client components with server actions for persistence).

## Complexity Tracking

No constitution violations to justify.
