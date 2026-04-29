import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ExportButtons } from "@/components/export-buttons";

vi.mock("@/app/actions/export", () => ({
  exportToXlsx: vi.fn(),
}));

import { exportToXlsx } from "@/app/actions/export";

const mockExportToXlsx = vi.mocked(exportToXlsx);

describe("ExportButtons", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders download button", () => {
    render(<ExportButtons weddingId={1} />);
    const buttons = screen.getAllByRole("button", { name: "Download as XLSX" });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows success message when XLSX export succeeds", async () => {
    const user = userEvent.setup();
    mockExportToXlsx.mockResolvedValue({
      success: true,
      data: btoa("fake-xlsx-data"),
      filename: "rsvp-export-Alice-and-Bob.xlsx",
    });

    render(<ExportButtons weddingId={2} />);

    await user.click(
      screen.getAllByRole("button", { name: "Download as XLSX" })[0],
    );

    expect(mockExportToXlsx).toHaveBeenCalledWith(2);
    expect(await screen.findByText("Download started!")).toBeInTheDocument();
  });

  it("shows error message when XLSX export fails", async () => {
    const user = userEvent.setup();
    mockExportToXlsx.mockResolvedValue({
      success: false,
      error: "Export failed",
    });

    render(<ExportButtons weddingId={1} />);

    await user.click(
      screen.getAllByRole("button", { name: "Download as XLSX" })[0],
    );

    expect(await screen.findByText("Export failed")).toBeInTheDocument();
  });

  it("shows Downloading... while XLSX export is in progress", async () => {
    const user = userEvent.setup();
    let resolveXlsx: (value: Awaited<ReturnType<typeof exportToXlsx>>) => void;
    mockExportToXlsx.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveXlsx = resolve;
        }),
    );

    render(<ExportButtons weddingId={1} />);

    await user.click(
      screen.getAllByRole("button", { name: "Download as XLSX" })[0],
    );

    const downloadingButtons = screen.getAllByRole("button", {
      name: "Downloading...",
    });
    expect(downloadingButtons.length).toBeGreaterThanOrEqual(1);

    await waitFor(() =>
      resolveXlsx({ success: true, data: btoa("x"), filename: "test.xlsx" }),
    );
  });
});
