import { describe, it, expect, vi, afterEach } from "vitest";
import { searchAddress } from "@/lib/geocoding";

describe("searchAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok with results for a valid query", async () => {
    const mockResults = [
      {
        place_id: 123,
        display_name: "123 Main St, Springfield, IL, USA",
        lat: "39.7817",
        lon: "-89.6501",
      },
    ];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResults), { status: 200 }),
    );

    const response = await searchAddress("123 Main St");
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.results).toHaveLength(1);
      expect(response.results[0]).toEqual({
        display_name: "123 Main St, Springfield, IL, USA",
        lat: "39.7817",
        lon: "-89.6501",
      });
    }
  });

  it("returns ok with empty results for query under 3 chars", async () => {
    const response = await searchAddress("ab");
    expect(response).toEqual({ ok: true, results: [] });
  });

  it("returns api_error for API error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Server Error", { status: 500 }),
    );

    const response = await searchAddress("Springfield");
    expect(response).toEqual({ ok: false, error: "api_error" });
  });

  it("returns timeout for fetch timeout", { timeout: 10000 }, async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, opts) => {
      return new Promise((_, reject) => {
        const signal = (opts as RequestInit)?.signal as AbortSignal;
        if (signal) {
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }
      });
    });

    const response = await searchAddress("Springfield");
    expect(response).toEqual({ ok: false, error: "timeout" });
  });

  it("returns no_results when API returns empty array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const response = await searchAddress("zzznonexistentplace");
    expect(response).toEqual({ ok: false, error: "no_results" });
  });

  it("includes User-Agent header in request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ display_name: "x", lat: "0", lon: "0" }]), { status: 200 }),
    );

    await searchAddress("Springfield");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("nominatim.openstreetmap.org"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": expect.any(String),
        }),
      }),
    );
  });

  it("returns timeout for network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const response = await searchAddress("Springfield");
    expect(response).toEqual({ ok: false, error: "timeout" });
  });
});
