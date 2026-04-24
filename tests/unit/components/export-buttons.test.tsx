import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ExportButtons } from "@/components/export-buttons";

vi.mock("@/app/actions/export", () => ({
  getGoogleAuthUrl: vi.fn(),
  getGoogleAuthStatus: vi.fn(),
  exportToGoogleSheets: vi.fn(),
  exportToXlsx: vi.fn(),
}));

import {
  getGoogleAuthUrl,
  getGoogleAuthStatus,
  exportToGoogleSheets,
  exportToXlsx,
} from "@/app/actions/export";

const mockGetGoogleAuthUrl = vi.mocked(getGoogleAuthUrl);
const mockGetGoogleAuthStatus = vi.mocked(getGoogleAuthStatus);
const mockExportToGoogleSheets = vi.mocked(exportToGoogleSheets);
const mockExportToXlsx = vi.mocked(exportToXlsx);

/**
 * React 19 in jsdom double-renders under StrictMode, so many queries return
 * duplicates. We use getAllBy* and check the first element throughout.
 */

describe("ExportButtons", () => {
  const originalWindowOpen = window.open;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.open = vi.fn();
    mockGetGoogleAuthStatus.mockResolvedValue({ isConnected: true });
  });

  afterEach(() => {
    cleanup();
    window.open = originalWindowOpen;
  });

  it("renders both export buttons", () => {
    render(<ExportButtons weddingId={1} />);

    const googleButtons = screen.getAllByRole("button", {
      name: "Export to Google Sheets",
    });
    const xlsxButtons = screen.getAllByRole("button", {
      name: "Download as XLSX",
    });

    expect(googleButtons.length).toBeGreaterThanOrEqual(1);
    expect(xlsxButtons.length).toBeGreaterThanOrEqual(1);
  });

  // --- Google export ---

  it("opens auth URL when not connected and shows authentication message", async () => {
    const user = userEvent.setup();
    mockGetGoogleAuthStatus.mockResolvedValue({ isConnected: false });
    mockGetGoogleAuthUrl.mockResolvedValue({
      url: "https://accounts.google.com/oauth?foo=bar",
    });

    render(<ExportButtons weddingId={1} />);

    await user.click(
      screen.getAllByRole("button", { name: "Export to Google Sheets" })[0],
    );

    expect(mockGetGoogleAuthStatus).toHaveBeenCalledOnce();
    expect(mockGetGoogleAuthUrl).toHaveBeenCalledOnce();
    expect(window.open).toHaveBeenCalledWith(
      "https://accounts.google.com/oauth?foo=bar",
      "_blank",
    );

    expect(
      await screen.findByText(
        "Complete Google authentication in the new tab, then try again.",
      ),
    ).toBeInTheDocument();
  });

  it("opens spreadsheet URL when connected and export succeeds", async () => {
    const user = userEvent.setup();
    mockGetGoogleAuthStatus.mockResolvedValue({ isConnected: true });
    mockExportToGoogleSheets.mockResolvedValue({
      success: true,
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/abc",
    });

    render(<ExportButtons weddingId={5} />);

    await user.click(
      screen.getAllByRole("button", { name: "Export to Google Sheets" })[0],
    );

    expect(mockExportToGoogleSheets).toHaveBeenCalledWith(5);
    expect(window.open).toHaveBeenCalledWith(
      "https://docs.google.com/spreadsheets/d/abc",
      "_blank",
    );

    expect(
      await screen.findByText("Spreadsheet created!"),
    ).toBeInTheDocument();
  });

  it("shows error message when Google export fails", async () => {
    const user = userEvent.setup();
    mockGetGoogleAuthStatus.mockResolvedValue({ isConnected: true });
    mockExportToGoogleSheets.mockResolvedValue({
      success: false,
      error: "Failed to create spreadsheet",
    });

    render(<ExportButtons weddingId={1} />);

    await user.click(
      screen.getAllByRole("button", { name: "Export to Google Sheets" })[0],
    );

    expect(
      await screen.findByText("Failed to create spreadsheet"),
    ).toBeInTheDocument();
  });

  // --- XLSX export ---

  it("shows success message when XLSX export succeeds", async () => {
    const user = userEvent.setup();
    mockExportToXlsx.mockResolvedValue({
      success: true,
      data: [1, 2, 3],
      filename: "rsvps.xlsx",
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

  // --- Loading / disabled states ---

  it("shows Exporting... while Google export is in progress", async () => {
    const user = userEvent.setup();
    let resolveGoogleSheets: (value: unknown) => void;
    mockGetGoogleAuthStatus.mockResolvedValue({ isConnected: true });
    mockExportToGoogleSheets.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGoogleSheets = resolve;
        }),
    );

    render(<ExportButtons weddingId={1} />);

    await user.click(
      screen.getAllByRole("button", { name: "Export to Google Sheets" })[0],
    );

    // Button text changes to "Exporting..."
    const exportingButtons = screen.getAllByRole("button", {
      name: "Exporting...",
    });
    expect(exportingButtons.length).toBeGreaterThanOrEqual(1);

    // XLSX button should be disabled
    const xlsxButtons = screen.getAllByRole("button", {
      name: "Download as XLSX",
    });
    for (const btn of xlsxButtons) {
      expect(btn).toBeDisabled();
    }

    // Resolve to clean up
    await waitFor(() => resolveGoogleSheets({ success: true }));
  });

  it("shows Downloading... while XLSX export is in progress", async () => {
    const user = userEvent.setup();
    let resolveXlsx: (value: unknown) => void;
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

    // Google button should be disabled
    const googleButtons = screen.getAllByRole("button", {
      name: "Export to Google Sheets",
    });
    for (const btn of googleButtons) {
      expect(btn).toBeDisabled();
    }

    // Resolve to clean up
    await waitFor(() =>
      resolveXlsx({ success: true, data: [0], filename: "test.xlsx" }),
    );
  });
});
