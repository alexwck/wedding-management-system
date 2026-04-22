# Requirements Quality Checklist: Guest Seat Assignment

**Purpose**: Thorough requirements quality validation — data integrity, UX clarity, integration correctness
**Created**: 2026-04-22
**Feature**: [spec.md](../spec.md)
**Depth**: Thorough | **Focus**: Data integrity, UX clarity, integration points | **Audience**: Author + Reviewer (PR gate)

## Requirement Completeness

- [ ] CHK001 - Are error states specified for the assignment dialog when the server action fails (network error, permission denied)? [Gap]
- [ ] CHK002 - Is the behavior specified when two users (couple + admin) attempt to assign the same guest simultaneously? [Gap, Spec §FR-015]
- [ ] CHK003 - Are requirements defined for what happens to assignments when a new RSVP is created (guest added) after some assignments already exist? [Completeness]
- [ ] CHK004 - Are requirements defined for what happens when an attending guest's RSVP is deleted entirely (not just status changed)? [Completeness, Spec §FR-012]
- [ ] CHK005 - Is the maximum number of assignments per wedding specified or bounded? [Completeness]
- [ ] CHK006 - Are requirements specified for the floor plan editor state when assignments are loading (initial fetch, after save)? [Gap]
- [ ] CHK007 - Are requirements defined for what happens when a chair item ID is recycled (item deleted then a new item gets the same ID)? [Gap, Spec §FR-007]

## Requirement Clarity

- [ ] CHK008 - Is "filled/highlighted color" in FR-004 quantified with a specific color value or design token? [Clarity, Spec §FR-004]
- [ ] CHK009 - Is "real-time" in FR-009 defined with a specific update latency (already SC-002 says 1 second — are these consistent)? [Clarity, Spec §FR-009 vs SC-002]
- [ ] CHK010 - Is "seat position" in FR-010 defined — does it mean chairIndex, ordinal position among siblings, or spatial position? [Clarity, Spec §FR-010]
- [ ] CHK011 - Is the "table name" derivation rule specified — does it use the floor plan item's label, a generated label, or the item ID? [Clarity, Spec §FR-010, Assumptions]
- [ ] CHK012 - Is the assignment dialog dismissal behavior specified (click outside, escape key, explicit close button)? [Gap]
- [ ] CHK013 - Is the "Unassigned" indicator in US4 specified with a specific visual treatment? [Clarity, Spec §US4.2]

## Requirement Consistency

- [ ] CHK014 - Are the edge case definitions consistent with FR-013 regarding what triggers assignment deletion (chair deleted vs table deleted vs floor plan reset)? [Consistency, Spec §Edge Cases vs FR-013]
- [ ] CHK015 - Is FR-009 "real-time" panel update consistent with the server-action-based architecture — does the spec require optimistic client updates or server round-trips? [Consistency, Spec §FR-009]
- [ ] CHK016 - Are the cleanup rules in the data model consistent with the spec's edge cases — specifically, does the "chair moved between tables" edge case imply table_item_id must be updated on move? [Consistency, Spec §Edge Cases vs Data Model §Cleanup Triggers]
- [ ] CHK017 - Is FR-016 (both couple and admin roles) consistent with the existing auth model — does the current system actually grant admins the same floor plan write access as couples? [Consistency, Spec §FR-016]

## Acceptance Criteria Quality

- [ ] CHK018 - Can US3.2 ("guest is removed from the panel without requiring a full page reload") be objectively measured — what constitutes a "full page reload"? [Measurability, Spec §US3.2]
- [ ] CHK019 - Is SC-001 "under 10 seconds" testable given that dialog search interaction time varies by guest count? [Measurability, Spec §SC-001]
- [ ] CHK020 - Can SC-005 "survive floor plan save/load cycles" be verified without implementation knowledge of the save mechanism? [Measurability, Spec §SC-005]

## Scenario Coverage

- [ ] CHK021 - Are requirements defined for the scenario where a user attempts to assign a guest to a chair that no longer exists (race condition: another user deleted the table)? [Coverage, Exception Flow]
- [ ] CHK022 - Are requirements defined for the scenario where the floor plan has not been created yet (no items) and the user tries to assign guests? [Coverage, Zero State]
- [ ] CHK023 - Are requirements defined for accessibility — can the assignment dialog be navigated via keyboard? Can screen readers identify occupied vs empty chairs? [Coverage, Gap]
- [ ] CHK024 - Are requirements defined for the mobile viewport layout — how do the left panel (guests) and right panel (catalog) behave on small screens? [Coverage, Spec §FR-008]
- [ ] CHK025 - Are requirements defined for the dialog behavior when there are 200+ attending guests — is search/filter mandatory or just assumed? [Coverage, Spec §Assumptions]

## Edge Case Coverage

- [ ] CHK026 - Is the behavior specified when a guest name contains special characters or is very long (> 15 chars) — does the label truncate correctly on the chair? [Edge Case]
- [ ] CHK027 - Is the behavior specified when the floor plan is saved while an assignment dialog is open? [Edge Case]
- [ ] CHK028 - Is the behavior specified when a user undoes (ctrl+Z) a floor plan action that added/removed chairs with assignments? [Edge Case, Constitution §IV]
- [ ] CHK029 - Is the behavior specified when an assignment action fails after the chair visual state has already been optimistically updated? [Edge Case, Recovery Flow]

## Data Integrity

- [ ] CHK030 - Are the uniqueness constraints in the data model (one guest per seat, one seat per guest) explicitly required by the spec or only by the plan? [Traceability, Spec §FR-015 vs Data Model]
- [ ] CHK031 - Is the requirement for atomic assignment (no partial state where guest is removed from one chair but not added to another during reassignment) specified in the spec? [Gap, Spec §FR-003]
- [ ] CHK032 - Is the cleanup timing specified — must orphaned assignments be removed immediately on floor plan save, or is deferred cleanup acceptable? [Clarity, Data Model §Cleanup Triggers]

## Integration Points

- [ ] CHK033 - Are requirements specified for how the existing RSVP status change action triggers assignment cleanup (FR-012) — is this a synchronous requirement? [Dependency, Spec §FR-012]
- [ ] CHK034 - Is the Google Sheets export extension requirement (FR-011) clear about column order, header names, and data format for the new columns? [Clarity, Spec §FR-011]
- [ ] CHK035 - Are requirements defined for the admin wedding detail view — should admins see seat assignments when viewing a wedding's RSVPs? [Gap, Spec §FR-016]
- [ ] CHK036 - Is the requirement for how the unassigned guests panel is populated on initial page load specified? [Dependency, Spec §FR-008]

## Dependencies & Assumptions

- [ ] CHK037 - Is the assumption "Google Sheets export already exists" validated — is the current export feature documented and stable? [Assumption, Spec §Assumptions]
- [ ] CHK038 - Is the assumption about chair ID stability (Assumptions + Research R5) consistent with the spec's edge case about chair deletion? [Consistency]
- [ ] CHK039 - Is the dependency on floor plan item labels for "table name" display (FR-010) documented as an assumption about label format? [Assumption, Spec §FR-010]
