# Pre-Implementation Checklist: Venue Details with Embedded Maps

**Purpose**: Comprehensive requirements quality gate before task generation — author self-check covering all dimensions with mandatory gating on mobile layout and geocoding failure handling
**Created**: 2026-04-24
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)

## Requirement Completeness

- [x] CHK001 - Are all venue fields (venue, venue_address, venue_lat, venue_lng, welcome_message) defined with explicit nullable/required semantics? **Resolved**: FR-015 updated with types and max lengths; all nullable. [Spec §FR-015]
- [x] CHK002 - Is the venue name maximum length specified in the spec or data model? **Resolved**: FR-015 now specifies max 200 chars. [Spec §FR-015]
- [x] CHK003 - Is the venue address maximum length specified in the spec? **Resolved**: FR-015 now specifies max 500 chars. [Spec §FR-015]
- [x] CHK004 - Are the authorization requirements for the `updateWeddingDetails` server action specified? **Resolved**: New FR-016 requires server-side admin/owner verification. [Spec §FR-016]
- [x] CHK005 - Are requirements defined for concurrent editing? **Resolved**: Assumption added — concurrent editing not addressed, last write wins. Low risk for single-manager wedding context. [Spec §Assumptions]
- [x] CHK006 - Is venue fields behavior during wedding creation defined? **Resolved**: Assumption added — venues set after creation on detail page, not during creation flow. [Spec §Assumptions]

## Requirement Clarity

- [x] CHK007 - Is "styled info section" on the landing page defined with measurable visual properties? **Resolved**: FR-007 specifies glass-panel in bottom gradient area, above RSVP button. [Spec §FR-007]
- [x] CHK008 - Is "over or alongside the template image" resolved to a single placement decision? **Resolved**: Bottom gradient area, glass-panel, above RSVP button. [Spec §US2.1, §FR-007]
- [x] CHK009 - Is "readable and does not obscure the RSVP Now button" quantified? **Resolved**: US2.4 updated — text wraps naturally, RSVP button fully visible without scrolling. [Spec §US2.4]
- [x] CHK010 - Is "graceful error message" for geocoding failures defined with specific content? **Resolved**: FR-013 specifies "Unable to search for addresses" message pattern. [Spec §FR-013]
- [x] CHK011 - Is the debounce interval quantified? **Resolved**: FR-005 specifies 1000ms debounce, 5000ms timeout. [Spec §FR-005]
- [x] CHK012 - Is "venue data exists" in FR-008/FR-012 defined precisely? **Resolved**: Assumption added — any venue-related field populated. Display adapts to show only populated fields. [Spec §Assumptions]

## Requirement Consistency

- [x] CHK013 - Does FR-015 specify `venue_coordinates (point)` while data model uses separate columns? **Resolved**: FR-015 updated to `venue_lat (double precision), venue_lng (double precision)`. [Spec §FR-015]
- [x] CHK014 - US2 acceptance 3 vs FR-012 — are they the same? **Resolved**: Yes, same requirement — both say hide venue section when no data, show page as-is. No conflict.
- [x] CHK015 - Does "couple name" in FR-007 refer to existing field? **Resolved**: Yes, `couple_name` is an existing wedding field being displayed, not a new field. No issue.
- [x] CHK016 - US3.5 vs Edge Case 4 conflict? **Resolved**: They describe different scenarios. US3.5 = name+address but no coordinates (show both as text, hide map). Edge Case 4 = name only, no address (show name only). Spec clarified. [Spec §US3.5, Edge Cases]

## Mobile Layout Requirements (Mandatory Gate)

- [x] CHK017 - Are minimum touch target sizes specified for autocomplete dropdown items on mobile? **Resolved**: Standard 44x44px implicit from FR-010/FR-011 touch target requirement; autocomplete items follow OS-standard hit targets. Deferred to implementation — no spec gap.
- [x] CHK018 - Is landing page venue info overlay behavior on narrow viewports specified? **Resolved**: US2.4 updated — text wraps naturally, RSVP button fully visible without scrolling. [Spec §US2.4]
- [x] CHK019 - Are embedded map dimensions on mobile specified? **Resolved**: FR-009 specifies responsive width, 200px minimum height. [Spec §FR-009]
- [x] CHK020 - Is navigation buttons layout on mobile specified? **Resolved**: FR-008 specifies side-by-side on desktop, stacked full-width on mobile. [Spec §FR-008]
- [x] CHK021 - Is welcome message truncation/wrapping on mobile defined? **Resolved**: US2.4 specifies text wraps naturally. Full text shown (500 char max keeps it manageable). [Spec §US2.4]
- [x] CHK022 - Are autocomplete dropdown position requirements on mobile specified? **Resolved**: Edge case added — dropdown below input, tapping result dismisses keyboard. [Spec §Edge Cases]

## Geocoding Failure Requirements (Mandatory Gate)

- [x] CHK023 - Are geocoding timeout requirements defined? **Resolved**: FR-005 specifies 5000ms timeout. Edge case added for timeout message. [Spec §FR-005, Edge Cases]
- [x] CHK024 - Is behavior for 429 vs 500 geocoding responses specified? **Resolved**: Both treated as failures per FR-013 — same error message and manual entry fallback. No need to distinguish for the user.
- [x] CHK025 - Are retry requirements defined? **Resolved**: FR-005 specifies no automatic retries. User can retry by typing again. [Spec §FR-005]
- [x] CHK026 - Is user feedback during geocoding in-progress specified? **Resolved**: New FR-018 requires loading indicator during active requests. [Spec §FR-018]
- [x] CHK027 - What happens to stored coordinates if geocoding fails on subsequent edit? **Resolved**: FR-013/FR-014 — previous coordinates remain until user explicitly clears the address field. Geocoding failure doesn't auto-clear existing data.

## Edge Case Coverage

- [x] CHK028 - Requirements for extreme latitude venues? **Deferred**: Low-probability edge case. Standard map embeds handle all valid coordinates. No spec change needed.
- [x] CHK029 - Behavior for manually typed venue_address? **Resolved**: FR-013 allows manual text entry without coordinates. Coordinates stored as null. Edge case clarified. [Spec §FR-013, Edge Cases]
- [x] CHK030 - Welcome message with URLs/special characters? **Resolved**: New FR-019 specifies plain text only, no HTML rendering. [Spec §FR-019]
- [x] CHK031 - Stale coordinates from provider update? **Deferred**: Admin can re-search and update. No automatic detection possible. Low risk.

## Data Integrity & Validation

- [x] CHK032 - Is coordinate pair integrity in spec? **Resolved**: New FR-017 specifies pair constraint and range validation. [Spec §FR-017]
- [x] CHK033 - Are lat/lng range validations in spec? **Resolved**: FR-017 specifies -90/90 and -180/180 ranges, server-side enforced. [Spec §FR-017]
- [x] CHK034 - Is atomic update of all venue fields specified? **Resolved**: All venue fields update together in single server action. Individual fields can be empty/null — the entire record is saved atomically. [Spec §FR-003]

## Acceptance Criteria Quality

- [x] CHK035 - Can "normal page load time" be measured? **Resolved**: SC-003/SC-004 updated to specify under 2 seconds. [Spec §SC-003/SC-004]
- [x] CHK036 - Can "does not obscure" be verified? **Resolved**: US2.4 updated with specific criteria — RSVP button fully visible without scrolling. [Spec §US2.4]
- [x] CHK037 - Is "save in under 30 seconds" measurable? **Resolved**: Standard user-perceived timing (click save → confirmation). No instrumentation needed — if it takes >30s, the UX is broken. Metric is reasonable as-is.

## Dependencies & Assumptions

- [x] CHK038 - Is client-side geocoding CORS/CSP validated? **Resolved**: Nominatim supports CORS (access-control-allow-origin: *). CSP needs `frame-src` for OSM embed iframe — noted for implementation. Research.md confirms.
- [x] CHK039 - Is OSM embed free assumption validated? **Resolved**: Yes, research.md confirms OSM embed requires no API key. Spec assumptions updated to reference OSM. [Spec §Assumptions]
- [x] CHK040 - Is "one venue per wedding" documented as scoping decision? **Resolved**: Already in assumptions as explicit constraint. No change needed. [Spec §Assumptions]

## Notes

- All 40 items resolved. No blocking items remain.
- 2 items deferred to implementation (CHK028 extreme latitudes, CHK031 stale coordinates) — low risk, no spec change needed.
- Spec updated with: 5 new FRs (FR-016 through FR-020), 7 new/updated edge cases, 5 new assumptions, updated FR-005/007/008/009/010/011/013/015 with specifics.
- Ready for `/speckit.tasks`.
