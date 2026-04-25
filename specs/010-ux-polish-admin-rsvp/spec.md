# Feature Specification: Admin Lock, Floor Plan Polish & RSVP Redesign

**Feature Branch**: `010-ux-polish-admin-rsvp`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "Admin lock feature on couples, floor plan collision fix, editable couple name, undo/redo completeness, save UX with OOB prevention, RSVP single-page redesign, template image management fix"

## User Scenarios & Testing

### User Story 1 - Admin Locks Wedding to Freeze All Changes (Priority: P1)

An admin wants to prevent any modifications to a confirmed or completed wedding. They toggle a lock on the wedding, which immediately prevents the couple from editing their dashboard (template, venue, floor plan, couple name) and stops new RSVP submissions on the public page. The admin can unlock at any time to allow edits again.

**Why this priority**: Foundational control — without it, couples can modify confirmed or ended weddings, causing confusion and data integrity issues. All other features assume edits are legitimate.

**Independent Test**: Admin locks a wedding via the admin panel, then attempts to edit the wedding as the couple (blocked) and submit an RSVP as a guest (blocked). Admin unlocks, and both actions succeed.

**Acceptance Scenarios**:

1. **Given** an unlocked wedding, **When** admin clicks "Lock Wedding", **Then** the wedding is marked as locked and all edit forms on the couple dashboard become read-only
2. **Given** a locked wedding, **When** a guest navigates to the public RSVP page, **Then** they see a message indicating RSVP is closed instead of the form
3. **Given** a locked wedding, **When** admin clicks "Unlock Wedding", **Then** all editing capabilities are restored
4. **Given** a locked wedding, **When** a couple user accesses their dashboard, **Then** all forms and editors display a "locked" indicator and save actions are disabled
5. **Given** a locked wedding, **When** admin accesses the wedding detail page, **Then** all editing interfaces (forms, editors, canvas) are read-only and the only available action is "Unlock Wedding"

---

### User Story 2 - Catalog Items Disabled When No Valid Placement Exists (Priority: P1)

A user is building a floor plan and placing items. As the canvas fills up, items that cannot be placed without overlapping existing items are visually disabled in the catalog. This prevents frustration from items being placed on top of each other.

**Why this priority**: Prevents invalid state (overlapping items) which causes downstream issues with guest seat assignments and visual confusion. The current system silently places items at center with overlap when the spiral placement algorithm exhausts all positions.

**Independent Test**: Fill a small canvas with tables until no more can fit. Verify that the table catalog item appears disabled. Remove a table. Verify the item becomes clickable again.

**Acceptance Scenarios**:

1. **Given** a canvas with items placed near capacity, **When** no valid non-overlapping in-bounds position exists for a specific item type, **Then** that item appears grayed out and disabled in the catalog with a tooltip indicating insufficient space
2. **Given** a disabled catalog item, **When** the user removes or moves an existing item creating valid space, **Then** the previously disabled catalog item becomes active
3. **Given** an empty canvas, **When** the user views the catalog, **Then** all items are enabled and placeable
4. **Given** a canvas where round tables are disabled but long tables still fit, **When** the user views the catalog, **Then** round tables are disabled while long tables remain enabled

---

### User Story 3 - Intuitive Save Status with Out-of-Bounds Prevention (Priority: P1)

A user editing the floor plan sees a clear, unambiguous save status at all times. When items are outside the canvas bounds, saving is blocked with a clear explanation and guidance on how to fix it.

**Why this priority**: The current "Saved" / "Save Now" labels are confusing — even the product owner cannot recall what they mean. OOB items can be saved silently, creating invalid floor plans that guests and couples see. This directly impacts data quality and user trust.

**Independent Test**: Drag an item partially outside the canvas. Verify a clear warning appears and saving is blocked with an explanation. Move the item back in bounds. Verify saving becomes available and auto-save triggers.

**Acceptance Scenarios**:

1. **Given** a floor plan with unsaved changes and all items in bounds, **When** the user views the save area, **Then** they see a clear "Unsaved changes" indicator with a prominent save button
2. **Given** a floor plan being saved, **When** auto-save triggers, **Then** the status shows "Saving..." and transitions to "All changes saved" with a timestamp upon completion
3. **Given** a floor plan with one or more items outside canvas bounds, **When** auto-save or manual save attempts to run, **Then** saving is blocked and a visible message explains "N item(s) outside canvas — move them within bounds to save"
4. **Given** a floor plan with items out of bounds, **When** the out-of-bounds items are moved back in bounds, **Then** the save block is lifted and auto-save resumes after the debounce period
5. **Given** a floor plan with no changes since last save, **When** the user views the save area, **Then** they see "All changes saved" with a timestamp and no action button

---

### User Story 4 - Single-Page RSVP Experience with CTA Hierarchy (Priority: P1)

A guest receives a wedding invitation link and lands on a single scrollable page that tells the wedding's story: a full-screen hero image with the couple's names and date, venue details with map, and a clear call-to-action that smoothly scrolls to the RSVP form. The experience flows like a modern product landing page (Apple-style CTA hierarchy) rather than requiring navigation between separate pages.

**Why this priority**: Highest user-facing impact — every guest interacts with this page. A single-page flow eliminates navigation friction, creates an emotional journey (invitation → details → response), and follows proven CTA hierarchy patterns. This is the digital equivalent of a beautiful wedding invitation card.

**Independent Test**: Navigate to a wedding URL. See the hero section with couple name and date. Click the RSVP CTA and smoothly scroll to the form. Fill and submit an RSVP. All on one page with no page transitions.

**Acceptance Scenarios**:

1. **Given** a wedding with a template image, **When** a guest navigates to `/w/[slug]`, **Then** they see a full-screen hero section with the template image, couple name, wedding date with timezone, and a prominent RSVP call-to-action button
2. **Given** the wedding landing page, **When** the guest clicks the RSVP CTA button, **Then** the page smoothly scrolls to the RSVP form section below the hero
3. **Given** a wedding with venue details, **When** the guest scrolls past the hero, **Then** they see venue information (name, address, welcome message, map, navigation buttons) before reaching the RSVP form
4. **Given** the RSVP form section on the single page, **When** the guest submits a valid RSVP, **Then** they see a success confirmation inline without leaving the page
5. **Given** a wedding without a template image, **When** a guest navigates to the URL, **Then** they see a gracefully designed fallback hero section (gradient or pattern background with couple name and date) instead of a 404 error
6. **Given** a locked wedding, **When** a guest scrolls to the RSVP section, **Then** they see "RSVP is now closed" instead of the form
7. **Given** the separate RSVP route no longer exists, **When** a guest navigates to `/w/[slug]`, **Then** the full single-page experience is served with all sections including the RSVP form

---

### User Story 5 - Comprehensive Undo/Redo for All Canvas Actions (Priority: P2)

A user performing any action in the floor plan editor can undo and redo reliably. Every action — placing from catalog, deleting, dragging, rotating, resizing, changing canvas dimensions, changing chair counts, assigning/unassigning guests, and editing labels — produces exactly one undo entry and restores the complete state correctly.

**Why this priority**: Undo/redo is a core editor expectation. The system currently tracks most actions, but the user reports inconsistent behavior. An audit and fix of any gaps ensures trust in the editor.

**Independent Test**: Place an item, drag it, rotate it, change chair count, assign a guest, then undo each action one by one. Verify each step restores the exact previous state. Redo all steps to return to the final state.

**Acceptance Scenarios**:

1. **Given** a canvas with 3 items, **When** the user places a 4th item from the catalog and presses undo, **Then** the 4th item is removed and the canvas returns to the 3-item state
2. **Given** a placed item, **When** the user drags it to a new position and presses undo, **Then** the item returns to its exact pre-drag position including rotation and dimensions
3. **Given** a placed non-table item, **When** the user resizes and rotates it and presses undo, **Then** the item returns to its exact pre-transform state
4. **Given** a table with assigned guests, **When** the user changes the chair count (removing chairs with guests) and presses undo, **Then** the chair count, all chairs, and all guest assignments are restored exactly
5. **Given** a canvas with unassigned guests, **When** the user assigns a guest to a chair and presses undo, **Then** the guest returns to the unassigned list and the chair becomes empty
6. **Given** a series of 5 actions, **When** the user undoes 3 times and redoes 2 times, **Then** the canvas state matches the state after action 4
7. **Given** the undo history at maximum capacity, **When** the user performs a new action, **Then** the oldest entry is discarded and the new action is tracked without unbounded memory growth

---

### User Story 6 - Editable Couple Name (Priority: P3)

An admin or couple wants to update the couple/wedding name displayed to guests (e.g., "Sarah & James" becomes "Sarah & James Smith"). The couple name field is editable directly on the wedding management page, positioned above the wedding date and time picker.

**Why this priority**: Convenience enhancement — the couple name is set at account creation and currently cannot be changed, but names, presentation preferences, and formal titles evolve during wedding planning.

**Independent Test**: Navigate to the wedding management page. Edit the couple name above the date picker. Save. Verify the updated name appears on the public landing page, RSVP section, and admin dashboard.

**Acceptance Scenarios**:

1. **Given** a wedding with couple name "Alex & Jordan", **When** the admin or couple edits the name to "Alex & Jordan Lee" and saves, **Then** the name is updated and reflected on the public landing page, RSVP section, and admin listings
2. **Given** the wedding management page, **When** the user views the area above the date/time picker, **Then** they see the current couple name in an editable text input
3. **Given** a locked wedding, **When** the couple user views their dashboard, **Then** the couple name field is read-only with a lock indicator

---

### User Story 7 - Template Image Always Shows Latest Upload (Priority: P3)

When a couple or admin uploads a new template image, the preview and all display locations immediately reflect the new image. Only one image is stored per wedding at any time.

**Why this priority**: Bug fix — stale images in the preview confuse users about which image is active. The underlying storage uses an overwrite pattern, so the issue is likely a caching or URL invalidation problem.

**Independent Test**: Upload template image A. Verify preview shows A. Upload template image B. Verify preview and landing page immediately show B without manual refresh.

**Acceptance Scenarios**:

1. **Given** an existing template image, **When** the user uploads a new image, **Then** the preview component immediately shows the new image without requiring a page refresh
2. **Given** a wedding with a template image, **When** checking storage, **Then** only one image file exists for that wedding
3. **Given** a newly uploaded image, **When** navigating to the public landing page, **Then** the hero section shows the latest uploaded image

---

### Edge Cases

- What happens when admin locks a wedding while the couple is actively editing the floor plan? The couple's next save attempt should fail with a clear "This wedding has been locked" message. Same applies if admin locks while another admin is editing — the lock takes effect and all edits are blocked.
- What happens when the canvas is exactly at capacity? All catalog items should be disabled, including non-table items like Stage and Pillar. The catalog should display a message such as "Canvas is full — remove an item to add more" when no items can be placed.
- What happens when a guest has already submitted an RSVP and the wedding is then locked? The existing RSVP data is preserved in full; only new submissions are blocked.
- What happens when undo is pressed during an active drag gesture? The drag should complete before undo processes to avoid state corruption.
- What happens when the couple name is cleared to empty? Validation must prevent saving an empty couple name.
- What happens with the old `/w/[slug]/rsvp` route? It is removed entirely — the RSVP form lives on the single page.
- What happens when multiple catalog items are disabled and the user resizes the canvas larger? All items that now fit should re-enable in real-time.
- What happens when the canvas is resized smaller? Items near the new edges may go out of bounds and catalog items that no longer fit should become disabled immediately.
- What happens when a template image upload fails mid-transfer? The previous image remains active and no partial/orphan file is left in storage.

## Clarifications

### Session 2026-04-25

- Q: When a wedding is locked, should the admin still be able to edit it? → A: No one can edit while locked — admin must unlock, make changes, then re-lock.

## Requirements

### Functional Requirements

**Admin Lock**

- **FR-001**: System MUST provide a lock/unlock toggle on each wedding visible to admins on the wedding detail page
- **FR-002**: System MUST prevent all edits by both the couple AND admin (template, venue, floor plan, couple name, date) when the wedding is locked — the only action permitted on a locked wedding is unlocking it. Enforcement MUST be server-side in every mutation action, not solely through client-side UI disabling.
- **FR-003**: System MUST prevent new RSVP submissions on the public page when the wedding is locked, displaying a "RSVP is closed" message
- **FR-004**: System MUST preserve all existing data (RSVPs, floor plan, venue, assignments) when a wedding is locked — locking is a state change only, never data deletion
- **FR-005**: System MUST allow admins to lock and unlock any wedding at any time regardless of its current state

**Catalog Collision Blocking**

- **FR-006**: System MUST check whether a valid non-overlapping, in-bounds position exists for each catalog item type before allowing placement
- **FR-007**: System MUST visually disable catalog items that have no valid placement position, with a tooltip explaining insufficient space
- **FR-008**: System MUST re-evaluate catalog item availability in real-time on every canvas state change — items MUST be disabled when canvas shrinks or items are added, and re-enabled when space becomes available (after item deletion, move, or canvas resize)

**Save UX & OOB Prevention**

- **FR-009**: System MUST display one of these clear save states at all times: "Unsaved changes" (with save button), "Saving...", "All changes saved" (with timestamp), "N item(s) outside canvas — move within bounds to save" (blocked, no save button), or "Save failed — try again"
- **FR-010**: System MUST block both auto-save and manual save when any floor plan item is outside the canvas bounds
- **FR-011**: System MUST display the count of out-of-bounds items when save is blocked, with guidance to move them within bounds
- **FR-012**: System MUST resume auto-save automatically once all out-of-bounds items are corrected and the debounce period elapses

**RSVP Single-Page Experience**

- **FR-013**: System MUST present the wedding invitation as a single scrollable page combining hero image, venue details, and RSVP form
- **FR-014**: System MUST provide a prominent CTA button in the hero section that smooth-scrolls to the RSVP form section
- **FR-015**: System MUST display a designed fallback hero section (gradient or pattern background with couple name and date) for weddings without a template image, instead of returning a 404
- **FR-016**: The separate `/w/[slug]/rsvp` route is removed — RSVP form lives directly on the single page

**Editable Couple Name**

- **FR-017**: System MUST display the couple name as an editable text input on the wedding management page, positioned above the wedding date/time picker
- **FR-018**: System MUST reject empty couple name values and enforce a maximum length of 100 characters, with a validation error for both

**Template Image**

- **FR-019**: System MUST ensure the template preview shows the most recently uploaded image immediately after upload without requiring a page refresh
- **FR-020**: System MUST ensure only one template image file exists per wedding in storage at any time
- **FR-020a**: The template preview button MUST be labeled "Adjust Crop" (not "Preview") to accurately describe its focal-point crop adjustment function

**Undo/Redo Completeness**

- **FR-021**: System MUST track all canvas actions in undo history: item placement from catalog, item deletion, drag position change, rotation, resize, canvas dimension changes, chair count changes, guest seat assignments, guest unassignments, and item label edits
- **FR-022**: System MUST produce exactly one undo entry per user gesture — a drag produces one entry, a rotation produces one entry, a resize produces one entry, not continuous entries during the gesture
- **FR-023**: System MUST restore the complete canvas state (items, dimensions, guest assignment map, unassigned guest list) when undoing or redoing any action
- **FR-024**: System MUST cap undo history at 20 entries maximum to prevent unbounded memory growth — the oldest entry is discarded when a new action exceeds the cap

**Lock × Floor Plan Editor Interaction**

- **FR-025**: When a wedding is locked, the floor plan editor MUST disable all interactive capabilities (drag, rotate, resize, catalog placement, chair count changes, guest assignments, canvas dimension edits) — the canvas is view-only
- **FR-026**: When a wedding is locked, undo and redo controls MUST be disabled — existing undo history is preserved but not navigable until the wedding is unlocked

**Accessibility**

- **FR-027**: The lock toggle MUST include ARIA attributes conveying its current state (locked/unlocked) for screen reader users
- **FR-028**: Disabled catalog items MUST be announced as disabled with the reason ("no space available") for screen reader users
- **FR-029**: Save status changes MUST be announced via ARIA live regions for screen reader users

### Key Entities

- **Wedding**: Core entity, extended with a locked/unlocked status. The lock state controls editability across the couple dashboard, admin panel, and public RSVP page.
- **Floor Plan Canvas**: The interactive editing surface. Its complete state (items, dimensions, assignments) must be fully captured by undo/redo and validated before save.
- **Catalog Item**: A placeable floor plan element. Its availability depends on whether a valid placement position exists given the current canvas state.
- **Template Image**: The hero image displayed to guests on the landing page. One per wedding, always reflecting the latest upload.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admins can lock or unlock any wedding in under 5 seconds via a single toggle action
- **SC-002**: Zero overlapping items are placed from the catalog — items without valid positions are disabled before the user can click them
- **SC-003**: 100% of save attempts with out-of-bounds items are blocked with a clear, actionable message
- **SC-004**: Guests can view the full wedding invitation and submit an RSVP on a single page without any page-to-page navigation
- **SC-005**: All undo/redo operations restore the exact prior canvas state within 200ms of user action
- **SC-006**: Template preview reflects the latest uploaded image within 2 seconds of upload completing
- **SC-007**: Couple name changes are visible on the public landing page after one save and page refresh
- **SC-008**: Locked weddings show zero edit controls to couple users and zero RSVP form to guests

## Assumptions

- **No backward compatibility required**: The system is still in development with no production users. Breaking changes (removing the separate RSVP route, schema changes, restructuring pages) are acceptable without migration paths or legacy support.
- **Admin lock scope**: Locking prevents all modifications by everyone — couple dashboard edits, admin wedding edits, and public RSVP submissions. The only action permitted on a locked wedding is unlocking it. Admin must unlock to make any changes, then re-lock if needed. Existing RSVP data is preserved. Any admin can lock or unlock any wedding.
- **Lock is manual**: Locking is an explicit admin action, not automatic based on wedding date. Admins may lock when the plan is confirmed or after the wedding has ended.
- **RSVP single-page design direction**: The recommended approach is a single scrollable page with CTA hierarchy — hero section (full-screen image, couple name, date, venue summary) → smooth scroll or CTA → venue details section → RSVP form section. This follows the Apple-style landing page pattern the user referenced. The separate `/w/[slug]/rsvp` route is removed entirely — no backward compatibility needed.
- **Wedding without template image**: The single-page redesign shows a styled fallback hero (gradient background with couple name and date) instead of the current 404. This allows RSVP submissions even without an uploaded image.
- **Template preview purpose**: The current template preview is a focal-point/crop adjuster that controls which portion of the uploaded image is visible in the hero section's frame via CSS object-position. This is a genuinely useful feature that gives couples visual control over their hero image. Per FR-020a, it is renamed to "Adjust Crop."
- **Undo/redo capacity**: History is capped at 20 entries, balancing memory usage with practical editing depth.
- **Catalog placement algorithm**: The existing spiral placement algorithm is retained; the enhancement disables items when the algorithm cannot find any valid position, rather than placing at center with overlap.
- **OOB save block is a hard block**: When items are out of bounds, no save occurs — neither auto-save nor manual save. The user must move items within bounds before any data is persisted.
