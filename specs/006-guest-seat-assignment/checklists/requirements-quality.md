# Requirements Quality Checklist: Guest Seat Assignment

**Purpose**: Thorough requirements quality validation — data integrity, UX clarity, integration correctness
**Created**: 2026-04-22
**Feature**: [spec.md](../spec.md)
**Depth**: Thorough | **Focus**: Data integrity, UX clarity, integration points | **Audience**: Author + Reviewer (PR gate)

## Requirement Completeness

- [x] CHK001 - Are error states specified for the assignment dialog when the server action fails (network error, permission denied)? [Gap] — Added FR-024
- [x] CHK002 - Is the behavior specified when two users (couple + admin) attempt to assign the same guest simultaneously? [Gap, Spec §FR-015] — Added edge case; unique constraint prevents double-assignment
- [x] CHK003 - Are requirements defined for what happens to assignments when a new RSVP is created (guest added) after some assignments already exist? [Completeness] — Already covered in Edge Cases: new guest appears in unassigned panel
- [x] CHK004 - Are requirements defined for what happens when an attending guest's RSVP is deleted entirely (not just status changed)? [Completeness, Spec §FR-012] — Already covered in Edge Cases: CASCADE deletes assignment
- [x] CHK005 - Is the maximum number of assignments per wedding specified or bounded? [Completeness] — Added assumption: bounded by attending RSVP count (< 500)
- [x] CHK006 - Are requirements specified for the floor plan editor state when assignments are loading (initial fetch, after save)? [Gap] — Added edge case: chairs non-interactive during load
- [x] CHK007 - Are requirements defined for what happens when a chair item ID is recycled (item deleted then a new item gets the same ID)? [Gap, Spec §FR-007] — Added edge case; unlikely due to deterministic ID generation

## Requirement Clarity

- [x] CHK008 - Is "filled/highlighted color" in FR-004 quantified with a specific color value or design token? [Clarity, Spec §FR-004] — FR-004 specifies "teal/green (from default purple #f3e8ff)"
- [x] CHK009 - Is "real-time" in FR-009 defined with a specific update latency (already SC-002 says 1 second — are these consistent)? [Clarity, Spec §FR-009 vs SC-002] — FR-009 explicitly states "within 1 second via optimistic client-side state updates"
- [x] CHK010 - Is "seat position" in FR-010 defined — does it mean chairIndex, ordinal position among siblings, or spatial position? [Clarity, Spec §FR-010] — FR-010 specifies "chairIndex + 1 among siblings"
- [x] CHK011 - Is the "table name" derivation rule specified — does it use the floor plan item's label, a generated label, or the item ID? [Clarity, Spec §FR-010, Assumptions] — Added assumption: uses item label, falls back to type + index
- [x] CHK012 - Is the assignment dialog dismissal behavior specified (click outside, escape key, explicit close button)? [Gap] — Added FR-023
- [x] CHK013 - Is the "Unassigned" indicator in US4 specified with a specific visual treatment? [Clarity, Spec §US4.2] — US4.2 specifies dash (—); added FR-025

## Requirement Consistency

- [x] CHK014 - Are the edge case definitions consistent with FR-013 regarding what triggers assignment deletion (chair deleted vs table deleted vs floor plan reset)? [Consistency, Spec §Edge Cases vs FR-013] — All three scenarios are covered: chair deleted, table deleted, floor plan reset
- [x] CHK015 - Is FR-009 "real-time" panel update consistent with the server-action-based architecture — does the spec require optimistic client updates or server round-trips? [Consistency, Spec §FR-009] — FR-009 explicitly states "optimistic client-side state updates"
- [x] CHK016 - Are the cleanup rules in the data model consistent with the spec's edge cases — specifically, does the "chair moved between tables" edge case imply table_item_id must be updated on move? [Consistency, Spec §Edge Cases vs Data Model §Cleanup Triggers] — Edge case specifies "table_item_id is updated to reflect the new parent"
- [x] CHK017 - Is FR-016 (both couple and admin roles) consistent with the existing auth model — does the current system grant admins the same floor plan write access as couples? [Consistency, Spec §FR-016] — Server actions use adminClient which bypasses RLS; both roles validated via wedding ownership check

## Acceptance Criteria Quality

- [x] CHK018 - Can US3.2 ("guest is removed from the panel without requiring a full page reload") be objectively measured — what constitutes a "full page reload"? [Measurability, Spec §US3.2] — Measurable: no browser navigation event; state update via JS (can verify with Performance API or manual observation)
- [x] CHK019 - Is SC-001 "under 10 seconds" testable given that dialog search interaction time varies by guest count? [Measurability, Spec §SC-001] — Testable with manual timing; 10s is generous upper bound for the click-search-confirm flow
- [x] CHK020 - Can SC-005 "survive floor plan save/load cycles" be verified without implementation knowledge of the save mechanism? [Measurability, Spec §SC-005] — Testable: assign guests → save → reload page → verify assignments still present

## Scenario Coverage

- [x] CHK021 - Are requirements defined for the scenario where a user attempts to assign a guest to a chair that no longer exists (race condition: another user deleted the table)? [Coverage, Exception Flow] — Covered by FR-013 cleanup + assignSeat validates chair exists in floor plan JSONB
- [x] CHK022 - Are requirements defined for the scenario where the floor plan has not been created yet (no items) and the user tries to assign guests? [Coverage, Zero State] — Added edge case: no chairs to click
- [x] CHK023 - Are requirements defined for accessibility — can the assignment dialog be navigated via keyboard? Can screen readers identify occupied vs empty chairs? [Coverage, Gap] — FR-023 specifies Escape key dismissal; shadcn Command component supports keyboard navigation by default
- [x] CHK024 - Are requirements defined for the mobile viewport layout — how do the left panel (guests) and right panel (catalog) behave on small screens? [Coverage, Spec §FR-008] — Assumption added: mobile viewports collapse sidebars; Constitution §VII mandates mobile parity
- [x] CHK025 - Are requirements defined for the dialog behavior when there are 200+ attending guests — is search/filter mandatory or just assumed? [Coverage, Spec §Assumptions] — Added assumption: search/filter always present

## Edge Case Coverage

- [x] CHK026 - Is the behavior specified when a guest name contains special characters or is very long (> 15 chars) — does the label truncate correctly on the chair? [Edge Case] — FR-004 specifies "truncated to 15 characters"
- [x] CHK027 - Is the behavior specified when the floor plan is saved while an assignment dialog is open? [Edge Case] — Dialog shows stale state briefly; next interaction fetches fresh data
- [x] CHK028 - Is the behavior specified when a user undoes (ctrl+Z) a floor plan action that added/removed chairs with assignments? [Edge Case, Constitution §IV] — Added edge case: undo restores canvas; orphan cleanup on next save
- [x] CHK029 - Is the behavior specified when an assignment action fails after the chair visual state has already been optimistically updated? [Edge Case, Recovery Flow] — Added edge case: rollback optimistic state + error toast

## Data Integrity

- [x] CHK030 - Are the uniqueness constraints in the data model (one guest per seat, one seat per guest) explicitly required by the spec or only by the plan? [Traceability, Spec §FR-015 vs Data Model] — FR-015 requires "prevent assigning the same guest to multiple chairs"; FR-007 requires linking to "specific chair item"
- [x] CHK031 - Is the requirement for atomic assignment (no partial state where guest is removed from one chair but not added to another during reassignment) specified in the spec? [Gap, Spec §FR-003] — Added assumption: reassignment is atomic
- [x] CHK032 - Is the cleanup timing specified — must orphaned assignments be removed immediately on floor plan save, or is deferred cleanup acceptable? [Clarity, Data Model §Cleanup Triggers] — Added assumption: cleanup occurs immediately on save

## Integration Points

- [x] CHK033 - Are requirements specified for how the existing RSVP status change action triggers assignment cleanup (FR-012) — is this a synchronous requirement? [Dependency, Spec §FR-012] — FR-012 says "automatically remove"; server action runs assignment cleanup synchronously after RSVP update
- [x] CHK034 - Is the Google Sheets export extension requirement (FR-011) clear about column order, header names, and data format for the new columns? [Clarity, Spec §FR-011] — FR-020 specifies exact column names and order
- [x] CHK035 - Are requirements defined for the admin wedding detail view — should admins see seat assignments when viewing a wedding's RSVPs? [Gap, Spec §FR-016] — FR-016 mandates "both couple and admin roles for all seat assignment operations"
- [x] CHK036 - Is the requirement for how the unassigned guests panel is populated on initial page load specified? [Dependency, Spec §FR-008] — FR-008 requires panel display; hook fetches data on mount

## Dependencies & Assumptions

- [x] CHK037 - Is the assumption "Google Sheets export already exists" validated — is the current export feature documented and stable? [Assumption, Spec §Assumptions] — Assumption clarified: "Google Sheets export is a new feature built as part of this specification — no prior export functionality exists"
- [x] CHK038 - Is the assumption about chair ID stability (Assumptions + Research R5) consistent with the spec's edge case about chair deletion? [Consistency] — IDs are stable for lifetime of item; deleted items' IDs are not reused (deterministic counter-based generation)
- [x] CHK039 - Is the dependency on floor plan item labels for "table name" display (FR-010) documented as an assumption about label format? [Assumption, Spec §FR-010] — Added assumption: uses item label, falls back to type + index
