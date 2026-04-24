import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplatePreview } from "@/components/template-preview";

vi.mock("@/app/actions/admin", () => ({
  updateTemplateFocalPoint: vi.fn().mockResolvedValue({ success: true }),
}));

describe("TemplatePreview", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders preview button", () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("opens dialog on click", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    expect(screen.getByText(/Click to set focal point/)).toBeInTheDocument();
  });

  it("shows existing focal point on open", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={50}
        focalY={30}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    expect(screen.getByText(/50\.0%.*30\.0%/)).toBeInTheDocument();
  });

  it("shows save button when focal point is set", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={25}
        focalY={75}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    expect(screen.getByText("Save Focal Point")).toBeInTheDocument();
  });
});
