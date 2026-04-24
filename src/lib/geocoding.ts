export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const TIMEOUT_MS = 5000;

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (query.length < 3) return [];

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

    if (!response.ok) return [];

    const data = await response.json();
    return data.map(
      (item: { display_name: string; lat: string; lon: string }) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }),
    );
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
