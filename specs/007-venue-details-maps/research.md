# Research: Venue Details with Embedded Maps

**Feature**: 007-venue-details-maps | **Date**: 2026-04-24

## Decision 1: Geocoding Provider

**Decision**: Nominatim (OpenStreetMap)

**Rationale**: Free, no API key required, CORS-enabled (`access-control-allow-origin: *`), returns structured JSON with `display_name`, `lat`, `lon`. Rate limit is 1 req/sec which is sufficient for admin address search.

**Alternatives considered**:
- Google Places API: Requires API key, paid after free tier
- Mapbox Geocoding: Requires API key, paid after free tier
- Here Geocoding: Requires API key

**Implementation notes**:
- Endpoint: `GET https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5`
- Must include `User-Agent` header (app name + contact email)
- Debounce to 1 req/sec on client side
- Client-side call is fine — CORS is supported, no API key to protect

## Decision 2: Map Embed Method

**Decision**: OpenStreetMap iframe embed

**Rationale**: Google Maps embed now requires an API key (paid). OpenStreetMap export/embed endpoint is free, requires no key, and supports marker pins.

**Alternatives considered**:
- Google Maps iframe: Requires API key as of 2026
- Leaflet.js: Adds a client-side JS dependency; overkill for a static map with a pin
- Mapbox GL: Requires API key, paid

**Implementation notes**:
- URL format: `https://www.openstreetmap.org/export/embed.html?bbox={minlon},{minlat},{maxlon},{maxlat}&layer=mapnik&marker={lat},{lon}`
- Compute bbox from coordinates: `±0.005` degrees (~500m radius) around the venue point
- No API key, no JS dependency, pure iframe

## Decision 3: Coordinate Storage

**Decision**: Two `double precision` columns (`venue_lat`, `venue_lng`) instead of PostgreSQL `point` type

**Rationale**: Constitution Principle V (Simplicity). The native `point` type has lon/lat ordering gotchas and requires string casting in Supabase JS. Two decimal columns are trivial to insert, query, and validate. The spec's `venue_coordinates (point)` intent is preserved — we store lat/lng, just in two columns for simplicity.

**Alternatives considered**:
- PostgreSQL `point` type: Lon/lat ordering convention differs from lat/lon standard; Supabase JS client requires string format `'POINT(lon lat)'`; extra casting in queries
- PostGIS `geography(POINT)`: Requires PostGIS extension; overkill for simple lat/lng storage
- JSONB `{"lat": ..., "lng": ...}`: Loss of numeric type safety at DB level

## Decision 4: Wedding Edit Form Location

**Decision**: Inline on existing admin wedding detail page (`/admin/weddings/[id]`), as a collapsible "Wedding Details" section. Same component reused on couple dashboard.

**Rationale**: Spec says "inline on existing wedding detail page." The current page is read-only with a template upload section. Adding an editable venue section follows the same pattern. Couples see the same form on their dashboard (Principle VII — mobile parity, consistent UX).

**Alternatives considered**:
- Separate `/admin/weddings/[id]/settings` page: Adds navigation complexity, violates simplicity
- Modal dialog: Hides the form, harder on mobile
