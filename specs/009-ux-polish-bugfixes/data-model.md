# Data Model: UX Polish & Bugfixes

**Feature**: 009-ux-polish-bugfixes | **Date**: 2026-04-25

## Database Changes

No schema migrations required. All features repurpose existing columns or use client-side computed state.

### Existing Columns Used

| Table | Column | Current Use | New Use |
|-------|--------|-------------|---------|
| `weddings` | `template_focal_x` | Focal point X percentage (0-100) | Crop offset X percentage (0-100) |
| `weddings` | `template_focal_y` | Focal point Y percentage (0-100) | Crop offset Y percentage (0-100) |

### Data Flow Changes

**Before (focal point)**:
- User clicks on image → percentage coordinates saved
- Landing page: `object-position: ${x}% ${y}%` with `object-contain`

**After (crop offset)**:
- User drags image within frame → percentage offset saved
- Landing page: `object-position: ${x}% ${y}%` with `object-cover`

The column semantics shift from "interesting point" to "which portion is visible." The data type (FLOAT, 0-100) remains identical.

## Client-Side Entities

### Canvas Statistics (computed, not persisted)

Derived from existing `items` array and `assignmentMap`:

```
CanvasStats {
  roundTableCount: number    // items where type === 'round-table'
  longTableCount: number     // items where type === 'long-table'
  totalChairs: number        // sum of all chair items
  assignedChairs: number     // chairs with entries in assignmentMap
  emptyChairs: number        // totalChairs - assignedChairs
}
```

### Guest Panel State (computed, not persisted)

Derived from existing `unassignedGuests` and `assignmentMap`:

```
AssignedGuest {
  guestName: string
  tableNumber: string        // derived from parent table item ID or label
}
```

### Undo Snapshot (captured on every action, not persisted)

```
Snapshot {
  items: FloorPlanItem[]
  width: number              // venue width in feet
  height: number             // venue height in feet
  assignmentMap: SeatAssignmentMap  // chair ID → { guestName, rsvpId }
  unassignedGuests: UnassignedGuest[]  // guests not assigned to any chair
}
```

All fields are `structuredClone`'d for isolation. History capped at 20 snapshots (MAX_HISTORY_SIZE).

### Item Resize Bounds (constants, not persisted)

Added to existing `FLOOR_PLAN_ITEMS` in `constants.ts`:

```
ResizeBounds {
  minWidth: number   // feet
  maxWidth: number   // feet
  minHeight: number  // feet
  maxHeight: number  // feet
}
```

Per-item defaults:
- Stage: min 4x3, max 20x20
- Pillar: min 1x1, max 6x6
- Walkway: min 2x1, max 20x10
- Misc: min 1x1, max 15x15
- Round tables: N/A (not resizable)
- Long tables: N/A (not resizable)

### Password Confirmation (form-only, not persisted)

```
CreateCoupleForm {
  email: string
  password: string
  confirmPassword: string   // NEW — validated client-side only
  displayName: string
  coupleName: string
}
```

Zod schema addition: `.refine(data => data.password === data.confirmPassword)`
Server action receives `{ password, ... }` without `confirmPassword` (stripped before API call).
