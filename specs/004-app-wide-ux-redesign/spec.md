# Feature Specification: Floor Plan UX Redesign and App-Wide Design System

**Feature Branch**: `004-app-wide-ux-redesign`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "1. the label for the chair should only include the number 2. long table and round table label can show table only 3. the chair is not evenly space around the round table, long table is working properly 4. when dragging the item in the canvas, it's easy to drag the canvas and i cant seem to rotate the item even though it was part of the specification in earlier implementation 5. use frontend-design skill to make the UI more intuitive, also come out with design system for glassmorphism style 6. As a product designer, think how a end user would love to use the website. UPDATE: Stories 5 and 6 apply to the entire application and all features built so far — not just the floor plan editor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Item Labels (Priority: P1)

A couple or admin places tables and chairs on the floor plan canvas. They want labels to be clean and uncluttered — chair labels show only the seat number (e.g., "1", "2", "3") without a "Chair" prefix, and table labels show only the table name (e.g., "Table 1", "Table 2") without redundant type descriptors.

**Why this priority**: Labels are visible on every single item at all times. Bloated labels clutter the canvas and reduce usability every time the editor is opened.

**Independent Test**: Place a round table with 6 chairs. Verify each chair shows only its number and the table shows only "Table N" — no "Chair" prefix, no type labels.

**Acceptance Scenarios**:

1. **Given** a round table with 6 chairs on the canvas, **When** the user views the labels, **Then** each chair displays only its number (e.g., "1", "2") and the table displays only "Table N"
2. **Given** a long table with chairs on the canvas, **When** the user views the labels, **Then** chair labels show only numbers and the table label shows only "Table N"
3. **Given** a user double-clicks a chair label, **When** they edit the text, **Then** the label updates to show their custom text

---

### User Story 2 - Evenly Spaced Chairs Around Round Tables (Priority: P1)

A couple is arranging a round table with 8 chairs. They expect the chairs to be evenly distributed around the table circumference, forming a symmetrical circle. Currently, chairs appear unevenly spaced, making the floor plan look unprofessional.

**Why this priority**: This is a visual correctness bug. An uneven arrangement immediately signals poor quality and undermines trust in the tool. Long tables already work correctly.

**Independent Test**: Place round tables of different sizes (3ft, 4ft, 5ft, 6ft) with default chair counts. Verify all chairs are equidistant from each other around each table's circumference.

**Acceptance Scenarios**:

1. **Given** a 5ft round table with 8 chairs, **When** the user views the arrangement, **Then** all chairs are evenly spaced at equal angular intervals around the table
2. **Given** any round table size (3ft–7ft), **When** chairs are generated at any valid count, **Then** the angular distance between adjacent chairs is identical
3. **Given** a round table with chairs, **When** the user increases or decreases the chair count, **Then** chairs redistribute evenly around the circumference

---

### User Story 3 - Precise Item Dragging Without Canvas Panning (Priority: P1)

A couple is fine-tuning table positions on the floor plan. When they click and drag a table, the item should move reliably without accidentally panning the entire canvas. Currently, it's too easy to accidentally drag the canvas background instead of the intended item.

**Why this priority**: Dragging is the most fundamental canvas interaction. If users can't reliably move items, the entire editor becomes frustrating to use.

**Independent Test**: Place 3 items on the canvas. Drag each one to a new position. Verify each item moves to the intended location without any unintended canvas panning.

**Acceptance Scenarios**:

1. **Given** an item on the canvas, **When** the user clicks and drags on the item, **Then** only the item moves and the canvas stays in place
2. **Given** an item on the canvas, **When** the user clicks and drags on empty canvas space, **Then** the canvas pans and items stay in their positions
3. **Given** a table with attached chairs, **When** the user drags the table, **Then** all child chairs move together with the table
4. **Given** a densely packed floor plan, **When** the user clicks near an item's edge (within the widened hit area), **Then** the item (not the canvas) is grabbed and moved

---

### User Story 4 - Item Rotation (Priority: P2)

A couple wants to rotate long tables and other items to fit their venue layout. They should be able to rotate selected items using intuitive controls — either a rotation handle on the item or a toolbar button.

**Why this priority**: Rotation was specified in an earlier implementation but never surfaced in the UI. Without it, users cannot create realistic layouts for rectangular tables or stages.

**Independent Test**: Place a long table on the canvas. Rotate it 90 degrees. Verify the table and its chairs rotate correctly and collision detection still works.

**Acceptance Scenarios**:

1. **Given** a selected item on the canvas, **When** the user activates rotation, **Then** the item rotates smoothly around its center
2. **Given** a long table with chairs, **When** the user rotates the table, **Then** all attached chairs rotate with it maintaining their relative positions
3. **Given** a rotated item, **When** collision detection runs, **Then** collisions are detected correctly accounting for the rotation angle
4. **Given** a selected item, **When** the user uses a rotation control (handle or button), **Then** the item can be rotated in 15-degree increments and freely

---

### User Story 5 - App-Wide Glassmorphism Design System (Priority: P2)

A user interacts with the wedding management system — from the moment they land on the login page, through the dashboard, admin panels, wedding landing pages, RSVP forms, and floor plan editor. Every screen presents a cohesive, modern visual language using glassmorphism: translucent frosted-glass cards, panels, and overlays with backdrop blur, subtle borders, and layered depth. The design system unifies all pages under a single aesthetic identity.

**Why this priority**: Visual design is the first impression. A polished, modern UI builds trust and makes the tool feel professional, directly impacting user engagement and satisfaction. Inconsistency across pages (plain login vs styled dashboard) breaks that trust.

**Independent Test**: Navigate through every page of the application. Verify that cards, panels, forms, navigation, and overlays all use a consistent glassmorphism style with translucent backgrounds, backdrop blur, and subtle borders.

**Acceptance Scenarios**:

1. **Given** the login page, **When** the user views the login card, **Then** the card uses a frosted-glass effect with translucent background and backdrop blur
2. **Given** the couple's dashboard, **When** the user views the sidebar navigation, RSVP summary cards, and any panels, **Then** all surfaces display consistent glassmorphism styling
3. **Given** the admin panel, **When** the user navigates between admin pages (dashboard, couples, weddings, wedding detail), **Then** all cards, tables, and panels share the same frosted-glass visual language
4. **Given** a public wedding landing page, **When** a guest views the invitation, **Then** the RSVP button and any overlays use glassmorphism effects complementary to the background image
5. **Given** the RSVP form, **When** a guest fills out their details, **Then** the form card uses the frosted-glass design system
6. **Given** the floor plan editor, **When** the user views the sidebar, toolbar, and overlay panels, **Then** all panels display a frosted-glass effect consistent with the rest of the application
7. **Given** multiple pages across the app, **When** the user compares them, **Then** all surfaces share a consistent visual language (blur intensity, opacity levels, border style, shadow depth)
8. **Given** the glassmorphism design system is applied app-wide, **When** the user interacts on different screen sizes (mobile, tablet, desktop), **Then** the design remains readable and functional on all devices
9. **Given** the error and not-found pages, **When** the user encounters an error, **Then** the error display uses the same glassmorphism styling

---

### User Story 6 - App-Wide Intuitive Interaction Design (Priority: P3)

A user — whether a guest filling out an RSVP, a couple managing their wedding, or an admin overseeing all weddings — can navigate and use every feature of the application without confusion or external guidance. Each page provides clear visual affordances, contextual feedback, logical navigation flow, and a natural, delightful workflow.

**Why this priority**: Intuitive UX reduces the learning curve and support burden across all user types. This is the "delight" layer that transforms a functional tool into one users love and recommend to others.

**Independent Test**: Three user types complete their core tasks without guidance: a guest submits an RSVP, a couple creates a floor plan and checks their guest list, an admin creates a couple account and views wedding details. All succeed using only the interface's visual cues.

**Acceptance Scenarios**:

1. **Given** the floor plan editor with no items, **When** the user first opens it, **Then** clear visual cues guide them to add items from the catalog
2. **Given** a selected item in the floor plan, **When** the user looks for actions, **Then** available actions (move, rotate, delete, resize) are visually obvious through handles, buttons, or affordances
3. **Given** the user performs any action across the app, **When** feedback is needed (save status, form errors, collision warnings, out-of-bounds), **Then** the feedback is shown inline, unobtrusively, and in a consistent style
4. **Given** a mobile user on any page, **When** they interact with touch devices, **Then** all interactions (drag, rotate, zoom, form submission, navigation) work with touch gestures
5. **Given** the couple's dashboard, **When** the user first arrives, **Then** the page clearly communicates what actions are available (view RSVPs, manage floor plan, copy public link)
6. **Given** the admin panel, **When** the user navigates between sections, **Then** the navigation provides clear context about where they are (via breadcrumbs and active-item highlighting) and how to get to related features (via grouped nav sections with icons)
7. **Given** a public wedding landing page, **When** a guest views the invitation, **Then** the RSVP call-to-action is prominent and the flow to respond is obvious
8. **Given** the RSVP form, **When** a guest fills out their details, **Then** form validation provides clear, immediate feedback for any errors
9. **Given** any page in the application, **When** a loading state or async operation is in progress, **Then** the user sees a consistent, unobtrusive loading indicator

---

### Edge Cases

- **EC-001**: When a round table has only 1 or 2 chairs, the system MUST still position them at valid angular intervals (1 chair at 12 o'clock; 2 chairs at 180° apart)
- **EC-002**: When an item is rotated near the venue boundary, collision detection MUST account for the rotated bounding box and prevent out-of-bounds placement
- **EC-003**: When the canvas is zoomed very far in or out, labels MUST remain readable and not overlap with adjacent items
- **EC-004**: When dragging on a touch device, the hit area expansion MUST correctly distinguish item drag from canvas pan with finger input
- **EC-005**: When a chair label is edited to be very long (over 15 characters), the system MUST truncate the display with ellipsis while preserving the full text for editing
- **EC-006**: When glassmorphism renders on low-powered devices, the system MUST maintain at least 30fps during scroll/interaction; if not, reduce blur to a simpler fallback
- **EC-007**: When a wedding landing page has no background image, the glassmorphism overlay MUST render against the default gradient backdrop (rose-to-lavender-to-blue)
- **EC-008**: When browser zoom or accessibility settings change, glassmorphism effects MUST degrade gracefully — panels remain readable at 200% zoom
- **EC-009**: When admin creates a new couple, the form MUST display clear success confirmation or inline error messages for each field

## Clarifications

### Session 2026-04-20

- Q: What serves as the visual backdrop for glassmorphism on pages without a natural background image (login, dashboard, admin, error pages)? → A: Layered soft gradient with organic blob accents — diagonal base gradient (soft rose through pale lavender to sky blue) with 2-3 large semi-transparent radial gradient circles for depth. Wedding landing pages use the couple's uploaded background image instead.
- Q: Should glassmorphism apply to both HTML panels and Konva canvas items? → A: HTML panels only — Konva canvas items keep solid fills with refined colors. (See FR-008 for full scope.)
- Q: How should the system distinguish between item drag and canvas pan? → A: Wider invisible hit areas on items — clicking within a small margin around any item grabs it, only truly empty space pans the canvas.
- Q: Should the design system include a dark mode variant? → A: Light theme only — no dark mode for now.
- Q: Should the navigation be visually styled only or structurally redesigned? → A: Full redesign — glassmorphism styling, icons for each nav item, section grouping, and breadcrumbs for context.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chair labels MUST display only the chair number (e.g., "1", "2", "3") by default, with no "Chair" prefix
- **FR-002**: Table labels (both round and long) MUST display only the table name (e.g., "Table 1", "Table 2") with no additional type descriptor
- **FR-003**: Chairs around round tables MUST be evenly spaced at equal angular intervals around the table circumference
- **FR-004**: The system MUST distinguish between item drag and canvas pan using widened invisible hit areas on items — clicking within 8px margin around any item grabs the item, and only truly empty canvas space initiates panning
- **FR-005**: The system MUST provide a rotation mechanism for selected items, including tables, stages, and other placeable objects
- **FR-006**: When a table is rotated, all attached chairs MUST rotate with it, maintaining their relative positions
- **FR-007**: Collision detection MUST correctly account for item rotation when detecting overlaps
- **FR-008**: All application pages MUST use a consistent glassmorphism design system — login, dashboard, admin, wedding landing pages, RSVP forms, floor plan editor, error pages — with a layered soft gradient backdrop (rose-to-lavender-to-sky-blue diagonal gradient plus 2-3 organic radial gradient blobs) on pages without a natural background image; glassmorphism applies to HTML panels only (sidebar, toolbar, overlays, cards, forms), not to Konva canvas items
- **FR-009**: The glassmorphism design system MUST define standard tokens for blur intensity, background opacity, border style, and shadow depth, applied uniformly across all pages
- **FR-010**: Navigation MUST be fully redesigned with glassmorphism styling, icons for each nav item (using lucide-react: LayoutDashboard, Users, Grid, Heart, UserPlus), logical section grouping ("Planning" for dashboard/RSVPs/floor plan, "Management" for couples/weddings, "Overview" for admin dashboard), and breadcrumbs showing the user's current location in the app hierarchy (e.g., Admin > Weddings > [Name] > Floor Plan)
- **FR-011**: All form interactions (login, RSVP, admin forms) MUST provide immediate, clear validation feedback in a consistent style
- **FR-012**: Touch interactions MUST work correctly for drag, rotate, zoom, and form interactions on mobile devices across all pages
- **FR-013**: Labels on floor plan items MUST remain readable at all zoom levels (minimum 8px rendered text height) and not overlap with adjacent item bounding boxes
- **FR-014**: Loading states and async operations across all pages MUST display a consistent inline spinner (small animated circle, matching glassmorphism theme) positioned adjacent to the triggering action
- **FR-015**: The public wedding landing page and RSVP form MUST use glassmorphism effects that complement the background image or gradient
- **FR-016**: Glassmorphism effects MUST degrade gracefully on devices or browsers that do not support backdrop-blur

### Key Entities

- **Chair Label**: The text displayed on a chair item, defaulting to its sequence number
- **Table Label**: The text displayed on a table item, defaulting to "Table N" format
- **Chair Arrangement**: The angular positioning of chairs around a table, defined by equal angular spacing
- **Drag Interaction**: The input handling that distinguishes between item movement and canvas panning
- **Rotation Control**: A UI mechanism (handle, button, or gesture) that allows rotating selected items
- **Glassmorphism Design Token**: A reusable style value (blur, opacity, border, shadow) that ensures visual consistency across all application surfaces
- **Glass Panel**: Any card, sidebar, toolbar, form container, or overlay that uses the glassmorphism design tokens
- **Page Context Indicator**: A visual element showing the user's current location within the app hierarchy

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can place items and see clean labels (number-only for chairs, table-name-only for tables) without any redundant prefixes
- **SC-002**: Chairs around any round table appear perfectly symmetrical — adjacent chairs are equidistant from each other around the circumference
- **SC-003**: Users can drag items to any position on the canvas without accidentally panning the canvas in at least 95% of drag attempts
- **SC-004**: Users can rotate any placeable item to any angle, with the rotation completing in under 1 second from gesture to visual update
- **SC-005**: All application surfaces (login card, dashboard panels, admin cards, navigation, floor plan editor panels, RSVP form, error pages) use identical glassmorphism design tokens — same blur intensity (16px), same background opacity (30%), same border style (1px solid at 20% white opacity), and same shadow depth
- **SC-006**: A first-time user can complete their primary task within 30 seconds on any page without external guidance — guests submit an RSVP, couples place and arrange a table, admins navigate to a wedding's details
- **SC-007**: All interactions work on both desktop (mouse) and mobile (touch) without degradation across all pages
- **SC-008**: Navigation between any two pages in the application requires no more than 3 clicks/taps

## Assumptions

- Chair label editing (custom text) remains supported — only the default label format changes
- The existing label editing mechanism (double-click to edit) is preserved
- Rotation will use 15-degree snap increments by default, with free rotation available
- Glassmorphism effects use CSS `backdrop-filter: blur()` which is supported in all modern browsers
- The app-wide glassmorphism backdrop uses a layered soft gradient (soft rose → pale lavender → sky blue) with 2-3 organic radial gradient blobs for visual depth; wedding landing pages use the couple's uploaded background image instead of this gradient
- The glassmorphism design system will be defined as reusable CSS custom properties/Tailwind theme tokens applied app-wide
- Existing color coding per item type (blue for round tables, amber for long tables, purple for chairs) will be retained but refined within the glassmorphism system
- Rotation controls will include both a rotation handle on the selected item and toolbar buttons
- The canvas background itself will not use glassmorphism — only HTML overlay panels and controls will (per FR-008)
- The glassmorphism design system will include a fallback (solid backgrounds) for browsers that do not support backdrop-blur
- Light theme only — no dark mode variant for this iteration
- The navigation will be fully redesigned: glassmorphism-styled sidebar with icons per nav item, logical section grouping, and breadcrumbs on interior pages for wayfinding
- Table-based pages (admin couples, weddings, RSVP list) will retain their tabular data layout but cards and containers around them will use glassmorphism
- The wedding landing page glassmorphism will be designed to complement any background image or a default gradient when no image is provided
- The existing shadcn/ui component library will be retained; glassmorphism tokens will be applied through theme customization
- App-wide changes will maintain consistent spacing, typography, and interaction patterns as a unified design language
