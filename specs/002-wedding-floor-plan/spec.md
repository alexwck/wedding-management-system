# Feature Specification: Wedding Floor Plan Designer

**Feature Branch**: `002-wedding-floor-plan`
**Created**: 2026-04-19
**Status**: Draft
**Input**: User description: "Build a page to customise wedding floor plans with drag-and-drop items, automatic chair population, and dimension controls. Access restricted to admin and couples."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Configure a Floor Plan (Priority: P1)

A couple or admin sets up a new floor plan for a wedding by defining the venue dimensions and begins placing furniture items on the canvas.

**Why this priority**: Without a floor plan canvas with configurable dimensions, no other features can function. This is the foundation.

**Independent Test**: Can be fully tested by navigating to the floor plan page, entering width/height dimensions, and verifying the canvas renders at those dimensions.

**Acceptance Scenarios**:

1. **Given** a couple is logged in and viewing their wedding, **When** they navigate to the floor plan page, **Then** they see a canvas area with dimension input controls for width and height
2. **Given** the floor plan page is open, **When** the user enters width "60" and height "40" (in feet), **Then** the canvas resizes to reflect a 60ft x 40ft venue space
3. **Given** a floor plan exists with dimensions set, **When** the user changes the dimensions to smaller values, **Then** any placed items that fall outside the new boundary are flagged or repositioned
4. **Given** a user is on the floor plan page, **When** they set dimensions, **Then** the changes are persisted automatically so they can return later and find their floor plan intact

---

### User Story 2 - Place and Arrange Items on the Floor Plan (Priority: P2)

A user selects furniture items from a catalog and places them on the floor plan canvas, positioning them via drag-and-drop with collision detection.

**Why this priority**: Placing items is the core value proposition — it's what makes the floor plan useful for planning the wedding layout.

**Independent Test**: Can be fully tested by selecting an item from the catalog, placing it on the canvas, and verifying it appears at the correct position with the correct dimensions.

**Acceptance Scenarios**:

1. **Given** the floor plan canvas is open with dimensions set, **When** the user clicks an item from the item catalog (e.g., "6ft Round Table"), **Then** the item appears on the canvas at a default position with its correct physical dimensions and a default label (e.g., "Round Table 1")
2. **Given** an item is placed on the canvas, **When** the user drags it to a new position, **Then** the item moves to the new location and its coordinates update
3. **Given** two items are on the canvas, **When** the user drags one item to overlap another, **Then** the system prevents the overlap and the items snap apart or the user receives a visual collision warning
4. **Given** an item is placed on the canvas, **When** the user attempts to move or resize it beyond the floor plan boundary, **Then** the item is constrained to remain within the canvas bounds
5. **Given** an item is placed, **When** the user selects it and applies a rotation, **Then** the item rotates freely to any angle the user desires while staying within bounds
6. **Given** a placed item with a default label (e.g., "Round Table 1"), **When** the user clicks on the label, **Then** they can edit the label text to a custom name
7. **Given** multiple items of the same type are placed, **When** each is added, **Then** each receives an incrementing number (e.g., "Round Table 1", "Round Table 2", "Chair 1", "Chair 2")

---

### User Story 3 - Automatic Chair Population Around Tables (Priority: P3)

When a user places a table on the floor plan, chairs are automatically generated and arranged around it based on the table type and size.

**Why this priority**: Automatic chair arrangement saves significant time and ensures realistic seating layouts, but it builds on top of the basic item placement.

**Independent Test**: Can be fully tested by placing each table type on the canvas and verifying chairs appear with correct count and positioning.

**Acceptance Scenarios**:

1. **Given** the user places a round table (e.g., 6ft diameter), **When** the table is placed on the canvas, **Then** chairs are automatically generated in a circle around the table edge — 8 to 10 chairs for a 6ft round table
2. **Given** the user places a Viking/long table (e.g., 6ft long), **When** the table is placed on the canvas, **Then** chairs appear along the top and bottom sides only, evenly distributed, facing inward
3. **Given** a table with auto-generated chairs exists, **When** the user moves the table, **Then** all associated chairs move with it as a group
4. **Given** a table with chairs, **When** the user removes the table, **Then** all associated chairs are also removed

**Chair Seating Capacities**:

| Table Type | Size | Recommended Chairs |
|------------|------|--------------------|
| Round | 3ft diameter | 2–4 |
| Round | 4ft diameter | 4–6 |
| Round | 5ft diameter | 6–8 |
| Round | 6ft diameter | 8–10 |
| Round | 7ft diameter | 10–12 |
| Viking/Long | 6ft x 2.5ft | 6–8 (3–4 per side) |
| Viking/Long | 7ft x 2.5ft | 8–10 (4–5 per side) |

---

### User Story 4 - Canvas Navigation and Zoom (Priority: P4)

A user pans and zooms the floor plan canvas to view different areas, especially useful for large venues or on smaller screens.

**Why this priority**: Navigation is essential for usability on large floor plans and mobile devices, but the feature works minimally without it.

**Independent Test**: Can be fully tested by loading a floor plan and verifying pan/zoom controls work with both mouse and touch input.

**Acceptance Scenarios**:

1. **Given** the floor plan canvas is displayed, **When** the user scrolls or pinches, **Then** the canvas zooms in/out centered on the cursor/finger position
2. **Given** the canvas is zoomed in, **When** the user clicks and drags on empty space, **Then** the canvas pans to show a different area
3. **Given** a user on a mobile device, **When** they use touch gestures (pinch to zoom, two-finger drag to pan), **Then** the canvas responds identically to desktop mouse interactions

---

### User Story 5 - Access Control for Floor Plans (Priority: P5)

Admin users can access and edit floor plans for all weddings, while couple users can only access and edit their own wedding's floor plan. Unauthenticated guests cannot access floor plans at all.

**Why this priority**: Access control is essential for security but can be layered on top of the existing auth system — the floor plan itself is functional without unique permissions.

**Independent Test**: Can be fully tested by logging in as different user roles and verifying each can only access the appropriate floor plans.

**Acceptance Scenarios**:

1. **Given** a couple is logged in, **When** they navigate to the floor plan page, **Then** they see only their own wedding's floor plan
2. **Given** an admin is logged in, **When** they navigate to the floor plan management area, **Then** they can see and select floor plans for any wedding
3. **Given** an unauthenticated user, **When** they attempt to access a floor plan URL, **Then** they are redirected to the login page

---

### Edge Cases

- What happens when a user sets floor plan dimensions smaller than an already-placed item? The item should be flagged as out-of-bounds or the dimension change should be rejected with a warning.
- What happens when two items are placed at the exact same coordinates? Collision detection should prevent this overlap.
- What happens when the user rotates a long table near the canvas edge? The system should prevent the rotation if it would cause the item to exceed the boundary, regardless of the rotation angle.
- What happens if the browser tab is closed without explicit save? Floor plan state should auto-save periodically so minimal work is lost.
- How does the system handle very large venues (e.g., 200ft x 200ft)? The canvas should support zooming out to fit the full plan while maintaining readable item labels.
- What happens when a user removes an item that other items depend on (e.g., removing a table with auto-generated chairs)? All dependent items (chairs) should be removed together.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated floor plan page accessible only to authenticated admin and couple users
- **FR-002**: The system MUST allow users to define the floor plan dimensions (width and height in feet)
- **FR-003**: The system MUST provide a catalog of placeable items: Round Tables (3ft, 4ft, 5ft, 6ft, 7ft diameter), Viking/Long Tables (6ft x 2.5ft, 7ft x 2.5ft), Stage, Pillar, Walkway, and Misc items. Tables have fixed dimensions; Stage, Pillar, Walkway, and Misc items have user-configurable dimensions
- **FR-004**: The system MUST allow users to place items on the floor plan canvas by selecting from the catalog
- **FR-005**: The system MUST constrain all placed items within the floor plan boundary dimensions
- **FR-006**: The system MUST support drag-and-drop repositioning of placed items
- **FR-007**: The system MUST support free rotation of placed items to any user-specified angle
- **FR-008**: The system MUST detect and prevent collisions between placed items
- **FR-009**: The system MUST automatically generate and arrange chairs around tables when placed:
  - Round tables: chairs in a circle around the table edge, evenly spaced, facing inward
  - Viking/long tables: chairs along top and bottom sides only, evenly distributed, facing inward
- **FR-010**: The system MUST associate auto-generated chairs with their parent table — moving or removing a table moves or removes its chairs
- **FR-011**: The system MUST support pan and zoom on the canvas for navigation
- **FR-012**: The system MUST support touch input (pinch-to-zoom, two-finger pan, tap-to-place) for mobile devices
- **FR-013**: The system MUST persist the floor plan state (dimensions, placed items with positions and rotations) so users can return to a saved layout
- **FR-014**: The system MUST enforce access control: couples can only access their own wedding's floor plan; admins can access all floor plans
- **FR-015**: The system MUST allow users to remove individual items from the floor plan
- **FR-016**: The system MUST prevent placing an item whose dimensions exceed the remaining unoccupied floor plan space
- **FR-017**: The system MUST assign a default label to each placed item consisting of the item type name followed by an incrementing number (e.g., "Round Table 1", "Round Table 2", "Chair 1", "Chair 2")
- **FR-018**: The system MUST display the label on or near each item on the canvas
- **FR-019**: The system MUST allow authenticated admin and couple users to edit the label of any placed item
- **FR-020**: The system MUST allow authenticated admin and couple users to set custom dimensions (width and height) for Stage, Pillar, Walkway, Misc, and Chair items when placing them or after placement

### Key Entities

- **Floor Plan**: Represents the venue space with configurable width and height dimensions. Belongs to one wedding. Contains placed items.
- **Placed Item**: A furniture or fixture item positioned on the floor plan. Has a type (round table, long table, stage, pillar, walkway, misc), physical dimensions, position (x, y coordinates), rotation angle, a label (defaulting to type name + incrementing number, e.g. "Chair 3"), and optional parent/child relationships (e.g., chairs belonging to a table).
- **Item Catalog**: The predefined set of available items with their types, sizes, and default chair capacities. This is a static reference, not user-configurable.
- **Chair**: A seating item auto-generated and grouped with a parent table. Inherits its position relative to the parent table. Receives an incrementing label (e.g., "Chair 1", "Chair 2"). Default size is 2ft x 2ft, configurable by authenticated users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set floor plan dimensions and place their first item within 30 seconds of opening the page
- **SC-002**: The canvas renders and responds to interactions (drag, zoom, pan) without noticeable lag for floor plans containing up to 50 placed items
- **SC-003**: 90% of users can create a complete wedding layout (10+ tables with chairs, stage, walkway) without needing external help or documentation
- **SC-004**: Collision detection prevents 100% of item overlaps in both desktop and mobile interactions
- **SC-005**: Touch interactions on mobile devices perform identically to desktop mouse interactions for all core operations (place, drag, rotate, zoom, pan)
- **SC-006**: A user can close and reopen the page, and their floor plan loads with all items in their saved positions within 3 seconds
- **SC-007**: Chair generation is instantaneous — chairs appear at the same time as the parent table with no perceptible delay

## Assumptions

- Users have stable internet connectivity (floor plan requires a browser; no offline mode needed for v1)
- Measurements are in feet (not meters) based on the user's specification using "ft" units
- Stage, Pillar, Walkway, and Misc items do not have fixed dimensions — authenticated users specify the width and height when placing or editing these items
- Round Tables and Viking/Long Tables have fixed dimensions per size variant and are not user-resizable
- Chair dimensions default to 2ft x 2ft but are user-configurable by authenticated admin and couple users
- Each wedding has exactly one floor plan (one-to-one relationship)
- Floor plans are accessible via the existing authenticated route structure (admin routes and couple dashboard routes)
- The existing Supabase auth and RLS system will be extended for floor plan access control
- "Misc items" refers to general-purpose rectangular items that users can label (e.g., bar, DJ booth, gift table)
- Rotation is free-form — users can rotate items to any angle, not limited to fixed increments
- The floor plan canvas supports a maximum venue size of 300ft x 300ft
