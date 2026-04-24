import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemCatalog } from "@/components/floor-plan/item-catalog";

describe("ItemCatalog", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders round table buttons", () => {
    render(<ItemCatalog onSelectItem={vi.fn()} />);
    expect(screen.getAllByText(/5ft/).length).toBeGreaterThan(0);
  });

  it("renders long table buttons", () => {
    render(<ItemCatalog onSelectItem={vi.fn()} />);
    expect(screen.getAllByText(/6ft x 2\.5ft/).length).toBeGreaterThan(0);
  });

  it("renders other item buttons", () => {
    render(<ItemCatalog onSelectItem={vi.fn()} />);
    expect(screen.getAllByText("Stage").length).toBeGreaterThan(0);
  });

  it("calls onSelectItem with type and sizeVariant for round table", async () => {
    const onSelectItem = vi.fn();
    render(<ItemCatalog onSelectItem={onSelectItem} />);

    const buttons = screen.getAllByRole("button");
    const btn = buttons.find(b => b.textContent?.includes("5ft") && b.textContent.includes("7 chairs"));
    expect(btn).toBeTruthy();
    await userEvent.click(btn!);
    expect(onSelectItem).toHaveBeenCalledWith("round_table", 5);
  });

  it("calls onSelectItem with type and sizeVariant for long table", async () => {
    const onSelectItem = vi.fn();
    render(<ItemCatalog onSelectItem={onSelectItem} />);

    const buttons = screen.getAllByRole("button");
    const btn = buttons.find(b => b.textContent?.includes("6ft x 2.5ft"));
    expect(btn).toBeTruthy();
    await userEvent.click(btn!);
    expect(onSelectItem).toHaveBeenCalledWith("long_table", 6);
  });

  it("calls onSelectItem with type only for other items", async () => {
    const onSelectItem = vi.fn();
    render(<ItemCatalog onSelectItem={onSelectItem} />);

    const buttons = screen.getAllByRole("button");
    const btn = buttons.find(b => b.textContent === "Stage");
    expect(btn).toBeTruthy();
    await userEvent.click(btn!);
    expect(onSelectItem).toHaveBeenCalledWith("stage");
  });

  it("collapses and expands the catalog", async () => {
    render(<ItemCatalog onSelectItem={vi.fn()} />);

    const collapseBtns = screen.getAllByLabelText("Collapse catalog");
    await userEvent.click(collapseBtns[0]);

    expect(screen.queryByText("Round Tables")).not.toBeInTheDocument();

    const expandBtns = screen.getAllByLabelText("Expand catalog");
    await userEvent.click(expandBtns[0]);

    expect(screen.getAllByText("Round Tables").length).toBeGreaterThan(0);
  });

  it("has constrained height for overflow handling", () => {
    const { container } = render(<ItemCatalog onSelectItem={vi.fn()} />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("h-[calc(100vh-40px)]");
  });

  it("has overflow-y-auto for scrollable content", () => {
    const { container } = render(<ItemCatalog onSelectItem={vi.fn()} />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("overflow-y-auto");
  });
});
