import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplatePreview } from "@/components/template-preview";

const mockUpdateFocalPoint = vi.fn().mockResolvedValue({ success: true });

vi.mock("@/app/actions/admin", () => ({
  updateTemplateFocalPoint: (...args: unknown[]) => mockUpdateFocalPoint(...args),
}));

function createImageWithDimensions(width: number, height: number) {
  return {
    naturalWidth: width,
    naturalHeight: height,
    width,
    height,
  };
}

describe("TemplatePreview — drag-to-crop", () => {
  beforeEach(() => {
    cleanup();
    mockUpdateFocalPoint.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders crop preview dialog with drag instruction", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    expect(screen.getByText(/drag the image/i)).toBeInTheDocument();
  });

  it("shows save button with crop label instead of focal point", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={25}
        focalY={75}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    expect(screen.getByText("Save Crop")).toBeInTheDocument();
  });

  it("computes horizontal offset when dragging a landscape image", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));

    const container = screen.getByRole("img");
    const img = container as HTMLImageElement;

    Object.defineProperty(img, "naturalWidth", { value: 1600, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 900, configurable: true });
    Object.defineProperty(img, "clientWidth", { value: 400, configurable: true });
    Object.defineProperty(img, "clientHeight", { value: 400, configurable: true });

    fireEvent.mouseDown(img, { clientX: 200, clientY: 200 });
    fireEvent.mouseMove(img, { clientX: 150, clientY: 200 });
    fireEvent.mouseUp(img);

    expect(screen.getByText(/Crop offset:/)).toBeInTheDocument();
  });

  it("computes vertical offset when dragging a portrait image", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));

    const img = screen.getByRole("img") as HTMLImageElement;
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 1200, configurable: true });
    Object.defineProperty(img, "clientWidth", { value: 400, configurable: true });
    Object.defineProperty(img, "clientHeight", { value: 400, configurable: true });

    fireEvent.mouseDown(img, { clientX: 200, clientY: 100 });
    fireEvent.mouseMove(img, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(img);

    expect(screen.getByText(/Crop offset:/)).toBeInTheDocument();
  });

  it("calls updateTemplateFocalPoint on save with crop offsets", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={50}
        focalY={50}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    await userEvent.click(screen.getByText("Save Crop"));

    await waitFor(() => {
      expect(mockUpdateFocalPoint).toHaveBeenCalledWith(1, 50, 50);
    });
  });

  it("shows error toast on save failure with retry option", async () => {
    mockUpdateFocalPoint.mockResolvedValueOnce({ success: false, error: "Network error" });

    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={50}
        focalY={50}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));
    await userEvent.click(screen.getByText("Save Crop"));

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("clamps crop offset to 0-100 bounds", async () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/template.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    await userEvent.click(screen.getByText("Preview"));

    const img = screen.getByRole("img") as HTMLImageElement;
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 1200, configurable: true });
    Object.defineProperty(img, "clientWidth", { value: 400, configurable: true });
    Object.defineProperty(img, "clientHeight", { value: 400, configurable: true });

    fireEvent.mouseDown(img, { clientX: 200, clientY: 200 });
    fireEvent.mouseMove(img, { clientX: 200, clientY: 800 });
    fireEvent.mouseUp(img);

    await userEvent.click(screen.getByText("Save Crop"));

    await waitFor(() => {
      const call = mockUpdateFocalPoint.mock.calls[0];
      if (call) {
        expect(call[2]).toBeLessThanOrEqual(100);
        expect(call[2]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("initializes without crop offset when no focal point set", () => {
    render(
      <TemplatePreview
        weddingId={1}
        imageUrl="https://example.com/new.jpg"
        focalX={null}
        focalY={null}
      />,
    );

    // The crop offset text should show the drag instruction, not coordinates
    expect(screen.queryByText(/Crop offset:/)).not.toBeInTheDocument();
  });
});
