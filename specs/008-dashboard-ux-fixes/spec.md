# Feature Specification: Dashboard UX Redesign & Bug Fixes

**Feature Branch**: `008-dashboard-ux-fixes`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "7 items covering wedding date management, dashboard layout redesign, RSVP table improvements, Google Sheets removal, XLSX export fix, floor plan catalog overflow fix, and chair count editing fix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Wedding Date (Priority: P1)

As an admin or couple, I want to set and edit the wedding date for my wedding so that guests see the correct date on the landing page and I can plan around an accurate timeline.

**Why this priority**: The wedding date is foundational data that drives the entire event. Without a UI to set it, the date can only be entered via database manipulation — a critical gap for the core use case.

**Independent Test**: Can be fully tested by navigating to the admin wedding detail page or couple dashboard, setting a wedding date via a date picker, and verifying it appears on the public landing page. Delivers immediate value: couples can communicate their date to guests.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a wedding detail page, **When** they click the wedding date field and select a date, **Then** the date is saved and displayed on the public wedding landing page.
2. **Given** a couple is on their dashboard, **When** they view the wedding date section, **Then** they see the current wedding date (or "Not set" if none) and can edit it.
3. **Given** a wedding has no date set, **When** the landing page is viewed, **Then** the date section is hidden or shows a graceful empty state.

---

### User Story 2 - Side-by-Side Dashboard Layout (Priority: P1)

As an admin or couple, I want the wedding management page to show the template upload on the left and venue details, RSVP summary, and RSVP responses on the right so that I can see all key information at a glance without scrolling.

**Why this priority**: The current stacked layout forces scrolling to access venue and RSVP data. A side-by-side layout dramatically improves information density and reduces navigation friction — this is the primary daily-use view.

**Independent Test**: Can be tested by loading the admin wedding detail page and couple dashboard and verifying the two-column layout renders correctly on desktop, with template upload occupying the left column and all other sections in the right column.

**Acceptance Scenarios**:

1. **Given** an admin views a wedding detail page on desktop, **When** the page loads, **Then** template upload appears on the left (roughly 1/3 width) and venue details + RSVP summary + RSVP responses appear on the right (roughly 2/3 width).
2. **Given** a couple views their dashboard on desktop, **When** the page loads, **Then** the layout follows the same side-by-side pattern.
3. **Given** a user views the page on a mobile device, **When** the viewport is narrow, **Then** the layout stacks vertically (left column on top, right column below) for usability.

---

### User Story 3 - Collapsible RSVP Responses Table (Priority: P2)

As an admin or couple, I want to view RSVP responses in a clean, collapsible table that shows guest name, status, dietary notes, and other key columns so that I can quickly scan responses and optionally collapse the section to focus on other details.

**Why this priority**: Improves data readability and page scannability. The collapsible design gives users control over information density — they can expand when reviewing responses and collapse when focusing on other sections.

**Independent Test**: Can be tested by viewing RSVP responses on the wedding detail page, verifying the table displays all RSVP data in organized columns, and confirming the section can be expanded and collapsed.

**Acceptance Scenarios**:

1. **Given** a wedding has RSVP responses, **When** the RSVP responses section is displayed, **Then** responses appear in a table with columns for guest name, status, dietary notes, vegetarian, baby chair, and submission date.
2. **Given** the RSVP responses section is expanded, **When** the user clicks the collapse toggle, **Then** the table collapses to show only the section header with response count.
3. **Given** the RSVP responses section is collapsed, **When** the user clicks the expand toggle, **Then** the full table is revealed.

---

### User Story 4 - Fix XLSX Export (Priority: P1)

As an admin or couple, I want to download RSVP data as a valid XLSX file that opens correctly in Excel so that I can work with the data offline.

**Why this priority**: A broken export is a functional regression — users expect downloadable data to work. This directly impacts trust and usability.

**Independent Test**: Can be tested by downloading an XLSX export and opening it in Excel or Google Sheets, verifying the file opens without errors and contains correct data.

**Acceptance Scenarios**:

1. **Given** a wedding has RSVP responses, **When** the user clicks "Download as XLSX", **Then** a valid XLSX file downloads with the filename based on the wedding couple name (special characters like `&` replaced cleanly).
2. **Given** the downloaded file, **When** opened in Excel, **Then** the file opens without format/extension errors and displays all RSVP data correctly.

---

### User Story 5 - Remove Google Sheets Export (Priority: P2)

As a product owner, I want the Google Sheets export feature removed from the application since it is still in development and adds unnecessary complexity.

**Why this priority**: Removing unused features reduces maintenance burden and UI clutter. No backward compatibility is needed since this is pre-release.

**Independent Test**: Can be tested by verifying that no Google Sheets button, OAuth flow, or related code paths exist in the application.

**Acceptance Scenarios**:

1. **Given** the application UI, **When** viewing the export section, **Then** only the XLSX download button is visible — no Google Sheets option.
2. **Given** the codebase, **When** searching for Google Sheets references, **Then** no OAuth token storage, Google API calls, or related UI components remain.

---

### User Story 6 - Fix Floor Plan Catalog Overflow (Priority: P2)

As a user editing a floor plan, I want the item catalog sidebar to stay within the browser viewport when I collapse and re-expand it so that I can access all items without the panel overflowing off-screen.

**Why this priority**: This is a usability blocker for the floor plan editor — users cannot reliably access the catalog items after toggling, forcing a page reload.

**Independent Test**: Can be tested by opening the floor plan editor, collapsing the item catalog, re-expanding it, and verifying the catalog stays within the viewport bounds.

**Acceptance Scenarios**:

1. **Given** the floor plan editor is open, **When** the user collapses and re-expands the item catalog, **Then** the catalog panel stays within the browser viewport and all items are accessible.
2. **Given** the catalog is expanded, **When** the catalog content exceeds the viewport height, **Then** the catalog scrolls internally without overflowing the page.

---

### User Story 7 - Fix Chair Count Editing (Priority: P2)

As a user editing a floor plan, I want to edit the number of chairs on a table so that I can customize seating arrangements to match my venue layout.

**Why this priority**: Chair count editing is core to floor plan functionality. Without it, users cannot customize table seating — a key feature of the editor.

**Independent Test**: Can be tested by selecting a table in the floor plan editor and verifying the chair count controls (+/-) appear and function correctly.

**Acceptance Scenarios**:

1. **Given** a table is placed on the floor plan canvas, **When** the user clicks/selects the table, **Then** chair count editing controls (decrement, input, increment) appear.
2. **Given** chair count controls are visible, **When** the user increments or decrements the count, **Then** chairs are added or removed accordingly within the allowed range.

---

### User Story 8 - Template Image Preview & Focal Point (Priority: P2)

As an admin or couple, I want to preview the uploaded template image at full size and set a focal point so that the most important part of the image is centered and visible on the landing page regardless of the image's original dimensions.

**Why this priority**: In the two-column layout, the template thumbnail may be small. Users need a way to see the full image and ensure the right area is displayed on the public landing page — especially when the image aspect ratio doesn't match the display area.

**Independent Test**: Can be tested by uploading an image, clicking to open the preview, setting a focal point on the image, and verifying the landing page renders the image centered around that focal point.

**Acceptance Scenarios**:

1. **Given** a template image has been uploaded, **When** the user clicks the image or a "Preview" button, **Then** a full-size preview opens showing the entire image.
2. **Given** the preview is open, **When** the user clicks a point on the image, **Then** that point is marked as the focal point (with a visual indicator) and the position is saved.
3. **Given** a focal point has been set, **When** the public landing page displays the template image, **Then** the image is cropped/positioned to center on the focal point.
4. **Given** no focal point has been set, **When** the landing page displays the image, **Then** the image centers on its midpoint as a default.

---

### Edge Cases

- What happens when a wedding date is cleared (set to empty)? The landing page should hide the date section gracefully.
- What happens when the XLSX export is triggered with zero RSVPs? The file should still be valid but contain only headers.
- What happens on the dashboard when no template is uploaded? The left column should show the upload area without a preview image.
- What happens when the item catalog is resized on a very small screen? The catalog should remain usable with internal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a datetime picker on the admin wedding detail page to set or edit the wedding date and ceremony time.
- **FR-002**: System MUST provide a datetime picker on the couple dashboard to view and edit the wedding date and ceremony time.
- **FR-003**: System MUST display the wedding date and ceremony time on the public landing page when set, and hide the date section when not set.
- **FR-004**: System MUST render the admin wedding detail page in a two-column layout on desktop: template upload on the left, wedding date + venue details + RSVP summary + RSVP responses on the right.
- **FR-005**: System MUST render the couple dashboard in the same two-column layout on desktop, with wedding date in the right column above venue details.
- **FR-006**: System MUST stack the layout vertically on mobile viewports (narrow screens).
- **FR-007**: System MUST display RSVP responses in a table format with columns for guest name, status, dietary notes, vegetarian, baby chair, table name, seat, and submitted date.
- **FR-007a**: System MUST allow sorting the RSVP table by guest name (alphabetical), status (attending/declining), submitted date (chronological), and table name (alphabetical).
- **FR-008**: System MUST allow the RSVP responses section to be collapsed and expanded via a toggle on the section header, with the section expanded by default on page load.
- **FR-009**: System MUST show the RSVP response count in the collapsed section header.
- **FR-010**: System MUST generate valid XLSX files that open correctly in spreadsheet applications, with special characters in the filename sanitized (e.g., `&` replaced with `and`).
- **FR-011**: System MUST remove the Google Sheets export feature entirely: button, OAuth flow, token storage, API integration code, and the `oauth_tokens` database table.
- **FR-012**: System MUST constrain the floor plan item catalog to stay within the browser viewport when toggled between collapsed and expanded states.
- **FR-013**: System MUST provide internal scrolling for the item catalog when its content exceeds the available height.
- **FR-014**: System MUST display chair count editing controls (+/- buttons and numeric input) when a table is selected in the floor plan editor.
- **FR-015**: System MUST update chair positions correctly when chair count is changed via the editing controls.
- **FR-016**: System MUST provide a full-size preview of the uploaded template image, accessible via a click or "Preview" button on the dashboard.
- **FR-017**: System MUST allow the user to set a focal point on the template image by clicking a position in the preview.
- **FR-018**: System MUST save the focal point coordinates (x, y as percentages) with the wedding template data.
- **FR-019**: System MUST render the template image on the public landing page centered on the saved focal point, defaulting to the image midpoint if no focal point is set.

### Key Entities

- **Wedding Date**: A date and time attribute on the wedding entity, stored as a timestamp. Editable by admin and couple. Displayed on the public landing page as "Month Day, Year at HH:MM".
- **Dashboard Layout**: Two-column arrangement — left column for template/media management, right column for event details (wedding date, venue, RSVP summary, RSVP responses). Collapses to single column on mobile.
- **RSVP Table**: Tabular view of all RSVP responses with collapsible section header. Columns include guest name, status, dietary information, seating, and submission metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins and couples can set or change the wedding date in under 10 seconds via a date picker, and the change is reflected on the landing page within one page refresh.
- **SC-002**: All dashboard information (template, venue, RSVP summary, RSVP responses) is visible without scrolling on a standard desktop viewport (1440px wide).
- **SC-003**: Downloaded XLSX files open without errors in Excel and Google Sheets, with all RSVP data accurately represented.
- **SC-004**: The floor plan item catalog remains fully visible and functional after any number of collapse/expand toggles, with no page reload required.
- **SC-005**: Chair count editing controls appear within 1 second of selecting a table and respond to increments/decrements immediately.
- **SC-006**: No Google Sheets export code, UI elements, or OAuth flows remain in the application after removal.

## Clarifications

### Session 2026-04-25

- Q: Should the wedding date picker capture just the date, or date + ceremony time? → A: Date + time — full ceremony start time for guests.
- Q: Where should the wedding date picker appear in the two-column layout? → A: Right column, with venue details.
- Q: Should RSVP responses section be expanded or collapsed by default? → A: Expanded by default.
- Q: Should Google Sheets removal include dropping the oauth_tokens DB table? → A: Full removal — drop the oauth_tokens table via a new migration.
- Q: Which RSVP table columns should be sortable? → A: Guest name, status (attending/declining), submitted date, and table name. Other columns (vegetarian, baby chair) are better as filters.
- Q: For template image positioning — focal point picker or crop tool? → A: Focal point picker — click to set center of focus, landing page crops around that point.

## Assumptions

- The `wedding_date` column already exists in the database (TIMESTAMPTZ type) and is displayed on the landing page — only the editing UI is missing.
- The RSVP responses are already displayed in a table component (`rsvp-table.tsx`); this spec adds collapsibility and integrates it into the new dashboard layout.
- The ExcelJS library is already in use for XLSX generation — the bug is likely in filename sanitization or buffer handling, not the library itself.
- Removing Google Sheets export requires both application code removal and a database migration to drop the `oauth_tokens` table.
- The dashboard layout change applies to both the admin wedding detail page and the couple dashboard page.
- Mobile breakpoint follows the existing application convention (Tailwind `md:` prefix, 768px).
