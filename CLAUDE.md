# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding management system built with Next.js 16 (App Router) and Supabase. Couples can create wedding landing pages with RSVP forms; admins manage all weddings and couples. Uses a specification-driven development workflow via speckit skills.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests (tests/unit/)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests (tests/e2e/, requires Supabase + dev server running)
supabase db reset    # Reset local DB, re-run migrations + seed data
```

## Architecture

```
src/
├── app/
│   ├── (public)/           # Public route group (no auth required)
│   │   ├── auth/login/     # Login page
│   │   └── w/[slug]/       # Wedding landing pages (+ /rsvp sub-route)
│   ├── (auth)/             # Authenticated route group
│   │   ├── admin/          # Admin: manage weddings, couples
│   │   │   └── weddings/[id]/floor-plan/  # Admin floor plan editor
│   │   └── dashboard/      # Couple: manage own RSVPs
│   │       └── floor-plan/ # Couple floor plan editor
│   ├── actions/            # Server actions (admin.ts, auth.ts, rsvp.ts, upload.ts, floor-plan.ts, export.ts)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Tailwind v4 via @import
│   ├── error.tsx / not-found.tsx
├── components/
│   ├── floor-plan/         # Konva canvas floor plan editor (all client components)
│   │   ├── floor-plan-canvas.tsx    # Main canvas wrapper (Stage/Layer, compact top bar, label tracking)
│   │   ├── floor-plan-toolbar.tsx   # Undo/redo, zoom controls (inlined into top bar)
│   │   ├── canvas-item.tsx          # Memoized Konva item renderer
│   │   ├── canvas-stats.tsx         # Always-visible stats (table/chair counts, assigned/empty breakdown)
│   │   ├── guest-panel.tsx          # Collapsible unassigned + assigned guests with table numbering
│   │   ├── item-catalog.tsx         # Sidebar of placeable items
│   │   ├── rotation-transformer.tsx # Konva Transformer (rotation all items, resize non-table only)
│   │   ├── items/                   # Konva shape components (round-table, long-table, chair, etc.)
│   │   └── hooks/                   # use-floor-plan-state, use-auto-save, use-collision-detection, etc.
│   ├── ui/                 # shadcn/ui components (button, card, dialog, etc.)
│   ├── landing-page.tsx    # Wedding landing page component (venue info overlay, object-cover crop display)
│   ├── rsvp-form.tsx       # RSVP form with react-hook-form + zod
│   ├── rsvp-table.tsx      # Sortable RSVP response table
│   ├── rsvp-section.tsx    # Collapsible RSVP section with embedded export buttons
│   ├── rsvp-summary.tsx    # RSVP summary cards (attending, declining, vegetarian, baby chairs)
│   ├── export-buttons.tsx  # XLSX export button
│   ├── template-preview.tsx # Template preview with drag-to-crop repositioning
│   ├── template-upload.tsx # Template image upload with preview button
│   ├── wedding-date-picker.tsx # Wedding date/time picker with timezone selector
│   ├── timezone-combobox.tsx   # Searchable IANA timezone dropdown (cmdk)
│   ├── venue-editor.tsx    # Admin/couple venue editing form (client, Nominatim autocomplete)
│   ├── venue-section.tsx   # Public venue display with OSM map embed + nav buttons (server)
│   └── ...                 # Other app components
├── lib/
│   ├── floor-plan/         # Floor plan utilities (constants, collision, serializers, stats)
│   ├── geocoding.ts        # Nominatim API client (searchAddress)
│   ├── supabase/           # Supabase clients: client.ts, server.ts, admin.ts
│   ├── utils.ts            # cn() helper and utilities
│   └── validations/        # Zod schemas (admin.ts, rsvp.ts, floor-plan.ts, upload.ts, wedding.ts)
├── proxy.ts                # Auth middleware (NOT middleware.ts — renamed for Next.js 16 compat)
├── types/
│   └── floor-plan.ts       # Floor plan type definitions
supabase/
├── migrations/             # 11 migrations: users, weddings, rsvps, storage, floor_plans, seat_assignments, oauth_tokens, admin_rls_policies, venue_columns, timezone_focal_point, drop_oauth_tokens
├── seed.sql                # Dev seed data (weddings, RSVPs, users — venue data on test-wedding-1)
├── config.toml             # Supabase local config
```

## Speckit Workflow

Specification-driven development via slash-command skills:

1. `/speckit-constitution` → `.specify/memory/constitution.md`
2. `/speckit-specify` → `specs/###-feature-name/spec.md`
3. `/speckit-clarify` → Clarify spec ambiguities
4. `/speckit-plan` → Implementation plan in `specs/###-feature-name/`
5. `/speckit-tasks` → Dependency-ordered tasks
6. `/speckit-analyze` → Check spec/plan/tasks consistency
7. `/speckit-implement` → Execute tasks in dependency order
8. `/speckit-checklist` → Validate requirements quality

Git hooks in `.specify/extensions.yml` auto-commit at each stage.

Constitution at `.specify/memory/constitution.md` (v2.2.0) defines 9 enforceable principles including Test Verification (Red-Green proven by execution), Security by Default (atomic upserts), Mobile Parity (`onTap` + `onClick`), Data Integrity (validate at serialization boundaries), and Glassmorphism Design System.

## Key Technologies

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 (CSS-based config in globals.css, no tailwind.config file) + shadcn/ui (Nova theme)
- **Canvas**: react-konva + konva for interactive 2D floor plan editor
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth (email-based, admin/couple roles)
- **Storage**: Supabase Storage (`wedding-templates` bucket)
- **Forms**: react-hook-form + zod
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile Chrome)
- **TypeScript**: Strict mode, path alias `@/*` → `src/*`

## Git Hooks

Shared git hooks live in `.githooks/` and are committed to the repo. Each collaborator needs to run once:

```bash
git config core.hooksPath .githooks
```

| Hook | Purpose |
|------|---------|
| `prepare-commit-msg` | Strips `Co-Authored-By` lines from commit messages |

## Gotchas

- **proxy.ts, not middleware.ts**: Auth middleware is named `src/proxy.ts` because Next.js 16 has a conflict with `middleware.ts` naming
- **Tailwind v4**: No `tailwind.config.js` — configuration lives in `globals.css` using `@theme` blocks
- **RSVP deduplication**: Unique constraint on `(wedding_id, LOWER(guest_name))` plus application-level checks
- **Server components by default**: Most components are RSCs; only form components and canvas components use `"use client"`
- **Supabase client variants**: Three separate clients — `client.ts` (browser), `server.ts` (server components), `admin.ts` (service role, bypasses RLS)
- **Floor plan item IDs**: Arbitrary strings (e.g. `"fp-rt-1"`), not UUIDs — Zod schema validates `z.string().min(1)`
- **Chair count max**: Round tables use `maxChairs` (already includes +1); long tables use `maxChairs` directly — `getMaxChairCount` returns `getMaxChairs()` for both. Long table 6ft: default 7, max 8. Long table 7ft: default 9, max 10.
- **Floor plan server actions**: Use `adminClient` for reads/writes (bypasses RLS); `saveFloorPlan` uses atomic `upsert` on `wedding_id` — no read-then-write
- **Konva interactive nodes**: Every interactive shape must have `id` (for `findOne` lookups) and `onTap` alongside `onClick` (for mobile touch) — but `onTap` is Konva-only, not for regular HTML elements
- **Root page redirects**: `src/app/page.tsx` is a server component that reads auth session and redirects to `/auth/login`, `/dashboard`, or `/admin` — proxy.ts handles the same logic as middleware defense-in-depth
- **Logout**: Nav `LogoutButton` calls server action `signOut()` in `src/app/actions/auth.ts` (signOut is idempotent — no session guard needed)
- **Server action body size limit**: `next.config.ts` sets `serverActions.bodySizeLimit: "6mb"` — required because the default 1MB limit blocks template uploads before the 5MB app-level validation in `upload.ts` can run
- **Konva label tracking**: Labels are siblings (not children) of draggable shapes due to React Fragment wrapping. During drag-move, labels are found via `stage.findOne(`#${itemId}-label`)` and moved by the same pixel delta as the shape. All item components pass `id={`${id}-label`}` to `ItemLabel`.
- **Konva coordinate conventions**: Circle uses (x,y) as center; Rect uses (x,y) as top-left. The data model stores top-left for all items. Round tables and long tables compute center at render time; drag handlers convert back to top-left for storage. Both use `centerPixelsToTopLeftFeet()`.
- **Chair rotation**: Chairs (circles) don't independently rotate — only reposition (x/y) when their parent table rotates. `handleRotationEnd` applies rotation delta to chair positions via trig but omits `rotation` from the update.
- **Compact top bar**: Floor plan editor uses a single `glass-panel` bar at top (W/H inputs, undo/redo, zoom, save). No floating overlays at top of canvas. `containerRef` is on the inner canvas-area div so Stage dimensions exclude the 40px bar.
- **Canvas auto-centering**: `handleFitToScreen()` runs once on mount via `useEffect` with `hasFittedRef` guard, triggered when ResizeObserver reports actual container dimensions.
- **Glassmorphism design system**: The app uses a `.glass-panel` CSS utility class defined in `globals.css` with `backdrop-filter: blur(16px)`, `background: rgba(255,255,255,0.3)`, `border: 1px solid rgba(255,255,255,0.2)`, and `box-shadow: 0 8px 32px rgba(0,0,0,0.08)`. All card-like surfaces (forms, overlays, toolbars, modals) should use this pattern. CSS variables: `--glass-bg`, `--glass-bg-heavy`, `--glass-border`, `--glass-shadow`, `--glass-blur`, `--radius-glass`. Dark backgrounds make glass panels pop.
- **Turbopack stale routes**: After migrations or route changes, the dev server may serve 404 for routes it hasn't compiled. Fix: touch a file in the route directory (`touch src/app/\(public\)/w/\[slug\]/rsvp/page.tsx`) or restart the dev server. Always `curl` a page before debugging E2E failures.
- **E2E mobile click interception**: The mobile nav (`md:hidden fixed z-50`) overlays sidebar buttons on small viewports. Use `{ force: true }` on Playwright clicks for floor plan catalog items when targeting Mobile Chrome.
- **Undo history**: `canUndo` is true only after 2+ pushes (index > 0). Adding one item pushes the pre-add state but index stays at 0. Tests verifying undo must add at least 2 items before asserting `canUndo=true`.
- **Test infrastructure**: Shared helpers in `tests/unit/helpers/` — `mockFrom()` for Supabase chains, `factories.ts` for test data (`makeFloorPlanItem`, `makeRsvp`, etc.). New tests MUST use these instead of duplicating mocks. Current: 406 unit tests (44 files), 22 E2E spec files.
- **Playwright workers must be 1**: `playwright.config.ts` uses `workers: 1` unconditionally — parallel workers cause session cookie race conditions and flaky login-redirect failures, not just in CI
- **React 19 component tests require cleanup()**: Explicit `cleanup()` in `beforeEach`/`afterEach` is mandatory — RTL auto-cleanup doesn't handle React 19's double-renders in jsdom. Without it, DOM elements from previous tests leak and cause false assertion failures
- **fireEvent for fake timer tests**: Use `fireEvent` (not `userEvent`) in tests that use `vi.useFakeTimers()` — `userEvent`'s internal event loop conflicts with fake timers. Use `userEvent` for non-timer tests
- **jsdom FileReader never fires onload**: File upload component tests must provide a synchronous FileReader mock that calls `onload` immediately in `readAsDataURL`. File inputs need `Object.defineProperty(input, "files", {...})` + `fireEvent.change()` rather than Playwright's `setInputFiles`
- **Venue coordinate pair integrity**: `venue_lat` and `venue_lng` must both be present or both null — enforced at DB level (CHECK constraint) and Zod schema level (`.refine()`). Clearing `venue_address` with coordinates set is rejected by validation.
- **Venue editor autocomplete**: Client-side Nominatim geocoding (`src/lib/geocoding.ts`) returns `GeocodingResponse` discriminated union — `{ ok, results }` vs `{ ok, error }` (api_error/no_results/timeout). Address field uses `onChange` (not `register`) for debounced search; lat/lng are hidden inputs set on suggestion select. Shows "No results found" and "Unable to search" states per FR-013.
- **RSVP form layout wrapper**: `rsvp-form.tsx` no longer wraps itself in `min-h-screen` — the RSVP page (`rsvp/page.tsx`) controls the layout so it can render `VenueSection` above the form.
- **OSM map embed**: Venue section uses OpenStreetMap iframe (free, no API key) with bbox ±0.005 around venue coordinates. No Leaflet dependency needed.
- **E2E test data isolation**: Admin venue edit tests modify seed data. Read-only venue tests should not assert specific venue names that admin tests change. Assert stable fields (address, welcome message, couple name) instead.
- **FormData field clearing**: Send all text fields unconditionally in FormData (no `if (data.field)` guards). Server-side code converts empty strings to null. Conditional inclusion silently prevents field clearing.
- **External API client return types**: Return discriminated unions (`{ ok, results } | { ok, error }`) from external API clients, not flat arrays. Enables callers to distinguish "no results" from "API error" from "timeout."
- **Debounce loading state**: Set loading state inside the `setTimeout` callback, not before it. Setting before causes stale loading indicators when the timer is cancelled by subsequent input.
- **(0,0) coordinate guard**: When using lat/lng to render maps, guard against `(0,0)` (Null Island) in addition to null checks. `lat != null` is truthy for zero.
- **Coordinate clearing on address clear**: When a user clears the address field, set lat/lng to null via `setValue` — the Zod schema rejects saving coordinates without an address.
- **datetime-local for date picking**: Wedding date uses native `<input type="datetime-local">` — the value is a local datetime string (no timezone info). The server action converts to UTC via `new Date(value).toISOString()` before storing as TIMESTAMPTZ. Display uses `toLocaleDateString` with the wedding's `timezone` column for correct conversion.
- **Base64 buffer transfer for XLSX**: Server actions can't return raw `ArrayBuffer` — `workbook.xlsx.writeBuffer()` result is converted to base64 string via `Buffer.from(buffer).toString("base64")`. Client decodes with `atob()` + `Uint8Array` → `Blob` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- **object-position for focal point**: Landing page template image uses CSS `object-position: {focalX}% {focalY}%` when focal point is set, defaulting to `50% 50%`. Focal point coordinates are stored as 0-100 percentages. Reset to `NULL` on image replace.
- **h-[calc(100vh-40px)] for catalog**: Floor plan item catalog uses `h-[calc(100vh-40px)]` alongside `overflow-y-auto` to constrain height to viewport minus the 40px top bar. Without this, catalog overflows on collapse/expand toggling.
- **UTC+offset display format**: Wedding date on landing page shows `timeZoneName: "shortOffset"` via `Intl.DateTimeFormat` — produces strings like "June 15, 2026 at 2:00 PM GMT+8" rather than abbreviated timezone names.
- **Undo initial state**: `useUndoRedo.pushState()` must be called on mount with initial items/dimensions — otherwise `canUndo` stays false after the first action because the history index never moves past 0.
- **Chair collision on drag**: When dragging a table, child chairs must also be checked for OOB and collisions (not just the parent table). The `checkDragCollisions` helper handles this — it early-exits on parent collision before computing child positions.
- **Venue suggestion dropdown styling**: Address autocomplete suggestions must use `bg-background shadow-md` (not `glass-panel`) because the transparent glass-panel background makes text unreadable over page content beneath.
- **Canvas item memoization**: `CanvasItem` is a memoized component wrapping each Konva shape. It prevents full canvas re-renders on selection changes — always use it instead of rendering shapes directly in the `Stage`.
- **Template crop uses object-cover**: Landing page and preview now use `object-cover` with `object-position` (not `object-contain`). Crop offsets are 0-100 percentages stored in `template_focal_x`/`template_focal_y` columns.
- **Guest panel table numbering**: Table numbers are derived from sequential position among table-type items in the canvas items array — not from item IDs or labels. Deleting and re-adding tables changes numbering.
- **Resize bounds per item type**: Only non-table items (Stage, Pillar, Walkway, Misc) have resize handles via Konva Transformer. Bounds are defined in `RESIZE_BOUNDS` in constants.ts. Tables are fixed at predefined dimensions.
- **Guest cascade on table deletion**: When a table is deleted from the canvas, all guests assigned to that table's chairs are returned to the unassigned section via `seatAssignments.unassignGuest()`.
- **Undo bug was in caller, not hook**: The double-undo was caused by a duplicate pushState in the mount useEffect of floor-plan-canvas.tsx, not in the useUndoRedo hook itself. The initial pushState was removed.
- **Password confirmation client-side only**: `createCoupleFormSchema` adds confirmPassword with `.refine()` match validation. `createCoupleSchema` (server) has no confirmPassword. Client form explicitly picks only email/password/displayName/coupleName for FormData.
- **Undo tracks all canvas state**: `useUndoRedo.pushState()` captures items, width, height, assignmentMap, and unassignedGuests. Undo/redo restores all five atomically via `restoreAssignments` which diffs maps and parallelizes server calls.
- **Center-based rendering for all items**: All Konva items (tables, chairs, stage, pillar, walkway, misc) render at center position with `offsetX/Y` = half dimensions. This ensures rotation pivots around visual center. Data model still stores top-left in feet; conversion at render time.
- **Merged rotation+resize handler**: Single `onTransformEnd` in `rotation-transformer.tsx` handles both rotation and resize. Converts center pixels to top-left feet via `centerPixelsToTopLeftFeet`. One pushHistory per gesture.
- **Number input undo dedup**: Venue dimension and chair count inputs use `useRef` edit-started guards — `pushHistory` fires on first keystroke only, resets on blur. Prevents one undo entry per keystroke.
- **Callback stability via refs**: `pushHistory` reads `assignmentMap` and `unassignedGuests` via refs (not deps) to prevent callback cascade when seats change. `handleChairClick` uses stable `useCallback` instead of inline arrow to preserve `CanvasItem.memo()`.
- **Chair count scoped unassign**: `handleChairCountChange` only unassigns guests from chairs being removed (computed via `newChairIds` set diff), not from all chairs on the table.
- **restoreAssignments diff logic**: `useSeatAssignments.restoreAssignments` uses `structuredClone` for safe diffing, handles 3 cases: removed chairs, new chairs, and same-chair-different-guest. Server calls parallelized: unassignes first via `Promise.all`, then assigns.
- **Transformer center-to-topLeft**: `rotation-transformer.tsx` converts Konva center pixel positions to top-left feet via `centerPixelsToTopLeftFeet` before emitting `TransformResult`. All drag/transform handlers use this conversion uniformly.

## Active Technologies
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-konva, konva, Tailwind CSS v4, shadcn/ui (Nova theme), react-hook-form, zod, exceljs, cmdk (008-dashboard-ux-fixes)
- Supabase PostgreSQL — `timezone`, `template_focal_x`, `template_focal_y` columns on `weddings`; dropped `oauth_tokens` table (008-dashboard-ux-fixes)
- XLSX export via `exceljs` with base64 buffer transfer pattern (008-dashboard-ux-fixes)
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-konva, konva, shadcn/ui, zod, react-hook-form, @supabase/supabase-js (006-guest-seat-assignment)
- Supabase PostgreSQL — `seat_assignments` table + existing `rsvps`, `floor_plans` (006-guest-seat-assignment)
- TypeScript (strict mode) with Next.js 16 (App Router) + React 19 + react-hook-form, zod, Supabase JS, Tailwind CSS v4, shadcn/ui (007-venue-details-maps)

## Recent Changes
- 009-ux-polish-bugfixes: Drag-to-crop template repositioning (replaces click focal point), collapsible guest panel with assigned/unassigned sections, canvas stats (table/chair/assignment counts), undo tracks all state (items + assignments + dimensions), number input undo dedup, center-based rendering for all items (offsetX/Y), merged rotation+resize handler, callback stability via refs, chair count scoped unassign, password confirmation for couple creation, resize handles for non-table items (Stage/Pillar/Walkway/Misc) with per-type min/max bounds
- 008-dashboard-ux-fixes: Side-by-side dashboard layout (template left, details right), wedding date picker with timezone, collapsible sortable RSVP table, template preview with click-to-set focal point, fixed XLSX export (base64 transfer), removed Google Sheets export, fixed floor plan catalog overflow, chair count controls in top toolbar, collision detection for child chairs during drag, undo initial state fix, venue suggestion dropdown styling, memoized CanvasItem component, extracted checkDragCollisions and ChairCountControls helpers
- 007-venue-details-maps: Added venue name, address (with Nominatim autocomplete), welcome message, embedded OSM map, and navigation buttons. Venue editor on admin/couple pages, venue info on landing page, venue section with map on RSVP form.
- 006-guest-seat-assignment: Guest-to-chair seat assignments with drag-and-drop, unassigned guests panel, assignment dialog
- 005-fix-coords-ui-layout: Fixed Konva coordinate system (Circle center vs Rect top-left), added compact glass-panel top bar, real-time label tracking during drag, canvas auto-centering on load, chair rotation removal (chairs follow parent table only)
- 004-app-wide-ux-redesign: App-wide content density improvements across all pages
- 003-ux-polish-floorplan-fixes: Floor plan editor UX polish, Supabase Auth + Storage integration
