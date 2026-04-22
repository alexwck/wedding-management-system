# Research: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22

## R1: Data Storage — Separate table vs. columns on rsvps

**Decision**: Separate `seat_assignments` table.

**Rationale**: The spec requires linking to a specific chair item ID (arbitrary string like `"fp-ch-1"`), not just a table name. Putting `chair_item_id` and `table_item_id` on the `rsvps` table would pollute the RSVP concern with floor plan layout concerns. A separate table keeps normalization clean and allows cascade deletion when floor plan items change without touching the RSVP record itself. The `rsvps` table's unique constraint on `(wedding_id, LOWER(guest_name))` already guarantees one RSVP per guest per wedding, so a unique constraint on `rsvp_id` in the assignments table enforces one-seat-per-guest.

**Alternatives considered**:
- Adding `chair_item_id` / `table_item_id` columns to `rsvps` — rejected because floor plan item IDs are arbitrary strings tied to the canvas layout, not stable identifiers. Deleting and recreating a table generates new IDs. Coupling RSVPs to layout IDs creates fragile dependencies.
- Storing assignments inside the `floor_plans.items` JSONB — rejected because it mixes presentation data (positions, dimensions) with relational data (guest assignments), making it hard to query "which guests are unassigned?" without parsing the entire JSONB array.

## R2: Assignment dialog UX — shadcn Command vs Dialog with ScrollArea

**Decision**: shadcn `Dialog` + `Command` (combobox pattern).

**Rationale**: The `Command` component provides built-in search/filter which is essential for weddings with 50+ guests. Wrapping it in a `Dialog` gives a glass-panel modal surface consistent with the design system. The dialog shows the currently assigned guest (if any) at the top, a search input, and the filtered guest list below. This pattern is well-supported by shadcn/ui.

**Alternatives considered**:
- Plain `Dialog` with `ScrollArea` — rejected because no built-in search for large guest lists.
- Inline dropdown (Popover) — rejected because it doesn't provide enough space for a searchable list of guests.

## R3: Visual indicator for occupied chairs

**Decision**: Filled color change + guest name label overlay.

**Rationale**: Changing the chair fill color from the default purple (`#f3e8ff`) to a distinct occupied color (e.g., green/teal) provides immediate visual distinction at a glance. Adding a truncated guest name label (via the existing `ItemLabel` pattern) on the chair provides detail on hover/zoom. This uses the existing label infrastructure rather than introducing new rendering concepts.

**Alternatives considered**:
- Border change only — rejected because too subtle, especially at zoom-out levels.
- Badge/chip overlay — rejected because it adds rendering complexity on top of the Konva circle.

## R4: Seat assignment lifecycle — when assignments are cleaned up

**Decision**: Cascade deletion via application logic in server actions.

**Rationale**: The spec requires assignment cleanup when: (a) a table is deleted, (b) a chair is deleted, (c) RSVP changes to "declined", (d) floor plan is reset. These are all triggered by explicit user actions that already go through server actions. Rather than database triggers (which would need to parse JSONB to find item IDs), the cleanup logic lives in the server actions that handle these mutations. This follows the existing pattern where `saveFloorPlan` does an atomic upsert.

**Alternatives considered**:
- PostgreSQL triggers — rejected because floor plan items are stored as JSONB, making trigger logic complex and fragile.
- No cleanup (stale assignments tolerated) — rejected because it violates data integrity and confuses users with ghost assignments.

## R5: Chair item ID stability for assignments

**Decision**: Assignments reference the existing arbitrary string IDs (e.g., `"fp-ch-1"`). When a table's chair count is reduced, assignments for removed chairs are deleted.

**Rationale**: Chair IDs are already generated deterministically by `use-chair-generation.ts`. They are stable across a session as long as the chair isn't removed. The existing `removeItem` already removes child chairs when a table is deleted. Assignment cleanup piggybacks on this by checking for orphaned `chair_item_id` values after floor plan save.

## R6: Unassigned guests panel placement

**Decision**: Left sidebar (guests panel), item catalog moves to right sidebar.

**Rationale**: During seating, the unassigned guests panel is the primary interaction surface — users repeatedly pick guests from it. Placing it on the left (natural reading start) gives it prominence. The item catalog (tables, chairs, etc.) is used less frequently during seating, so it moves to the right. Both use glass-panel styling. This swap reduces travel distance between the guest list and the canvas.

**Alternatives considered**:
- Guests panel below item catalog (left) — rejected because it pushes guests below the fold and makes the left sidebar too tall.
- Separate tab/page — rejected because it breaks the assign-while-viewing workflow.
- Floating overlay — rejected because it would overlap the canvas.
