# Server Action Contracts: UX Polish & Bugfixes

**Feature**: 009-ux-polish-bugfixes | **Date**: 2026-04-25

## Existing Server Actions (Modified)

### updateTemplateFocalPoint

**File**: `src/app/actions/admin.ts`

**No signature change** — the action already accepts `(weddingId: string, focalX: number, focalY: number)`.

The semantics shift from "focal point" to "crop offset" but the contract is identical:
- Input: wedding ID + two percentage values (0-100)
- Validation: `focalPointSchema` (z.number().min(0).max(100) for both)
- Output: `{ ok: true }` or `{ ok: false, error: string }`

### createCoupleAccount

**File**: `src/app/actions/admin.ts`

**No signature change** — the server action receives the same fields. The `confirmPassword` field is stripped client-side before the FormData is constructed.

## New Client-Side Contracts

### Canvas Stats Computation

**Not a server action** — pure client-side computation.

```typescript
function computeStats(items: FloorPlanItem[], assignmentMap: Map<string, GuestAssignment>): CanvasStats
```

### Guest Panel Assignment Derivation

**Not a server action** — pure client-side computation.

```typescript
function getAssignedGuests(assignmentMap: Map<string, GuestAssignment>, items: FloorPlanItem[]): AssignedGuest[]
```
