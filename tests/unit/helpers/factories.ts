import type { FloorPlanItem, FloorPlanItemMetadata } from "@/types/floor-plan";

export function makeFloorPlanItem(
  overrides: Partial<FloorPlanItem> & { id: string },
): FloorPlanItem {
  return {
    type: "chair",
    label: "",
    x: 0,
    y: 0,
    width: 2,
    height: 2,
    rotation: 0,
    parentItemId: null,
    metadata: {},
    ...overrides,
  };
}

export function makeRsvp(
  overrides: Partial<{
    id: number;
    wedding_id: number;
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
    created_at: string;
  }> = {},
) {
  return {
    id: 1,
    wedding_id: 1,
    guest_name: "Alice",
    status: "attending",
    dietary_notes: null,
    is_vegetarian: false,
    needs_baby_chair: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeWedding(
  overrides: Partial<{
    id: number;
    slug: string;
    couple_name: string;
    user_id: string;
    wedding_date: string;
    template_image_url: string | null;
    created_at: string;
  }> = {},
) {
  return {
    id: 1,
    slug: "test-wedding",
    couple_name: "Alice & Bob",
    user_id: "user-1",
    wedding_date: "2026-06-15",
    template_image_url: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeSeatAssignment(
  overrides: Partial<{
    id: number;
    wedding_id: number;
    rsvp_id: number;
    chair_item_id: string;
    table_item_id: string;
    created_at: string;
    updated_at: string;
  }> = {},
) {
  return {
    id: 1,
    wedding_id: 1,
    rsvp_id: 1,
    chair_item_id: "chair-1",
    table_item_id: "table-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeUser(
  overrides: Partial<{
    id: string;
    email: string;
    app_metadata: Record<string, unknown>;
  }> = {},
) {
  return {
    id: "user-1",
    email: "test@example.com",
    app_metadata: { role: "couple" },
    ...overrides,
  };
}

export function makeFloorPlan(
  overrides: Partial<{
    id: number;
    weddingId: number;
    width: number;
    height: number;
    items: FloorPlanItem[];
    createdAt: string;
    updatedAt: string;
  }> = {},
) {
  return {
    id: 1,
    weddingId: 1,
    width: 50,
    height: 50,
    items: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
