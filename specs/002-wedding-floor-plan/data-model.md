# Data Model: Wedding Floor Plan Designer

## Database Tables

### `floor_plans`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, GENERATED ALWAYS AS IDENTITY | Auto-increment primary key |
| `wedding_id` | BIGINT | FK → weddings(id), UNIQUE, ON DELETE CASCADE | One-to-one with wedding |
| `width` | DECIMAL(8,2) | NOT NULL, CHECK > 0 | Venue width in feet (max 300) |
| `height` | DECIMAL(8,2) | NOT NULL, CHECK > 0 | Venue height in feet (max 300) |
| `items` | JSONB | NOT NULL DEFAULT '[]' | Array of placed items (see item schema) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last save timestamp |

**RLS Policies**:
- Couples: can read/update their own wedding's floor plan (via wedding → user_id join)
- Admin: can read/update all floor plans (service role bypasses RLS)

### Floor Plan Item JSON Schema (stored in `items` JSONB)

```typescript
interface FloorPlanItem {
  id: string;                    // UUID for client-side identity
  type: "round_table" | "long_table" | "chair" | "stage" | "pillar" | "walkway" | "misc";
  label: string;                 // Display label (e.g., "Round Table 1", "Chair 3")
  x: number;                     // Position x (in feet, relative to canvas origin)
  y: number;                     // Position y (in feet, relative to canvas origin)
  width: number;                 // Item width in feet
  height: number;                // Item height in feet
  rotation: number;              // Rotation angle in degrees (0-360)
  parentItemId: string | null;   // For chairs: references parent table item id
  metadata: {
    // Round table specific
    diameter?: number;           // 3, 4, 5, 6, or 7 (feet)
    // Long table specific
    length?: number;             // 6 or 7 (feet)
    // Chair specific
    chairIndex?: number;         // Index within parent table's chairs
    chairCount?: number;         // For tables: current number of generated chairs
    // Misc specific
    customType?: string;         // User-defined type name (e.g., "Bar", "DJ Booth")
  };
}
```

## TypeScript Types

```typescript
type ItemType = "round_table" | "long_table" | "chair" | "stage" | "pillar" | "walkway" | "misc";

type RoundTableSize = 3 | 4 | 5 | 6 | 7;
type LongTableLength = 6 | 7;

interface FloorPlan {
  id: number;
  weddingId: number;
  width: number;
  height: number;
  items: FloorPlanItem[];
  createdAt: string;
  updatedAt: string;
}
```

## Item Catalog Constants

| Type | Size (ft) | Default Chairs | Chair Range (0 to max+1) |
|------|-----------|----------------|--------------------------|
| Round Table | 3 diameter | 3 | 0–5 |
| Round Table | 4 diameter | 5 | 0–7 |
| Round Table | 5 diameter | 7 | 0–9 |
| Round Table | 6 diameter | 9 | 0–11 |
| Round Table | 7 diameter | 11 | 0–13 |
| Long Table | 6 x 2.5 | 7 | 0–9 |
| Long Table | 7 x 2.5 | 9 | 0–11 |
| Stage | user-defined | — | — |
| Pillar | user-defined | — | — |
| Walkway | user-defined | — | — |
| Misc | user-defined | — | — |
| Chair | 2 x 2 (default) | — | — |

## Entity Relationships

```
Wedding (1) ──── (1) Floor Plan
                       │
                       └── FloorPlanItem[] (JSONB array)
                            ├── Tables (parent items)
                            │    └── Chairs (child items via parentItemId)
                            └── Non-table items (stage, pillar, walkway, misc)
```

## Validation Rules

- `width` and `height`: must be > 0 and <= 300
- Item position must be within floor plan bounds (accounting for rotation)
- Item dimensions for tables are fixed per catalog entry
- Item dimensions for stage/pillar/walkway/misc/chair are user-configurable but must be > 0
- No two items can occupy overlapping space (collision detection)
- Chair `parentItemId` must reference an existing table item in the same layout
- Label max length: 50 characters
