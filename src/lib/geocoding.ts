export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

export type GeocodingResponse =
  | { ok: true; results: GeocodingResult[] }
  | { ok: false; error: "no_results" | "api_error" | "timeout" };

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const TIMEOUT_MS = 5000;

export async function searchAddress(query: string): Promise<GeocodingResponse> {
  if (query.length < 3) return { ok: true, results: [] };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "WeddingManagementSystem/1.0",
      },
    });

    if (!response.ok) return { ok: false, error: "api_error" };

    const data = await response.json();
    const results = data.map(
      (item: { display_name: string; lat: string; lon: string }) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }),
    );

    if (results.length === 0) return { ok: false, error: "no_results" };
    return { ok: true, results };
  } catch {
    return { ok: false, error: "timeout" };
  } finally {
    clearTimeout(timeout);
  }
}
