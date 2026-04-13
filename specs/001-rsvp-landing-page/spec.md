# Feature Specification: RSVP Landing Page & Form

**Feature Branch**: `001-rsvp-landing-page`
**Created**: 2026-04-13
**Status**: Draft
**Input**: User description: "Wedding management system with authentication, landing page with Canva template upload, and RSVP form with duplicate submission prevention"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Uploads Wedding Invitation (Priority: P1)

An administrator logs in and uploads a Canva-designed wedding invitation
template to create a landing page. The template includes a CTA button
that guests will click to access the RSVP form. The admin can preview the
landing page before sharing it.

**Why this priority**: Without a landing page there is no entry point for
guests. This is the foundational feature everything else depends on.

**Independent Test**: Admin can log in, upload a Canva image/template,
see it rendered as a landing page with a CTA button, and get a shareable
link. Delivers value as a standalone digital invitation.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they upload a Canva template
   image, **Then** the system creates a landing page displaying the image
   with an overlaying CTA button linking to the RSVP form.
2. **Given** an admin has uploaded a template, **When** they view the
   landing page, **Then** the page is mobile-responsive and the CTA
   button is prominently visible on all screen sizes.
3. **Given** an admin has created a landing page, **When** they copy the
   shareable link, **Then** anyone with the link can view the landing
   page without needing to log in.

---

### User Story 2 - Guest Submits RSVP (Priority: P1)

A guest receives the shared link, views the wedding invitation landing
page, clicks the CTA button, and fills out the RSVP form. The form
collects: RSVP status (attending/declining), dietary notes (free text),
vegetarian preference (checkbox), and baby chair requirement (checkbox).
Once a name has submitted an RSVP, the same name cannot submit again.

**Why this priority**: RSVP collection is the core purpose of the system.
This is co-equal with the landing page as the minimum viable product.

**Independent Test**: A guest opens the shared link, clicks CTA, fills
in their name and details, submits, and sees a confirmation. Attempting
to submit again with the same name shows a message that they have already
RSVPed.

**Acceptance Scenarios**:

1. **Given** a guest has the landing page link, **When** they click the
   CTA button, **Then** they are taken to the RSVP form.
2. **Given** a guest is on the RSVP form, **When** they fill in their
   name, select RSVP status, optionally add dietary notes, vegetarian
   preference, and baby chair requirement, and submit, **Then** they
   see a confirmation message.
3. **Given** a guest named "John Tan" has already submitted an RSVP,
   **When** someone tries to submit an RSVP with the name "John Tan"
   again, **Then** the system prevents the duplicate submission and
   shows a message indicating the name has already been registered.
4. **Given** a guest is viewing the RSVP form on a mobile device,
   **When** they interact with the form, **Then** all fields, checkboxes,
   and the submit button are usable without horizontal scrolling.

---

### User Story 3 - Couple Views Their RSVP Responses (Priority: P2)

A couple logs in and views all RSVP responses for their wedding. They can
see a summary of attending/declining guests, dietary requirements, and
baby chair counts. They can only access their own wedding's data.

**Why this priority**: The couple needs to see responses to plan their
wedding (seating, catering, etc.), but the system delivers value to
guests even without this view.

**Independent Test**: A couple logs in, sees a dashboard listing all
RSVPs for their wedding with counts and details. They cannot access
another couple's data.

**Acceptance Scenarios**:

1. **Given** a couple is logged in, **When** they navigate to their
   dashboard, **Then** they see a list of all RSVP responses for their
   wedding.
2. **Given** a couple views their dashboard, **When** they look at the
   summary, **Then** they see counts of attending guests, declining
   guests, vegetarian meals, and baby chairs required.
3. **Given** a couple is logged in, **When** they attempt to access
   another couple's wedding data, **Then** the system denies access.

---

### User Story 4 - Admin Manages All Weddings (Priority: P2)

An administrator can view all weddings, see all RSVP responses across
all couples, and manage landing pages and RSVP forms for any couple.

**Why this priority**: Admin oversight is important for system management
but the system works for guests without it.

**Independent Test**: Admin logs in, sees a list of all weddings, can
click into any wedding to view its landing page and RSVP responses.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to the admin
   dashboard, **Then** they see all weddings in the system.
2. **Given** an admin views the admin dashboard, **When** they select a
   wedding, **Then** they can view and manage that wedding's landing page
   and all RSVP responses.

---

### Edge Cases

- What happens when a guest submits a name with different casing
  (e.g., "John Tan" vs "john tan")? Duplicate detection should be
  case-insensitive.
- What happens when a guest submits a very long dietary note? The text
  box should have a reasonable character limit.
- What happens if the uploaded Canva template is very large? The system
  should enforce a maximum file size.
- What happens if someone accesses the RSVP form URL directly without
  a valid wedding association? The system should show an error.
- What happens if a couple has not yet uploaded a landing page template?
  The system should show a placeholder or setup prompt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to upload a Canva-designed
  image to serve as the wedding landing page background.
- **FR-002**: System MUST display a CTA button overlaid on the landing
  page that links to the RSVP form.
- **FR-003**: System MUST generate a shareable link for each landing page
  that is accessible without authentication.
- **FR-004**: RSVP form MUST collect: guest name, RSVP status
  (attending/declining), dietary notes (text), vegetarian (checkbox),
  baby chair required (checkbox).
- **FR-005**: System MUST prevent duplicate RSVP submissions based on
  guest name (case-insensitive matching) per wedding.
- **FR-006**: System MUST show a clear message when a duplicate name is
  detected instead of accepting the submission.
- **FR-007**: System MUST provide authentication for couples and admins.
- **FR-008**: Couples MUST only be able to access their own wedding's
  data (landing page, RSVP responses).
- **FR-009**: Admins MUST be able to access all weddings and all RSVP
  data.
- **FR-010**: Each landing page and RSVP form MUST be tied to a specific
  couple's wedding.
- **FR-011**: Public guests accessing via the shared link MUST be able to
  view the landing page and submit the RSVP form without authentication.
- **FR-012**: All pages MUST be mobile-responsive.
- **FR-013**: System MUST enforce a maximum upload file size for Canva
  templates.

### Key Entities

- **Wedding**: Represents a couple's wedding event. Has an associated
  landing page and RSVP form. Belongs to a couple (user account).
- **Landing Page**: Contains the uploaded Canva template image and a CTA
  button. Has a unique shareable link. Tied to one Wedding.
- **RSVP Response**: Contains guest name, RSVP status (attending/declining),
  dietary notes, vegetarian preference, baby chair requirement. Tied to
  one Wedding. Guest name is unique per Wedding.
- **User (Couple)**: An authenticated user who owns a Wedding. Can only
  access their own data.
- **Admin**: An authenticated user with access to all Weddings and data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A guest can view a landing page and complete an RSVP
  submission in under 2 minutes on a mobile device.
- **SC-002**: The landing page renders correctly on screens from 320px
  to 2560px width without horizontal scrolling.
- **SC-003**: Duplicate RSVP detection prevents 100% of same-name
  submissions per wedding.
- **SC-004**: Couples can view their RSVP summary within 3 clicks of
  logging in.
- **SC-005**: Landing page load time is under 3 seconds on a standard
  mobile connection.

## Assumptions

- Each couple account corresponds to exactly one wedding. If a couple
  has multiple events (e.g., separate ceremonies), each would be a
  separate account or handled in a future feature.
- The Canva template is uploaded as a static image file (PNG/JPG). The
  CTA button is overlaid by the system, not embedded in the Canva design.
- Guest name is the sole identifier for duplicate detection. No email
  or phone is collected in this version.
- "RSVP status" has two options: attending and declining. A "maybe" or
  "pending" option is out of scope for this version.
- The system supports one landing page per wedding. Multiple landing
  pages per wedding is out of scope.
- File size limit for Canva uploads defaults to 10MB.
- Dietary notes text box has a 500-character limit.
