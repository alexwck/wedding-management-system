# Feature Specification: Coordinate System Fix and UI Layout Overhaul

**Feature Branch**: `005-fix-coords-ui-layout`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "Fix critical coordinate system bugs in floor plan editor where Konva Circle (center-based) and Rect (top-left-based) positioning causes chairs to not circle around round tables, chairs to misalign after table rotation, and long tables to rotate around their corner instead of center. Additionally, overhaul UI layout across all pages to eliminate excessive empty space, remove unnecessary horizontal scrolling, improve content density and visual hierarchy on every page (login, dashboard, RSVPs, floor plan editor, admin pages, wedding detail, landing page, RSVP form, error/404 pages), and create mockups for user review before implementation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chairs Circle Correctly Around Round Tables (Priority: P1)

A couple places a round table on the floor plan canvas. They expect the chairs to be evenly distributed in a perfect circle around the table. Currently, the table renders offset from its actual position, so chairs appear to orbit empty space instead of the table. After dragging the table, the offset changes unpredictably, making the problem worse.

**Why this priority**: This is the most visible rendering bug. Every user who places a round table sees it immediately. The table and its chairs must visually belong together — this is table stakes for a floor plan editor.

**Independent Test**: Place a 5ft round table. Verify the table circle and its chairs share the same visual center. Drag the table to a new position. Verify chairs stay centered around the table at the new position.

**Acceptance Scenarios**:

1. **Given** a newly placed round table with default chairs, **When** the user views the canvas, **Then** all chairs are equidistant from the table's visual center and the table appears centered among its chairs
2. **Given** a round table that has been dragged to a new position, **When** the user views the canvas, **Then** the table and all its chairs moved together and remain centered
3. **Given** a round table with chairs, **When** the user increases or decreases the chair count, **Then** new chairs appear at correct positions around the table's visual center

---

### User Story 2 - Tables Rotate Around Their Center (Priority: P1)

A couple rotates a long table to fit their venue layout. They expect the table to spin in place, like turning a piece of paper on a desk. Currently, the table swings around its top-left corner like a door hinge, dragging all chairs into wrong positions. Round tables also exhibit rotation issues after being dragged.

**Why this priority**: Rotation is a fundamental manipulation. Spinning around the corner instead of the center is immediately jarring and makes precise layout impossible.

**Independent Test**: Place a long table. Use the rotation handle to rotate it 90 degrees. Verify the table spins around its visual center and chairs maintain their relative positions. Repeat with a round table.

**Acceptance Scenarios**:

1. **Given** a long table with chairs on the canvas, **When** the user rotates it 90 degrees, **Then** the table spins around its visual center (not its corner)
2. **Given** a round table with chairs, **When** the user rotates it, **Then** all chairs rotate with the table maintaining correct relative positions
3. **Given** any rotated table, **When** the user drags it to a new position, **Then** the table and chairs move together in the rotated orientation
4. **Given** a table rotated 45 degrees, **When** the user changes chair count, **Then** new chairs appear at correct rotated positions

---

### User Story 3 - Floor Plan Editor Uses Canvas Space Efficiently (Priority: P2)

A couple opens the floor plan editor to design their reception layout. The editor should use all available screen space for the canvas — no wasted vertical space on headings, no horizontal scrolling, and an item catalog that can collapse when not needed.

**Why this priority**: The floor plan editor is the most tool-intensive page. Every pixel of canvas space matters for precise layout work. Fixed-height toolbars and always-visible sidebars waste the most valuable real estate.

**Independent Test**: Open the floor plan editor. Verify the canvas fills the entire content area below breadcrumbs. Collapse the item catalog. Verify the canvas expands. No horizontal scrollbar appears.

**Acceptance Scenarios**:

1. **Given** the floor plan editor, **When** the page loads, **Then** the canvas fills all available vertical space below breadcrumbs with no heading wasting space
2. **Given** the item catalog sidebar, **When** the user collapses it, **Then** the canvas expands to use the freed space
3. **Given** the floor plan editor at any viewport width, **When** the user views the page, **Then** no horizontal scrollbar appears
4. **Given** toolbar controls (zoom, undo, dimensions), **When** the user interacts with the canvas, **Then** controls float as overlays without consuming vertical space

---

### User Story 4 - All Pages Have Balanced Content Density (Priority: P2)

A user navigates through the wedding management system — from login, through the couple dashboard, admin panels, and public wedding pages. Every page should feel purposeful and complete, not half-empty with content floating in the middle of a vast white expanse. Forms should be wide enough to be usable, error pages should be compact, and content should fill the available space naturally.

**Why this priority**: Empty space creates an unfinished, unprofessional impression. Users trust tools that look complete. This applies to every page they encounter.

**Independent Test**: Navigate through every page. Verify each page uses at least 60% of the available viewport area for meaningful content. No page has more than 30% dead space on standard screens (1280x800).

**Acceptance Scenarios**:

1. **Given** the login page, **When** the user views it on a standard screen, **Then** the card is wide enough to be usable and does not float in excessive whitespace
2. **Given** the couple dashboard, **When** the user views their RSVPs, **Then** content fills the main area with clear visual hierarchy
3. **Given** the admin couples page, **When** the user views it on a wide screen, **Then** the form and table appear side by side instead of stacked vertically
4. **Given** the error or 404 page, **When** the user encounters it, **Then** the message appears compact in the upper portion of the screen, not centered in a vast empty page
5. **Given** the public RSVP form, **When** a guest views it, **Then** the form is wide enough for comfortable input
6. **Given** the admin wedding detail page, **When** the user views a wedding, **Then** content sections use a tabbed or compact layout instead of a long vertical scroll

---

### User Story 5 - Visual Mockups Reviewed Before Implementation (Priority: P3)

Before any UI layout changes are implemented, the product designer reviews mockups of each page to choose the preferred design direction. Mockups are created as visual files that can be compared side by side.

**Why this priority**: UI changes are subjective. Reviewing mockups prevents wasted implementation effort on designs that don't meet expectations.

**Independent Test**: Navigate to the mockups folder. Verify visual mockups exist for all major pages. Verify at least two design options per page for comparison.

**Acceptance Scenarios**:

1. **Given** the mockups folder, **When** the designer opens it, **Then** visual mockups exist for login, dashboard, RSVPs, floor plan, admin dashboard, admin couples, admin weddings, wedding detail, landing page, RSVP form, error, and 404 pages
2. **Given** the mockups for any page, **When** the designer compares options, **Then** at least two layout variations are available

---

### Edge Cases

- What happens when a round table is dragged near the venue edge? Chairs must stay attached and the coordinate conversion must not produce NaN or Infinity values.
- What happens when a long table is rotated 180 degrees — do chairs stay on the correct sides (top/bottom)?
- What happens when a table is rotated and then dragged — does the coordinate conversion handle the combined transform correctly?
- What happens on mobile viewports (320px wide) — the floor plan editor may show a "use a larger screen" prompt; all other pages must remain usable without horizontal scrolling
- What happens when the floor plan editor's floating controls overlap with canvas content on small screens?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Round tables MUST render at the visual center of their bounding box so chairs circle the table correctly on initial placement
- **FR-002**: After dragging any table type, the stored position MUST remain consistent with the bounding-box coordinate convention so subsequent chair generation and rotation calculations are correct
- **FR-003**: Long tables MUST rotate around their visual center, not their corner, so the rotation feels natural
- **FR-004**: When any table is rotated, all child chairs MUST rotate with it, maintaining their correct relative positions around the table
- **FR-005**: The floor plan editor canvas MUST fill all available vertical space below breadcrumbs with no intermediate headings
- **FR-006**: The floor plan item catalog MUST be collapsible so the canvas can use the full editor width when catalog is hidden
- **FR-007**: The floor plan editor MUST NOT produce horizontal scrollbars at viewport widths of 768px and above; below 768px, the editor may display a prompt to use a larger screen
- **FR-008**: Floor plan toolbar controls MUST float as overlays on the canvas instead of consuming vertical space above it
- **FR-009**: The login page card MUST be wide enough for comfortable form entry (at least 32rem) without excessive surrounding whitespace
- **FR-010**: Error and 404 pages MUST display their content compactly in the upper portion of the viewport, not vertically centered in the full screen height
- **FR-011**: The admin couples page MUST present the create-couple form and the couples table side by side on wide screens
- **FR-012**: The public RSVP form MUST be wide enough for comfortable input (at least 36rem)
- **FR-013**: Dashboard and admin page content MUST be constrained to a maximum width for readability on ultra-wide screens
- **FR-014**: Visual mockups for all pages MUST be created and available for designer review before UI implementation begins

### Key Entities

- **Floor Plan Item Position**: The coordinate system that maps stored data positions to visual rendering positions for circles (round tables, chairs) and rectangles (long tables, stages, etc.). The conversion between data model and rendering must be lossless and consistent through drag, rotate, and chair generation operations.
- **Page Layout**: The spatial arrangement of content on each page, including container widths, spacing, content density, and responsive breakpoints.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of round tables render with chairs visually centered around the table, both on initial placement and after any number of drag operations
- **SC-002**: All table types rotate around their visual center with chairs maintaining correct relative positions
- **SC-003**: The floor plan editor uses at least 95% of available viewport height for the canvas area
- **SC-004**: Every page uses at least 60% of the available viewport for meaningful content on a 1280x800 screen
- **SC-005**: No horizontal scrollbar appears on any page at viewport widths of 768px and above
- **SC-006**: Users can complete common tasks (place table, rotate, drag, adjust chairs) without encountering visual glitches on any operation

## Clarifications

### Session 2026-04-21

- Q: Floor plan editor minimum viewport width — should it support 320px mobile? → A: Floor plan editor minimum is 768px; other pages support down to 320px
- Q: Should undo/redo after rotation be explicitly required? → A: No special requirement — works automatically if coordinates are correct
- Q: Do existing saved floor plans need a data migration for corrupted positions? → A: No migration needed — dev-only data, clean up before running tests

## Assumptions

- The existing bounding-box coordinate convention (x,y = top-left) in the data model is correct and should be preserved; only the rendering layer needs fixing
- The floor plan's item catalog should default to expanded but remember collapsed state during the session
- Mockups will be created as HTML files rendered to screenshots, not as design tool exports
- Mobile viewports below 768px may have different layouts (stacked instead of side-by-side) — this is acceptable
- The existing glassmorphism design system (`.glass-panel` class) will continue to be used on redesigned pages
- No database migrations are needed — existing floor plan data is dev-only and will be cleaned up before testing
