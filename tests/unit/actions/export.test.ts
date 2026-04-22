import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSchema, handleGoogleCallbackSchema } from "@/lib/validations/export";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  getAuthAndVerifyAccess: vi.fn(),
}));

vi.mock("@/lib/token-crypto", () => ({
  encrypt: vi.fn((s: string) => `enc:${s}`),
  decrypt: vi.fn((s: string) => s.replace("enc:", "")),
}));

vi.mock("googleapis", () => {
  const mockOAuth2Instance = {
    generateAuthUrl: vi.fn().mockReturnValue("https://accounts.google.com/o/oauth2/auth"),
    getToken: vi.fn().mockResolvedValue({
      tokens: { access_token: "at", refresh_token: "rt", scope: "scope" },
    }),
    setCredentials: vi.fn(),
    credentials: { access_token: "at" },
  };
  return {
    google: {
      auth: {
        OAuth2: class {
          constructor() { return mockOAuth2Instance; }
        },
      },
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          create: vi.fn().mockResolvedValue({
            data: { spreadsheetId: "sheet-1" },
          }),
          values: {
            update: vi.fn().mockResolvedValue({}),
          },
        },
      }),
    },
  };
});

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
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from("xlsx-data")),
      };
    },
  },
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthAndVerifyAccess } from "@/lib/auth-guards";
import { handleGoogleCallback, exportToXlsx } from "@/app/actions/export";
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

  describe("handleGoogleCallbackSchema", () => {
    it("accepts valid callback data", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        code: "auth-code-123",
        state: "user-uuid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing code", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        state: "user-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty state", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        code: "auth-code",
        state: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("handleGoogleCallback action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for unauthenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const result = await handleGoogleCallback({ code: "code", state: "state" });
    expect(result.success).toBe(false);
  });

  it("returns error when state does not match user id", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);

    const result = await handleGoogleCallback({ code: "code", state: "wrong-state" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid state parameter.");
  });

  it("returns success on valid callback", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);

    const fromMock = vi.fn().mockReturnValue(mockFrom({ error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await handleGoogleCallback({ code: "code", state: "u1" });
    expect(result.success).toBe(true);
  });
});

describe("exportToXlsx action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for unauthenticated user", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: null,
      error: "Not authenticated.",
    } as const);

    const result = await exportToXlsx(1);
    expect(result.success).toBe(false);
  });

  it("returns success with buffer and filename", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      error: null,
    } as const);

    const fromMock = vi.fn();
    // getRsvpsWithAssignments: 3 parallel calls
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null })); // rsvps
    fromMock.mockReturnValueOnce(mockFrom({ data: [], error: null })); // seat_assignments
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null })); // floor_plans
    // wedding name query
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { couple_name: "Alice & Bob" }, error: null }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await exportToXlsx(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toContain("Alice---Bob");
      expect(result.data).toBeInstanceOf(Buffer);
    }
  });
});
