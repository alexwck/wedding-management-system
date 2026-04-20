# Feature Specification: UX Polish & Floor Plan Fixes

**Feature Branch**: `003-ux-polish-floorplan-fixes`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "Default landing page redirect, file upload constraints, logout feature, admin/dashboard access control, chair rendering and spacing fixes, long table max chair count correction, null reference error fix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default Redirect After Login (Priority: P1)

A user navigating to the root URL ("/") or completing login should land on the appropriate authenticated page. Currently the root page shows a Next.js starter template instead of redirecting to the dashboard.

**Why this priority**: The root URL is the first thing users see — a broken starter page undermines trust immediately.

**Independent Test**: Navigate to "/" while logged in and verify redirect to "/dashboard" (couple) or "/admin" (admin). Navigate to "/" while logged out and verify redirect to "/auth/login".

**Acceptance Scenarios**:

1. **Given** a logged-in couple user, **When** they navigate to "/", **Then** they are redirected to "/dashboard"
2. **Given** a logged-in admin user, **When** they navigate to "/", **Then** they are redirected to "/admin"
3. **Given** an unauthenticated user, **When** they navigate to "/", **Then** they are redirected to "/auth/login"

---

### User Story 2 - Logout (Priority: P1)

Any authenticated user (admin or couple) can log out of the application and return to the login page. Currently there is no logout functionality.

**Why this priority**: Without logout, users on shared devices have no way to end their session — a basic security requirement.

**Independent Test**: Log in, click logout, verify session is terminated and user is on the login page.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click the logout button, **Then** their session is terminated and they are redirected to the login page
2. **Given** a user who just logged out, **When** they navigate to "/dashboard" or "/admin", **Then** they are redirected to "/auth/login"
3. **Given** an authenticated user, **When** they view the navigation, **Then** a logout option is visible and accessible

---

### User Story 3 - Admin Access Control (Priority: P2)

Admin users should only access "/admin" routes and be blocked from "/dashboard" routes, since "/dashboard" is for couples. Currently admins can navigate to "/dashboard" freely.

**Why this priority**: Prevents confusion where admins accidentally end up in the couple-facing interface with incorrect data or permissions.

**Independent Test**: Log in as admin, attempt to navigate to "/dashboard", verify redirect to "/admin".

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they navigate to "/dashboard" or any sub-route, **Then** they are redirected to "/admin"
2. **Given** an authenticated couple user, **When** they navigate to "/admin" or any sub-route, **Then** they are redirected to "/dashboard"
3. **Given** an authenticated couple user, **When** they navigate to "/dashboard", **Then** they see their dashboard normally

---

### User Story 4 - File Upload Constraints (Priority: P2)

When uploading a template image, the file size limit is 5MB and only JPG and PNG formats are accepted. The system rejects oversized or wrong-format files with clear error messages.

**Why this priority**: Prevents storage abuse and ensures consistent image handling across the application.

**Independent Test**: Attempt to upload files of various sizes and formats; verify rejections and acceptances.

**Acceptance Scenarios**:

1. **Given** a user uploading a template image, **When** the file is a JPG or PNG under 5MB, **Then** the upload succeeds
2. **Given** a user uploading a template image, **When** the file exceeds 5MB, **Then** a clear error message is shown indicating the 5MB limit
3. **Given** a user uploading a template image, **When** the file is a GIF, SVG, WebP, or other non-JPG/PNG format, **Then** a clear error message is shown indicating only JPG and PNG are accepted
4. **Given** a user uploading a template image, **When** the file is exactly 5MB and is JPG or PNG, **Then** the upload succeeds

---

### User Story 5 - Chair Rendering and Spacing (Priority: P2)

Chairs on the floor plan display as circles (not rectangles) with a fixed 1x1 ft size, are not user-configurable, and are positioned with adequate spacing so they do not overlap one another around tables.

**Why this priority**: Chairs that overlap are visually confusing and make the floor plan unusable for planning seating.

**Independent Test**: Place a table with maximum chairs and verify all chairs render as circles with visible gaps between them.

**Acceptance Scenarios**:

1. **Given** a round table with 8 chairs, **When** viewing the floor plan, **Then** all chairs render as circles with 1x1 ft diameter
2. **Given** any table with chairs, **When** viewing the floor plan, **Then** there is visible spacing between adjacent chairs (no overlap)
3. **Given** a selected chair item, **When** viewing the dimension editor, **Then** no dimension inputs are shown (chairs are not configurable)
4. **Given** a chair on the floor plan, **When** the user views it at any zoom level, **Then** it appears as a circle, not a rectangle

---

### User Story 6 - Long Table Chair Count Maximum (Priority: P3)

The maximum number of chairs for long tables equals the recommended (default) chair count, not the recommended count plus one. This aligns with the practical seating capacity of each table.

**Why this priority**: Incorrect chair maximums lead to over-seated tables and unrealistic floor plans.

**Independent Test**: Select a 6ft long table, verify max chairs equals the recommended count (7), not 8.

**Acceptance Scenarios**:

1. **Given** a 6ft long table, **When** the user increases chairs, **Then** the maximum allowed is 7 (the recommended count)
2. **Given** a 7ft long table, **When** the user increases chairs, **Then** the maximum allowed is 9 (the recommended count)
3. **Given** a round table of any size, **When** the user increases chairs, **Then** the maximum allowed remains one more than the recommended count (existing behavior preserved)

---

### User Story 7 - Floor Plan Selection Null Error Fix (Priority: P1)

Adding an item from the catalog to the floor plan does not crash with "Cannot read properties of null (reading 'id')". The handleSelectItem callback safely handles the addItem return value.

**Why this priority**: A crash on the most basic action (adding an item) makes the floor plan editor unusable.

**Independent Test**: Open the floor plan editor, click any item in the catalog, verify the item is added without error.

**Acceptance Scenarios**:

1. **Given** the floor plan editor is open, **When** the user clicks any item in the catalog, **Then** the item is added to the canvas without a runtime error
2. **Given** the floor plan editor is open with existing items, **When** the user adds a new item, **Then** the newly added item is automatically selected

---

### Edge Cases

- What happens when a user logs out while the auto-save is in progress?
- What happens when an admin tries to access "/dashboard/floor-plan" directly via URL?
- What happens when a user uploads a file named "image.JPG" vs "image.jpg" — are both accepted?
- What happens if a couple user has bookmarked "/admin" and their role changes?
- What happens when chair generation produces chairs that would exceed the floor plan boundary?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect unauthenticated users visiting "/" to "/auth/login"
- **FR-002**: System MUST redirect authenticated couple users visiting "/" to "/dashboard"
- **FR-003**: System MUST redirect authenticated admin users visiting "/" to "/admin"
- **FR-004**: System MUST provide a logout action accessible from the navigation for all authenticated users
- **FR-005**: System MUST terminate the user session and redirect to the login page upon logout
- **FR-006**: System MUST prevent admin users from accessing any "/dashboard" route, redirecting them to "/admin"
- **FR-007**: System MUST prevent couple users from accessing any "/admin" route, redirecting them to "/dashboard"
- **FR-008**: System MUST reject uploaded files larger than 5MB with a clear error message
- **FR-009**: System MUST only accept JPG and PNG file formats for template image uploads, rejecting all other formats with a clear error message
- **FR-010**: System MUST render chairs as circles on the floor plan canvas with a fixed 1x1 ft diameter
- **FR-011**: System MUST NOT allow users to modify chair dimensions (width/height inputs must not appear for chair items)
- **FR-012**: System MUST position chairs around tables with sufficient spacing to prevent visual overlap between adjacent chairs
- **FR-013**: System MUST set the maximum chair count for long tables to the recommended (default) chair count for that table size, not the recommended count plus one
- **FR-014**: System MUST preserve the existing round table maximum chair count behavior (recommended + 1)
- **FR-015**: System MUST handle null return values from addItem without crashing, ensuring the floor plan editor remains usable

### Key Entities

- **User Session**: Authentication state determining role (admin/couple) and access permissions
- **Chair Item**: Floor plan element with fixed 1x1 ft circular dimensions, positioned relative to parent table
- **Template Image Upload**: Image file constrained to JPG/PNG format and 5MB maximum size

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All authenticated users can log out in a single click from any page
- **SC-002**: Navigating to "/" always redirects within 1 second to the correct destination based on auth state and role
- **SC-003**: Zero runtime errors occur when adding any item type from the catalog to the floor plan
- **SC-004**: Chairs around any table configuration are visually distinct with no overlapping areas
- **SC-005**: File uploads over 5MB or in non-JPG/PNG formats are rejected before reaching the server
- **SC-006**: Admin users cannot reach any dashboard page, and couple users cannot reach any admin page

## Assumptions

- The root page redirect can be implemented as a server-side redirect rather than a client-side navigation for better performance
- Logout clears the Supabase session and removes all auth cookies
- The shared Nav component and FloorPlanCanvas component between admin and couple roles are appropriate shared code (not duplicates) — they render differently based on role context
- JPG includes both ".jpg" and ".jpeg" extensions, both mapped to "image/jpeg" MIME type
- Chair spacing should account for the 1x1 ft diameter with at least 0.25 ft gap between chair edges
- The null reference error in handleSelectItem is caused by addItem returning null in certain React rendering states — a simple null guard is the fix
- Client-side file validation (format and size) is sufficient for UX; server-side validation already exists as a safety net
