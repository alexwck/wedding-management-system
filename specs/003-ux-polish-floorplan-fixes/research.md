# Research: UX Polish & Floor Plan Fixes

**Date**: 2026-04-20

## Decision 1: Root Page Redirect Strategy

**Decision**: Implement root "/" redirect in `src/app/page.tsx` as a server component that reads the Supabase session and calls `redirect()`. Also add root redirect logic to `src/proxy.ts` for defense-in-depth.

**Rationale**: Server component redirect is the simplest approach — no client-side JavaScript needed. Adding it to proxy.ts as well ensures the redirect happens even earlier in the request lifecycle (middleware runs before page rendering). The proxy already handles auth checks for `/dashboard` and `/admin`, so adding `/` handling is natural.

**Alternatives considered**:
- Client-side redirect with `useEffect` + `router.push` — adds a flash of content, worse UX
- Middleware-only redirect — works but page.tsx should also handle it as a fallback

## Decision 2: Logout Implementation

**Decision**: Create a server action (`signOut`) that calls `supabase.auth.signOut()`, then invoke it from a client-side logout button in the Nav component that also calls the client-side `supabase.auth.signOut()` before redirecting.

**Rationale**: Supabase's signOut works best when called from both server and client to fully clear session cookies and local storage. The Nav component is a client component shared by both admin and couple layouts, making it the natural location for the logout button.

**Alternatives considered**:
- Server-only signOut — doesn't clear browser-side session state reliably
- Client-only signOut — doesn't invalidate server session

## Decision 3: Chair Rendering (Rect → Circle)

**Decision**: Change the Chair component from rendering a `Rect` to rendering a `Circle` with radius = 0.5 ft * FEET_TO_PIXELS (10px). Adjust positioning by adding 0.5 to both x and y in feet-space before scaling to convert from top-left anchor to center anchor.

**Rationale**: react-konva's Circle uses center positioning (x, y = center), while Rect uses top-left positioning. The offset of +0.5 ft (= half the 1ft diameter) converts the stored top-left coordinates to center coordinates for the Circle shape.

**Alternatives considered**:
- Keep Rect with border-radius = 50% — Konva Rect's cornerRadius doesn't produce perfect circles reliably at all sizes
- Store center coordinates instead of top-left — would require changes across all item types, too invasive

## Decision 4: Chair Spacing Algorithm

**Decision**: For round tables, use angular distribution with `angle_i = (2π * i) / n` and verify the chord distance between adjacent chairs is >= 1 ft (chair diameter). For long tables, use even spacing with `spacing = tableLength / numChairsPerSide` and position chairs at slot centers `(i + 0.5)`. Chair positions are stored as top-left coordinates (subtract 0.5 ft from center positions).

**Rationale**: The current algorithm already uses angular distribution for round tables and linear spacing for long tables, but doesn't account for chair size when spacing. The fix is to ensure the offset distance from the table edge accounts for chair radius, and the spacing between adjacent chairs accounts for chair diameter.

**Alternatives considered**:
- Fixed pixel gap between chairs — doesn't scale with zoom level
- Reduce max chairs instead of changing spacing — user wants the current chair counts, just no overlap

## Decision 5: Long Table Max Chair Count

**Decision**: Change `getMaxChairCount()` in `use-chair-generation.ts` to return `getMaxChairs(table.type, size)` directly for long tables (without `+ 1`), while keeping `+ 1` for round tables.

**Rationale**: The current code adds 1 unconditionally. The spec (FR-013, FR-014) requires removing the +1 only for long tables. This is a one-line conditional change.

**Alternatives considered**:
- Change the constants table instead — the LONG_TABLE_LENGTHS.maxChairs values could be changed, but the +1 is added in getMaxChairCount(), not in the constants
