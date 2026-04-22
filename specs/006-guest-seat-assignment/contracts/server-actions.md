# Server Action Contracts: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22

## New Server Actions (`src/app/actions/seat-assignment.ts`)

### assignSeat

Assigns an attending guest to a specific chair.

```
Input:
  weddingId: number       — the wedding ID
  rsvpId: number          — the RSVP to assign
  chairItemId: string     — the floor plan chair item ID
  tableItemId: string     — the floor plan table item ID (parent of chair)

Output:
  { success: true, assignment: SeatAssignment }
  | { success: false, error: string }

Validation:
  - User is authenticated and owns this wedding (or is admin)
  - RSVP exists, belongs to this wedding, and status = "attending"
  - RSVP is not already assigned to another chair
  - Chair is not already occupied by another guest
  - Chair item ID exists in the floor plan's items JSONB
  - Table item ID exists and is the parent of the chair

Atomicity:
  - Single INSERT with conflict handling (ON CONFLICT DO NOTHING on chair_item_id unique constraint)
  - Check rsvp_id uniqueness before insert to prevent double-assignment
```

### unassignSeat

Removes a guest from a chair.

```
Input:
  weddingId: number       — the wedding ID
  chairItemId: string     — the chair to clear

Output:
  { success: true }
  | { success: false, error: string }

Validation:
  - User is authenticated and owns this wedding (or is admin)
  - An assignment exists for this chair

Atomicity:
  - Single DELETE with WHERE clause matching wedding_id AND chair_item_id
```

### getSeatAssignments

Retrieves all seat assignments for a wedding.

```
Input:
  weddingId: number       — the wedding ID

Output:
  SeatAssignment[]        — array of all assignments for this wedding

Validation:
  - User is authenticated and owns this wedding (or is admin)

Notes:
  - No pagination needed — weddings typically have < 500 guests
  - Returned as a flat array; client maps to chairItemId-keyed Record
```

### getUnassignedGuests

Retrieves attending RSVPs without a seat assignment.

```
Input:
  weddingId: number       — the wedding ID

Output:
  Rsvp[]                  — attending RSVPs without a seat_assignment row

Validation:
  - User is authenticated and owns this wedding (or is admin)

Notes:
  - LEFT JOIN rsvps with seat_assignments, WHERE assignment IS NULL
  - Filters to status = "attending" only
```

### cleanupOrphanedAssignments

Removes assignments referencing floor plan items that no longer exist.

```
Input:
  weddingId: number       — the wedding ID

Output:
  { deletedCount: number }

Validation:
  - User is authenticated and owns this wedding (or is admin)

Notes:
  - Called after floor plan save
  - Compares assignment chair_item_id / table_item_id against current items JSONB
  - Deletes assignments where the referenced items no longer exist
```

## Modified Existing Server Actions

### saveFloorPlan (in `actions/floor-plan.ts`)

**Change**: After the existing upsert, call `cleanupOrphanedAssignments` to remove assignments for deleted items.

```
Additional behavior:
  - After successful upsert of floor plan data
  - Extract current item IDs from the saved items array
  - Delete seat_assignments where chair_item_id or table_item_id
    is not in the current items array
```

## Dashboard RSVP Data Contract

### Dashboard RSVP list (modified)

The existing RSVP list query is extended to LEFT JOIN seat_assignments and include assignment info:

```
Output per RSVP row:
  {
    ...existingRsvpFields,
    seatAssignment: {
      chairItemId: string,
      tableItemId: string,
    } | null,
    tableName: string | null,    // from floor plan item label lookup
    seatLabel: string | null,    // derived from chairIndex
  }
```
