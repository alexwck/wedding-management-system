# Data Model: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22

## New Table: `seat_assignments`

```
seat_assignments
├── id             BIGINT PRIMARY KEY (auto-increment)
├── wedding_id     BIGINT NOT NULL (FK → weddings.id, ON DELETE CASCADE)
├── rsvp_id        BIGINT NOT NULL UNIQUE (FK → rsvps.id, ON DELETE CASCADE)
├── chair_item_id  TEXT NOT NULL
├── table_item_id  TEXT NOT NULL
├── created_at     TIMESTAMPTZ DEFAULT now()
├── updated_at     TIMESTAMPTZ DEFAULT now()
│
├── INDEX idx_seat_assignments_wedding (wedding_id)
├── INDEX idx_seat_assignments_chair (wedding_id, chair_item_id) UNIQUE
├── INDEX idx_seat_assignments_table (wedding_id, table_item_id)
│
└── RLS:
     ├── Couples: SELECT/INSERT/UPDATE/DELETE where wedding_id IN (their weddings)
     └── Admins: SELECT/INSERT/UPDATE/DELETE for all weddings
```

### Field Details

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | BIGINT | PK, auto-increment | Row identifier |
| wedding_id | BIGINT | NOT NULL, FK → weddings.id | Which wedding this assignment belongs to |
| rsvp_id | BIGINT | NOT NULL, UNIQUE, FK → rsvps.id | Which guest (RSVP) is assigned. UNIQUE ensures one seat per guest. |
| chair_item_id | TEXT | NOT NULL | Floor plan chair item ID (e.g., "fp-ch-1"). Not a FK — references JSONB data in floor_plans.items. |
| table_item_id | TEXT | NOT NULL | Floor plan table item ID (e.g., "fp-rt-1"). Denormalized from chair's parentItemId for efficient table-level queries. |
| created_at | TIMESTAMPTZ | DEFAULT now() | Assignment creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last modification timestamp |

### Key Constraints

1. **One guest per seat**: `UNIQUE (wedding_id, chair_item_id)` — a chair can only have one guest
2. **One seat per guest**: `UNIQUE (rsvp_id)` — a guest can only be assigned to one chair
3. **Cascade on wedding delete**: If the wedding is deleted, all its seat assignments are deleted
4. **Cascade on RSVP delete**: If the RSVP is deleted, the assignment is removed
5. **No FK to floor plan items**: chair_item_id and table_item_id are soft references to IDs within the JSONB `items` array. Orphaned assignments (items removed from floor plan) are cleaned up by application logic in server actions.

### Relationships

```
weddings 1───* seat_assignments (via wedding_id)
rsvps    1───0..1 seat_assignments (via rsvp_id)
floor_plans (items JSONB) ← soft-referenced by chair_item_id, table_item_id
```

## State Transitions

```
                    assignGuest()
[No Assignment] ──────────────────→ [Assigned to chair]
                        │                    │
                        │    unassignGuest() │
                        │←───────────────────┤
                        │                    │
                        │   reassignGuest()  │
                        │←───────────────────┤  (unassign old + assign new)
```

## Cleanup Triggers (Application-Level)

| Event | Cleanup Action |
|-------|---------------|
| Floor plan save with fewer items | Delete assignments where chair_item_id or table_item_id no longer exists in items JSONB |
| RSVP status → "declining" | Delete assignment for that rsvp_id |
| RSVP deleted | CASCADE handles automatically |
| Wedding deleted | CASCADE handles automatically |
| Floor plan items array emptied | Delete all assignments for that wedding_id |

## Migration Strategy

New migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_seat_assignments.sql`

1. Create `seat_assignments` table
2. Add RLS policies (matching existing pattern for couple/admin access)
3. Add updated_at trigger (matching existing pattern)
4. No data migration needed — new table, no existing data to port

## Application Types

```typescript
// src/types/seat-assignment.ts

interface SeatAssignment {
  id: number;
  weddingId: number;
  rsvpId: number;
  chairItemId: string;
  tableItemId: string;
  createdAt: string;
  updatedAt: string;
}

// Extended RSVP shape (joined for display)
interface RsvpWithAssignment extends Rsvp {
  seatAssignment: SeatAssignment | null;
  tableName: string | null;    // derived from floor plan item label
  seatLabel: string | null;    // e.g., "Seat 3"
}

// Assignment map for canvas rendering
// chairItemId → guest info
type SeatAssignmentMap = Record<string, {
  guestName: string;
  rsvpId: number;
}>;
```

## New Table: `oauth_tokens`

```
oauth_tokens
├── id             BIGINT PRIMARY KEY (auto-increment)
├── user_id        UUID NOT NULL (FK → auth.users.id, ON DELETE CASCADE)
├── provider       TEXT NOT NULL DEFAULT 'google'
├── access_token   TEXT NOT NULL
├── refresh_token  TEXT NOT NULL
├── scope          TEXT
├── expires_at     TIMESTAMPTZ
├── created_at     TIMESTAMPTZ DEFAULT now()
├── updated_at     TIMESTAMPTZ DEFAULT now()
│
├── UNIQUE (user_id, provider)
├── INDEX idx_oauth_tokens_user (user_id)
│
└── RLS:
     ├── Users: SELECT/INSERT/UPDATE/DELETE where user_id = auth.uid()
     └── Service role: full access (for server-side token refresh)
```

### Field Details

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | BIGINT | PK, auto-increment | Row identifier |
| user_id | UUID | NOT NULL, FK → auth.users | Which user owns this token |
| provider | TEXT | NOT NULL, DEFAULT 'google' | OAuth provider name |
| access_token | TEXT | NOT NULL | Current access token |
| refresh_token | TEXT | NOT NULL | Long-lived refresh token |
| scope | TEXT | nullable | Granted scopes |
| expires_at | TIMESTAMPTZ | nullable | When the access token expires |
| created_at | TIMESTAMPTZ | DEFAULT now() | Token creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last refresh timestamp |

### Application Types

```typescript
// src/types/oauth.ts

interface OAuthToken {
  id: number;
  userId: string;
  provider: 'google';
  accessToken: string;
  refreshToken: string;
  scope: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```
