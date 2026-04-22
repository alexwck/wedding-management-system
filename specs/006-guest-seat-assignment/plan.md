# Implementation Plan: Guest Seat Assignment

**Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-guest-seat-assignment/spec.md`

## Summary

Add guest-to-seat assignment to the floor plan editor. Couples and admins click chairs to assign attending RSVP guests via a searchable dialog. Occupied chairs show a filled color + guest name label. A sidebar panel tracks unassigned guests. Assignments persist in a new `seat_assignments` table linked to RSVPs, display in the dashboard RSVP table, and export to Google Sheets.

## Technical Context

**Language/Version**: TypeScript (strict mode) with Next.js 16 (App Router) + React 19
**Primary Dependencies**: react-konva, konva, shadcn/ui, zod, react-hook-form, @supabase/supabase-js
**Storage**: Supabase PostgreSQL — new `seat_assignments` table + existing `rsvps`, `floor_plans`
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile Chrome)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Assignment dialog opens < 200ms, panel updates < 1s, canvas renders 60fps
**Constraints**: Must work on mobile touch (Konva onTap), glass-panel design system
**Scale/Scope**: Up to ~500 guests per wedding, ~200 chairs per floor plan

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec written and clarified. TDD workflow will be followed. |
| II. Type Safety | PASS | New types in `src/types/seat-assignment.ts`, Zod schemas for all boundaries. No `any`. |
| III. Component-First Architecture | PASS | New components: dialog, panel, hook. Server components where possible. |
| IV. User Experience First | PASS | Searchable dialog, real-time panel updates, visual chair indicators. |
| V. Simplicity | PASS | Separate table (simplest query pattern), reuses existing label/dialog infrastructure. |
| VI. Security by Default | PASS | Server actions verify auth + wedding ownership before mutations. Atomic inserts. |
| VII. Mobile Parity | PASS | Chair click uses Konva `onTap` + `onClick`. Dialog works on mobile viewports. |
| VIII. Data Integrity | PASS | Zod validation on inputs, unique constraints prevent double-assignment, cleanup orphans. |
| IX. Glassmorphism Design System | PASS | Dialog and panel use `.glass-panel` class and CSS variables. |

## Project Structure

### Documentation (this feature)

```text
specs/006-guest-seat-assignment/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   └── server-actions.md  # Server action contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
# New files
supabase/migrations/*_add_seat_assignments.sql
src/types/seat-assignment.ts
src/lib/validations/seat-assignment.ts
src/app/actions/seat-assignment.ts
src/components/floor-plan/guest-assignment-dialog.tsx
src/components/floor-plan/unassigned-guests-panel.tsx
src/components/floor-plan/hooks/use-seat-assignments.ts

# Modified files
src/components/floor-plan/items/chair.tsx           # occupied visual indicator
src/components/floor-plan/floor-plan-canvas.tsx      # chair click → assignment dialog
src/app/actions/floor-plan.ts                        # cleanup orphaned assignments on save
src/app/(auth)/dashboard/rsvps/page.tsx              # assignment columns in RSVP table
src/app/(auth)/admin/weddings/[id]/page.tsx          # assignment info in admin view
src/lib/validations/floor-plan.ts                    # (no changes expected)
```

**Structure Decision**: Single-project web app. All new files follow existing directory conventions — types in `src/types/`, actions in `src/app/actions/`, components in `src/components/floor-plan/`.

## Complexity Tracking

> No violations — all principles pass.
