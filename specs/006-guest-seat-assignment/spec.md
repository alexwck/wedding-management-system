# Feature Specification: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment`
**Created**: 2026-04-22
**Status**: Draft
**Input**: User description: "Add guest-to-seat assignment to the floor plan editor. Couples and admins can click any chair on the floor plan canvas to assign a specific RSVP guest to that seat. Chairs with assigned guests show the guest's name and a visual indicator (filled/highlighted). Clicking an occupied chair opens a dialog to reassign or unassign."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign a Guest to an Empty Chair (Priority: P1)

As a couple planning my wedding, I want to click on an empty chair on my floor plan and assign an attending guest to it, so that I can build a seating arrangement for my reception.

**Why this priority**: This is the core value proposition — without the ability to assign guests to seats, no other seating features matter.

**Independent Test**: Can be fully tested by placing chairs on the floor plan, having attending RSVPs, clicking a chair, selecting a guest from the dialog, and confirming the chair visually shows the guest's name. Delivers standalone value as a basic seating chart tool.

**Acceptance Scenarios**:

1. **Given** a floor plan with chairs and at least one attending RSVP guest who is unassigned, **When** the user clicks an empty chair, **Then** a dialog appears showing a list of unassigned attending guests
2. **Given** the assignment dialog is open with a list of unassigned guests, **When** the user selects a guest and confirms, **Then** the chair displays the guest's name with a teal/green fill color and a guest name label (truncated to 15 characters), and the guest is removed from the unassigned list
3. **Given** a floor plan with no attending RSVPs, **When** the user clicks an empty chair, **Then** the dialog shows an empty state message indicating no guests are available to assign
4. **Given** all attending guests are already assigned to seats, **When** the user clicks an empty chair, **Then** the dialog shows an empty state indicating all guests are seated

---

### User Story 2 - Reassign or Unassign a Seated Guest (Priority: P1)

As a couple, I want to click on an occupied chair to either reassign the guest to a different seat or remove the assignment entirely, so that I can adjust my seating plan as RSVPs change.

**Why this priority**: Seating plans are iterative — couples must be able to revise assignments. Without reassignment, the feature is write-only and impractical.

**Independent Test**: Can be tested by first assigning a guest (US1), then clicking the occupied chair, choosing to unassign or pick a different guest, and verifying the chair updates accordingly.

**Acceptance Scenarios**:

1. **Given** a chair with an assigned guest, **When** the user clicks that chair, **Then** a dialog opens showing the currently assigned guest's name with options to unassign or change the assignment
2. **Given** the reassignment dialog for an occupied chair, **When** the user clicks "Unassign", **Then** the chair returns to its default purple fill color and empty state, and the guest reappears in the unassigned guests list
3. **Given** the reassignment dialog for an occupied chair, **When** the user selects a different unassigned guest, **Then** the previous guest is returned to the unassigned list and the new guest is assigned to the chair

---

### User Story 3 - View Unassigned Guests Panel (Priority: P2)

As a couple, I want to see a panel listing all attending guests who haven't been assigned a seat yet, so that I know who still needs to be seated.

**Why this priority**: Helps users track progress on seating arrangements, but the core assign/unassign flow works without it.

**Independent Test**: Can be tested by viewing the panel alongside the floor plan and verifying it lists exactly the attending guests not currently in any seat. Delivers value as a progress tracker.

**Acceptance Scenarios**:

1. **Given** a wedding with 10 attending RSVPs and 4 guests assigned to seats, **When** the user views the unassigned guests panel, **Then** the panel shows exactly 6 guests
2. **Given** the unassigned guests panel is visible, **When** the user assigns a guest from the panel to a chair, **Then** the guest is removed from the panel within 1 second via optimistic client update (no full browser page navigation)
3. **Given** all attending guests are assigned, **When** the user views the unassigned guests panel, **Then** the panel shows a completion message (e.g., "All guests are seated!")

---

### User Story 4 - View Seat Assignments in RSVP Dashboard (Priority: P2)

As a couple, I want to see each guest's assigned table and seat number in the RSVP list on my dashboard, so that I can review seating arrangements alongside RSVP details.

**Why this priority**: Integrates seating data into existing workflows, but is a read-only view — the primary interaction happens on the floor plan.

**Independent Test**: Can be tested by viewing the RSVP list after making assignments on the floor plan and verifying each row shows the correct table/seat info.

**Acceptance Scenarios**:

1. **Given** a guest is assigned to "Round Table 1, Seat 3", **When** the user views the RSVP list on the dashboard, **Then** that guest's row displays "Round Table 1 — Seat 3" where "Round Table 1" is derived from the floor plan item's label and "Seat 3" is derived from the chair's chairIndex + 1 among sibling chairs under the same parent table
2. **Given** a guest has no seat assignment, **When** the user views the RSVP list, **Then** that guest's row shows a dash (—) indicating no assignment

---

### User Story 5 - Export RSVP Data with Seat Assignments (Priority: P3)

As a couple, I want to export my wedding's RSVP responses with seat assignments to a Google Spreadsheet, so that I can share a complete seating chart with my venue or coordinator. If I don't have Google authentication, I want a fallback XLSX download.

**Why this priority**: Extends RSVP data with seating data for external sharing. Important for day-of logistics but not blocking for the core seating workflow.

**Independent Test**: Can be tested by clicking "Export to Google Sheets" on the RSVP dashboard, completing Google OAuth, and verifying the created spreadsheet contains correct columns and data. Fallback tested by downloading XLSX without Google auth.

**Acceptance Scenarios**:

1. **Given** the user is on the RSVP dashboard with RSVPs and seat assignments, **When** the user clicks "Export to Google Sheets", **Then** the system initiates Google OAuth, creates a new spreadsheet in the user's Google Drive, and shows a confirmation with a link to open it
2. **Given** guests with mixed assignment status (some assigned, some not), **When** the export completes, **Then** the spreadsheet contains columns: Guest Name, Status, Vegetarian, Dietary Notes, Baby Chair, Table, Seat, Submitted At — with Table and Seat populated from assignments or "Unassigned" for unseated guests
3. **Given** the user does not have Google authentication configured or declines OAuth, **When** the user clicks "Download as XLSX", **Then** the system generates and downloads an XLSX file with the same column structure
4. **Given** the user has admin role, **When** they export, **Then** they can export any wedding's RSVP data (same access as viewing)

---

### Edge Cases

- What happens when a floor plan item (table) is deleted while it has assigned seats? Assignments are deleted and those guests return to the unassigned list.
- What happens when an individual chair item is deleted? Same as table deletion — the assignment is removed and the guest returns to the unassigned list.
- What happens when an RSVP status changes from "attending" to "declined" after a guest is assigned? The seat assignment is automatically removed and the chair becomes empty.
- What happens when a guest name is edited on the RSVP? The assignment persists but displays the updated name.
- What happens when the floor plan is reset (all items cleared)? All seat assignments for that wedding are deleted.
- What happens when a chair is moved between tables (parent changed)? The assignment persists and follows the chair to its new parent. The table_item_id in the assignment is updated to reflect the new parent.
- What happens when a guest is assigned to a chair on a table that is later rotated? The assignment persists — rotation repositions chairs but does not affect assignments.
- What happens when the user removes a chair/table from the canvas but the server unassign action fails? The chair is removed from the canvas state optimistically. The orphaned assignment is cleaned up on the next floor plan save (via cleanupOrphanedAssignments).
- What happens when Google OAuth fails or the token expires during export? The system shows an error message and prompts the user to re-authenticate or use the XLSX fallback.
- What happens when a new RSVP is submitted (guest added) after assignments exist? The new guest appears in the unassigned guests panel automatically — no conflict with existing assignments.
- What happens when an RSVP is deleted entirely? The CASCADE on rsvp_id deletes the assignment automatically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to click any chair on the floor plan canvas to open a guest assignment dialog
- **FR-002**: System MUST display a list of attending, unassigned RSVP guests in the assignment dialog for empty chairs
- **FR-003**: System MUST allow users to select a guest from the dialog and assign them to the clicked chair
- **FR-004**: System MUST visually distinguish occupied chairs by changing fill color to teal/green (from default purple `#f3e8ff`) and displaying a guest name label truncated to 15 characters
- **FR-005**: System MUST open a reassignment dialog when an occupied chair is clicked, showing the current guest and options to unassign or change
- **FR-006**: System MUST return a previously assigned guest to the unassigned pool when their seat is unassigned
- **FR-007**: System MUST persist seat assignments in the database, linked to the RSVP record and the specific chair item
- **FR-008**: System MUST display an unassigned guests panel on the left sidebar of the floor plan editor showing attending guests without a seat
- **FR-009**: System MUST update the unassigned guests panel within 1 second of any assignment change via optimistic client-side state updates
- **FR-010**: System MUST show each guest's assigned table name (derived from floor plan item label) and seat position (derived from chair's chairIndex + 1 among siblings) in the RSVP list on the dashboard
- **FR-011**: System MUST include "Table" and "Seat" columns in RSVP exports (Google Sheets and XLSX)
- **FR-012**: System MUST automatically remove seat assignments when an RSVP status changes from "attending" to "declining"
- **FR-013**: System MUST delete seat assignments when their parent table item or the assigned chair item itself is removed from the floor plan
- **FR-014**: System MUST only show attending guests (status = "attending") in the assignment dialog — declined guests are never shown
- **FR-015**: System MUST prevent assigning the same guest to multiple chairs simultaneously
- **FR-016**: System MUST support both couple and admin roles for all seat assignment operations
- **FR-017**: System MUST provide an "Export to Google Sheets" button on the RSVP dashboard that initiates Google OAuth and creates a new spreadsheet with RSVP data
- **FR-018**: System MUST store Google OAuth tokens securely per user for spreadsheet creation access
- **FR-019**: System MUST provide a "Download as XLSX" fallback on the RSVP dashboard for users without Google authentication
- **FR-020**: System MUST create spreadsheets with columns: Guest Name, Status, Vegetarian, Dietary Notes, Baby Chair, Table, Seat, Submitted At
- **FR-021**: System MUST enforce the same access controls for export as the RSVP dashboard (couples see their own, admins see any wedding)
- **FR-022**: System MUST handle Google OAuth failures gracefully with an error message and XLSX fallback prompt

### Key Entities

- **Seat Assignment**: Links an attending RSVP guest to a specific chair item on a specific table within a wedding's floor plan. Each attending guest can have at most one active assignment. Identified by the RSVP record and chair item ID.
- **Unassigned Guest**: A derived view of attending RSVP guests who do not have an active seat assignment for their wedding.
- **Google OAuth Token**: Stores a user's Google API access and refresh tokens for spreadsheet creation. Scoped to `spreadsheets` and `drive.file`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign a guest to a chair in under 10 seconds (click chair → select guest → confirm), verified by manual timing during testing
- **SC-002**: The unassigned guests panel updates within 1 second of any assignment change, achieved via optimistic client-side updates
- **SC-003**: All attending guests can be assigned and unassigned without full browser page navigations or data loss
- **SC-004**: The RSVP dashboard accurately reflects current seat assignments for 100% of guests
- **SC-005**: Seat assignments survive floor plan save/load cycles without data loss
- **SC-006**: Google Sheets and XLSX exports include accurate seat assignment data for every RSVP row
- **SC-007**: Export completes and shows the spreadsheet link or downloads the XLSX file within 5 seconds

## Clarifications

### Session 2026-04-22

- Q: What happens when an individual chair item is deleted from the floor plan (distinct from parent table deletion)? → A: Assignment is deleted; guest returns to unassigned list (consistent with FR-013 table deletion behavior)

## Assumptions

- Each chair on the floor plan can hold at most one guest at a time
- The chair's parent table determines the "table name" displayed in the RSVP list (derived from the table item's label)
- Seat position within a table is derived from the chair's chairIndex + 1 among sibling chairs under the same parent table
- Seat assignments are per-wedding — a guest from one wedding cannot be assigned to another wedding's floor plan
- The existing `rsvps` table's `status` field ("attending"/"declining") is the source of truth for guest availability
- Both couple and admin users have the same seat assignment capabilities (no role-based restrictions beyond existing floor plan access)
- The assignment dialog will use a searchable list (shadcn Command component) to handle weddings with many guests (50+)
- The unassigned guests panel appears on the left sidebar of the floor plan editor; the item catalog moves to the right sidebar
- A new RSVP update action must be created to support status changes (attending → declining), which triggers assignment cleanup (FR-012)
- Google Sheets export is a new feature built as part of this specification — no prior export functionality exists
- Google OAuth tokens are stored in a separate `oauth_tokens` table for cleaner separation from auth metadata
- Each export creates a new spreadsheet (no update-existing-spreadsheet workflow)
- XLSX generation uses server-side processing for data privacy
