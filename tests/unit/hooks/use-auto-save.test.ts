import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAutoSave } from "@/components/floor-plan/hooks/use-auto-save";
import { makeFloorPlanItem } from "../helpers/factories";

const mockSaveFloorPlan = vi.fn();

vi.mock("@/app/actions/floor-plan", () => ({
  get saveFloorPlan() { return mockSaveFloorPlan; },
}));

describe("useAutoSave", () => {
  beforeEach(() => {
    mockSaveFloorPlan.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    mockSaveFloorPlan.mockReset();
  });

  it("starts with idle status", () => {
    const { result } = renderHook(() =>
      useAutoSave({
        weddingId: 1,
        width: 50,
        height: 50,
        items: [],
      }),
    );
    expect(result.current.saveStatus).toBe("idle");
  });

  it("sets status to saved on saveNow success", async () => {
    mockSaveFloorPlan.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useAutoSave({
        weddingId: 1,
        width: 50,
        height: 50,
        items: [makeFloorPlanItem({ id: "t1" })],
      }),
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.saveStatus).toBe("saved");
    expect(mockSaveFloorPlan).toHaveBeenCalledTimes(1);
  });

  it("sets status to error on saveNow failure", async () => {
    mockSaveFloorPlan.mockResolvedValue({ success: false, error: "fail" });

    const { result } = renderHook(() =>
      useAutoSave({
        weddingId: 1,
        width: 50,
        height: 50,
        items: [makeFloorPlanItem({ id: "t1" })],
      }),
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.saveStatus).toBe("error");
  });

  it("sets lastSavedAt on success", async () => {
    mockSaveFloorPlan.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useAutoSave({
        weddingId: 1,
        width: 50,
        height: 50,
        items: [makeFloorPlanItem({ id: "t1" })],
      }),
    );

    expect(result.current.lastSavedAt).toBeNull();

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.lastSavedAt).not.toBeNull();
  });

  it("passes current items, width, height to saveFloorPlan", async () => {
    mockSaveFloorPlan.mockResolvedValue({ success: true });

    const items = [makeFloorPlanItem({ id: "t1" })];
    const { result } = renderHook(() =>
      useAutoSave({
        weddingId: 1,
        width: 60,
        height: 80,
        items,
      }),
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockSaveFloorPlan).toHaveBeenCalledWith(1, {
      width: 60,
      height: 80,
      items,
    });
  });
});
