# Checklist: Coordinate System and UI Layout Requirements Quality

**Purpose**: Validate requirements quality for coordinate system fixes and UI layout overhaul
**Created**: 2026-04-21
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are coordinate conversion requirements specified for all item types (round table, long table, chair, stage, etc.) during drag operations? [Completeness, Spec §FR-002]
- [ ] CHK002 Are coordinate conversion requirements specified for all item types during rotation operations? [Completeness, Spec §FR-003, §FR-004]
- [ ] CHK003 Are the exact pixel offset calculations required for center-based rendering documented as requirements (not just implementation details)? [Completeness, Spec §FR-001]
- [ ] CHK004 Are requirements for out-of-bounds behavior after coordinate fix specified for all table types? [Completeness, Spec Edge Cases]
- [ ] CHK005 Are requirements for chair position recalculation after table drag specified for both table types? [Completeness, Spec §FR-002]
- [ ] CHK006 Is the minimum usable viewport width (768px) specified as a firm requirement for the floor plan editor, not just an assumption? [Completeness, Spec §FR-007]
- [ ] CHK007 Are requirements for the collapsed item catalog state (what shows, what hides, how to expand) fully defined? [Completeness, Spec §FR-006]
- [ ] CHK008 Are requirements for floating toolbar behavior (positioning, overlap handling, z-ordering) fully specified? [Completeness, Spec §FR-008]
- [ ] CHK009 Are width requirements (min-width values) specified for all pages that need them, not just login and RSVP form? [Completeness, Spec §FR-009, §FR-012]
- [ ] CHK010 Are requirements for mockup deliverables (format, number of options, which pages) complete and unambiguous? [Completeness, Spec §FR-014]

## Requirement Clarity

- [ ] CHK011 Is "visual center" defined with a measurable criterion (e.g., pixel tolerance for centering)? [Clarity, Spec §FR-001]
- [ ] CHK012 Is "equidistant from the table's visual center" quantified with a specific tolerance? [Clarity, Spec US1 Acceptance 1]
- [ ] CHK013 Is "compact" for error/404 pages defined with specific sizing (e.g., max-height, max-width, vertical position)? [Clarity, Spec §FR-010]
- [ ] CHK014 Is "upper portion of the viewport" for error pages defined with a measurable boundary? [Clarity, Spec §FR-010]
- [ ] CHK015 Is "comfortable form entry" quantified with specific usability criteria beyond minimum width? [Clarity, Spec §FR-009, §FR-012]
- [ ] CHK016 Is "at least 60% of the available viewport area for meaningful content" defined with a measurement method? [Clarity, Spec §SC-004]
- [ ] CHK017 Is "at least 95% of available viewport height for the canvas area" defined with a measurement method? [Clarity, Spec §SC-003]
- [ ] CHK018 Is "side by side on wide screens" defined with a specific breakpoint for the admin couples page? [Clarity, Spec §FR-011]

## Requirement Consistency

- [ ] CHK019 Do the coordinate requirements for round tables (FR-001) align with the drag handler requirements (FR-002) — both use the same center convention? [Consistency, Spec §FR-001, §FR-002]
- [ ] CHK020 Do rotation requirements (FR-003, FR-004) align with drag-after-rotate requirements in US2 Acceptance 3? [Consistency, Spec §FR-003, §FR-004, US2 Acceptance 3]
- [ ] CHK021 Is the viewport width requirement for no horizontal scrollbar (768px+, FR-007) consistent with the mobile exception for floor plan editor? [Consistency, Spec §FR-007, Edge Cases]
- [ ] CHK022 Are max-width constraints (FR-013) consistent with minimum width requirements (FR-009, FR-012) across pages? [Consistency, Spec §FR-009, §FR-012, §FR-013]

## Acceptance Criteria Quality

- [ ] CHK023 Can "chairs stay centered around the table at the new position" (US1 Acceptance 2) be objectively measured? [Measurability, Spec US1 Acceptance 2]
- [ ] CHK024 Can "table spins around its visual center (not its corner)" (US2 Acceptance 1) be objectively measured? [Measurability, Spec US2 Acceptance 1]
- [ ] CHK025 Can "no horizontal scrollbar appears" (US3 Acceptance 3) be objectively verified at specific viewport widths? [Measurability, Spec US3 Acceptance 3]
- [ ] CHK026 Can "content fills the main area with clear visual hierarchy" (US4 Acceptance 2) be objectively measured? [Measurability, Spec US4 Acceptance 2]

## Scenario Coverage

- [ ] CHK027 Are requirements specified for what happens when a table is dragged, rotated, then dragged again (combined operations)? [Coverage, Spec Edge Cases]
- [ ] CHK028 Are requirements specified for collision detection behavior after coordinate fixes? [Coverage, Gap]
- [ ] CHK029 Are requirements specified for undo/redo operations after coordinate fix — does undo correctly restore top-left coordinates? [Coverage, Gap]
- [ ] CHK030 Are requirements specified for chair generation on a rotated table (US2 Acceptance 4) — is the interaction with the coordinate fix addressed? [Coverage, Spec US2 Acceptance 4]
- [ ] CHK031 Are requirements specified for the admin wedding detail page "tabbed or compact layout" (US4 Acceptance 6) — which option is required? [Coverage, Spec US4 Acceptance 6]
- [ ] CHK032 Are requirements specified for the landing page layout changes — what specifically should change? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK033 Are requirements defined for coordinate conversion when a table is dragged near the canvas edge (NaN/Infinity protection)? [Edge Case, Spec Edge Cases]
- [ ] CHK034 Are requirements defined for rotation at exact multiples of 90 degrees vs arbitrary angles? [Edge Case, Gap]
- [ ] CHK035 Are requirements defined for the floor plan editor on viewports between 320px and 768px (the gap between mobile support and minimum)? [Edge Case, Spec Edge Cases]
- [ ] CHK036 Are requirements defined for overlapping floating controls on small desktop screens (e.g., 768px-1024px)? [Edge Case, Spec Edge Cases]

## Non-Functional Requirements

- [ ] CHK037 Are performance requirements for coordinate calculations during rapid drag specified? [Non-Functional, Gap]
- [ ] CHK038 Are accessibility requirements for the collapsible catalog (keyboard toggle, screen reader announcement) specified? [Non-Functional, Gap]
- [ ] CHK039 Are accessibility requirements for floating toolbar controls (keyboard accessible, focus management) specified? [Non-Functional, Gap]
- [ ] CHK040 Are requirements for animation/transition during catalog collapse/expand specified? [Non-Functional, Gap]

## Dependencies & Assumptions

- [ ] CHK041 Is the assumption that "existing bounding-box coordinate convention is correct" validated — what happens if it's wrong? [Assumption, Spec Assumptions]
- [ ] CHK042 Is the assumption that "no database migrations are needed" still valid given the coordinate fix approach? [Assumption, Spec Assumptions]
- [ ] CHK043 Is the assumption about "mockups as HTML files rendered to screenshots" validated — are tool/format requirements specified? [Assumption, Spec Assumptions]
- [ ] CHK044 Is the dependency on Konva's offset behavior for rotation documented as a requirement constraint? [Dependency, Gap]

## Ambiguities & Conflicts

- [ ] CHK045 Is there a potential conflict between "no heading wasting space" (FR-005) and breadcrumb navigation — are breadcrumbs still required? [Conflict, Spec §FR-005]
- [ ] CHK046 Is "remember collapsed state during the session" (Assumptions) a requirement or an assumption — should it be elevated to an FR? [Ambiguity, Spec Assumptions]
- [ ] CHK047 Is the scope of "visual hierarchy" (US4) defined — which visual hierarchy principles apply, or is it purely about space reduction? [Ambiguity, Spec US4]
