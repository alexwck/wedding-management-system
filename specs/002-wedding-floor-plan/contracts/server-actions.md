# Server Action Contracts: Floor Plan

## `getFloorPlan(weddingId: number)`

**Access**: Authenticated admin or couple (couple must own wedding)

**Returns**:
```typescript
{
  success: boolean;
  floorPlan?: {
    id: number;
    weddingId: number;
    width: number;
    height: number;
    items: FloorPlanItem[];
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}
```

**Behavior**: Returns existing floor plan for wedding, or `null` floorPlan if none exists yet.

---

## `saveFloorPlan(weddingId: number, data: FloorPlanInput)`

**Access**: Authenticated admin or couple (couple must own wedding)

**Input**:
```typescript
{
  width: number;        // 0 < width <= 300
  height: number;       // 0 < height <= 300
  items: FloorPlanItem[];
}
```

**Returns**:
```typescript
{
  success: boolean;
  floorPlan?: FloorPlan;
  error?: string;
}
```

**Behavior**: Creates or updates the floor plan for the given wedding. Validates dimensions and item bounds. Upserts on `wedding_id`.
