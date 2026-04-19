# Quickstart: Wedding Floor Plan Designer

## Setup

1. Install new dependencies:
```bash
npm install konva react-konva
```

2. Run the new migration:
```bash
supabase db reset
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard/floor-plan` | Couple | Couple's own wedding floor plan |
| `/admin/weddings/[id]/floor-plan` | Admin | Any wedding's floor plan |

## Key Files

- **Canvas**: `src/components/floor-plan/floor-plan-canvas.tsx` — Main interactive canvas (client component)
- **State hook**: `src/components/floor-plan/hooks/use-floor-plan-state.ts` — Items array, add/remove/move/update
- **Server actions**: `src/app/actions/floor-plan.ts` — `getFloorPlan`, `saveFloorPlan`
- **Migration**: `supabase/migrations/20260419000001_create_floor_plans.sql`
- **Types**: `src/types/floor-plan.ts`
- **Constants**: `src/lib/floor-plan/constants.ts` — Item catalog with sizes and chair counts

## Architecture Notes

- The floor plan canvas is a **client component** (`"use client"`) because Konva requires browser APIs
- Item state lives in React hooks, auto-saved to Supabase via debounced server action calls
- Collision detection uses Separating Axis Theorem (SAT) for rotated bounding boxes
- Chairs are auto-generated as child items with `parentItemId` linking them to their table
- Undo/redo maintains a history stack of the last 20 state snapshots
