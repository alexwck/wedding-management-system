# Feature Specification: UX Polish & Bugfixes

**Feature Branch**: `009-ux-polish-bugfixes`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "Template image crop repositioning, floor plan guest panel with assigned guests and stats, undo bug fix, password confirmation, item resize"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Template Image Crop & Reposition (Priority: P1)

As a couple or admin uploading a wedding template image, I want to control which portion of my photo appears in the frame on the landing page, so that the most important part of the image is always visible regardless of the original photo dimensions.

**Why this priority**: The template image is the centerpiece of the wedding landing page. If it displays poorly (cropped awkwardly or with blank space), it degrades the first impression for every guest. This affects all weddings.

**Independent Test**: Upload a portrait-oriented photo (e.g., 800x1200) and a landscape photo (e.g., 1600x900). In both cases, drag the image within the preview frame to choose the visible area. The preview frame matches the exact landing page container dimensions. Verify the chosen crop is reflected on the public landing page.

**Acceptance Scenarios**:

1. **Given** a template image that is taller than the display frame, **When** the user opens the preview, **Then** the image is shown fitted within the frame and the user can drag vertically (mouse drag or touch drag) to choose which portion is visible
2. **Given** a template image that is wider than the display frame, **When** the user opens the preview, **Then** the image is shown fitted within the frame and the user can drag horizontally (mouse drag or touch drag) to choose which portion is visible
3. **Given** an image that exactly matches the display frame aspect ratio, **When** the user opens the preview, **Then** no dragging is needed and the image fills the frame completely
4. **Given** a user has dragged to a preferred crop position, **When** they save, **Then** the landing page renders the image at that exact crop position
5. **Given** a user uploads a new template image, **When** the previous image had a saved crop, **Then** the crop position resets and the user must choose a new position
6. **Given** the user is dragging the image within the crop preview, **When** the browser window is resized, **Then** the crop position is preserved relative to the image and the preview frame updates to match the new landing page container dimensions
7. **Given** the same wedding is open in multiple browser tabs, **When** the user saves a crop position in one tab, **Then** the other tab does not conflict — the last save wins (no merge logic required)

---

### User Story 2 - Floor Plan Guest Panel with Assigned Guests (Priority: P1)

As a couple or admin managing floor plan seating, I want to see both unassigned and assigned guests in the left panel, organized into collapsible sections, so that I can quickly understand the seating status and reassign guests as needed.

**Why this priority**: The guest panel is the primary interface for seat assignments. Without visibility into assigned guests, users cannot effectively manage seating changes or review their arrangement.

**Independent Test**: Open the floor plan editor, assign a guest to a seat, and verify the guest moves from the "Unassigned" section to the "Assigned" section. Collapse/expand both sections. Verify the unassigned section is expanded by default and the assigned section is collapsed by default.

**Acceptance Scenarios**:

1. **Given** the floor plan editor loads with a mix of assigned and unassigned guests, **When** the page renders, **Then** the unassigned guests section is expanded and the assigned guests section is collapsed
2. **Given** both sections are visible, **When** the user clicks a section header, **Then** that section collapses or expands accordingly (keyboard-accessible via Enter/Space)
3. **Given** a guest is in the unassigned list, **When** the user assigns them to a seat, **Then** the guest moves to the assigned section showing their table number (e.g., "Jane Doe — Table 3") and the counts update
4. **Given** a guest is in the assigned list, **When** the user unassigns them, **Then** the guest moves back to the unassigned section and the counts update
5. **Given** the guest panel is loading initial data, **When** the fetch is in progress, **Then** a loading indicator is shown in each section until data arrives
6. **Given** a section contains more guests than fit in the visible panel area, **When** the section is expanded, **Then** the section scrolls independently without affecting the other section or the stats component
7. **Given** zero RSVPs have been received, **When** the guest panel renders, **Then** both sections show "No guests yet" (unassigned) and an empty state (assigned)

---

### User Story 3 - Floor Plan Canvas Statistics (Priority: P2)

As a couple or admin, I want to see a summary of tables, chairs, and seat assignments in the floor plan panel, so that I can tell at a glance whether the venue layout accommodates all guests.

**Why this priority**: Statistics provide essential planning context but depend on the guest panel (P1) being in place first.

**Independent Test**: Place round tables, long tables, and chairs on the canvas. Assign some guests. Verify the stats component shows correct counts for each category and highlights unoccupied chairs.

**Acceptance Scenarios**:

1. **Given** the canvas contains 2 round tables (5ft, 7ft) and 1 long table (6ft), **When** the stats component renders, **Then** it shows "2 Round Tables, 1 Long Table" and the total chair count based on each table's chair configuration
2. **Given** 10 chairs across all tables and 7 guests assigned, **When** the stats component renders, **Then** it shows "7 assigned, 3 empty" (where "empty" means chairs without a guest assigned, regardless of whether all guests are seated)
3. **Given** all guests are assigned and 3 chairs remain empty (3 surplus chairs beyond guest count), **When** the stats component renders, **Then** the empty chair count reflects chairs that still have no guest
4. **Given** an empty canvas, **When** the stats component renders, **Then** it shows zero counts for all categories

---

### User Story 4 - Undo Bug Fix & Assignment Tracking (Priority: P1)

As a floor plan user, when I undo my last action, I expect exactly one action to be reversed — including guest seat assignments, item dimensions, and venue changes — so that I can reliably control changes to my layout and seating arrangements.

**Why this priority**: A core interaction (undo) is broken. Users cannot trust the editor's history system, which undermines confidence in making changes. Extended scope ensures undo covers ALL canvas state, not just item positions.

**Independent Test**: Place two items on the canvas, assign a guest to a chair. Click undo once. Verify exactly the guest assignment is reversed (not the item placement). Click undo again. Verify one item is removed.

**Acceptance Scenarios**:

1. **Given** the user has added 3 items sequentially, **When** the user clicks undo once, **Then** exactly the last item is removed and 2 items remain
2. **Given** the user has moved an item, **When** the user clicks undo, **Then** the item returns to its previous position (no additional state changes)
3. **Given** the undo button is clicked multiple times in quick succession, **When** each click is processed, **Then** only one state change occurs per click — the undo action is synchronous and blocks duplicate invocations
4. **Given** a guest is assigned to a chair, **When** the user clicks undo, **Then** the guest returns to the unassigned list and the chair becomes empty
5. **Given** a guest is unassigned from a chair, **When** the user clicks undo, **Then** the guest is re-assigned to the same chair
6. **Given** venue dimensions are changed (e.g., width from 50 to 60), **When** the user clicks undo, **Then** the width reverts to 50
7. **Given** the user types a new value into a venue dimension input field (multiple keystrokes), **When** the typing is complete and the user clicks undo, **Then** only one undo entry exists for the entire typing session (not one per keystroke)
8. **Given** the user types a new value into a chair count input field (multiple keystrokes), **When** the typing is complete and the user clicks undo, **Then** only one undo entry exists for the entire typing session

---

### User Story 5 - Password Confirmation for Couple Account Creation (Priority: P2)

As an admin creating a couple account, I want to type the password twice to confirm it, so that I do not accidentally create an account with a mistyped password.

**Why this priority**: Prevents support burden from mistyped passwords but does not block existing functionality.

**Independent Test**: Attempt to create a couple account with mismatched passwords. Verify the form rejects the submission with a clear error. Submit with matching passwords and verify the account is created.

**Acceptance Scenarios**:

1. **Given** the admin couple creation form, **When** the admin types different passwords in the password and confirm fields, **Then** the form displays the error "Passwords do not match" below the confirm field
2. **Given** the admin couple creation form, **When** the admin types identical passwords in both fields, **Then** the form submits successfully
3. **Given** the confirm password field is empty, **When** the admin attempts to submit, **Then** the form displays a required field error

---

### User Story 6 - Configurable Item Dimensions / Resize (Priority: P3)

As a couple or admin using the floor plan editor, I want to resize non-table items (Stage, Pillar, Walkway, Misc) on the canvas, so that I can match the real-world dimensions of my venue's fixtures. Round tables and long tables must remain at their predefined dimensions.

**Why this priority**: Enhances flexibility for venue-specific fixtures but is not blocking — round and long table presets already cover standard sizes.

**Independent Test**: Select a Stage on the canvas, resize it from 12x8ft to 16x10ft using a handle or input, and verify the shape updates. Verify that selecting a round table shows no resize controls.

**Acceptance Scenarios**:

1. **Given** a Stage item is selected on the canvas, **When** the user drags a resize handle, **Then** the stage dimensions change accordingly
2. **Given** a round table is selected, **When** the user views the top bar or selection controls, **Then** no resize handles or dimension inputs are shown — only the fixed size is displayed
3. **Given** a long table is selected, **When** the user views the top bar or selection controls, **Then** no resize handles or dimension inputs are shown — only the fixed size is displayed
4. **Given** a resized non-table item, **When** the user undoes the resize, **Then** the item returns to its previous dimensions
5. **Given** any item being resized, **When** the new dimensions would cause a collision with another item, **Then** the collision indicator appears
6. **Given** an item being resized near the canvas boundary, **When** the new dimensions would extend beyond the venue limits, **Then** the resize snaps to the venue boundary and the out-of-bounds indicator appears
7. **Given** a table with assigned guest chairs, **When** the table is deleted, **Then** the assigned guests are returned to the unassigned section
8. **Given** a non-table item (Stage, Pillar, Walkway, Misc) is rotated, **When** the rotation completes, **Then** the item's label remains centered on the item
9. **Given** a non-table item is resized, **When** the resize completes, **Then** the item's label remains centered on the item
10. **Given** any item is rotated, **When** the rotation completes, **Then** exactly one undo entry is created (not separate entries for rotation and resize)

**Per-Item Resize Limits**:

| Item Type | Min (WxH) | Max (WxH) | Default (WxH) |
|-----------|-----------|-----------|----------------|
| Stage     | 4ft x 3ft | 20ft x 20ft | 12ft x 8ft |
| Pillar    | 1ft x 1ft | 6ft x 6ft   | 2ft x 2ft  |
| Walkway   | 2ft x 1ft | 20ft x 10ft | 6ft x 3ft  |
| Misc      | 1ft x 1ft | 15ft x 15ft | 4ft x 4ft  |

---

### Edge Cases

- Very small template images (e.g., 100x100) fill the frame entirely — no dragging/cropping needed since the image is smaller than the display area
- When all guests are assigned and the unassigned section becomes empty, it displays a "All guests are seated!" message
- Undo and redo buttons stay disabled when there is nothing to undo or redo (initial state only / end of history)
- Password confirmation validation triggers correctly even when fields are filled via browser autofill
- Resizable items enforce per-type minimum and maximum dimension limits (see table in User Story 6) — dragging snaps to the boundary
- Tables (round and long) cannot be resized — selecting a table shows no resize handles
- If the template image is deleted from storage but a crop offset exists, the landing page shows the default state (no image) and the crop offset is ignored gracefully
- If the crop position save fails (network error), the preview shows an error toast and the user can retry without losing their current crop position
- Undoing a guest assignment must handle server-side failures gracefully — if the server unassign/assign call fails, the full assignment state is re-fetched to restore consistency
- When undoing changes that affect both items and guest assignments (e.g., deleting a table that had assigned chairs), both item state and assignment state are restored atomically in a single undo step
- Rotating an item via the Konva Transformer and then undoing must restore both the item's rotation and the positions of any child chairs that were repositioned by the rotation
- Venue dimension and chair count input fields push a single undo entry when the user finishes editing (on blur), not one entry per keystroke
- Restoring guest assignments after undo/redo parallelizes server calls (unassignes first, then assigns) for performance

## Requirements *(mandatory)*

### Functional Requirements

**Template Image Crop & Reposition**

- **FR-001**: System MUST allow users to drag a template image within the preview frame to choose the visible portion (supporting both mouse drag and touch drag for mobile parity)
- **FR-002**: System MUST replace the current click-to-set focal point feature with the drag-to-crop interaction
- **FR-003**: System MUST persist the crop position as percentage-based offset coordinates (0–100 for horizontal and vertical), compatible with CSS `object-position`
- **FR-004**: System MUST render the saved crop position on the public wedding landing page
- **FR-005**: System MUST reset the crop position when a new template image is uploaded
- **FR-006**: System MUST accept any image dimensions (portrait, landscape, square) without enforcing specific aspect ratios
- **FR-007**: System MUST continue enforcing the existing 5MB file size limit and PNG/JPEG format constraint

**Floor Plan Guest Panel**

- **FR-008**: System MUST display assigned guests in a separate collapsible section within the left panel
- **FR-009**: System MUST display unassigned guests in a collapsible section (replacing the current non-collapsible panel)
- **FR-010**: System MUST expand the unassigned guests section by default on page load
- **FR-011**: System MUST collapse the assigned guests section by default on page load
- **FR-012**: System MUST update guest lists within 500ms when assignments change (guest moves between sections)
- **FR-012a**: System MUST show a loading indicator in each guest section while initial data is being fetched
- **FR-012b**: System MUST allow each guest section to scroll independently when guest count exceeds the visible panel area
- **FR-012c**: Table numbers in the assigned guests list are derived from the item's sequential position among table-type items on the canvas (e.g., the first table placed is Table 1, the second is Table 2)

**Floor Plan Canvas Statistics**

- **FR-013**: System MUST display a summary component pinned at the top of the left panel (always visible, not collapsible) showing total round tables and total long tables
- **FR-014**: System MUST display total chair count across all tables
- **FR-015**: System MUST display number of chairs with assigned guests and number of chairs without an assigned guest ("empty")
- **FR-016**: System MUST display the count of empty chairs that remain after all guests have been assigned (same value as FR-015's "empty" count — FR-016 exists to emphasize this metric when all guests are seated)
- **FR-017**: System MUST update statistics within 500ms as items are added, removed, or guests are assigned/unassigned

**Undo Bug Fix & Assignment Tracking**

- **FR-018**: System MUST revert exactly one state change per undo action
- **FR-019**: System MUST correctly track initial state so that undo from a single action returns to the pre-action state
- **FR-019a**: System MUST include guest seat assignments (assignmentMap and unassignedGuests) in every undo/redo snapshot alongside items, width, and height
- **FR-019b**: System MUST restore guest seat assignments when undoing or redoing, including unassigning and reassigning guests on the server
- **FR-019c**: System MUST deduplicate undo entries for number input fields (venue dimensions, chair count) — one undo entry per editing session (focus → blur), not one per keystroke

**Password Confirmation**

- **FR-020**: System MUST add a confirm password field to the admin couple account creation form
- **FR-021**: System MUST validate that password and confirm password match before form submission
- **FR-022**: System MUST display "Passwords do not match" below the confirm password field when passwords do not match

**Item Dimensions / Resize**

- **FR-023**: System MUST allow users to resize non-table items — specifically Stage, Pillar, Walkway, and Misc — on the canvas via drag handles or dimension inputs (this is the exhaustive list of resizable types; any future item types default to non-resizable unless explicitly added)
- **FR-024**: System MUST NOT show resize controls for round tables and long tables — these items use fixed predefined dimensions only
- **FR-025**: System MUST enforce minimum and maximum dimension limits for resizable items
- **FR-026**: System MUST include resize actions in the undo/redo history

**Rendering & Performance**

- **FR-027**: All floor plan items MUST use center-based Konva positioning with offsetX/Y so that rotation pivots around the visual center (not the top-left corner)
- **FR-028**: System MUST use a single merged transform handler (not separate rotation and resize handlers) to prevent duplicate undo entries when rotating and resizing
- **FR-029**: System MUST use stable callback references for canvas item event handlers to prevent unnecessary re-renders of memoized CanvasItem components when unrelated state changes (e.g., guest assignments)
- **FR-030**: When chair count decreases, System MUST only unassign guests from chairs that are being removed (not from all chairs on the table)

### Key Entities

- **Crop Position**: Stores the horizontal and vertical offset of the template image within the display frame. Represents the user's chosen visible portion of the image.
- **Guest Panel Section**: A collapsible container in the floor plan left panel that groups guests by assignment status (assigned or unassigned).
- **Canvas Statistics**: A computed summary of floor plan items — table counts by type, chair counts, assignment counts — derived from the current canvas state.
- **Item Dimensions**: The width and height of a floor plan item, mutable via resize interaction, with type-specific min/max bounds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can position any uploaded template image within 3 seconds of opening the preview (time-to-interactive: the drag handle is responsive and the image moves with the pointer/touch within 100ms)
- **SC-002**: The landing page renders the crop position using the same percentage-based `object-position` value as the preview — verified by comparing the computed CSS `object-position` on both pages
- **SC-003**: Users can see both assigned and unassigned guest counts and canvas statistics at a glance without scrolling
- **SC-004**: Undo reverts exactly one action in 100% of test cases (no double-undo behavior)
- **SC-005**: Admin cannot submit the couple creation form with mismatched passwords — validation catches 100% of mismatches
- **SC-006**: Users can resize a non-table item (Stage, Pillar, Walkway, Misc) within 1 second and see the updated dimensions on canvas
- **SC-007**: All statistics update within 1 second of any canvas change (item add, remove, resize, guest assign/unassign)

## Clarifications

### Session 2026-04-25

- Q: Should each assigned guest entry display which table/seat they are assigned to? → A: Show guest name and table number only (e.g., "Jane Doe — Table 3")
- Q: Should the canvas statistics component be always visible or collapsible? → A: Always visible, pinned at top of panel above guest sections
- Q: What aspect ratio should the template crop preview frame use? → A: Free-form — preview matches the exact landing page container dimensions, no fixed ratio

## Assumptions

- The existing focal point database columns (`template_focal_x`, `template_focal_y`) can be repurposed for crop offset storage — the storage mechanism is the same (two numeric coordinates stored as percentages 0–100)
- Portrait-oriented images (taller than wide) are the most common wedding template uploads and will be the primary design target
- The crop preview frame uses the same dimensions as the landing page container (free-form, no fixed aspect ratio) — what the user sees in preview matches what guests see on the landing page
- The floor plan left panel (224px / w-56) has sufficient space to accommodate both guest sections and a statistics component without requiring horizontal scrolling; on mobile viewports the panel adapts to full-width overlay
- The undo bug is caused by a duplicate `pushState` call in `floor-plan-canvas.tsx` (the caller), specifically `pushHistory()` being called before `addItem()` — the fix is in the canvas event handler, not in the `use-undo-redo` hook itself
- The undo system tracks the full canvas state: items, venue dimensions, guest assignment map, and unassigned guests list — all captured atomically in each snapshot
- Password confirmation is a client-side-only validation enhancement — no server-side changes needed beyond what the existing Zod schema provides
- Item resize applies only to non-table items (Stage, Pillar, Walkway, Misc) — round tables and long tables are fixed at their predefined dimensions
- The undo history limit of 20 snapshots is adequate for resize operations — each resize is a single state push on drag-end, not per-pixel during drag
- Stats computation for canvases with up to 100 items must complete within the 500ms update requirement (simple array iteration, no heavy computation)
- Collapsible guest sections follow the same visual pattern as the existing item catalog collapse in the right sidebar (glass-panel styling, chevron toggle icon)
