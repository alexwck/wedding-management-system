# Post-Fix Validation Checklist: Dashboard UX Redesign & Bug Fixes

**Purpose**: Re-validate spec after addressing all 60 deep-gate items — confirm gap fixes are solid and no new issues introduced
**Created**: 2026-04-25
**Updated**: 2026-04-25 (all 15 items addressed)
**Feature**: [spec.md](../spec.md)
**Depth**: Standard (re-validation pass)
**Audience**: Author (pre-implementation)
**Status**: All items addressed

## Requirement Completeness (Re-validation)

- [ ] CHK061 - Does the "curated list of common wedding destination timezones plus all standard IANA zones" in FR-001 have a defined minimum set or is it unbounded? [Clarity, Spec §FR-001]
- [ ] CHK062 - Is the couple dashboard RSVP table inclusion (FR-005: "same collapsible RSVP table and export button as admin") consistent with the couple dashboard having a separate `/dashboard/rsvps` page that already exists? [Consistency, Spec §FR-005]
- [ ] CHK063 - Are requirements defined for the RSVP table's behavior when sorting a column that contains null/empty values (e.g., missing table name or seat)? [Coverage, Gap]
- [ ] CHK064 - Is it specified whether the timezone abbreviation in FR-003 uses IANA abbreviations (e.g., "MYT", "JST") or UTC offsets (e.g., "+08:00", "+09:00")? [Clarity, Spec §FR-003]
- [ ] CHK065 - Are requirements defined for the focal point dialog's close behavior (close on backdrop click, close button, Escape key)? [Completeness, Spec §FR-016]

## Requirement Clarity (Re-validation)

- [ ] CHK066 - Is FR-004's "1024px+" clear about whether the breakpoint is `min-width: 1024px` or `min-width: 1025px` (Tailwind `lg:` is 1024px inclusive)? [Clarity, Spec §FR-004 vs §FR-006]
- [ ] CHK067 - Does FR-012's `max-h-[calc(100vh-<topbar-height>)]` placeholder need a concrete pixel value or is it intentionally left for implementation? [Clarity, Spec §FR-012]
- [ ] CHK068 - Is the "DECIMAL(5,2)" type in FR-018 clear enough — does it mean 0.00 to 100.00 with two decimal places? [Clarity, Spec §FR-018]

## Consistency (Re-validation)

- [ ] CHK069 - Does US-7's "Root Cause" saying "investigation needed" conflict with FR-014 specifying "correct z-index" — is the root cause known or not? [Conflict, Spec §US-7 vs §FR-014]
- [ ] CHK070 - Is FR-005's statement that couple dashboard "includes the same collapsible RSVP table and export button as the admin page" consistent with FR-011 removing the Google Sheets button (which would already be gone from both)? [Consistency, Spec §FR-005 vs §FR-011]

## Scenario Coverage (Re-validation)

- [ ] CHK071 - Is a scenario defined for when the datetime picker input receives a manually typed invalid date string (not from the picker UI)? [Coverage, Gap]
- [ ] CHK072 - Is a scenario defined for the RSVP table when only one RSVP response exists — does sorting still show the sort indicator? [Coverage]
- [ ] CHK073 - Are requirements specified for what happens when the timezone selector receives a timezone that becomes deprecated in the IANA database? [Coverage, Gap]

## Dependencies & Assumptions (Re-validation)

- [ ] CHK074 - Is the assumption "shadcn/ui dialog for focal point preview" validated — does shadcn/ui include a dialog/modal component in the current project? [Assumption, Spec §Assumptions]
- [ ] CHK075 - Is the assumption about "native `datetime-local` input" for the date picker validated against the glassmorphism design system — can the native input be styled consistently? [Assumption]

## Notes

- Re-validation pass after addressing 60 deep-gate items
- 15 items focused on newly introduced content and edge cases from the fixes
- Items CHK069 and CHK070 are potential new conflicts introduced during gap fixes

## Resolution Notes

| Item | Resolution |
|------|-----------|
| CHK061 | Updated FR-001: "full set of IANA timezones via `Intl.supportedValuesOf('timeZone')`, searchable by city/region name" |
| CHK062 | Updated FR-005: couple dashboard shows RSVP summary + link to `/dashboard/rsvps` (existing page), not duplicated table |
| CHK063 | Updated FR-007a: "Null/empty values in sortable columns sort to the end in both ascending and descending order" |
| CHK064 | Updated FR-003: changed from "TZ abbreviation" to "UTC offset" format (e.g., "UTC+8") for universal clarity |
| CHK065 | Updated FR-016: "closes on backdrop click, Escape key, or a close button in the top-right corner" |
| CHK066 | Updated FR-004 and FR-005: clarified as `min-width: 1024px`, Tailwind `lg:` breakpoint, inclusive |
| CHK067 | Updated FR-012: concrete value `h-[calc(100vh-40px)]` (40px = compact top bar height) |
| CHK068 | Updated FR-018: clarified as "up to 3 digits before the decimal and 2 after, range 0.00–100.00" |
| CHK069 | Updated US-7 Root Cause: clarified FR-014 z-index guidance addresses cause (b) specifically, other causes need different fixes |
| CHK070 | Resolved — FR-011 removes Google Sheets from both pages. FR-005 now shows export on `/dashboard/rsvps` page only |
| CHK071 | Updated FR-001 and FR-002: "If the user types a date string manually, invalid strings are rejected with an inline validation message" |
| CHK072 | Added US-3 scenario 6: single RSVP response — sort indicator appears but row stays unchanged |
| CHK073 | Updated FR-003a: "Deprecated IANA timezones are accepted as-is — the Intl API resolves them correctly for display" |
| CHK074 | Updated Assumptions: "shadcn/ui Dialog component already installed in the project via `src/components/ui/dialog.tsx`" |
| CHK075 | Updated Assumptions: "Native `datetime-local` styled via Tailwind to match existing form inputs. Native picker dropdown inherits system theme — acceptable per Constitution V (Simplicity)" |
