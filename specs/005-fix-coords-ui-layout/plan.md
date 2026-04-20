# Implementation Plan: Coordinate System Fix and UI Layout Overhaul

**Branch**: `005-fix-coords-ui-layout` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-fix-coords-ui-layout/spec.md`

## Summary

Fix critical Konva coordinate bugs (Circle center vs Rect top-left mismatch) causing chairs to not circle round tables and tables to rotate around corners. Then overhaul UI layout across all pages to reduce empty space, eliminate horizontal scrolling, and improve content density. Mockups will be created for designer review before UI implementation.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 16 (App Router) + React 19
**Primary Dependencies**: react-konva, konva, Tailwind CSS v4, shadcn/ui (Nova theme), react-hook-form, zod
**Storage**: Supabase PostgreSQL (existing `floor_plans` table — no new migrations)
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
**Target Platform**: Web browser (desktop: 768px+ for floor plan, 320px+ for all other pages)
**Project Type**: Web application (full-stack Next.js)
**Performance Goals**: Canvas interactions under 200ms, no visual glitches on drag/rotate
**Constraints**: Preserve existing data model (x,y = top-left), no database migrations needed
**Scale/Scope**: 13+ pages for UI overhaul, 3 core floor plan item components for coordinate fix

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec complete with 5 user stories, 14 FRs, 6 SCs |
| II. Type Safety | PASS | No new types needed; existing FloorPlanItem preserved |
| III. Component-First Architecture | PASS | Changes are within existing components |
| IV. User Experience First | PASS | Core UX bugs being fixed; layout improving density |
| V. Simplicity | PASS | Minimal change approach — fix rendering layer, not data model |
| VI. Security by Default | PASS | No auth/security changes; same server actions |
| VII. Mobile Parity | PASS | Floor plan minimum 768px; onClick+onTap already in place |
| VIII. Data Integrity | PASS | No data model changes; validate at serialization boundaries |

No violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-coords-ui-layout/
├── plan.md              # This file
├── research.md          # Phase 0: coordinate system analysis
├── data-model.md        # Phase 1: coordinate entities
├── quickstart.md        # Phase 1: test scenarios
├── checklists/          # Requirements quality checklist
└── tasks.md             # Phase 2: task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/floor-plan/
│   ├── floor-plan-canvas.tsx     # Drag/rotate handlers — FIX drag coordinate conversion
│   ├── item-catalog.tsx          # Collapsible sidebar — ADD collapse toggle
│   ├── items/
│   │   ├── round-table.tsx       # Circle rendering — FIX center calculation
│   │   ├── long-table.tsx        # Rect rendering — ADD offset for rotation
│   │   └── chair.tsx             # No changes needed
│   └── hooks/
│       └── use-chair-generation.ts  # No changes needed (already correct)
├── app/
│   ├── (public)/auth/login/page.tsx        # Wider card
│   ├── (public)/w/[slug]/page.tsx          # Landing page (via component)
│   ├── (auth)/dashboard/page.tsx           # Dashboard density
│   ├── (auth)/dashboard/floor-plan/page.tsx # Full-height canvas
│   ├── (auth)/admin/couples/page.tsx       # Side-by-side layout
│   ├── (auth)/admin/weddings/[id]/page.tsx  # Compact tabs
│   ├── error.tsx                           # Compact error
│   └── not-found.tsx                       # Compact 404
├── components/
│   └── rsvp-form.tsx                       # Wider form
└── lib/floor-plan/constants.ts             # No changes needed
```

**Structure Decision**: Single web application. Changes span floor plan components (coordinate fix) and page layouts (UI overhaul). No new files needed — all changes are edits to existing components.

## Complexity Tracking

No violations to justify.
