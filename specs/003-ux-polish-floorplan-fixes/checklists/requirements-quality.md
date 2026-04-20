# Requirements Quality Checklist: UX Polish & Floor Plan Fixes

**Purpose**: Validate requirements quality across auth/access control and floor plan data integrity domains — "unit tests for English"
**Created**: 2026-04-20
**Feature**: [spec.md](../spec.md)

**Note**: This checklist tests whether the requirements are well-written, complete, unambiguous, and ready for implementation — NOT whether the implementation works.

## Auth & Access Control Requirements

### Requirement Completeness

- [ ] CHK001 Are redirect destination requirements defined for ALL user states (authenticated admin, authenticated couple, unauthenticated) on the root "/" path? [Completeness, Spec §FR-001–003]
- [ ] CHK002 Is the logout placement requirement specific enough to determine which UI component houses it (nav sidebar, header, dropdown)? [Clarity, Spec §FR-004]
- [ ] CHK003 Are logout session termination requirements explicit about which session artifacts must be cleared (cookies, tokens, server-side session)? [Completeness, Spec §FR-005]
- [ ] CHK004 Are access control redirect requirements defined for ALL sub-routes under "/dashboard" and "/admin" (e.g., "/dashboard/floor-plan", "/admin/weddings/[id]")? [Completeness, Spec §FR-006–007]
- [ ] CHK005 Is the requirement for couple users accessing "/admin" and admin users accessing "/dashboard" mutually exclusive and non-contradictory? [Consistency, Spec §FR-006 vs §FR-007]

### Scenario Coverage — Auth

- [ ] CHK006 Are requirements defined for what happens when a user's role changes mid-session (e.g., admin demoted to couple)? [Coverage, Gap]
- [ ] CHK007 Are requirements defined for concurrent session handling (e.g., user logged in on two browsers and logs out from one)? [Coverage, Gap]
- [ ] CHK008 Is the requirement for post-logout navigation back to protected routes explicit about redirect behavior (not just blocking)? [Clarity, Spec §US2-Acceptance 2]
- [ ] CHK009 Are requirements defined for the auto-save-in-progress + logout race condition listed in edge cases? [Coverage, Spec §Edge Cases]

### Acceptance Criteria Quality — Auth

- [ ] CHK010 Can "accessible from the navigation" (Spec §FR-004) be objectively verified — is the expected location and visibility quantified? [Measurability, Spec §FR-004]
- [ ] CHK011 Can "session is terminated" (Spec §US2-Acceptance 1) be objectively measured — what constitutes a fully terminated session? [Measurability, Spec §FR-005]
- [ ] CHK012 Is the "within 1 second" redirect timing requirement (Spec §SC-002) applicable to all three redirect scenarios or only the root "/" redirect? [Clarity, Spec §SC-002]

## Floor Plan Data Integrity Requirements

### Requirement Completeness

- [ ] CHK013 Is the chair circle rendering requirement explicit about stroke color, fill color, and border width — or are these left to implementation discretion? [Clarity, Spec §FR-010]
- [ ] CHK014 Is "sufficient spacing" between chairs quantified with a minimum gap measurement? [Clarity, Spec §FR-012]
- [ ] CHK015 Are requirements defined for chair positioning behavior when the maximum chair count results in chairs that would exceed the venue boundary? [Coverage, Spec §Edge Cases]
- [ ] CHK016 Is the long table max chair count requirement (Spec §FR-013) consistent with the stated acceptance scenarios for 6ft (max 7) and 7ft (max 9) tables? [Consistency, Spec §FR-013 vs §US6]
- [ ] CHK017 Is the requirement to preserve round table max behavior (Spec §FR-014) consistent with the clarification that all floor plans will be reset to empty (Spec §FR-016)? [Consistency, Spec §FR-014 vs §FR-016]
- [ ] CHK018 Are requirements defined for the chair-to-table positioning algorithm — specifically how chairs distribute along long table edges vs. around round table perimeters? [Completeness, Gap]

### Scenario Coverage — Floor Plan

- [ ] CHK019 Are requirements defined for what "no dimension inputs shown" means for selected chairs — is the entire dimension panel hidden, or just disabled? [Clarity, Spec §FR-011]
- [ ] CHK020 Is the null error handling requirement (Spec §FR-015) specific about expected behavior when addItem fails — silently skip, show error, or retry? [Clarity, Spec §FR-015]
- [ ] CHK021 Are requirements defined for what happens to existing floor plan seed data in the database (not just user-created plans)? [Coverage, Spec §FR-016]
- [ ] CHK022 Are requirements defined for the visual appearance of the chair circle when selected vs. unselected — consistent with how other item types show selection? [Consistency, Gap]

### Acceptance Criteria Quality — Floor Plan

- [ ] CHK023 Can "visually distinct with no overlapping areas" (Spec §SC-004) be objectively measured at any zoom level? [Measurability, Spec §SC-004]
- [ ] CHK024 Can "fixed 1x1 ft diameter" (Spec §FR-010) be verified on the canvas — is the diameter measurement relative to the grid or an absolute pixel size? [Clarity, Spec §FR-010]

## File Upload Requirements

### Requirement Completeness

- [ ] CHK025 Are the accepted file extensions explicitly listed (".jpg", ".jpeg", ".png") or is the requirement stated only in terms of MIME types? [Clarity, Spec §FR-009]
- [ ] CHK026 Is the "clear error message" requirement for rejected uploads specific about message content, or is wording left to implementation? [Clarity, Spec §FR-008–009]
- [ ] CHK027 Is the boundary condition "exactly 5MB" (Spec §US4-Acceptance 4) explicitly addressed — inclusive or exclusive limit? [Clarity, Spec §FR-008]
- [ ] CHK028 Are requirements defined for client-side file validation vs. server-side validation responsibilities? [Completeness, Spec §Assumptions]

## Non-Functional Requirements

- [ ] CHK029 Are accessibility requirements defined for the logout button (keyboard accessible, screen reader announced)? [Coverage, Gap]
- [ ] CHK030 Are accessibility requirements defined for chair items on the floor plan canvas (e.g., contrast ratio for selected/unselected states)? [Coverage, Gap]
- [ ] CHK031 Are performance requirements defined for the floor plan canvas with maximum chair counts (e.g., a 7ft table with 9 chairs)? [Coverage, Gap]

## Dependencies & Assumptions

- [ ] CHK032 Is the assumption that "logout clears Supabase session and removes all auth cookies" (Spec §Assumptions) sufficient, or should it also address browser tab session state (e.g., sessionStorage)? [Assumption, Spec §Assumptions]
- [ ] CHK033 Is the assumption that "client-side validation is sufficient for UX" (Spec §Assumptions) consistent with SC-005 which says files are "rejected before reaching the server"? [Consistency, Spec §Assumptions vs §SC-005]
- [ ] CHK034 Is the assumption about "0.25 ft gap between chair edges" (Spec §Assumptions) documented as a formal requirement or left as an assumption only? [Traceability, Spec §Assumptions]

## Notes

- Check items off as completed: `[x]`
- Items marked [Gap] indicate missing requirements that should be added to the spec before implementation
- Items marked [Consistency] flag potential contradictions between spec sections
- Items marked [Clarity] flag vague requirements that need quantification
