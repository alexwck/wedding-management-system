# Data Model: Coordinate System Fix and UI Layout Overhaul

**Date**: 2026-04-21 | **Feature**: 005-fix-coords-ui-layout

## Entities

### FloorPlanItem (existing — no schema changes)

The existing `FloorPlanItem` type from `src/types/floor-plan.ts` is preserved unchanged.

```typescript
interface FloorPlanItem {
  id: string;
  type: ItemType;
  label: string;
  x: number;        // Top-left x in feet (bounding box convention)
  y: number;        // Top-left y in feet (bounding box convention)
  width: number;    // Width in feet
  height: number;   // Height in feet
  rotation: number; // Degrees
  parentItemId: string | null;
  metadata: FloorPlanItemMetadata;
}
```

**Key constraint**: `x, y` always represent top-left of bounding box in feet. The rendering layer converts to center for Circle and offset-Rect, but the data model is unchanged.

### Rendering Coordinate Mapping (conceptual, not stored)

| Component | Data (feet) | Rendering (pixels) | Notes |
|-----------|------------|-------------------|-------|
| Round Table Circle | x, y (top-left) | `centerX = (x + width/2) * FP`, `centerY = (y + height/2) * FP` | Circle uses center |
| Long Table Rect | x, y (top-left) | `centerX = (x + width/2) * FP`, offset=`width/2 * FP` | Rect with offset for rotation |
| Chair Circle | x, y (top-left) | `centerX = (x + 0.5) * FP` | No change — already correct |
| Other items | x, y (top-left) | `pixelX = x * FP`, `pixelY = y * FP` | No change |

Where `FP = FEET_TO_PIXELS = 20`.

### Drag Conversion (conceptual, not stored)

| Source | Drag Output (pixels) | Stored (feet) | Conversion |
|--------|---------------------|---------------|------------|
| Table types | `node.x()` = center px | `newX = node.x() / FP - width / 2` | Center to top-left |
| Other items | `node.x()` = top-left px | `newX = node.x() / FP` | Direct |

## No Database Changes

- No new migrations
- No schema changes to `floor_plans` table
- Existing floor plan data is dev-only, will be cleaned up before testing
