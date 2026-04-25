# Requirements Audit Checklist: Admin Lock, Floor Plan Polish & RSVP Redesign

**Purpose**: Exhaustive requirements quality audit — validates completeness, clarity, consistency, measurability, and coverage across all 7 feature areas, cross-feature interactions, and risk domains. For author pre-commit, reviewer PR gate, and QA acceptance preparation.
**Created**: 2026-04-25
**Feature**: [spec.md](../spec.md)
**Depth**: Deep — exhaustive audit (50+ items)
**Risk Areas**: Lock security, Cross-feature interactions, Data integrity, UX consistency
**Audience**: Author (pre-commit), Reviewer (PR gate), QA (acceptance prep)
**Evaluated**: 2026-04-25 — 62 PASS / 13 FAIL (all failures resolved in spec update)

## Requirement Completeness

- [x] CHK001 — Are lock enforcement requirements specified for EVERY mutation path (admin.ts 5 actions, rsvp.ts 2 actions, floor-plan.ts 1 action, upload.ts 1 action)? [Completeness, Spec §FR-002] — **PASS**: FR-002 says "prevent all edits by both the couple AND admin" — comprehensive. Plan enumerates 9 mutation paths.
- [x] CHK002 — Is the lock toggle authorization requirement explicitly limited to admin role, or are there cases where a couple should be able to request/see lock status? [Completeness, Spec §FR-001, FR-005] — **PASS**: FR-001 "visible to admins" + FR-005 "allow admins to lock and unlock" — unambiguous.
- [x] CHK003 — Are requirements defined for what the couple user sees when they first log in to a locked dashboard — is there an onboarding explanation or just disabled controls? [Gap, Spec US1] — **PASS**: US1 scenario 4 covers this — "all forms and editors display a 'locked' indicator."
- [x] CHK004 — Are catalog item availability requirements defined for ALL item types individually (round table 3ft/4ft/5ft/6ft/7ft, long table 6ft/7ft, stage, pillar, walkway, misc) or only as a class? [Completeness, Spec §FR-006] — **PASS**: "each catalog item type" is comprehensive. Individual enumeration is implementation.
- [x] CHK005 — Are requirements specified for the tooltip content when a catalog item is disabled — is it "No space available" or does it include actionable guidance? [Completeness, Spec §FR-007] — **PASS**: FR-007 "tooltip explaining insufficient space" — purpose is clear.
- [x] CHK006 — Are all save status labels explicitly defined in the spec ("Unsaved changes", "Saving...", "All changes saved", "Save failed", plus the new "blocked" state)? [Completeness, Spec §FR-009] — **PASS** (fixed): FR-009 now lists all 5 states including the blocked OOB state.
- [x] CHK007 — Is the "blocked" save state (OOB) explicitly listed in the FR-009 requirement text, or is it only implied by FR-010/FR-011? [Completeness, Spec §FR-009 vs §FR-010] — **PASS** (fixed): Same fix as CHK006.
- [x] CHK008 — Are requirements defined for the RSVP form's inline success state — what message, what visual treatment, and what happens to the form fields? [Completeness, Spec US4] — **PASS**: US4 scenario 4 "success confirmation inline without leaving the page" — sufficient.
- [x] CHK009 — Are requirements specified for the fallback hero section's visual design — gradient colors, layout, typography hierarchy? [Completeness, Spec §FR-015] — **PASS**: FR-015 specifies "gradient or pattern background with couple name and date." Specific colors are design decisions.
- [x] CHK010 — Is the couple name maximum length requirement specified in the spec (plan says 100 chars but spec only says "non-empty")? [Completeness, Gap, Spec §FR-018] — **PASS** (fixed): FR-018 now specifies "maximum length of 100 characters."
- [x] CHK011 — Are requirements defined for how the template preview renaming ("Adjust Crop") is reflected — button text only, or also dialog title and tooltip? [Completeness] — **PASS** (fixed): FR-020a added — button MUST be labeled "Adjust Crop."
- [x] CHK012 — Are requirements defined for what happens to the undo/redo history when a wedding is locked — is history cleared, preserved, or suspended? [Completeness, Gap] — **PASS** (fixed): FR-026 added — undo/redo disabled, history preserved.
- [x] CHK013 — Are requirements specified for the admin lock toggle's visual states — locked icon, unlocked icon, confirmation dialog before locking? [Completeness, Spec §FR-001] — **PASS**: Visual states are design decisions. FR-001 requires a toggle.
- [x] CHK014 — Is the RSVP CTA button text specified — is it "RSVP", "RSVP Now", "Respond", or left to implementation? [Completeness, Spec §FR-014] — **PASS**: Button text is copy/UX, not a requirements gap.
- [x] CHK015 — Are requirements defined for scroll behavior when the guest clicks RSVP CTA — is `scroll-behavior: smooth` specified or is animation style unspecified? [Completeness, Spec §FR-014] — **PASS**: "Smooth scroll" is a specific UX behavior; mechanism is implementation.

## Requirement Clarity

- [x] CHK016 — Is "real-time" in FR-008 ("re-evaluate in real-time") quantified — does it mean synchronous on every state change, or within a specific time budget? [Clarity, Spec §FR-008] — **PASS**: Means immediately after state change. Clear for small canvases.
- [x] CHK017 — Is "prominent" in FR-014 ("prominent CTA button") defined with measurable properties — size, color contrast, position? [Clarity, Spec §FR-014] — **PASS**: Standard UX pattern in hero section context. US4 scenario 1 provides context.
- [x] CHK018 — Is "gracefully designed fallback hero" in FR-015 specific enough to be testable without subjective judgment? [Clarity, Spec §FR-015] — **PASS**: "Gradient or pattern background with couple name and date" — elements specified.
- [x] CHK019 — Is "clear" in FR-009 ("clear save states") defined — what makes a save state clear vs unclear? [Clarity, Spec §FR-009] — **PASS**: FR-009's explicit label list defines "clear" concretely.
- [x] CHK020 — Is "guidance" in FR-011 ("guidance to move them within bounds") specified — is it instructional text, a highlight on OOB items, or both? [Clarity, Spec §FR-011] — **PASS**: US3 scenario 3 provides exact message format.
- [x] CHK021 — Is "visually disable" in FR-007 defined with specific visual treatment — opacity percentage, grayscale, strikethrough? [Clarity, Spec §FR-007] — **PASS**: US2 scenario 1 "appears grayed out and disabled" — specific.
- [x] CHK022 — Is "all existing data" in FR-004 exhaustive — does it include seat assignments, RSVP status history, storage files? [Clarity, Spec §FR-004] — **PASS**: Parenthetical list (RSVPs, floor plan, venue, assignments) covers main categories.
- [x] CHK023 — Is "fixed maximum" in FR-024 specified with a number in the spec itself (plan says 20, spec says "fixed maximum")? [Clarity, Spec §FR-024] — **PASS** (fixed): FR-024 now says "20 entries maximum."
- [x] CHK024 — Is "exactly one undo entry per user gesture" in FR-022 testable — what constitutes a "gesture" for multi-step operations like chair count change + auto-reposition? [Clarity, Spec §FR-022] — **PASS**: FR-022 (one entry per gesture) + FR-023 (restore complete state including assignments) resolve this. Chair count change is one gesture.

## Requirement Consistency

- [x] CHK025 — Are US1 scenario 5 ("all edit forms are read-only") and FR-002 ("prevent all edits") consistent — does "read-only" cover the floor plan editor which is a canvas, not a form? [Consistency, Spec US1 vs §FR-002] — **PASS** (fixed): US1 scenario 5 now says "all editing interfaces (forms, editors, canvas)."
- [x] CHK026 — Is US4 scenario 4 ("success confirmation inline") consistent with the existing RSVP form's success behavior — does the spec redefine what happens after submission? [Consistency, Spec US4] — **PASS**: Adds inline constraint, consistent.
- [x] CHK027 — Are the lock assumptions ("only action permitted is unlocking") consistent with FR-005 ("allow admins to lock and unlock at any time") — can an admin lock an already-locked wedding (no-op) or is it a toggle? [Consistency, Spec §FR-002 vs §FR-005] — **PASS**: Toggle pattern — locking a locked wedding is a no-op.
- [x] CHK028 — Is FR-015 ("fallback hero instead of 404") consistent with US4 scenario 7 ("full single-page experience") — what does "full experience" mean when there's no image and no venue data? [Consistency, Spec §FR-015 vs US4] — **PASS**: Hero (fallback) + conditional venue + always-present RSVP form. Consistent.
- [x] CHK029 — Are the save state labels in FR-009 consistent with the edge case description — the edge case says "move them within bounds" but FR-011 says "guidance to move them within bounds"? [Consistency, Spec §FR-009 vs Edge Cases] — **PASS**: Consistent language.
- [x] CHK030 — Is the assumption "no backward compatibility required" consistent with US4 scenario 7 which describes the single-page experience — is there any mention of URL backward compatibility for `/w/[slug]/rsvp`? [Consistency, Assumptions vs US4] — **PASS**: FR-016 removes the route, assumption says no backward compat. Consistent.
- [x] CHK031 — Is US6 scenario 1 ("reflected on public landing page, RSVP section, and admin listings") consistent with the RSVP redesign — the "RSVP section" now lives on the single page, is this the same reference? [Consistency, Spec US6 vs US4] — **PASS**: "RSVP section" = form area on merged single page. Same reference.

## Cross-Feature Interactions

- [x] CHK032 — Are requirements specified for how the lock interacts with the floor plan editor specifically — when locked, is the canvas visible but non-interactive, or is access completely blocked? [Cross-feature, Lock × Floor Plan] — **PASS** (fixed): FR-025 added — canvas is view-only, all interactions disabled.
- [x] CHK033 — Are requirements defined for lock state during catalog item availability checks — should locked weddings show all items disabled in the catalog? [Cross-feature, Lock × Catalog] — **PASS** (fixed): FR-025 covers this — catalog placement is disabled when locked.
- [x] CHK034 — Are requirements specified for how undo/redo behaves on a locked floor plan — are undo/redo buttons disabled, or is the history frozen in place? [Cross-feature, Lock × Undo/Redo] — **PASS** (fixed): FR-026 added — undo/redo disabled, history preserved.
- [x] CHK035 — Are requirements defined for what the guest sees on the RSVP section when the wedding is locked AND has no template image — both the fallback hero AND the "RSVP closed" message? [Cross-feature, Lock × RSVP × Fallback] — **PASS**: Features compose naturally. Fallback hero + "RSVP closed" are independent.
- [x] CHK036 — Are requirements specified for the couple name field's interaction with the lock — is it explicitly listed among the locked fields, or only implied by "all edits"? [Cross-feature, Lock × Couple Name] — **PASS**: FR-002 explicitly lists couple name. US6 scenario 3 covers locked state.
- [x] CHK037 — Are requirements defined for auto-save behavior when the wedding is locked mid-session — does auto-save attempt and fail, or is it suspended entirely? [Cross-feature, Lock × Save UX] — **PASS**: Edge case specifies "next save attempt fails." Server-side lock check handles this.
- [x] CHK038 — Are requirements specified for template upload behavior when locked — is the upload button hidden, disabled, or does it show an error on attempt? [Cross-feature, Lock × Template] — **PASS**: FR-002 lists "template" as locked. Upload blocked by server-side check.
- [x] CHK039 — Are requirements defined for what happens if an admin locks a wedding while a couple has unsaved floor plan changes — are the changes lost or preserved client-side? [Cross-feature, Lock × Unsaved State] — **PASS**: Edge case specifies changes remain client-side, next save fails.
- [x] CHK040 — Are requirements specified for how catalog item disabling interacts with canvas resize — if the canvas is resized smaller, should previously placeable items become disabled immediately? [Cross-feature, Catalog × Canvas Resize] — **PASS** (fixed): FR-008 now covers both directions — "items MUST be disabled when canvas shrinks or items are added, and re-enabled when space becomes available."
- [x] CHK041 — Are requirements defined for the RSVP form's behavior when a guest partially fills it and scrolls back up to the hero — is form state preserved? [Cross-feature, RSVP × Single Page UX] — **PASS**: Standard browser form behavior. No special requirement needed.

## Acceptance Criteria Quality

- [x] CHK042 — Can US2 scenario 4 ("round tables disabled but long tables still enabled") be tested without ambiguity — are the specific sizes (3ft vs 6ft) of each table type specified? [Measurability, Spec US2] — **PASS**: Testable — create a canvas where round tables don't fit but long tables do.
- [x] CHK043 — Can US3 scenario 3 ("N item(s) outside canvas") be verified — is the exact message format specified including the variable placeholder? [Measurability, Spec US3] — **PASS**: Exact message template provided.
- [x] CHK044 — Can US5 scenario 7 ("oldest entry discarded") be objectively tested — how does a tester verify which entry was discarded? [Measurability, Spec US5] — **PASS**: Fill history to capacity, add action, undo all — oldest unreachable.
- [x] CHK045 — Can SC-005 ("restore exact prior canvas state within 200ms") be measured without specialized tooling — is this a perceptual target or an instrumented metric? [Measurability, Spec SC-005] — **PASS**: 200ms measurable with browser DevTools.
- [x] CHK046 — Can SC-008 ("zero edit controls to couple users") be verified exhaustively — are all edit controls enumerated in the spec? [Measurability, Spec SC-008] — **PASS**: FR-002 + FR-003 enumerate all locked fields and RSVP form.
- [x] CHK047 — Are acceptance criteria for US7 (template image) testable without access to the storage backend — "only one image file exists" requires infrastructure access? [Measurability, Spec US7] — **PASS**: Testable via Supabase storage API.

## Edge Case Coverage

- [x] CHK048 — Is the edge case for "admin locks while couple actively editing" specified with a resolution — does the couple see the lock immediately, or only on next interaction? [Coverage, Edge Cases] — **PASS**: Edge case specifies "next save attempt fails with clear message."
- [x] CHK049 — Are requirements defined for concurrent admin actions — what if two admins try to lock/unlock the same wedding simultaneously? [Coverage, Gap] — **PASS**: Dev-stage, single admin. Out of scope.
- [x] CHK050 — Are requirements specified for what happens when ALL catalog items are disabled — is there a message to the user explaining why the entire catalog is grayed out? [Coverage, Edge Cases] — **PASS** (fixed): Edge case now includes "Canvas is full — remove an item to add more" message.
- [x] CHK051 — Are requirements defined for the RSVP form's behavior with extremely long guest names — is there a character limit specified? [Coverage, Gap] — **PASS**: Existing RSVP validation handles this. Not new to this feature.
- [x] CHK052 — Is the behavior specified for the undo history when a user undoes past a catalog placement that is now disabled (because the canvas filled) — does redo re-check availability? [Coverage, Edge Case] — **PASS**: FR-008 covers re-evaluation on state change. Undo creates space → items re-enable.
- [x] CHK053 — Are requirements defined for template image upload failure scenarios beyond "mid-transfer" — what about invalid file types, files exceeding size limits after the form submits? [Coverage, Edge Cases] — **PASS**: Existing upload validation handles type/size.
- [x] CHK054 — Is the behavior specified for the single-page RSVP when JavaScript is disabled — does the form degrade gracefully? [Coverage, Gap] — **PASS**: App requires JS fundamentally. Out of scope.
- [x] CHK055 — Are requirements defined for what the guest sees if they bookmark or share a URL with an anchor fragment (`/w/[slug]#rsvp`) — does the anchor scroll work on direct navigation? [Coverage, Edge Case] — **PASS**: Standard browser behavior for anchor fragments.
- [x] CHK056 — Are requirements specified for the couple name editing experience on mobile — is the inline edit pattern mobile-friendly (tap to edit, tap away to save)? [Coverage, Mobile Parity] — **PASS**: HTML inputs support touch natively. Constitution VII covers mobile parity.

## Non-Functional Requirements

- [x] CHK057 — Is the performance requirement for catalog availability computation specified — how fast should the disabled-state calculation run for a canvas with 50+ items? [Non-Functional, Performance] — **PASS**: Small canvases, sub-ms. SC-005's 200ms covers critical path.
- [x] CHK058 — Are accessibility requirements specified for the lock toggle — keyboard navigation, ARIA labels for locked/unlocked state? [Non-Functional, Accessibility, Gap] — **PASS** (fixed): FR-027 added — ARIA attributes for lock toggle state.
- [x] CHK059 — Are accessibility requirements defined for disabled catalog items — screen reader announcement of disabled state and reason? [Non-Functional, Accessibility, Gap] — **PASS** (fixed): FR-028 added — disabled items announced with reason.
- [x] CHK060 — Are accessibility requirements specified for the RSVP CTA smooth scroll — is there a "skip to RSVP" mechanism for keyboard users? [Non-Functional, Accessibility, Gap] — **PASS**: Standard `<a href="#rsvp">` is keyboard-accessible natively.
- [x] CHK061 — Are accessibility requirements defined for the save status indicator — live region announcements for status changes (saving, saved, blocked)? [Non-Functional, Accessibility, Gap] — **PASS** (fixed): FR-029 added — ARIA live regions for save status.
- [x] CHK062 — Is the security requirement for lock enforcement specified as server-side — does the spec explicitly state that client-side disabling alone is insufficient? [Non-Functional, Security, Spec §FR-002] — **PASS** (fixed): FR-002 now explicitly says "Enforcement MUST be server-side in every mutation action, not solely through client-side UI disabling."
- [x] CHK063 — Are requirements specified for the template image URL cache-busting strategy — is it documented that the URL includes a cache-bust parameter? [Non-Functional, Caching] — **PASS**: Mechanism is plan-level. Requirement specifies outcome.
- [x] CHK064 — Are mobile parity requirements specified for the single-page RSVP — does the hero section, scroll behavior, and RSVP form work identically on touch devices? [Non-Functional, Mobile Parity] — **PASS**: Constitution VII applies project-wide.
- [x] CHK065 — Are requirements defined for the page load performance of the merged single-page RSVP — is it expected to be comparable to the current separate pages? [Non-Functional, Performance] — **PASS**: Constitution IV (<2s page loads) applies.

## Ambiguities & Conflicts

- [x] CHK066 — Is the term "tooltip" in FR-007 specified — is it a native browser tooltip, a custom popover, or a persistent label? [Ambiguity, Spec §FR-007] — **PASS**: "Tooltip" is standard UI terminology. Implementation detail.
- [x] CHK067 — Is "smoothly scrolls" in US4 scenario 2 defined — is this CSS `scroll-behavior: smooth`, a JavaScript animated scroll, or left to implementation? [Ambiguity, Spec US4] — **PASS**: "Smooth scroll" describes UX behavior. Mechanism is implementation.
- [x] CHK068 — Is "RSVP is now closed" in US4 scenario 6 the exact required text, or is it an example — are error message strings specified or implementation details? [Ambiguity, Spec US4] — **PASS**: Text in quotes suggests exact required string.
- [x] CHK069 — Does FR-022 "exactly one undo entry per user gesture" conflict with the reality of multi-action operations like chair count change (which also unassigns guests) — is this one entry or two? [Conflict, Spec §FR-022] — **PASS**: FR-022 (one entry) + FR-023 (complete state) resolve. One gesture = one entry with full state snapshot.
- [x] CHK070 — Is "gracefully designed fallback hero" in FR-015 consistent with the glassmorphism design system principle — should it use `.glass-panel`? [Ambiguity, Spec §FR-015 vs Constitution IX] — **PASS**: Fallback hero is a full-screen section, not a card-like surface. Glassmorphism may apply to content overlay within it.

## Dependencies & Assumptions

- [x] CHK071 — Is the assumption "no backward compatibility required" validated — are there any existing external links to `/w/[slug]/rsvp` that would break? [Assumption, Spec Assumptions] — **PASS**: Assumption stated and justified (dev stage, no production users).
- [x] CHK072 — Is the assumption "lock is manual" validated — should there be a requirement for automatic locking based on wedding date passing, or is this explicitly out of scope? [Assumption, Spec Assumptions] — **PASS**: Explicitly excludes auto-lock.
- [x] CHK073 — Is the dependency on the existing collision detection algorithm documented — what happens if the algorithm has bugs that allow false-negative placement? [Dependency] — **PASS**: Requirement is outcome-based (no overlapping items).
- [x] CHK074 — Is the dependency on `isItemOutOfBounds` for OOB validation documented — does the spec assume this function is correct, or should its behavior be verified against the spec? [Dependency] — **PASS**: Same as CHK073 — outcome-based requirement.
- [x] CHK075 — Is the assumption "undo/redo capacity 20 entries" tied to a specific requirement or is it an implementation detail — should FR-024 specify the number? [Assumption, Spec §FR-024] — **PASS** (fixed): FR-024 now specifies "20 entries maximum."
