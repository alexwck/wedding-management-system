import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

vi.mock("@/app/actions/upload", () => ({
  uploadTemplateImage: vi.fn(),
}));

import { TemplateUpload } from "@/components/template-upload";
import { uploadTemplateImage } from "@/app/actions/upload";

const mockUploadTemplateImage = vi.mocked(uploadTemplateImage);

/**
 * Mock FileReader so that readAsDataURL synchronously fires onload.
 * jsdom's FileReader never fires onload.
 */
function mockFileReader() {
  const originalFileReader = globalThis.FileReader;
  class MockFileReader {
    result: string | null = null;
    onload: ((this: MockFileReader, ev: ProgressEvent) => void) | null = null;
    readAsDataURL(_file: File) {
      this.result = "data:image/png;base64,dGVzdA==";
      if (this.onload) {
        this.onload.call(this, {} as ProgressEvent);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).FileReader = MockFileReader;
  return () => {
    globalThis.FileReader = originalFileReader;
  };
}

/**
 * React 19 double-renders in jsdom, so queries return duplicates.
 * We use getAllBy* and check the first element throughout.
 */

describe("TemplateUpload", () => {
  let restoreFileReader: () => void;

  beforeEach(() => {
    cleanup();
    mockUploadTemplateImage.mockReset();
    restoreFileReader = mockFileReader();
  });

  afterEach(() => {
    cleanup();
    restoreFileReader();
  });

  it("renders file input and upload button", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    expect(screen.getAllByRole("button", { name: /upload template/i }).length).toBeGreaterThanOrEqual(1);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("disables upload button when no file is selected", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    expect(buttons[0]).toBeDisabled();
  });

  it("shows error for non-PNG/JPG files", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.gif", { type: "image/gif" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    expect(screen.getByText("Only PNG and JPG images are allowed.")).toBeInTheDocument();
  });

  it("shows error for files over 5MB", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    expect(screen.getByText("File size must be under 5MB.")).toBeInTheDocument();
  });

  it("shows preview when a valid file is selected", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0]).toHaveAttribute("alt", "Template preview");
  });

  it("enables upload button when a valid file is selected", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    expect(buttons[0]).not.toBeDisabled();
  });

  it("calls uploadTemplateImage on upload click", async () => {
    mockUploadTemplateImage.mockResolvedValueOnce({
      success: true,
      imageUrl: "https://example.com/template.png",
    });

    render(<TemplateUpload weddingId={42} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(mockUploadTemplateImage).toHaveBeenCalledTimes(1);
    });

    const formData = mockUploadTemplateImage.mock.calls[0][0] as FormData;
    expect(formData.get("weddingId")).toBe("42");
    expect((formData.get("file") as File).name).toBe("test.png");
  });

  it("shows success message on successful upload", async () => {
    mockUploadTemplateImage.mockResolvedValueOnce({
      success: true,
      imageUrl: "https://example.com/template.png",
    });

    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText("Template uploaded successfully!")).toBeInTheDocument();
    });
  });

  it("shows error message on failed upload", async () => {
    mockUploadTemplateImage.mockResolvedValueOnce({
      success: false,
      error: "upload_failed" as const,
      message: "Failed to upload image. Please try again.",
    });

    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText("Failed to upload image. Please try again.")).toBeInTheDocument();
    });
  });

  it("shows uploading state while upload is in progress", async () => {
    let resolveUpload!: (value: unknown) => void;
    mockUploadTemplateImage.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
    );

    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;
    Object.defineProperty(input, "files", { value: [file], writable: false, configurable: true });
    fireEvent.change(input);

    const buttons = screen.getAllByRole("button", { name: /upload template/i });
    fireEvent.click(buttons[0]);

    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    const uploadingButtons = screen.getAllByRole("button", { name: /uploading/i });
    expect(uploadingButtons[0]).toBeDisabled();

    resolveUpload({
      success: true,
      imageUrl: "https://example.com/template.png",
    });

    await waitFor(() => {
      const doneButtons = screen.getAllByRole("button", { name: /upload template/i });
      expect(doneButtons[0]).not.toBeDisabled();
    });
  });

  it("shows existing image as preview when currentImageUrl is provided", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl="/existing.jpg" />);

    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0]).toHaveAttribute("src", "/existing.jpg");
  });

  it("clears previous error when a new file is selected", () => {
    render(<TemplateUpload weddingId={1} currentImageUrl={null} />);

    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLElement;

    // Select invalid file to trigger error
    const badFile = new File(["test"], "test.gif", { type: "image/gif" });
    Object.defineProperty(input, "files", { value: [badFile], writable: false, configurable: true });
    fireEvent.change(input);

    expect(screen.getByText("Only PNG and JPG images are allowed.")).toBeInTheDocument();

    // Select valid file -- error should clear
    const goodFile = new File(["test"], "test.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [goodFile], writable: false, configurable: true });
    fireEvent.change(input);

    expect(screen.queryByText("Only PNG and JPG images are allowed.")).not.toBeInTheDocument();
  });
});
