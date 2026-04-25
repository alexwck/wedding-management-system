# Research: Admin Lock, Floor Plan Polish & RSVP Redesign

**Date**: 2026-04-25 | **Feature**: 010-ux-polish-admin-rsvp

## R1 — Lock Enforcement Strategy

**Decision**: Server-side checks in every mutation server action, not RLS policies.

**Rationale**: All mutation actions use `adminClient` (service role key) which completely bypasses RLS. The RSVP INSERT policy allows unauthenticated public access. Neither RLS layer can enforce the lock. Server actions are the only enforcement point. The `verifyWeddingNotLocked(weddingId)` helper centralizes this check.

**Alternatives considered**:
- RLS policy on weddings UPDATE: Rejected because adminClient bypasses RLS entirely.
- Client-side only (hide/disable UI): Rejected — trivially bypassed, violates Constitution VI (Security by Default).
- Separate `wedding_locks` table: Rejected — adds join complexity when a simple column on `weddings` suffices.

## R2 — Lock Check Helper Pattern

**Decision**: Add `verifyWeddingNotLocked(weddingId)` to `src/lib/auth-guards.ts`, returning a typed result `{ ok: true } | { ok: false, error: string }`.

**Rationale**: Follows the existing discriminated union pattern used by `verifyWeddingAccess` and external API clients (geocoding). Consistent with the project's return-type convention documented in CLAUDE.md. Each mutation action calls this between access verification and the adminClient mutation.

**Alternatives considered**:
- Throw an error: Works but forces try/catch at every call site. Discriminated unions are the project pattern.
- Check in middleware (`proxy.ts`): Rejected — middleware doesn't know which wedding is being modified for most actions.

## R3 — Catalog Availability Computation

**Decision**: Compute availability eagerly on every canvas state change, but only when the catalog sidebar is visible.

**Rationale**: The spiral placement algorithm already exists and runs on every catalog click. Running it in "dry-run" mode (without placing) for each item type is the same cost as the user clicking each item once. With typical canvas sizes (20x30ft) and item counts (<50), this computation is sub-millisecond. Restricting to "catalog visible" avoids computing when the user isn't looking at the catalog.

**Alternatives considered**:
- Debounced computation (100ms delay): Rejected — adds complexity for no measurable performance gain at this scale.
- Lazy computation on catalog open: Rejected — user sees brief flash of enabled items before they're disabled.
- Background web worker: Overkill for the expected data volumes.

## R4 — Save UX Status Labels

**Decision**: Replace the current 4-state model (`idle`/`saving`/`saved`/`error`) with a 5-state model adding `blocked` for OOB items.

States:
1. `unsaved` — "Unsaved changes" + save button
2. `saving` — "Saving..." (spinner)
3. `saved` — "All changes saved" + timestamp (e.g., "Saved 2:34 PM")
4. `error` — "Save failed — try again" + retry button
5. `blocked` — "N item(s) outside canvas" + guidance text, no save button

**Rationale**: The `blocked` state is distinct from `error` (server failure) and `unsaved` (normal pending). Users need to understand WHY saving is blocked and WHAT to do about it. The current "Unsaved"/"Saved"/"Save Now" terminology was confusing even to the product owner.

**Alternatives considered**:
- Keep existing states, add OOB warning: Rejected — the current labels are already confusing.
- Modal dialog for OOB: Rejected — too intrusive for an ongoing editing session.

## R5 — Template Image Caching

**Decision**: Append `?t=${Date.now()}` cache-bust query parameter to the public URL returned from `uploadTemplateImage`.

**Rationale**: Supabase Storage generates deterministic public URLs (same path every upload). The browser and CDN cache the old image. A cache-bust query param forces a fresh fetch. The URL is stored in `weddings.template_image_url` so all consumers (admin preview, landing page, dashboard) automatically get the fresh URL. No code changes needed in consuming components — they just use the URL from the database.

**Alternatives considered**:
- Use Supabase image transformation API: Adds complexity, not needed for cache busting.
- Append `updated_at` timestamp from DB: Requires additional DB read; `Date.now()` is sufficient.
- Delete old file and create new path: The current upsert pattern already overwrites; the issue is caching, not storage.

## R6 — RSVP Single-Page Architecture

**Decision**: Server component page (`page.tsx`) that fetches all wedding data, renders hero section + venue section + client-side RSVP form in one scrollable page.

**Rationale**: The hero and venue sections are static (server-rendered). Only the RSVP form needs client-side interactivity (react-hook-form). The page remains a Server Component; the RSVP form is already a Client Component. Smooth scroll is CSS-only (`scroll-behavior: smooth` + anchor `href="#rsvp"`). No JavaScript routing needed.

**Alternatives considered**:
- Full client-side page with sections: Rejected — unnecessary, hero and venue don't need client-side rendering.
- Intersection Observer animations: Deferred — nice-to-have but not in scope. Can be added later.
- Keep separate routes with shared layout: Rejected — contradicts the spec's single-page requirement.

## R7 — Fallback Hero Without Template Image

**Decision**: Glassmorphism panel with gradient background (reusing existing CSS variables) showing couple name, date, and RSVP CTA.

**Rationale**: Currently returns 404 if no template image. Many couples may not have a professional photo ready when they start collecting RSVPs. A designed fallback maintains the premium feel without blocking functionality. Uses existing `--glass-bg`, `--glass-border`, `--glass-shadow` CSS variables for consistency.

## R8 — Undo/Redo Audit Approach

**Decision**: Systematic verification of all 9 action types against the `pushHistory()` calls in `floor-plan-canvas.tsx`, plus a focused test suite covering each action's undo behavior.

**Rationale**: The codebase audit shows all major actions already call `pushHistory()`. The user reports inconsistent behavior, which suggests edge cases (concurrent operations, multi-step gestures, state restoration) rather than missing coverage. A verification test suite will surface any gaps.

**Audit checklist** (from codebase analysis):
1. Catalog placement (`handleSelectItem`): Tracked ✓
2. Delete (`handleDelete`): Tracked ✓
3. Canvas size change (`handleVenueDimChange`): Tracked ✓ (with edit-started guard)
4. Chair count change (`handleChairCountChange`): Tracked ✓ (scoped unassign)
5. Guest assign (`handleGuestAssign`): Tracked ✓
6. Guest unassign (`handleGuestUnassign`): Tracked ✓
7. Drag end (`handleDragEnd`): Tracked ✓
8. Transform end (`handleTransformEnd`): Tracked ✓
9. Label edit (`commitLabelEdit`): Tracked ✓
10. Dimension edit (`handleDimChange`): Tracked ✓ (with edit-started guard)

All 10 actions appear tracked. The audit will verify correctness of state restoration, not just presence of pushHistory calls.
