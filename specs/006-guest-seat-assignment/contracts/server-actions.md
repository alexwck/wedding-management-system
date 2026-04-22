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

## New Server Action: RSVP Update (`src/app/actions/rsvp.ts`)

### updateRsvpStatus

Changes an RSVP's status (e.g., attending → declining). Triggers seat assignment cleanup.

```
Input:
  weddingId: number       — the wedding ID
  rsvpId: number          — the RSVP to update
  status: "attending" | "declining"

Output:
  { success: true, rsvp: Rsvp }
  | { success: false, error: string }

Validation:
  - User is authenticated and owns this wedding (or is admin)
  - RSVP exists and belongs to this wedding
  - Status is a valid enum value

Side effects:
  - If status changes to "declining": DELETE from seat_assignments WHERE rsvp_id = rsvpId
  - Must run AFTER the RSVP update is confirmed (not before)

Atomicity:
  - Wrap RSVP update + assignment cleanup in a Supabase transaction or sequential queries with error handling
```

## New Server Actions: Export (`src/app/actions/export.ts`)

### exportToGoogleSheets

Creates a new Google Spreadsheet with RSVP + seat assignment data.

```
Input:
  weddingId: number       — the wedding ID

Output:
  { success: true, spreadsheetUrl: string }
  | { success: false, error: string }

Validation:
  - User is authenticated and owns this wedding (or is admin)
  - User has a valid Google OAuth token in oauth_tokens table
  - Token is refreshed if expired (using refresh_token)

Behavior:
  - Refresh token if expired via Google OAuth API
  - Query RSVPs with LEFT JOIN seat_assignments for this wedding
  - Derive tableName and seatLabel from floor plan items JSONB
  - Create new spreadsheet via Google Sheets API
  - Populate rows with columns: Guest Name, Status, Vegetarian, Dietary Notes, Baby Chair, Table, Seat, Submitted At
  - "Table" and "Seat" columns: populated from assignment data or "Unassigned"
  - Return the spreadsheet URL for the confirmation message
```

### exportToXlsx

Generates and returns an XLSX file with RSVP + seat assignment data.

```
Input:
  weddingId: number       — the wedding ID

Output:
  { success: true, data: ArrayBuffer, filename: string }
  | { success: false, error: string }

Validation:
  - User is authenticated and owns this wedding (or is admin)

Behavior:
  - Query RSVPs with LEFT JOIN seat_assignments for this wedding
  - Derive tableName and seatLabel from floor plan items JSONB
  - Generate XLSX buffer with columns: Guest Name, Status, Vegetarian, Dietary Notes, Baby Chair, Table, Seat, Submitted At
  - "Table" and "Seat" columns: populated from assignment data or "Unassigned"
  - Return buffer and suggested filename (e.g., "rsvp-export-{wedding-slug}.xlsx")
```

### getGoogleAuthUrl

Generates a Google OAuth authorization URL.

```
Input: (none)

Output:
  { url: string }        — Google OAuth consent screen URL

Behavior:
  - Generate OAuth URL with scopes: spreadsheets, drive.file
  - Include state parameter for CSRF protection
  - Use configured Google OAuth client ID/secret from environment variables
```

### handleGoogleCallback

Processes the OAuth callback and stores tokens.

```
Input:
  code: string           — OAuth authorization code
  state: string          — CSRF state parameter

Output:
  { success: true }
  | { success: false, error: string }

Behavior:
  - Exchange authorization code for access_token + refresh_token
  - Upsert oauth_tokens row for the current user
  - Validate state parameter matches session
```

### getGoogleAuthStatus

Checks if the current user has valid Google OAuth tokens.

```
Input: (none)

Output:
  { isConnected: boolean }

Behavior:
  - Check if oauth_tokens row exists for current user + provider = 'google'
  - Check if token is not expired (or refreshable)
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
