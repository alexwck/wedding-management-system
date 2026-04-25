# UX Requirements Quality Checklist: UX Polish & Bugfixes

**Purpose**: Validate requirements quality across all 6 user stories — completeness, clarity, consistency, and coverage
**Created**: 2026-04-25
**Feature**: [spec.md](../spec.md)
**Depth**: Standard (implementation-readiness gate)
**Actor/Timing**: Author + reviewer before implementation

## Requirement Completeness

- [x] CHK001 - Are mobile touch interaction requirements explicitly specified for the drag-to-crop interaction (not just mouse drag)? [Completeness, Gap, Spec §FR-001] — Resolved: FR-001 now specifies "supporting both mouse drag and touch drag for mobile parity"
- [x] CHK002 - Are the exact min/max dimension values specified per resizable item type (Stage, Pillar, Walkway, Misc), or only a blanket 2ft–20ft range? [Completeness, Spec §FR-025] — Resolved: Per-item resize limits table added to User Story 6 acceptance scenarios
- [x] CHK003 - Is the "table number" derivation rule defined — sequential numbering, item ID, or item label? [Completeness, Gap, Clarification "Table 3"] — Resolved: FR-012c defines sequential position among table-type items
- [x] CHK004 - Are error state requirements specified for the crop position save operation (network failure, permission denied)? [Completeness, Gap] — Resolved: Edge case added for crop save failure with error toast and retry
- [x] CHK005 - Are loading state requirements defined for the guest panel sections (assigned/unassigned) during initial data fetch? [Completeness, Gap] — Resolved: FR-012a added for loading indicator
- [x] CHK006 - Are scroll behavior requirements specified for the guest panel when guest counts exceed the visible area? [Completeness, Gap, Spec §FR-008/FR-009] — Resolved: FR-012b added for independent scrolling per section
- [x] CHK007 - Are accessibility requirements (keyboard navigation, screen reader) defined for the collapsible guest sections? [Completeness, Gap] — Resolved: User Story 2 acceptance scenario 2 specifies keyboard-accessible via Enter/Space
- [x] CHK008 - Is the behavior specified when a template image is deleted from storage but a crop offset exists? [Completeness, Edge Case, Gap] — Resolved: Edge case added — landing page shows default state, crop offset ignored

## Requirement Clarity

- [x] CHK009 - Is "drag" in FR-001 precisely defined as both mouse and touch drag, or is it ambiguous? [Clarity, Spec §FR-001] — Resolved: FR-001 updated to "mouse drag and touch drag"
- [x] CHK010 - Is "real-time" in FR-012 and FR-017 quantified with a specific update latency threshold? [Clarity, Spec §FR-012, FR-017] — Resolved: Both updated to "within 500ms"
- [x] CHK011 - Is "clear error message" in FR-022 defined with specific message text, tone, or format? [Clarity, Spec §FR-022] — Resolved: FR-022 updated to exact text "Passwords do not match"
- [x] CHK012 - Are "offset coordinates" in FR-003 resolved as percentages or pixels — the spec says "percentages or pixels"? [Clarity, Ambiguity, Spec §FR-003] — Resolved: FR-003 updated to "percentage-based offset coordinates (0–100), compatible with CSS object-position"
- [x] CHK013 - Is the list "Stage, Pillar, Walkway, Misc" in FR-023 exhaustive, or could future item types be added that are also non-table? [Clarity, Spec §FR-023] — Resolved: FR-023 updated with explicit "(this is the exhaustive list; any future item types default to non-resizable)"
- [x] CHK014 - Is "dragged rapidly" in User Story 4 acceptance scenario 3 defined with a specific click-rate threshold? [Clarity, Spec §US4-3] — Resolved: Updated to "synchronous and blocks duplicate invocations"

## Requirement Consistency

- [x] CHK015 - Are the crop offset storage semantics (FR-003 "percentages or pixels") consistent with the existing `object-position` CSS behavior which uses percentages? [Consistency, Spec §FR-003] — Resolved: FR-003 now explicitly states "compatible with CSS object-position"
- [x] CHK016 - Is the "always visible, pinned at top" stats requirement (FR-013) consistent with the assumption that the left panel has "sufficient space"? [Consistency, Spec §FR-013 vs Assumptions] — Resolved: Assumptions updated to note "224px / w-56" width and mobile adaptation
- [x] CHK017 - Are the collapsible guest section behaviors consistent with the existing item catalog collapse pattern in the right sidebar? [Consistency] — Resolved: Assumptions updated to note "same visual pattern as existing item catalog collapse"
- [x] CHK018 - Does FR-016 ("empty chairs after all guests assigned") overlap with FR-015 ("empty chairs"), and if so, is the distinction clearly defined? [Consistency, Spec §FR-015 vs FR-016] — Resolved: FR-016 now states "(same value as FR-015's empty count — FR-016 exists to emphasize this metric when all guests are seated)"

## Acceptance Criteria Quality

- [x] CHK019 - Is SC-002 "no visible discrepancy" objectively measurable, or does it require subjective visual judgment? [Measurability, Spec §SC-002] — Resolved: SC-002 now specifies "verified by comparing the computed CSS object-position on both pages"
- [x] CHK020 - Is SC-001 "within 3 seconds" testable — does it mean time-to-interactive or time-to-complete-crop? [Measurability, Spec §SC-001] — Resolved: SC-001 now specifies "time-to-interactive: drag handle responsive within 100ms"
- [x] CHK021 - Is SC-004 "100% of test cases" a measurable requirement or an aspirational statement? [Measurability, Spec §SC-004] — Resolved: Kept as-is; it's a binary testable assertion (no test case should show double-undo)

## Scenario Coverage

- [x] CHK022 - Are requirements defined for the crop interaction when the browser window is resized during drag? [Coverage, Gap] — Resolved: User Story 1 acceptance scenario 6 added
- [x] CHK023 - Are requirements defined for concurrent crop saves from multiple browser tabs? [Coverage, Gap] — Resolved: User Story 1 acceptance scenario 7 added — last save wins
- [x] CHK024 - Are requirements defined for the guest panel with zero guests (no RSVPs received yet)? [Coverage, Edge Case] — Resolved: User Story 2 acceptance scenario 7 added — "No guests yet"
- [x] CHK025 - Are requirements defined for resize behavior when an item is dragged near the canvas boundary? [Coverage, Spec §FR-025] — Resolved: User Story 6 acceptance scenario 6 added — snaps to boundary
- [x] CHK026 - Are requirements defined for what happens when a chair's parent table item is deleted while the chair has an assigned guest? [Coverage, Gap] — Resolved: User Story 6 acceptance scenario 7 added — guests returned to unassigned

## Non-Functional Requirements

- [x] CHK027 - Are mobile viewport requirements specified for the guest panel layout (the panel is 224px wide — is this adequate on small screens)? [Non-Functional, Gap] — Resolved: Assumptions updated to note mobile adapts to full-width overlay
- [x] CHK028 - Are performance requirements for stats computation with large canvases (e.g., 50+ tables) specified? [Non-Functional, Spec §SC-007] — Resolved: Assumptions updated to note "up to 100 items must complete within 500ms"
- [x] CHK029 - Is the undo history size limit (currently 20 snapshots) adequate for the new resize operations which may generate many state changes? [Non-Functional, Gap] — Resolved: Assumptions updated to note "single state push on drag-end, not per-pixel"

## Ambiguities & Conflicts

- [x] CHK030 - Does the assumption "undo bug fix is in the hook logic" conflict with the research finding that the bug is in `floor-plan-canvas.tsx` (the caller)? [Conflict, Assumptions vs Research] — Resolved: Assumptions corrected to "duplicate pushState call in floor-plan-canvas.tsx (the caller)"
- [x] CHK031 - Is FR-006 "accept any image dimensions" consistent with FR-001's "drag to choose visible portion" when the image is smaller than the frame? [Ambiguity, Spec §FR-001 vs FR-006, Edge Case resolves this] — Resolved: Edge case "Very small template images fill the frame entirely — no dragging needed" already addresses this
