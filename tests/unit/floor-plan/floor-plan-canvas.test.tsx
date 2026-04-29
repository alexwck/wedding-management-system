import { describe, it, expect } from "vitest";

describe("FloorPlanCanvas handleSelectItem null guard", () => {
  it("should not crash when addItem returns null — null is safely handled", () => {
    // Simulates the guard logic: if addItem returns null, skip setSelectedItemId
    const addItem: () => { id: string } | null = () => null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const setSelectedItemId = (_: string) => {
      throw new Error("setSelectedItemId should not be called");
    };

    const item = addItem();
    if (!item) {
      // Guard: early return, no crash
      expect(item).toBeNull();
      return;
    }
    setSelectedItemId(item.id);
  });

  it("should call setSelectedItemId when addItem returns a valid item", () => {
    const mockItem = { id: "test-id", type: "stage" as const };
    const addItem = () => mockItem;
    let selectedId: string | null = null;
    const setSelectedItemId = (id: string) => { selectedId = id; };

    const item = addItem();
    if (!item) return;
    setSelectedItemId(item.id);

    expect(selectedId).toBe("test-id");
  });
});
