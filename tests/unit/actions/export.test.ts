import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSchema } from "@/lib/validations/export";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  getAuthAndVerifyAccess: vi.fn(),
}));

vi.mock("exceljs", () => ({
  default: {
    Workbook: class {
      addWorksheet() {
        return {
          columns: [],
          getRow: () => ({ font: {}, fill: {} }),
          addRow: vi.fn(),
        };
      }
      xlsx = {
        writeBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer),
      };
    },
  },
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthAndVerifyAccess } from "@/lib/auth-guards";
import { exportToXlsx } from "@/app/actions/export";
import { sanitizeFilename } from "@/lib/filename";
import { mockFrom } from "../helpers/supabase-mock";

describe("export validations", () => {
  describe("exportSchema", () => {
    it("accepts valid wedding ID", () => {
      const result = exportSchema.safeParse({ weddingId: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects missing weddingId", () => {
      const result = exportSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects negative weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects zero weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects string weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: "abc" });
      expect(result.success).toBe(false);
    });
  });
});

describe("sanitizeFilename", () => {
  it("replaces ampersand with 'and'", () => {
    expect(sanitizeFilename("Alex & Sam")).toBe("Alex-and-Sam");
  });

  it("removes parentheses", () => {
    expect(sanitizeFilename("Wedding (June)")).toBe("Wedding-June");
  });

  it("replaces spaces with hyphens", () => {
    expect(sanitizeFilename("My Wedding")).toBe("My-Wedding");
  });

  it("collapses consecutive hyphens", () => {
    expect(sanitizeFilename("Alex -- Sam")).toBe("Alex-Sam");
  });

  it("trims leading and trailing hyphens", () => {
    expect(sanitizeFilename("-Alex Sam-")).toBe("Alex-Sam");
  });

  it("returns 'wedding' for empty name", () => {
    expect(sanitizeFilename("")).toBe("wedding");
  });

  it("returns 'wedding' for name that becomes empty after sanitization", () => {
    expect(sanitizeFilename("!!!")).toBe("wedding");
  });

  it("handles full couple name with ampersand and spaces", () => {
    expect(sanitizeFilename("Alex & Sam")).toBe("Alex-and-Sam");
  });

  it("handles name with special characters", () => {
    expect(sanitizeFilename("O'Brien & Co. (Ltd)")).toBe("O-Brien-and-Co-Ltd");
  });
});

describe("exportToXlsx action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for unauthenticated user", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: null,
      isLocked: null,
      error: "Not authenticated.",
    } as const);

    const result = await exportToXlsx(1);
    expect(result.success).toBe(false);
  });

  it("returns success with base64 data and sanitized filename", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      isLocked: false,
      error: null,
    } as const);

    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { couple_name: "Alice & Bob" }, error: null }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await exportToXlsx(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe("rsvp-export-Alice-and-Bob.xlsx");
      expect(typeof result.data).toBe("string");
    }
  });

  it("defaults filename to 'wedding' when couple name is empty", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      isLocked: false,
      error: null,
    } as const);

    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { couple_name: null }, error: null }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await exportToXlsx(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe("rsvp-export-wedding.xlsx");
    }
  });
});
