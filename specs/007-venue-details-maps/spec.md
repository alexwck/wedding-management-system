# Feature Specification: Venue Details with Embedded Maps

**Feature Branch**: `007-venue-details-maps`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "Add wedding venue details with embedded maps. Admins and couples can set a venue name, venue address, and welcome message on the wedding detail page. Venue address uses Nominatim (OpenStreetMap) geocoding to search and autocomplete — selecting a result stores the formatted address and coordinates. The public RSVP page displays the couple name, wedding date, venue with an embedded Google Maps iframe, "Open in Maps" and "Navigate with Waze" buttons, and the welcome message in a styled section above the RSVP form. The venue details are stored in new columns on the weddings table (venue, venue_address, venue_coordinates, welcome_message)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Sets Venue Details (Priority: P1)

An admin or couple navigates to the wedding detail page and fills in the venue name, searches for the venue address using an autocomplete search field powered by a free geocoding service, and writes a welcome message. When they type into the address field, suggestions appear from the geocoding provider. Selecting a suggestion populates the formatted address and stores the latitude/longitude coordinates. All venue fields are saved together with the wedding record.

**Why this priority**: Without venue data entry, no other venue features work. This is the data foundation.

**Independent Test**: Can be fully tested by navigating to a wedding detail page, entering venue fields, saving, and verifying the data persists on reload.

**Acceptance Scenarios**:

1. **Given** an admin is on a wedding detail page, **When** they fill in venue name, search and select an address from autocomplete suggestions, enter a welcome message, and save, **Then** all venue fields are persisted and visible on reload.
2. **Given** an admin types a partial address into the venue address search, **When** at least 3 characters are entered, **Then** geocoding autocomplete suggestions appear within 2 seconds.
3. **Given** an admin has entered venue details, **When** they clear the venue address field and save, **Then** the venue coordinates are also cleared (address and coordinates are treated as a unit).
4. **Given** a couple user accesses their own wedding detail page, **When** they view venue fields, **Then** they can edit venue name, address, and welcome message the same as an admin.

---

### User Story 2 - Guest Sees Venue on Landing Page (Conversion Hook) (Priority: P1)

A guest opens the wedding landing page and sees the template image enhanced with an overlay showing the couple name, wedding date, venue name, and the couple's welcome message. This emotional content creates urgency and personal connection, motivating the guest to click "RSVP Now."

**Why this priority**: The landing page is the top of the conversion funnel. Venue name, date, and a personal welcome message create the emotional pull that drives guests to click through to RSVP. This is the highest-leverage UX change for conversion rate.

**Independent Test**: Can be tested by visiting a public wedding landing page with venue data saved, verifying the venue info and welcome message appear alongside the template image and RSVP button.

**Acceptance Scenarios**:

1. **Given** a wedding has venue details saved, **When** a guest visits the landing page, **Then** a styled info section displays the couple name, wedding date, venue name, and welcome message over or alongside the template image.
2. **Given** a wedding has a welcome message but no venue, **When** a guest visits the landing page, **Then** the welcome message and wedding date are still displayed (venue name is omitted gracefully).
3. **Given** a wedding has no venue details and no welcome message, **When** a guest visits the landing page, **Then** the page displays as it does today with no venue section — no empty containers or broken layout.
4. **Given** a guest views the landing page on mobile, **When** the venue info section is displayed, **Then** it is readable and does not obscure the "RSVP Now" button.

---

### User Story 3 - Guest Sees Venue Map on RSVP Form (Conversion Closer) (Priority: P1)

After clicking "RSVP Now," the guest lands on the RSVP form page and sees a venue details section above the form showing the venue name, venue address, an embedded map centered on the venue coordinates, "Open in Maps" and "Navigate with Waze" action buttons, and the couple's welcome message. This logistics content reassures the guest about travel planning, reducing form abandonment.

**Why this priority**: The RSVP form page is the bottom of the funnel. After the emotional hook gets them to click, the map and navigation details provide practical confidence to complete the RSVP. Without this, guests may abandon because they can't plan their trip.

**Independent Test**: Can be fully tested by navigating to the RSVP form for a wedding with venue data, verifying the map renders, navigation buttons link correctly, and the welcome message appears.

**Acceptance Scenarios**:

1. **Given** a wedding has full venue details, **When** a guest visits the RSVP form page, **Then** a venue section above the form displays venue name, address, embedded map, "Open in Maps" button, "Navigate with Waze" button, and welcome message.
2. **Given** a wedding has venue coordinates saved, **When** the RSVP form page loads, **Then** an embedded map renders centered on those coordinates.
3. **Given** the venue section is displayed on the RSVP form, **When** a guest taps "Open in Maps", **Then** they are directed to Google Maps at the venue coordinates. **When** they tap "Navigate with Waze", **Then** they are directed to Waze navigation at the venue coordinates.
4. **Given** a wedding has no venue details, **When** a guest visits the RSVP form page, **Then** no venue section appears and the form displays normally.
5. **Given** a wedding has a venue name but no coordinates, **When** a guest visits the RSVP form page, **Then** the venue name and address are shown as text, but the map and navigation buttons are hidden.

---

### User Story 4 - Address Autocomplete UX (Priority: P2)

An admin or couple interacts with the venue address search field and experiences a smooth autocomplete experience: results appear as they type, selecting a result populates the field, and the search respects the geocoding provider's rate limits to avoid errors.

**Why this priority**: Enhances the data entry experience but the core save/load works without polished autocomplete.

**Independent Test**: Can be tested by typing various queries into the address field and verifying suggestions appear, can be selected, and the field updates correctly.

**Acceptance Scenarios**:

1. **Given** an admin focuses the address search field, **When** they type at least 3 characters, **Then** geocoding search results appear as a dropdown list with formatted address labels.
2. **Given** autocomplete results are showing, **When** the admin clicks a result, **Then** the address field updates to the selected formatted address and coordinates are stored.
3. **Given** the admin is typing rapidly, **When** multiple keystrokes occur within a short window, **Then** requests are debounced to respect the geocoding provider's rate limits.

---

### Edge Cases

- What happens when the geocoding service returns no results for an address query? Display a "No results found" message in the dropdown.
- What happens when the geocoding service is unavailable or returns an error? Display a graceful error message; allow manual text entry for the address field without coordinates.
- What happens when venue coordinates are present but the embedded map fails to load? Show the address text and navigation buttons as fallback; the map area shows a placeholder or is hidden.
- What happens when a wedding has a venue name but no address or coordinates? Display the venue name text only; hide the map and navigation buttons.
- What happens when coordinates are near-null (0,0) or obviously invalid? Treat as no coordinates — hide the map and navigation buttons.

## Clarifications

### Session 2026-04-24

- Q: What is the maximum allowed length for the welcome message? → A: 500 characters (~2-3 paragraphs)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins and couples to set a venue name on each wedding record.
- **FR-002**: System MUST allow admins and couples to set a venue address with free geocoding autocomplete (provider chosen at implementation time; must be a free API).
- **FR-003**: System MUST store the selected formatted address and geographic coordinates (latitude/longitude) when a geocoding result is chosen.
- **FR-004**: System MUST allow admins and couples to set a welcome message on each wedding record, with a maximum length of 500 characters.
- **FR-005**: System MUST debounce geocoding API calls to respect the provider's rate limit.
- **FR-006**: System MUST require a minimum of 3 characters before triggering address autocomplete search.
- **FR-007**: System MUST display an info section on the public landing page showing couple name, wedding date, venue name, and welcome message when any of these fields are present. This section creates emotional pull to drive RSVP clicks (top of funnel).
- **FR-008**: System MUST display a logistics section on the RSVP form page showing venue name, venue address, embedded map, "Open in Maps" button, "Navigate with Waze" button, and welcome message when venue data exists. This section provides travel confidence to reduce form abandonment (bottom of funnel).
- **FR-009**: System MUST embed a map centered on the venue coordinates on the RSVP form page (using a free embed method that requires no paid API key). The map is NOT shown on the landing page to keep the focus on the RSVP CTA.
- **FR-010**: System MUST provide an "Open in Maps" button linking to Google Maps at the venue coordinates (RSVP form page only).
- **FR-011**: System MUST provide a "Navigate with Waze" button linking to Waze navigation at the venue coordinates (RSVP form page only).
- **FR-012**: System MUST hide the venue info section on both pages when no venue data or welcome message is present, showing the pages as they exist today.
- **FR-013**: System MUST handle geocoding service failures gracefully by showing an error message and allowing manual address text entry.
- **FR-014**: System MUST clear coordinates when the venue address field is cleared by the user.
- **FR-015**: System MUST store venue data in new columns on the existing weddings table: venue (text), venue_address (text), venue_coordinates (point), welcome_message (text).

### Key Entities

- **Wedding** (existing): Extended with venue_name, venue_address, venue_coordinates (lat/lng point), and welcome_message. One venue per wedding.
- **Venue Address Search Result**: Transient entity representing a geocoding result with display_name, latitude, and longitude. Not persisted independently — only the selected result's data is stored on the Wedding.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins and couples can set all venue fields and save in under 30 seconds.
- **SC-002**: Address autocomplete suggestions appear within 2 seconds of typing 3+ characters.
- **SC-003**: Guests viewing the public landing page see venue info (date, venue name, welcome message) render within normal page load time.
- **SC-004**: Guests viewing the RSVP form page see the map and logistics section render within normal page load time (no perceptible delay from the map embed).
- **SC-005**: All venue fields persist correctly after save and page reload.
- **SC-006**: Navigation buttons direct guests to the correct location in Google Maps and Waze.
- **SC-007**: Both pages gracefully adapt when venue data is partially filled (name only, name + address, full details, welcome message only).

## Assumptions

- A free geocoding API is used for address search (e.g., Nominatim/OpenStreetMap, or any free alternative). The specific provider is an implementation choice; the constraint is that it must be free to use.
- A free map embed method is used for displaying the venue location (e.g., Google Maps iframe, OpenStreetMap embed). No paid API key should be required.
- Venue editing happens inline on the existing wedding detail page, not on a separate settings page.
- All venue fields are optional — a wedding can exist without any venue information.
- The `venue_coordinates` column uses PostgreSQL's native `point` type for latitude/longitude storage.
- Only one venue is associated with each wedding.
- Rate limiting for the geocoding API is handled client-side via request debouncing.
- Venue information is displayed on two public pages with different purposes: the landing page shows emotional content (couple name, date, venue name, welcome message) to drive RSVP clicks; the RSVP form page shows logistics content (address, map, navigation buttons, welcome message) to reduce form abandonment.
- The landing page intentionally excludes the map and navigation buttons to keep the page focused on the single "RSVP Now" CTA.
- "Open in Maps" uses the standard `https://maps.google.com/?q=lat,lng` URL scheme.
- "Navigate with Waze" uses the standard `https://waze.com/ul?ll=lat,lng&navigate=yes` URL scheme.
