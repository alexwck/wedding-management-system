import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PresetSelector } from "@/components/preset-selector";

const mockUpdateWeddingPreset = vi.fn();

vi.mock("@/app/actions/admin", () => ({
  updateWeddingPreset: (...args: unknown[]) => mockUpdateWeddingPreset(...args),
}));

describe("PresetSelector", () => {
  beforeEach(() => {
    cleanup();
    mockUpdateWeddingPreset.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders all preset options", () => {
    render(
      <PresetSelector weddingId={1} currentPreset="bento" />
    );
    expect(screen.getByText("Minimalist")).toBeInTheDocument();
    expect(screen.getByText("Bento Box")).toBeInTheDocument();
    expect(screen.getByText("Storytelling")).toBeInTheDocument();
    expect(screen.getByText("Magazine")).toBeInTheDocument();
    expect(screen.getByText("Card Stack")).toBeInTheDocument();
    expect(screen.getByText("Asymmetric")).toBeInTheDocument();
    expect(screen.getByText("Cinematic")).toBeInTheDocument();
  });

  it("shows the current preset as selected", () => {
    render(
      <PresetSelector weddingId={1} currentPreset="magazine" />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("magazine");
  });

  it("calls updateWeddingPreset when selection changes", async () => {
    mockUpdateWeddingPreset.mockResolvedValue({ success: true, layoutPreset: "cinematic" });
    render(
      <PresetSelector weddingId={1} currentPreset="bento" />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "cinematic" } });

    // Wait for transition
    await new Promise((r) => setTimeout(r, 50));

    expect(mockUpdateWeddingPreset).toHaveBeenCalledWith(1, "cinematic");
  });

  it("shows success message when update succeeds", async () => {
    mockUpdateWeddingPreset.mockResolvedValue({ success: true, layoutPreset: "minimalist" });
    render(
      <PresetSelector weddingId={1} currentPreset="bento" />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "minimalist" } });

    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByText("Layout preset updated.")).toBeInTheDocument();
  });

  it("shows error message when update fails", async () => {
    mockUpdateWeddingPreset.mockResolvedValue({ success: false, error: "Failed to update layout preset." });
    render(
      <PresetSelector weddingId={1} currentPreset="bento" />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "minimalist" } });

    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByText("Failed to update layout preset.")).toBeInTheDocument();
  });

  it("disables select when locked", () => {
    render(
      <PresetSelector weddingId={1} currentPreset="bento" isLocked={true} />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });
});
