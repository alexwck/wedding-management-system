import { describe, it, expect, vi, afterEach } from "vitest";
import { searchAddress } from "@/lib/geocoding";

describe("searchAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns formatted results for a valid query", async () => {
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

    const results = await searchAddress("123 Main St");
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      display_name: "123 Main St, Springfield, IL, USA",
      lat: "39.7817",
      lon: "-89.6501",
    });
  });

  it("returns empty array for query under 3 chars", async () => {
    const results = await searchAddress("ab");
    expect(results).toEqual([]);
  });

  it("handles API error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Server Error", { status: 500 }),
    );

    const results = await searchAddress("Springfield");
    expect(results).toEqual([]);
  });

  it("handles fetch timeout", { timeout: 10000 }, async () => {
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

    const results = await searchAddress("Springfield");
    expect(results).toEqual([]);
  });

  it("handles no results from API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const results = await searchAddress("zzznonexistentplace");
    expect(results).toEqual([]);
  });

  it("includes User-Agent header in request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
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

  it("handles network error gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const results = await searchAddress("Springfield");
    expect(results).toEqual([]);
  });
});
