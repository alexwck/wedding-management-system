# Feature Specification: Dashboard UX Redesign & Bug Fixes

**Feature Branch**: `008-dashboard-ux-fixes`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "7 items covering wedding date management, dashboard layout redesign, RSVP table improvements, Google Sheets removal, XLSX export fix, floor plan catalog overflow fix, and chair count editing fix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Wedding Date (Priority: P1)

As an admin or couple, I want to set and edit the wedding date for my wedding so that guests see the correct date and ceremony time on the landing page and I can plan around an accurate timeline.

**Why this priority**: The wedding date is foundational data that drives the entire event. Without a UI to set it, the date can only be entered via database manipulation — a critical gap for the core use case.

**Independent Test**: Can be fully tested by navigating to the admin wedding detail page or couple dashboard, setting a wedding date via a date picker, and verifying it appears on the public landing page. Delivers immediate value: couples can communicate their date to guests.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a wedding detail page, **When** they click the wedding date field and select a date and time, **Then** the date is saved (stored as UTC) and displayed on the public wedding landing page in the wedding's configured timezone.
2. **Given** a couple is on their dashboard, **When** they view the wedding date section, **Then** they see the current wedding date and time in the wedding's configured timezone (or "Not set" if none) and can edit the date/time but not the timezone.
3. **Given** a wedding has no date set, **When** the landing page is viewed, **Then** the date section is hidden entirely.
4. **Given** a wedding date is set to Feb 29 in a leap year, **When** displayed on the landing page, **Then** the date shows correctly as February 29.
5. **Given** an admin changes the wedding timezone after a date is set, **When** the landing page is viewed, **Then** the displayed time shifts to reflect the new timezone correctly (e.g., 2pm SGT → 2pm JST).

---

### User Story 2 - Side-by-Side Dashboard Layout (Priority: P1)

As an admin or couple, I want the wedding management page to show the template upload on the left and venue details, RSVP summary, and RSVP responses on the right so that I can see all key information at a glance without scrolling.

**Why this priority**: The current stacked layout forces scrolling to access venue and RSVP data. A side-by-side layout dramatically improves information density and reduces navigation friction — this is the primary daily-use view.

**Independent Test**: Can be tested by loading the admin wedding detail page and couple dashboard and verifying the two-column layout renders correctly on desktop, with template upload occupying the left column and all other sections in the right column.

**Acceptance Scenarios**:

1. **Given** an admin views a wedding detail page on desktop (1024px+), **When** the page loads, **Then** template upload appears on the left (1/3 width, Tailwind `lg:col-span-1`) and wedding date + venue details + RSVP summary + RSVP responses appear on the right (2/3 width, Tailwind `lg:col-span-2`).
2. **Given** a couple views their dashboard on desktop (1024px+), **When** the page loads, **Then** the layout follows the same side-by-side pattern with the same proportions.
3. **Given** a user views the page on a mobile device (< 1024px), **When** the viewport is narrow, **Then** the layout stacks vertically (left column on top, right column below).
4. **Given** the page is viewed at exactly 1024px (breakpoint boundary), **When** the two-column layout is active, **Then** both columns render without overlap or overflow.
5. **Given** an extremely tall portrait template image is displayed in the left column, **When** the image is rendered, **Then** it is constrained to the column height with `object-fit: contain` and does not push content below the fold.

---

### User Story 3 - Collapsible RSVP Responses Table (Priority: P2)

As an admin or couple, I want to view RSVP responses in a clean, collapsible table that shows guest name, status, dietary notes, and other key columns so that I can quickly scan responses and optionally collapse the section to focus on other details.

**Why this priority**: Improves data readability and page scannability. The collapsible design gives users control over information density — they can expand when reviewing responses and collapse when focusing on other sections.

**Independent Test**: Can be tested by viewing RSVP responses on the wedding detail page, verifying the table displays all RSVP data in organized columns, and confirming the section can be expanded and collapsed.

**Acceptance Scenarios**:

1. **Given** a wedding has RSVP responses, **When** the RSVP responses section is displayed, **Then** responses appear in a table with columns for guest name, status, dietary notes, vegetarian, baby chair, and submission date.
2. **Given** the RSVP responses section is expanded, **When** the user clicks the collapse toggle, **Then** the table collapses to show only the section header with response count.
3. **Given** the RSVP responses section is collapsed, **When** the user clicks the expand toggle, **Then** the full table is revealed.
4. **Given** a wedding has zero RSVP responses, **When** the RSVP section is displayed, **Then** an empty state message appears ("No RSVP responses yet") instead of an empty table.
5. **Given** a wedding has 200+ RSVP responses, **When** the RSVP table is displayed, **Then** the table renders within the right column with internal vertical scrolling (max height constraint), not infinite page height.
6. **Given** a wedding has exactly one RSVP response, **When** the RSVP table is sorted by any column, **Then** the sort indicator still appears on the column header but the single row remains unchanged.

---

### User Story 4 - Fix XLSX Export (Priority: P1)

As an admin or couple, I want to download RSVP data as a valid XLSX file that opens correctly in Excel so that I can work with the data offline.

**Why this priority**: A broken export is a functional regression — users expect downloadable data to work. This directly impacts trust and usability.

**Root Cause**: The ExcelJS `writeBuffer()` returns an ArrayBuffer. Server actions serialize return values as JSON by default, which corrupts binary data during serialization/deserialization. The fix converts the buffer to a base64 string before returning, and the client converts it back to a Blob with the correct MIME type (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

**Independent Test**: Can be tested by downloading an XLSX export and opening it in Excel or Google Sheets, verifying the file opens without errors and contains correct data.

**Acceptance Scenarios**:

1. **Given** a wedding has RSVP responses, **When** the user clicks "Download as XLSX", **Then** a valid XLSX file downloads with the filename based on the wedding couple name.
2. **Given** the downloaded file, **When** opened in Microsoft Excel 2016+, **Then** the file opens without format/extension errors and displays all RSVP data correctly.
3. **Given** the downloaded file, **When** opened in Google Sheets, **Then** the file imports without errors and all data is preserved.
4. **Given** a wedding with couple name "Alex & Sam", **When** the XLSX file is downloaded, **Then** the filename is `rsvp-export-Alex-and-Sam.xlsx` (ampersand → "and", no consecutive hyphens, trimmed).
5. **Given** a wedding with no couple name, **When** the XLSX file is downloaded, **Then** the filename defaults to `rsvp-export-wedding.xlsx`.
6. **Given** RSVP data with special characters in guest names (accents, non-Latin scripts), **When** the XLSX is opened, **Then** all characters are preserved correctly (UTF-8 encoding).

---

### User Story 5 - Remove Google Sheets Export (Priority: P2)

As a product owner, I want the Google Sheets export feature removed from the application since it is still in development and adds unnecessary complexity.

**Why this priority**: Removing unused features reduces maintenance burden and UI clutter. No backward compatibility is needed since this is pre-release.

**Independent Test**: Can be tested by verifying that no Google Sheets button, OAuth flow, or related code paths exist in the application.

**Removal Scope**:
- `src/app/actions/export.ts`: Remove functions `createOAuth2Client`, `getGoogleAuthUrl`, `handleGoogleCallback`, `getGoogleAuthStatus`, `exportToGoogleSheets`; remove `googleapis` import
- `src/components/export-buttons.tsx`: Remove Google Sheets button, `isGoogleExporting` state, `handleGoogleExport` function, Google auth check
- `src/types/oauth.ts`: Delete entire file
- `package.json`: Remove `googleapis` dependency
- Database: `DROP TABLE public.oauth_tokens CASCADE`

**Acceptance Scenarios**:

1. **Given** the application UI, **When** viewing the export section, **Then** only the XLSX download button is visible — no Google Sheets option.
2. **Given** the codebase, **When** searching for "google", "oauth_tokens", or "googleapis", **Then** no references remain in application code.
3. **Given** the database after migration, **When** querying `public.oauth_tokens`, **Then** the table does not exist.

---

### User Story 6 - Fix Floor Plan Catalog Overflow (Priority: P2)

As a user editing a floor plan, I want the item catalog sidebar to stay within the browser viewport when I collapse and re-expand it so that I can access all items without the panel overflowing off-screen.

**Why this priority**: This is a usability blocker for the floor plan editor — users cannot reliably access the catalog items after toggling, forcing a page reload.

**Root Cause**: The item catalog container uses `overflow-y-auto` on a `flex flex-col` element without an explicit height constraint. On collapse/expand toggle, the container's height is calculated from its unconstrained content rather than the viewport, causing it to extend beyond the browser window. The fix adds `h-[calc(100vh-<topbar-height>)]` to constrain the catalog to the available viewport height.

**Independent Test**: Can be tested by opening the floor plan editor, collapsing the item catalog, re-expanding it, and verifying the catalog stays within the viewport bounds.

**Acceptance Scenarios**:

1. **Given** the floor plan editor is open, **When** the user collapses and re-expands the item catalog, **Then** the catalog panel stays within the browser viewport and all items are accessible via internal scrolling.
2. **Given** the catalog is expanded with many items, **When** the catalog content exceeds the viewport height, **Then** the catalog scrolls internally without overflowing the page.
3. **Given** the catalog is collapsed, **When** the browser window is resized, **Then** the collapsed state maintains its constrained height without overflow.

---

### User Story 7 - Fix Chair Count Editing (Priority: P2)

As a user editing a floor plan, I want to edit the number of chairs on a table so that I can customize seating arrangements to match my venue layout.

**Why this priority**: Chair count editing is core to floor plan functionality. Without it, users cannot customize table seating — a key feature of the editor.

**Root Cause**: Investigation needed during implementation. Potential causes: (a) `selectedItem?.type` string mismatch between stored type and the condition check, (b) z-index conflict causing the overlay to render behind other elements, or (c) the `selectedItem` state not being updated on table click. The fix involves debugging the actual cause. FR-014's z-index guidance addresses cause (b) if that is the issue; the other causes require different fixes.

**Independent Test**: Can be tested by selecting a table in the floor plan editor and verifying the chair count controls (+/-) appear and function correctly.

**Acceptance Scenarios**:

1. **Given** a round table is placed on the floor plan canvas, **When** the user clicks the table, **Then** chair count editing controls (decrement button, numeric input, increment button, max count display) appear within 1 second.
2. **Given** a long table is placed on the floor plan canvas, **When** the user clicks the table, **Then** the same chair count editing controls appear.
3. **Given** chair count controls are visible, **When** the user increments the count, **Then** chairs are added around the table within the allowed range.
4. **Given** chair count controls are visible, **When** the user decrements the count, **Then** chairs are removed from the table within the allowed range (minimum 0).
5. **Given** the chair count is changed, **When** the user selects a different item, **Then** the updated chair count persists correctly.

**Regression Risk**: The fix must not affect table drag, rotation, or selection behavior. Existing E2E tests for table placement and chair generation must continue to pass.

---

### User Story 8 - Template Image Preview & Focal Point (Priority: P2)

As an admin or couple, I want to preview the uploaded template image at full size and set a focal point so that the most important part of the image is centered and visible on the landing page regardless of the image's original dimensions.

**Why this priority**: In the two-column layout, the template thumbnail may be small. Users need a way to see the full image and ensure the right area is displayed on the public landing page — especially when the image aspect ratio doesn't match the display area.

**Independent Test**: Can be tested by uploading an image, clicking to open the preview, setting a focal point on the image, and verifying the landing page renders the image centered around that focal point.

**Acceptance Scenarios**:

1. **Given** a template image has been uploaded, **When** the user clicks the image or a "Preview" button, **Then** a full-size preview opens in a dialog showing the entire image.
2. **Given** the preview is open, **When** the user clicks a point on the image (mouse) or taps (touch), **Then** that point is marked as the focal point with a visual crosshair indicator and the coordinates are saved.
3. **Given** a focal point has been set, **When** the public landing page displays the template image, **Then** the image is positioned via CSS `object-position` to center on the focal point.
4. **Given** no focal point has been set, **When** the landing page displays the image, **Then** the image centers on its midpoint (50%, 50%) as the default.
5. **Given** a focal point has been set, **When** the user opens the preview again, **Then** the existing focal point indicator is visible and the user can reposition it by clicking a new point.
6. **Given** a template image is replaced with a new upload, **When** the new image is saved, **Then** the focal point resets to null (center default) since the old focal point may not be relevant.
7. **Given** the user sets a focal point at the extreme edge (0% or 100% x/y), **When** the landing page renders, **Then** the image positions correctly without distortion.

---

### Edge Cases

- **Wedding date cleared**: When a wedding date is set to empty/null, the landing page hides the date section entirely (not "TBD" or placeholder text).
- **XLSX with zero RSVPs**: The file downloads as a valid XLSX containing only header rows, no data rows.
- **No template uploaded**: The left column shows the upload area with a dashed border placeholder — no broken image icon.
- **Item catalog on small screen**: The catalog remains usable with `max-h-[calc(100vh-...)]` and internal scrolling regardless of screen size.
- **Wedding date across DST**: When a wedding date falls during a DST transition in the configured timezone, the displayed time uses the correct offset for that specific date (handled by IANA timezone database).
- **Concurrent date edits**: If admin and couple edit the wedding date simultaneously, the last write wins (no merge conflict resolution needed for single-field edits — acceptable for this use case).
- **Focal point on image replace**: When the template image is replaced, the focal point resets to null (50%, 50% default) since the old coordinates may not apply to the new image.
- **Leap year date (Feb 29)**: February 29 dates are valid and display correctly. No special handling needed — the datetime picker inherently supports leap years.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a datetime picker on the admin wedding detail page to set or edit the wedding date and ceremony time, with a timezone selector that defaults to Asia/Kuala_Lumpur (MYT, UTC+8). The timezone selector offers the full set of IANA timezones (e.g., via `Intl.supportedValuesOf('timeZone')`), searchable by city/region name. Admin-only access to the timezone selector. If the user types a date string manually (rather than using the picker), invalid strings are rejected with an inline validation message.
- **FR-002**: System MUST provide a datetime picker on the couple dashboard to view and edit the wedding date and ceremony time, displayed in the wedding's configured timezone. Couples cannot see or change the timezone selector. Invalid manually-typed date strings are rejected with an inline validation message.
- **FR-003**: System MUST display the wedding date and ceremony time on the public landing page in the wedding's configured timezone when set, formatted as "Month Day, Year at HH:MM (UTC offset)" (e.g., "June 15, 2026 at 2:00 PM (UTC+8)"). UTC offset format is used instead of IANA abbreviations for universal clarity. Hide the date section entirely when not set.
- **FR-003a**: System MUST default the wedding timezone to Asia/Kuala_Lumpur (UTC+8) for all new weddings. Only admins can change the timezone via the admin wedding detail page. All dates are stored as UTC in the database; the timezone is used only for display conversion on the landing page and dashboards. Timezone is validated as a valid IANA timezone string; invalid values are rejected with an error message. Deprecated IANA timezones (e.g., "Asia/Calcutta" → "Asia/Kolkata") are accepted as-is — the Intl API resolves them correctly for display.
- **FR-004**: System MUST render the admin wedding detail page in a two-column grid layout on desktop (`min-width: 1024px`, Tailwind `lg:` breakpoint, inclusive): template upload on the left (`lg:col-span-1`, ~1/3 width), wedding date + timezone + venue details + RSVP summary + RSVP responses on the right (`lg:col-span-2`, ~2/3 width). The right column sections stack vertically in this order: wedding date/timezone → venue details → RSVP summary → RSVP responses.
- **FR-005**: System MUST render the couple dashboard in the same two-column layout on desktop (`min-width: 1024px`), with wedding date in the right column above venue details. The couple dashboard shows the RSVP summary and a "View All RSVPs" link to the existing `/dashboard/rsvps` page (which contains the full collapsible sortable table and export button). This avoids duplicating the full RSVP table on the overview page.
- **FR-006**: System MUST stack the layout vertically on viewports below 1024px (Tailwind `lg:` breakpoint).
- **FR-007**: System MUST display RSVP responses in a table format with columns for guest name, status, dietary notes, vegetarian, baby chair, table name, seat, and submitted date.
- **FR-007a**: System MUST allow sorting the RSVP table by guest name (alphabetical), status (attending/declining), submitted date (chronological), and table name (alphabetical). Sortable columns display ascending/descending arrow indicators. The default sort order is by submitted date descending (newest first). Sorting is performed client-side. Null/empty values in sortable columns sort to the end (after all non-empty values) in both ascending and descending order.
- **FR-008**: System MUST allow the RSVP responses section to be collapsed and expanded via a toggle on the section header, with the section expanded by default on page load.
- **FR-009**: System MUST show the RSVP response count in the collapsed section header (e.g., "RSVP Responses (42)").
- **FR-010**: System MUST generate valid XLSX files that open correctly in Microsoft Excel 2016+ and Google Sheets, with special characters in the filename sanitized: `&` → "and", `(` and `)` removed, spaces replaced with hyphens, consecutive hyphens collapsed to single, leading/trailing hyphens trimmed. If couple name is empty, filename defaults to `rsvp-export-wedding.xlsx`. The buffer is transferred as base64 from server action to client, then decoded to a Blob with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- **FR-011**: System MUST remove the Google Sheets export feature entirely: all Google Sheets/OAuth functions from `export.ts`, the Google button and auth logic from `export-buttons.tsx`, the `oauth.ts` type file, the `googleapis` dependency, and the `oauth_tokens` database table.
- **FR-012**: System MUST constrain the floor plan item catalog to stay within the browser viewport when toggled between collapsed and expanded states, using `h-[calc(100vh-40px)]` (40px = compact top bar height, matching existing `containerRef` sizing).
- **FR-013**: System MUST provide internal scrolling for the item catalog when its content exceeds the available height.
- **FR-014**: System MUST display chair count editing controls (+/- buttons and numeric input) when a table is selected in the floor plan editor, with correct z-index to ensure visibility above other canvas elements.
- **FR-015**: System MUST update chair positions correctly when chair count is changed via the editing controls.
- **FR-016**: System MUST provide a full-size preview of the uploaded template image in a shadcn/ui Dialog (modal), accessible via a click or "Preview" button on the dashboard. The dialog closes on backdrop click, Escape key, or a close button in the top-right corner.
- **FR-017**: System MUST allow the user to set a focal point on the template image by clicking a position in the preview. Both mouse click and touch tap are supported. A crosshair indicator marks the selected focal point.
- **FR-018**: System MUST save the focal point coordinates as two DECIMAL(5,2) percentage values — meaning up to 3 digits before the decimal and 2 after, range 0.00–100.00 — with the wedding template data. Both coordinates must be present or both null (pair integrity). A focal point at (0.00, 0.00) represents the top-left corner; (100.00, 100.00) represents the bottom-right corner.
- **FR-019**: System MUST render the template image on the public landing page centered on the saved focal point using CSS `object-position`, defaulting to (50.00, 50.00) if no focal point is set. When the template image is replaced with a new upload, the focal point resets to null.

### Key Entities

- **Wedding Date**: A date and time attribute on the wedding entity, stored as UTC (TIMESTAMPTZ). A separate timezone field (IANA string, defaults to Asia/Kuala_Lumpur) controls display conversion only. Editable by admin and couple (date/time); timezone is admin-only. Displayed on the public landing page in the wedding's timezone as "Month Day, Year at HH:MM (UTC offset)".
- **Dashboard Layout**: Two-column grid arrangement using Tailwind `lg:grid-cols-3` — left column `lg:col-span-1` for template/media management, right column `lg:col-span-2` for event details (wedding date, venue, RSVP summary, RSVP responses). Stacks to single column below 1024px.
- **RSVP Table**: Tabular view of all RSVP responses with collapsible section header, sortable columns, and internal scrolling for 200+ rows. Columns include guest name, status, dietary information, seating, and submission metadata.
- **Template Focal Point**: Two percentage coordinates (x, y) stored on the wedding entity, representing the point on the template image that should be centered when displayed. Applied via CSS `object-position` on the landing page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins and couples can set or change the wedding date in under 10 seconds total (including save and confirmation), and the change is reflected on the landing page within one page refresh.
- **SC-002**: All dashboard information (template preview, wedding date, venue, RSVP summary, RSVP responses for up to 50 guests) is visible without scrolling on a standard desktop viewport (1440px wide). Viewports at 1024px–1439px show the same layout but may require scrolling for the RSVP table.
- **SC-003**: Downloaded XLSX files open without errors in Microsoft Excel 2016+ and Google Sheets, with all RSVP data including special characters accurately represented.
- **SC-004**: The floor plan item catalog remains fully visible and functional after 20+ consecutive collapse/expand toggles, with no page reload required.
- **SC-005**: Chair count editing controls appear within 1 second of selecting a table and respond to increments/decrements immediately.
- **SC-006**: No Google Sheets export code, UI elements, OAuth flows, or database tables remain in the application after removal.
- **SC-007**: RSVP table sorting response time is under 200ms for datasets up to 500 rows (client-side sort).

## Clarifications

### Session 2026-04-25

- Q: Should the wedding date picker capture just the date, or date + ceremony time? → A: Date + time — full ceremony start time for guests.
- Q: Where should the wedding date picker appear in the two-column layout? → A: Right column, with venue details.
- Q: Should RSVP responses section be expanded or collapsed by default? → A: Expanded by default.
- Q: Should Google Sheets removal include dropping the oauth_tokens DB table? → A: Full removal — drop the oauth_tokens table via a new migration.
- Q: Which RSVP table columns should be sortable? → A: Guest name, status (attending/declining), submitted date, and table name. Other columns (vegetarian, baby chair) are better as filters.
- Q: For template image positioning — focal point picker or crop tool? → A: Focal point picker — click to set center of focus, landing page crops around that point.
- Q: What timezone should the wedding date default to? → A: Asia/Kuala_Lumpur (MYT, UTC+8) by default. Only admins can change each wedding's timezone. Dates stored as UTC in DB; timezone is a display-only setting.

## Assumptions

- The `wedding_date` column already exists in the database (TIMESTAMPTZ type) and is displayed on the landing page — only the editing UI is missing.
- The RSVP responses are already displayed in a table component (`rsvp-table.tsx`); this spec adds collapsibility, sorting, and integrates it into the new dashboard layout.
- The ExcelJS library is already in use for XLSX generation — the bug is in buffer serialization and filename sanitization, not the library itself.
- Removing Google Sheets export requires both application code removal and a database migration to drop the `oauth_tokens` table. The migration runs after code deployment — existing deployments handle the missing table gracefully since the code no longer references it.
- The dashboard layout change applies to both the admin wedding detail page and the couple dashboard page.
- Mobile breakpoint follows the existing application convention (Tailwind `lg:` prefix, 1024px for two-column layout).
- Existing weddings with a `wedding_date` but no `timezone` value will receive the default `Asia/Kuala_Lumpur` via the column default — no data migration needed.
- Seed data will be updated to include timezone values for existing wedding records.
- Concurrent edits to the wedding date are acceptable with last-write-wins semantics — no optimistic locking needed for this single-field value.
- The focal point preview and picker use a shadcn/ui Dialog component (already installed in the project via `src/components/ui/dialog.tsx`) for consistent styling with the glassmorphism design system.
- The native `datetime-local` input is styled via Tailwind utility classes to match the existing form input styling (borders, padding, font). The native picker dropdown cannot be custom-styled but inherits system theme — this is acceptable per the simplicity principle (Constitution V).
- The `/dashboard/rsvps` page already exists and will be enhanced with sorting and collapsibility. The couple dashboard overview page shows only the RSVP summary cards with a link to the full page, avoiding duplication.
