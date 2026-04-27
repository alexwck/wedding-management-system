import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MobileModal } from "@/components/mobile-modal";

describe("MobileModal", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders when open", () => {
    render(
      <MobileModal open={true} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </MobileModal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <MobileModal open={false} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </MobileModal>
    );

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("calls onOpenChange when close button is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <MobileModal open={true} onOpenChange={onOpenChange} title="Test Modal">
        <p>Modal content</p>
      </MobileModal>
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });

  it("renders description when provided", () => {
    render(
      <MobileModal
        open={true}
        onOpenChange={vi.fn()}
        title="Test Modal"
        description="Test description"
      >
        <p>Modal content</p>
      </MobileModal>
    );

    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders children without header when title and description are omitted", () => {
    render(
      <MobileModal open={true} onOpenChange={vi.fn()}>
        <p>Modal content only</p>
      </MobileModal>
    );

    expect(screen.getByText("Modal content only")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <MobileModal open={true} onOpenChange={vi.fn()} className="custom-class">
        <p>Content</p>
      </MobileModal>
    );

    const dialog = document.querySelector('[data-slot="dialog-content"]');
    expect(dialog).toHaveClass("custom-class");
  });
});
