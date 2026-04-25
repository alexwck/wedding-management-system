# Implementation Plan: UX Polish & Bugfixes

**Branch**: `009-ux-polish-bugfixes` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-ux-polish-bugfixes/spec.md`

## Summary

Six features: (1) replace template focal point with drag-to-crop repositioning, (2) add collapsible assigned guests panel alongside unassigned, (3) add always-visible canvas statistics, (4) fix undo double-step bug, (5) add password confirmation to couple creation, (6) add resize handles for non-table floor plan items.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), React 19, react-konva, konva, react-hook-form, zod, shadcn/ui, Tailwind CSS v4, cmdk
**Storage**: Supabase PostgreSQL — `weddings.template_focal_x`, `template_focal_y` columns repurposed for crop offsets
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E, workers=1)
**Target Platform**: Web (desktop + mobile Chrome)
**Project Type**: Web application
**Performance Goals**: Stats update <1s, crop preview matches landing page exactly
**Constraints**: Konva canvas must handle onTap + onClick for mobile parity
**Scale/Scope**: Single-tenant per wedding, low concurrency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec with 6 user stories, acceptance criteria, clarifications done |
| II. Type Safety | PASS | All new code in TypeScript strict, Zod schemas for validation |
| III. Component-First Architecture | PASS | New components: crop preview, guest panel sections, stats component |
| IV. User Experience First | PASS | All features reduce cognitive load or fix broken interactions |
| V. Simplicity | PASS | Repurposing existing DB columns, no new tables or external deps |
| VI. Security by Default | PASS | Server actions already have auth checks; no new write endpoints needed for crop (reuses existing `updateTemplateFocalPoint`) |
| VII. Mobile Parity | PASS | Crop drag needs touch support; resize handles need onTap + onClick |
| VIII. Data Integrity | PASS | Crop offsets validated via Zod (0-100 range); resize dims validated per item type |
| IX. Glassmorphism | PASS | New panels use `.glass-panel` class |

## Project Structure

### Documentation (this feature)

```text
specs/009-ux-polish-bugfixes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── actions/
│   │   └── admin.ts                       # Modify: password confirmation in Zod schema
│   ├── (auth)/
│   │   ├── admin/couples/
│   │   │   └── page.tsx                   # No change (uses CreateCoupleForm)
│   │   ├── admin/weddings/[id]/floor-plan/
│   │   │   └── page.tsx                   # No change
│   │   └── dashboard/floor-plan/
│   │       └── page.tsx                   # No change
├── components/
│   ├── floor-plan/
│   │   ├── floor-plan-canvas.tsx          # Modify: fix undo bug, pass assigned guests to panel
│   │   ├── canvas-item.tsx               # Modify: add resize handles for non-table items
│   │   ├── unassigned-guests-panel.tsx    # Refactor: rename to guest-panel.tsx, add collapsible sections
│   │   ├── canvas-stats.tsx              # NEW: always-visible stats component
│   │   ├── hooks/
│   │   │   ├── use-floor-plan-state.ts   # Modify: expose computed stats
│   │   │   └── use-undo-redo.ts          # No change (bug is in caller, not hook)
│   │   └── items/                        # Modify: round-table, long-table disable resize
│   ├── template-preview.tsx              # Refactor: replace focal point click with drag-to-crop
│   ├── template-upload.tsx               # Modify: update preview integration
│   ├── landing-page.tsx                  # Modify: use crop offsets instead of object-position
│   ├── create-couple-form.tsx            # Modify: add confirm password field
│   └── ui/                               # May add: collapsible section component
├── lib/
│   ├── validations/
│   │   └── admin.ts                      # Modify: add confirmPassword to schema
│   └── floor-plan/
│       └── constants.ts                  # Modify: add min/max dims per non-table item type
└── types/
    └── floor-plan.ts                     # Modify: add resize-related type fields if needed

tests/
├── unit/
│   ├── components/
│   │   ├── floor-plan/
│   │   │   ├── canvas-stats.test.tsx     # NEW
│   │   │   ├── guest-panel.test.tsx      # NEW (or renamed from unassigned)
│   │   │   └── template-crop.test.tsx    # NEW (or renamed from template-preview)
│   │   └── create-couple-form.test.tsx   # Modify: add password mismatch tests
│   └── hooks/
│       └── use-undo-redo.test.ts         # Modify: add single-undo assertions
└── e2e/
    ├── template-crop.spec.ts             # NEW
    ├── guest-panel.spec.ts               # NEW (or modify existing floor-plan spec)
    ├── undo-fix.spec.ts                  # NEW
    ├── password-confirm.spec.ts          # NEW
    └── item-resize.spec.ts               # NEW
```

**Structure Decision**: Single web application following existing Next.js App Router conventions. All changes are in-place modifications to existing components with 3 new components (canvas-stats, guest-panel refactor, template-crop refactor).

## Complexity Tracking

No violations — all features use existing patterns, columns, and infrastructure.
