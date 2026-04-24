# Deep Gate Checklist: Dashboard UX Redesign & Bug Fixes

**Purpose**: Validate specification completeness and quality at formal release-gate depth before implementation begins
**Created**: 2026-04-25
**Updated**: 2026-04-25 (all gaps addressed)
**Feature**: [spec.md](../spec.md)
**Depth**: Deep (formal release gate)
**Audience**: Author (pre-implementation)
**Focus Areas**: UX/Layout requirements, Data integrity & migration, Bug fix requirements
**Status**: All items addressed — see Resolution Notes below

## Requirement Completeness

- [ ] CHK001 - Are timezone validation requirements specified (valid IANA strings, rejection of invalid values)? [Gap, Spec §FR-003a]
- [ ] CHK002 - Is the list of IANA timezones available to admins defined or constrained (e.g., common wedding destinations only vs. all IANA zones)? [Gap, Spec §FR-003a]
- [ ] CHK003 - Are requirements defined for how the datetime picker handles dates across DST boundaries in the wedding's timezone? [Gap, Spec §FR-001]
- [ ] CHK004 - Are column width proportions for the two-column layout specified with exact ratios or ranges (not just "roughly 1/3 and 2/3")? [Clarity, Spec §FR-004]
- [ ] CHK005 - Is the vertical ordering of sections within the right column explicitly defined (wedding date → venue → RSVP summary → RSVP responses)? [Completeness, Spec §FR-004]
- [ ] CHK006 - Are requirements specified for the RSVP table's sort direction indicators (ascending/descending visual cues)? [Gap, Spec §FR-007a]
- [ ] CHK007 - Is the initial sort order of the RSVP table defined when the page first loads? [Gap, Spec §FR-007a]
- [ ] CHK008 - Are requirements defined for the focal point preview interaction on touch/mobile devices (tap vs. click)? [Completeness, Spec §FR-017]
- [ ] CHK009 - Are requirements specified for the focal point visual indicator (marker style, size, visibility at different zoom levels)? [Gap, Spec §FR-017]
- [ ] CHK010 - Is the list of files/code to remove for Google Sheets export explicitly enumerated in the spec (not just the plan)? [Completeness, Spec §FR-011]

## Requirement Clarity

- [ ] CHK011 - Is "roughly 1/3 and 2/3 width" in US-2 quantified to a specific Tailwind grid or flex ratio? [Clarity, Spec §US-2]
- [ ] CHK012 - Is "standard desktop viewport (1440px wide)" in SC-002 the only viewport tested, or are intermediate sizes (1024px, 1280px) also specified? [Clarity, Spec §SC-002]
- [ ] CHK013 - Is "valid XLSX file" in FR-010 defined with a specific test criterion (e.g., "opens in Microsoft Excel without error dialog")? [Clarity, Spec §FR-010]
- [ ] CHK014 - Are the focal point "percentage" coordinates defined with precision (0-100 with how many decimal places)? [Clarity, Spec §FR-018]
- [ ] CHK015 - Is "object-position" or equivalent CSS mechanism specified for how the landing page applies the focal point? [Clarity, Spec §FR-019]
- [ ] CHK016 - Is the timezone display format on the landing page specified (abbreviation like "MYT", offset like "UTC+8", or full name)? [Clarity, Spec §FR-003, Key Entities]
- [ ] CHK017 - Are filename sanitization rules fully enumerated beyond the `&` → "and" example (e.g., parentheses, accented characters, spaces)? [Clarity, Spec §FR-010]

## Requirement Consistency

- [ ] CHK018 - Are FR-001 (admin datetime picker with timezone selector) and FR-002 (couple datetime picker without timezone) consistent about who can edit what? [Consistency, Spec §FR-001 vs §FR-002]
- [ ] CHK019 - Does the Key Entity description of Wedding Date display format ("HH:MM (TZ)") match what US-1 acceptance scenarios describe? [Consistency, Spec §Key Entities vs §US-1]
- [ ] CHK020 - Is the RSVP table column list in FR-007 consistent with the sortable columns in FR-007a (are all sortable columns also in the display list)? [Consistency, Spec §FR-007 vs §FR-007a]
- [ ] CHK021 - Is the layout description consistent between FR-004 (admin page) and FR-005 (couple dashboard) regarding which sections appear in which column? [Consistency, Spec §FR-004 vs §FR-005]
- [ ] CHK022 - Are edge case descriptions consistent with their parent user stories (e.g., "wedding date cleared" edge case aligns with US-1 acceptance scenario 3)? [Consistency, Spec §Edge Cases vs §US-1]

## Acceptance Criteria Quality

- [ ] CHK023 - Can US-1 acceptance scenario 1 ("date is saved and displayed on the public wedding landing page") be verified without knowing the timezone? [Measurability, Spec §US-1]
- [ ] CHK024 - Is the criterion for "valid XLSX file" (US-4) measurable — does "opens without format/extension errors" specify which application version to test with? [Measurability, Spec §US-4]
- [ ] CHK025 - Can SC-004 ("remains fully visible and functional after any number of collapse/expand toggles") be objectively measured — what defines "any number"? [Measurability, Spec §SC-004]
- [ ] CHK026 - Is SC-001 ("under 10 seconds via a date picker") measuring total time including save, or just the interaction time? [Clarity, Spec §SC-001]
- [ ] CHK027 - Are acceptance criteria for US-8 (focal point) missing a scenario for changing the focal point after initial set? [Coverage, Spec §US-8]

## Scenario Coverage

- [ ] CHK028 - Is a scenario defined for what happens when the wedding timezone is changed after the date has been set (does the displayed time shift correctly)? [Coverage, Gap]
- [ ] CHK029 - Are requirements defined for the RSVP table with a large number of responses (e.g., 200+ guests) — pagination, virtual scrolling, or max display? [Coverage, Gap]
- [ ] CHK030 - Is a scenario defined for the admin wedding detail page when no RSVP responses exist (does the table section show an empty state or hide entirely)? [Coverage, Spec §US-3]
- [ ] CHK031 - Is a scenario defined for concurrent edits to the wedding date (admin and couple editing simultaneously)? [Coverage, Exception Flow]
- [ ] CHK032 - Is a scenario defined for the focal point when the template image is replaced (does the focal point reset or persist)? [Coverage, Gap]
- [ ] CHK033 - Are requirements specified for the XLSX export when RSVP data includes special characters in guest names (accents, non-Latin scripts)? [Coverage, Spec §US-4]
- [ ] CHK034 - Is a scenario defined for the couple dashboard RSVP table — does the couple see the same collapsible sortable table as the admin, or a simplified version? [Coverage, Spec §FR-005]

## Edge Case Coverage

- [ ] CHK035 - Are requirements defined for the wedding date set to Feb 29 (leap year) and how it displays in non-leap years? [Edge Case, Gap]
- [ ] CHK036 - Is the edge case defined for the XLSX export with a wedding that has no couple name (what filename is generated)? [Edge Case, Spec §FR-010]
- [ ] CHK037 - Are requirements defined for the two-column layout at the exact mobile breakpoint (768px) — does it flip from two-column to single-column cleanly? [Edge Case, Spec §FR-006]
- [ ] CHK038 - Is the edge case defined for a template image that is extremely tall (portrait) or extremely wide (panorama) in the left column? [Edge Case, Spec §US-2]
- [ ] CHK039 - Are requirements defined for the floor plan catalog when the browser window is resized while the catalog is collapsed? [Edge Case, Spec §US-6]
- [ ] CHK040 - Is the edge case defined for a focal point set to the extreme edge of an image (0% or 100%)? [Edge Case, Spec §FR-018]

## Non-Functional Requirements

- [ ] CHK041 - Are accessibility requirements (keyboard navigation, screen reader labels) specified for the datetime picker? [NFR, Gap]
- [ ] CHK042 - Are accessibility requirements specified for the RSVP table sorting (sortable column headers need ARIA attributes)? [NFR, Gap]
- [ ] CHK043 - Are accessibility requirements specified for the focal point picker (keyboard alternative to click)? [NFR, Gap]
- [ ] CHK044 - Are loading state requirements defined for the datetime picker save operation (inline spinner, toast, disabled state)? [NFR, Completeness]
- [ ] CHK045 - Are error state requirements defined for focal point save failure (retry, revert, error message)? [NFR, Gap]
- [ ] CHK046 - Is the performance requirement for RSVP table sorting specified (client-side vs. server-side, response time for large datasets)? [NFR, Gap]

## Data Integrity & Migration

- [ ] CHK047 - Are requirements specified for migrating existing weddings that have a `wedding_date` but no `timezone` column (default value assignment)? [Migration, Spec §FR-003a]
- [ ] CHK048 - Is the `oauth_tokens` DROP migration order specified relative to application code deployment (drop before or after code removal)? [Migration, Spec §FR-011]
- [ ] CHK049 - Are rollback requirements defined for the migration that adds timezone and focal point columns? [Migration, Gap]
- [ ] CHK050 - Are rollback requirements defined for the migration that drops `oauth_tokens`? [Migration, Gap]
- [ ] CHK051 - Is the focal point coordinate pair integrity constraint documented (both x and y present or both null)? [Data Integrity, Spec §FR-018]
- [ ] CHK052 - Are requirements specified for seed data updates (do seed weddings need timezone values populated)? [Data Integrity, Gap]

## Bug Fix Requirements Quality

- [ ] CHK053 - Is the root cause of the XLSX bug documented in the spec, or only the symptom (corrupted file)? [Clarity, Spec §US-4]
- [ ] CHK054 - Is the root cause of the floor plan catalog overflow documented (what specifically causes it on re-expand)? [Clarity, Spec §US-6]
- [ ] CHK055 - Is the root cause of the chair count editing failure documented (UI visibility, state mismatch, z-index)? [Clarity, Spec §US-7]
- [ ] CHK056 - Are "done" criteria for each bug fix defined beyond "it works" — specific conditions that prove the fix? [Measurability, Spec §US-4/US-6/US-7]
- [ ] CHK057 - Is regression risk documented for each bug fix (could the fix break adjacent functionality)? [Coverage, Gap]

## Ambiguities & Conflicts

- [ ] CHK058 - Is it ambiguous whether the couple dashboard RSVP section should show the RSVP responses table directly, or link to a separate RSVP page (as the current dashboard does)? [Ambiguity, Spec §FR-005 vs existing behavior]
- [ ] CHK059 - Is the export button placement specified after Google Sheets removal — does it stay in the RSVP section header or move elsewhere? [Ambiguity, Spec §US-3 vs §US-4]
- [ ] CHK060 - Is there a conflict between SC-002 ("visible without scrolling on 1440px") and the number of sections in the right column (date + venue + RSVP summary + RSVP table with sorting)? [Conflict, Spec §SC-002 vs §FR-004]

## Notes

- Items marked [Gap] indicate requirements that may be missing entirely from the spec
- Items marked [Ambiguity] indicate requirements that could be interpreted multiple ways
- Items marked [Conflict] indicate potential contradictions between spec sections
- Deep gate coverage: 60 items across 10 quality dimensions

## Resolution Notes

All 60 items addressed in spec.md update (2026-04-25):

| Item | Resolution |
|------|-----------|
| CHK001 | Added to FR-003a: "Timezone is validated as a valid IANA timezone string; invalid values are rejected with an error message" |
| CHK002 | Added to FR-001: "The timezone selector offers a curated list of common wedding destination timezones plus all standard IANA zones" |
| CHK003 | Added to Assumptions: "When a wedding date falls during a DST transition, the displayed time uses the correct offset for that specific date (handled by IANA timezone database)" |
| CHK004 | Clarified in FR-004: "Tailwind `lg:col-span-1` (~1/3 width)" and "Tailwind `lg:col-span-2` (~2/3 width)" |
| CHK005 | Added to FR-004: "The right column sections stack vertically in this order: wedding date/timezone → venue details → RSVP summary → RSVP responses" |
| CHK006 | Added to FR-007a: "Sortable columns display ascending/descending arrow indicators" |
| CHK007 | Added to FR-007a: "The default sort order is by submitted date descending (newest first)" |
| CHK008 | Added to FR-017: "Both mouse click and touch tap are supported" |
| CHK009 | Added to FR-017: "A crosshair indicator marks the selected focal point" |
| CHK010 | Added US-5 "Removal Scope" section with explicit file/function list |
| CHK011 | Addressed via CHK004 — exact Tailwind grid classes specified |
| CHK012 | Clarified in SC-002: "Viewports at 1024px-1439px show the same layout but may require scrolling for the RSVP table" |
| CHK013 | Added to FR-010: "valid XLSX files that open correctly in Microsoft Excel 2016+ and Google Sheets" |
| CHK014 | Added to FR-018: "two DECIMAL(5,2) percentage values (0.00-100.00)" |
| CHK015 | Added to FR-019: "using CSS `object-position`" |
| CHK016 | Added to FR-003: "formatted as 'Month Day, Year at HH:MM (TZ abbreviation)' (e.g., 'June 15, 2026 at 2:00 PM (MYT)')" |
| CHK017 | Added to FR-010: "ampersand → 'and', parentheses removed, spaces → hyphens, consecutive hyphens collapsed, leading/trailing hyphens trimmed" |
| CHK018 | Confirmed consistent — FR-001 has timezone selector, FR-002 explicitly says "Couples cannot see or change the timezone selector" |
| CHK019 | Aligned Key Entities format with US-1 acceptance scenarios — both now reference timezone display |
| CHK020 | Confirmed consistent — all FR-007a sortable columns are in the FR-007 display list |
| CHK021 | Confirmed consistent — both FR-004 and FR-005 reference same two-column layout |
| CHK022 | Aligned — Edge Case "wedding date cleared" matches US-1 scenario 3 ("hidden entirely") |
| CHK023 | Updated US-1 scenario 1: "saved (stored as UTC) and displayed on the public wedding landing page in the wedding's configured timezone" |
| CHK024 | Updated US-4 scenarios 2-3: "Microsoft Excel 2016+" and "Google Sheets" as specific test targets |
| CHK025 | Updated SC-004: "after 20+ consecutive collapse/expand toggles" |
| CHK026 | Clarified SC-001: "in under 10 seconds total (including save and confirmation)" |
| CHK027 | Added US-8 scenario 5: user can reposition existing focal point by clicking new point |
| CHK028 | Added US-1 scenario 5: "admin changes timezone after date is set → displayed time shifts correctly" |
| CHK029 | Added US-3 scenario 5: "200+ RSVP responses → internal vertical scrolling, not infinite page height" |
| CHK030 | Added US-3 scenario 4: "zero RSVP responses → empty state message" |
| CHK031 | Added to Assumptions: "Concurrent edits acceptable with last-write-wins semantics" |
| CHK032 | Added US-8 scenario 6: "template image replaced → focal point resets to null" |
| CHK033 | Added US-4 scenario 6: "special characters in guest names preserved correctly (UTF-8 encoding)" |
| CHK034 | Added to FR-005: "The couple dashboard includes the same collapsible RSVP table and export button as the admin page" |
| CHK035 | Added US-1 scenario 4: Feb 29 leap year handling |
| CHK036 | Added US-4 scenario 5: "no couple name → filename defaults to rsvp-export-wedding.xlsx" |
| CHK037 | Added US-2 scenario 4: "exact 1024px breakpoint boundary — both columns render without overlap" |
| CHK038 | Added US-2 scenario 5: "extremely tall portrait image → constrained with object-fit: contain" |
| CHK039 | Added US-6 scenario 3: "browser window resized while collapsed → maintains constrained height" |
| CHK040 | Added US-8 scenario 7: "extreme edge (0% or 100%) → image positions correctly without distortion" |
| CHK041-043 | Deferred to implementation phase — shadcn/ui components provide default a11y; native datetime-local has built-in keyboard support. Noted in plan for component-level review |
| CHK044-045 | Deferred to implementation phase — error/loading states follow existing application patterns (toast for errors, button disabled state for loading). Noted in assumptions |
| CHK046 | Added SC-007: "RSVP table sorting response time is under 200ms for datasets up to 500 rows (client-side sort)" and FR-007a: "Sorting is performed client-side" |
| CHK047 | Added to Assumptions: "Existing weddings receive 'Asia/Kuala_Lumpur' via the column default — no data migration needed" |
| CHK048 | Added to data-model.md Migration 2: "This migration runs AFTER code deployment" |
| CHK049 | Added to data-model.md Migration 1: rollback SQL statement |
| CHK050 | Added to data-model.md Migration 2: rollback instruction |
| CHK051 | Added to FR-018: "Both coordinates must be present or both null (pair integrity)" |
| CHK052 | Added to data-model.md: "Seed Data Updates" section |
| CHK053 | Added US-4 "Root Cause" section explaining ArrayBuffer JSON serialization corruption |
| CHK054 | Added US-6 "Root Cause" section explaining missing height constraint on flex container |
| CHK055 | Added US-7 "Root Cause" section listing three potential causes to investigate |
| CHK056 | Added specific acceptance scenarios for each bug fix (US-4 has 6 scenarios, US-6 has 3, US-7 has 5) |
| CHK057 | Added US-7 "Regression Risk" note about existing table/chair E2E tests |
| CHK058 | Resolved in FR-005: couple dashboard includes same RSVP table directly (not link to separate page) |
| CHK059 | Export button stays in RSVP section header — confirmed by US-3 showing collapse toggle and US-4 showing download |
| CHK060 | Resolved in SC-002: clarified "up to 50 guests" visible without scrolling, and 1024px-1439px range may scroll for table |
