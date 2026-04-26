# Feature Specification: Homepage Redesign for Mobile Conversion

**Feature Branch**: `011-homepage-redesign`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Redesign wedding planning website homepage/landing page to increase mobile conversion with glassmorphism, bento box layouts, and soft pastel/earthy tones. Mobile friendly first."

---

## Overview

The wedding management system currently serves three primary audiences: **guests** who visit wedding landing pages to RSVP, **couples** who log in to manage their RSVPs and floor plans, and **admins** who oversee all weddings and users. The existing design, while functional, was not optimized for mobile-first engagement across any of these interfaces. Industry data shows that over 70% of wedding RSVPs and event page visits occur on mobile devices, yet mobile conversion rates and task completion lag desktop by a significant margin.

This feature delivers a complete visual and structural redesign of **all pages, components, and UI elements** in the codebase — public-facing pages, admin dashboards, couple dashboards, shared components, forms, tables, dialogs, navigation, and canvas controls — driven by 2026 UX trends: **frosted glass effects (glassmorphism)**, **bento box modular layouts with 3D depth**, and **soft pastel/earthy color palettes**. The redesign prioritizes mobile usability above all else across every user interface, with the explicit goal of increasing RSVP submission rates, reducing bounce rates, and improving task completion on mobile devices.

---

## Clarifications

### Session 2026-04-26

- **Q1**: When a guest clicks "Edit RSVP" on the confirmation card, how does the editing flow work?  
  **A**: The confirmation card is replaced inline by the original RSVP form, pre-filled with the guest's previous response (name, attendance, dietary preferences, plus-one). The guest can modify any field and re-submit, which atomically updates their existing RSVP record. No separate page or modal is needed. This keeps the single-page design consistent and minimizes friction.
- **Q2**: How are theme configurations stored and who controls them?  
  **A**: Themes are stored per-wedding in the database. Each wedding has its own theme configuration, inheriting from a global platform default when unset. Admins can customize per-wedding themes during creation or editing.
- **Q3**: How should screen reader users navigate between layout presets, and do presets maintain the same semantic structure?  
  **A**: All layout presets share a single semantic DOM structure. The visual layout differences are purely presentational (CSS-only). Screen reader users experience the identical heading hierarchy, landmark roles, and form field order regardless of which preset is chosen. This ensures WCAG 2.1 AA compliance is maintained across all presets without requiring per-preset accessibility testing.
- **Q4**: How should CSS for 7 layout presets be delivered to keep initial page load fast?  
  **A**: Only the active preset's CSS is loaded for guests. Admins get all preset CSS for instant preview switching. The global design system CSS (glassmorphism variables, utilities) loads upfront for all users.
- **Q5**: How does the system securely identify a returning guest to show their "Edit RSVP" option?  
  **A**: A short-lived random token cookie is set after successful RSVP submission. The cookie maps server-side to the RSVP record. On revisit, the cookie enables the personalized confirmation card. If the cookie is missing or expired, the guest sees the standard RSVP form. No PII is stored client-side.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest RSVPs on Mobile (Priority: P1)

A wedding guest receives a shareable link to a couple's wedding landing page. They open it on their smartphone while commuting or during a break. Within seconds, they understand whose wedding it is, see the essential details (date, venue), and can submit their RSVP with minimal friction. The experience feels modern, trustworthy, and emotionally resonant with the wedding theme.

**Why this priority**: This is the core conversion flow of the entire product. Every wedding hosted on the platform depends on guests successfully RSVPing. Mobile is the dominant device for this use case. Improving mobile RSVP conversion directly impacts the platform's core value proposition.

**Independent Test**: Can be fully tested by sending a wedding landing page link to a test user on a mobile device and measuring whether they can complete an RSVP submission in under 60 seconds without assistance.

**Acceptance Scenarios**:

1. **Given** a guest opens a wedding landing page on a mobile device, **When** the page loads, **Then** the hero section clearly displays the couple's names and wedding date above the fold without scrolling.
2. **Given** a guest is viewing the venue section, **When** they tap the RSVP call-to-action, **Then** the page smooth-scrolls to the RSVP form with the keyboard automatically focusing the first input field.
3. **Given** a guest is filling out the RSVP form on mobile, **When** they select attendance status, **Then** conditional fields (dietary preferences, plus-one) appear inline without page reloads or jarring layout shifts.
4. **Given** a guest submits the RSVP form, **When** the submission is successful, **Then** they see a celebratory confirmation with a glassmorphism-styled success card and an option to add the event to their calendar.
5. **Given** a guest who has already RSVPed revisits the wedding page, **When** the page loads, **Then** the RSVP form is replaced with a personalized glassmorphism confirmation card showing their submitted response and an "Edit RSVP" option (if the wedding is not locked).
6. **Given** a guest views the venue section, **When** the embedded map fails to load, **Then** the venue card displays the address text and navigation buttons in a glassmorphism panel with a subtle "Map unavailable" placeholder, without breaking the page layout.

---

### User Story 2 - Admin Manages Weddings on Mobile (Priority: P2)

A wedding planner or admin logs into the admin dashboard on their tablet or phone while on-site at a venue. They navigate between weddings, check RSVP counts, toggle wedding locks, edit venue details, and configure floor plans. Every screen they encounter uses the same cohesive glassmorphism and bento design language, with touch-friendly inputs, clear hierarchy, and no horizontal scrolling.

**Why this priority**: Admins increasingly manage weddings on mobile devices, especially during events. A consistent, mobile-optimized admin experience reduces errors, speeds up on-the-spot decisions, and builds trust in the platform's professionalism.

**Independent Test**: Can be fully tested by having an admin perform core tasks (view wedding list, edit a wedding, toggle lock, check RSVP counts) entirely on a mobile device without assistance.

**Acceptance Scenarios**:

1. **Given** an admin views the wedding list on mobile, **When** they scroll through 20+ weddings, **Then** each card uses glassmorphism styling with clear couple names, date, and RSVP count visible at a glance.
2. **Given** an admin edits a wedding on mobile, **When** they navigate through tabs (details, venue, floor plan, RSVPs), **Then** each tab renders in a bento-style layout with form inputs sized for thumb interaction.
3. **Given** an admin uses the floor plan editor on a tablet, **When** they tap to add a table or assign a guest, **Then** the canvas controls and guest panel adapt to the smaller screen without clipping or overflow.
4. **Given** an admin configures a wedding landing page, **When** they browse and select from the 6+ available layout presets, **Then** a live preview updates instantly showing how their template and content will render in the selected layout.
5. **Given** an admin uploads a template image, **When** they use the crop adjustment tool, **Then** the focal point they set is respected across all screen sizes without awkward cropping on mobile.
6. **Given** an admin has set a wedding to locked, **When** a guest visits the page, **Then** the RSVP form is replaced with a glassmorphism "RSVP is now closed" message while preserving the rest of the page design.
7. **Given** an admin views the wedding list with 50+ weddings on mobile, **When** they scroll through the list, **Then** the page uses pagination or virtual scrolling to maintain 60fps without jank or excessive memory usage.
8. **Given** an admin opens the floor plan editor on a phone screen narrower than 640px, **When** the page loads, **Then** a device-not-supported message is displayed with a prompt to use a tablet or desktop, while a read-only preview of the floor plan remains visible.

---

### User Story 3 - Couple Manages Their Wedding on Mobile (Priority: P3)

A couple logs into their dashboard on their phone while commuting. They check how many guests have RSVPed, view the RSVP breakdown (attending, declining, dietary needs), edit their venue details, adjust their floor plan, and preview how guests will see their public page. Every screen they use feels modern, responsive, and consistent with the overall platform design.

**Why this priority**: Couples are emotionally invested in their wedding planning tools and use them frequently on mobile. A polished, mobile-friendly dashboard experience increases engagement, reduces support requests, and creates a positive brand association that encourages word-of-mouth referrals.

**Independent Test**: Can be fully tested by having a couple user perform core dashboard tasks (view RSVP summary, edit venue, adjust floor plan, preview public page) entirely on a mobile device without assistance.

**Acceptance Scenarios**:

1. **Given** a couple views their dashboard on mobile, **When** the page loads, **Then** RSVP summary cards display in a bento grid with glassmorphism styling, showing attending, declining, vegetarian, and baby chair counts at a glance.
2. **Given** a couple views the RSVP table on mobile, **When** they tap a sortable column header, **Then** the table remains readable with appropriate column widths, pagination controls, and no horizontal overflow.
3. **Given** a couple edits venue details on mobile, **When** they use the address autocomplete, **Then** the suggestion dropdown is touch-friendly, the map preview is visible, and form inputs are sized for thumb interaction.
4. **Given** a couple uses the floor plan editor on a tablet, **When** they tap to add items or assign guests to chairs, **Then** the canvas, toolbar, and guest panel adapt to the smaller screen with all controls reachable.
5. **Given** a couple views their public page preview from the dashboard, **When** they open it on their phone, **Then** the page renders identically to what an unauthenticated guest would see.
6. **Given** a couple shares their page link via messaging app, **When** the link generates a preview card, **Then** the Open Graph image and description are derived from their template and couple name.
7. **Given** a couple views the RSVP table with 200+ guests on mobile, **When** the page loads, **Then** the table paginates at 25 rows per page with search and filter controls always visible, remaining performant and readable without horizontal overflow.
8. **Given** a couple opens a modal dialog on mobile, **When** they focus a text input and the on-screen keyboard appears, **Then** the dialog scrolls or repositions so the focused input remains visible and unobstructed.
9. **Given** a couple opens the floor plan editor on a phone screen narrower than 640px, **When** the page loads, **Then** a device-not-supported message is displayed with a prompt to use a tablet or desktop, while a read-only preview of the floor plan remains visible.

---

### Edge Cases

| Edge Case | Covered By |
|-----------|------------|
| Guest device has reduced motion preferences enabled | FR-008 |
| Wedding has no uploaded template image | FR-007 |
| Venue map service is unavailable | FR-022 |
| Guest has already submitted an RSVP and revisits the page | FR-023 |
| Guest uses screen readers or assistive technologies | FR-004, FR-021 |
| Page performance on slow 3G or low-end devices | FR-013 |
| Admin manages 50+ weddings on mobile | FR-024 |
| Couple views RSVP table with 200+ guests on mobile | FR-025 |
| Floor plan canvas on phone screens under 640px | FR-026 |
| Modal dialogs with on-screen keyboard on mobile | FR-027 |
| Browser lacks `backdrop-filter` support | FR-021 |

---

## Design Direction

After evaluating seven distinct layout approaches against 2026 trends and conversion goals, the design system will offer a curated gallery of presets so admins can select the aesthetic that best matches each couple's wedding theme. All layouts share the glassmorphism design language and pastel/earthy palette for cohesion, while offering structural variety.

### Layout A: Minimalist (Evaluated)

```
+----------------------------------+
|  [Glass Header - Couple Names]   |
+----------------------------------+
|                                  |
|      [Hero Image/Gradient]       |
|      [Date Overlay - Glass]      |
|                                  |
+----------------------------------+
|  [Venue Card - Glass]            |
+----------------------------------+
|  [RSVP Form - Clean, airy]       |
+----------------------------------+
|  [Footer - Minimal]                |
+----------------------------------+
```

**Evaluation**: Strong mobile performance and fast load times. However, it underutilizes the 2026 bento trend and can feel generic. Information density is low, requiring more scrolling. Conversion potential: moderate.

### Layout B: Bento Box / Modular (Recommended)

```
+----------------------------------+
|  [Glass Nav - Couple Names]      |
+--------+------------+------------+
|        |            |            |
| [Hero] | [Date &    | [Venue     |
| Image  |  Time]     |  Map]      |
|        |  [Glass]   |  [Glass]   |
+--------+------------+------------+
|  [Welcome Message - Glass Card]  |
+----------------------------------+
|  [RSVP Form - Prominent CTA]     |
+----------------------------------+
|  [Quick Stats - Glass Chips]     |
+----------------------------------+
```

**Mobile Adaptation**:

```
+----------------------------------+
|  [Hero Image - Full Width]       |
|  [Date Overlay - Glass Pill]     |
+----------------------------------+
|  [Venue Card - Full Width]       |
|  [Map Embed - Rounded Corners]   |
+----------------------------------+
|  [Welcome Message]               |
+----------------------------------+
|  [RSVP Form - Sticky CTA?]       |
+----------------------------------+
```

**Evaluation**: Excellent information density without clutter. Modular cards allow guests to scan quickly. The bento grid adapts beautifully to mobile stacking. Glassmorphism cards create depth and hierarchy. Each module can have subtle hover/scroll-triggered depth effects. Highest conversion potential due to reduced cognitive load and clear visual hierarchy.

### Layout C: Storytelling / Scroll-Based (Evaluated)

```
+----------------------------------+
|  [Full-bleed Hero - Parallax]   |
|  [Names fade in on scroll]       |
+----------------------------------+
|  [Scroll-triggered sections]     |
|  [Venue reveals as you scroll]   |
+----------------------------------+
|  [RSVP "chapter" - dramatic]     |
+----------------------------------+
|  [Closing image - couple photo]  |
+----------------------------------+
```

**Evaluation**: Emotionally engaging and on-trend for storytelling. However, scroll-based animations often hurt mobile performance and can frustrate users who want to quickly RSVP. Parallax effects can cause motion sickness. Conversion potential: high engagement but lower completion rate due to friction.

---

### Layout D: Magazine / Editorial

```
+----------------------------------+
|  [Full-bleed Hero Image]         |
|  [Couple Names - Serif, large]   |
|  [Date - Subtitle, elegant]      |
+----------------------------------+
|  [Editorial "Issue" Header]      |
+----------------------------------+
|  [Venue Feature - Large Photo]   |
|  [Venue Details - Column text]   |
+----------------------------------+
|  [RSVP Section - Callout Box]    |
+----------------------------------+
|  [Footer - Minimal, elegant]       |
+----------------------------------+
```

**Mobile Adaptation**: Single-column editorial flow. Large serif typography dominates. Hero image is full-bleed with text overlaid in a glassmorphism panel at the bottom. Venue section uses a split layout on desktop, stacks on mobile. RSVP is framed as an "RSVP Card" styled like a wedding invitation insert.

**Evaluation**: Appeals to couples who want their digital invitation to feel like a printed magazine spread. Serif typography and generous whitespace create luxury. However, large images may slow mobile load times. RSVP form can feel buried if not carefully placed. Best suited for formal/classic weddings. Conversion potential: moderate to high for the right audience.

---

### Layout E: Card Stack / Deck (Swipeable)

```
+----------------------------------+
|  [Card 1: Hero Image]            |
|  [Swipe down / tap to reveal]    |
+----------------------------------+
|  [Card 2: Date & Time]           |
|  [Peeking from bottom]           |
+----------------------------------+
|  [Card 3: Venue Map]             |
+----------------------------------+
|  [Card 4: RSVP Form]             |
+----------------------------------+
|  [Card 5: Confirmation]          |
+----------------------------------+
```

**Mobile Adaptation**: Each section is a full-screen card. Guests swipe vertically or tap to progress through the "deck." Each card uses glassmorphism with a different pastel tint. Progress dots at the bottom show how many cards remain. RSVP card auto-focuses the first input. Confirmation card shows a celebratory animation.

**Evaluation**: Highly novel and memorable. Gamifies the RSVP experience. Keeps each screen focused on one task, reducing cognitive overload. However, swipe gestures can be discoverability issues for older guests. Vertical scroll is more intuitive than card-swiping on mobile. Best for modern, tech-forward couples. Conversion potential: high for engaged users, but risk of drop-off if guests don't understand the interaction pattern.

---

### Layout F: Split Screen / Asymmetric

```
+----------------------------------+
|  [Hero Image - Left 60%] | [Date]|
|                          | [Time]|
|  [Template Image fills   | [Venue|
|   left side with soft    | Info] |
|   rounded corners]       |       |
+----------------------------------+
|  [RSVP Form - Right-aligned]     |
|  [Glass Panel overlay]           |
+----------------------------------+
|  [Welcome Message - Centered]     |
+----------------------------------+
|  [Quick Stats - Asymmetric chips] |
+----------------------------------+
```

**Mobile Adaptation**: On mobile, the split collapses to a single column with the hero image at full width, followed by a glassmorphism card that slides up to reveal date/time/venue. The asymmetric feel is preserved through varied card widths and staggered alignment.

**Evaluation**: Creates visual tension and interest through imbalance. Feels contemporary and art-directed. However, asymmetry can feel chaotic on small screens if not carefully handled. Best for creative couples (artists, designers, photographers). Conversion potential: moderate; the unconventional layout may confuse guests seeking familiar patterns.

---

### Layout G: Full-bleed Immersive / Cinematic

```
+----------------------------------+
|  [Hero Video / Slideshow]         |
|  [Names - Large, centered]       |
|  [Glassmorphism overlay]         |
+----------------------------------+
|  [Immersive Venue Panorama]      |
|  [Glass info panel floating]     |
+----------------------------------+
|  [RSVP - Floating glass card     |
|   over blurred background]       |
+----------------------------------+
|  [Closing full-bleed image]      |
+----------------------------------+
```

**Mobile Adaptation**: Full-bleed imagery dominates every section. Content is overlaid via floating glassmorphism panels that appear as the user scrolls. Backgrounds subtly cross-fade between template image, venue map, and pastel gradients. RSVP form floats above a blurred version of the hero image.

**Evaluation**: Maximum emotional impact and visual drama. Feels like a premium digital experience. However, heavy image/video assets pose significant mobile performance risks. Load times may exceed targets. Autoplaying media is often blocked on mobile. Best for couples with high-quality photography who prioritize aesthetics over speed. Conversion potential: high on fast connections, but significant risk of abandonment on slow networks.

### Recommendation

**Adopt a multi-preset system** with **Layout B (Bento Box / Modular)** as the default and recommended option for most weddings, supplemented by the other six layouts for couples who want a different aesthetic.

**Layout B remains the default** because it best serves the core goal of increasing mobile conversion:

1. **Reducing time-to-RSVP**: All critical information is visible within one viewport or a single scroll
2. **Scannable structure**: Guests can instantly locate date, venue, and RSVP sections
3. **Glassmorphism cohesion**: Frosted cards create visual separation without heavy borders, keeping the design light and wedding-appropriate
4. **Mobile-native stacking**: The bento grid collapses into a logical vertical stack on narrow screens
5. **Performance**: Modular sections can lazy-load independently, improving initial page load

**When to recommend other layouts**:
- **Layout A (Minimalist)**: For couples who want a clean, distraction-free experience or have a very simple template image
- **Layout C (Storytelling)**: For destination weddings or events with a strong narrative where engagement matters more than speed
- **Layout D (Magazine)**: For formal, elegant weddings where luxury typography and photography are central
- **Layout E (Card Stack)**: For tech-savvy couples with younger guest lists who will appreciate a novel interaction
- **Layout F (Asymmetric)**: For creative couples (artists, photographers) who want an unconventional, art-directed feel
- **Layout G (Cinematic)**: For couples with professional photography who prioritize visual impact and have a guest base on reliable connections

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public wedding landing page MUST use a mobile-first responsive layout where all primary content (couple names, wedding date, venue details, RSVP form) is accessible within two screenfuls on a standard mobile device. "Two screenfuls" is defined as 1500px maximum vertical height on a 375px-wide viewport (equivalent to 2 × iPhone 812px viewport height).
- **FR-002**: The design system MUST implement glassmorphism effects using frosted glass panels with consistent blur intensity (16px), semi-transparent white backgrounds (`rgba(255,255,255,0.3)`), and subtle borders (1px solid `rgba(255,255,255,0.2)`) across all card-like surfaces. On browsers without `backdrop-filter` support, glass panels MUST fall back to solid semi-transparent backgrounds.
- **FR-003**: The landing page MUST support a bento box modular layout where content is organized into distinct glass-panel cards (hero, date/time, venue, welcome message, RSVP form, quick stats) that stack vertically on mobile and grid on desktop. All layout presets MUST share a single semantic DOM structure, with visual differences implemented via CSS only. CSS Grid is the primary layout technique with Flexbox fallback for older browsers.
- **FR-004**: The color palette MUST use soft pastel and earthy tones as the default theme, with sufficient contrast ratios to meet WCAG AA accessibility standards for text readability against both light and dark backgrounds.
- **FR-005**: The RSVP form MUST be optimized for mobile input with appropriately sized touch targets (minimum 44x44px), clear input grouping, and inline validation that does not obstruct other fields.
- **FR-006**: The RSVP call-to-action MUST remain visually prominent throughout the mobile scrolling experience. Preset-specific placement: bento/minimalist/storytelling use high-contrast placement within the grid; magazine/card-stack/asymmetric/cinematic use a sticky bottom button on mobile.
- **FR-007**: Weddings without an uploaded template image MUST display a gradient fallback hero using the soft pastel palette, maintaining visual consistency with glassmorphism-themed pages.
- **FR-008**: All interactive elements MUST respect the user's `prefers-reduced-motion` system setting, disabling parallax, fade-ins, 3D depth transitions, and all CSS transitions/animations when this preference is active.
- **FR-009**: The venue section MUST display embedded map content within a rounded glassmorphism container, with navigation buttons (Get Directions, Save to Calendar) styled as glass-panel buttons.
- **FR-010**: The page MUST generate accurate Open Graph metadata (title, description, image) derived from the wedding's couple name and template image for proper social sharing previews.
- **FR-011**: When a wedding is locked, the RSVP form MUST be replaced with a glassmorphism "RSVP is now closed" message while preserving all other page content and styling.
- **FR-012**: The admin/couple preview mode MUST render the page identically to the guest-facing version, including the same responsive breakpoints and glassmorphism effects.
- **FR-013**: On mobile (375px viewport, simulated 4G), the page MUST render primary content within 2.5 seconds and become interactive within 4 seconds for 95% of page loads. Desktop targets are informational only.
- **FR-014**: The admin wedding list (`/admin/weddings`) MUST display as a responsive card grid on mobile, with each card showing couple name, date, RSVP count, and lock status in a glassmorphism-styled panel.
- **FR-015**: The couple dashboard (`/dashboard`) MUST present RSVP summary statistics in a bento grid layout with glassmorphism cards, displaying attending, declining, vegetarian, and baby chair counts.
- **FR-016**: The floor plan editor MUST be usable on tablet devices (768px+ width) with all toolbar controls, canvas, and guest panel visible and reachable without horizontal scrolling.
- **FR-017**: All form inputs across admin, couple, and public interfaces MUST have a minimum touch target of 44x44px, clear focus states, and inline validation that does not obstruct other fields on mobile.
- **FR-018**: Table components (RSVP tables, wedding lists) MUST remain readable on mobile through responsive column handling (minimum 80px, maximum 300px per column), horizontal scroll as a last resort, or card-based alternatives.
- **FR-019**: Dialog and modal components MUST adapt to mobile by using full-screen or bottom-sheet presentation on screens narrower than 640px, with a visible close action.
- **FR-020**: Navigation components (admin sidebar, couple sidebar, public nav) MUST collapse to a hamburger menu on mobile with touch-friendly links and clear active states.
- **FR-021**: The glassmorphism design system MUST degrade gracefully on browsers without `backdrop-filter` support, falling back to solid semi-transparent backgrounds.
- **FR-022**: When a venue map embed fails to load (detected via 5-second timeout or error event), the venue section MUST display the address text and navigation buttons in a glassmorphism card without the map, with a "Map unavailable" placeholder. The placeholder MUST include a retry button and auto-retry after 5 seconds.
- **FR-023**: When a guest who has already RSVPed revisits the page, the RSVP form MUST be replaced with a personalized glassmorphism confirmation card showing their submitted response and an "Edit RSVP" option if the wedding is not locked. Clicking "Edit RSVP" replaces the confirmation card inline with the pre-filled RSVP form, allowing the guest to modify and re-submit their response atomically. Returning guests are identified by a short-lived random token cookie (Secure, HttpOnly, SameSite=Lax, Max-Age=30 days) set after successful RSVP submission; if the cookie is missing or expired, the guest sees the standard RSVP form. The edit flow is rate-limited to 5 attempts per 15 minutes per token. If the wedding becomes locked mid-session, the "Edit RSVP" button MUST be disabled.
- **FR-024**: The admin wedding list MUST implement pagination or virtual scrolling so that 50+ wedding cards render without jank or excessive memory usage on mobile devices.
- **FR-025**: The couple dashboard RSVP table MUST paginate at 25 rows per page on mobile, with search and filter controls always visible, ensuring 200+ guest lists remain performant and readable.
- **FR-026**: The floor plan editor MUST display a device-not-supported message on screens narrower than 640px: "Floor plan editing requires a larger screen. Please use a tablet or desktop." A read-only preview of the floor plan remains visible below the message.
- **FR-027**: Modal dialogs on mobile MUST prevent the on-screen keyboard from obscuring the focused input by either scrolling the dialog into view or repositioning the dialog above the keyboard.
- **FR-028**: Preset-specific CSS MUST be loaded on-demand: only the active preset's CSS is delivered to guests (max 15KB per preset), while admins receive all preset CSS for instant preview switching. The global design system CSS (glassmorphism variables, utilities) loads upfront for all users (max 30KB).
- **FR-029**: All data-dependent screens MUST display loading states (skeletons or spinners) while data is fetching, and error states (inline messages or fallback UI) when data fetching fails.
- **FR-030**: All list and table views MUST display empty states when no data is present, with actionable guidance (e.g., "No RSVPs yet" with a link to share the page).
- **FR-031**: The responsive design MUST explicitly support the tablet viewport range (640px–768px) with optimized layouts distinct from both mobile (<640px) and desktop (>768px).
- **FR-032**: Template image uploads MUST validate file type (JPEG, PNG, WebP) and size (max 5MB), displaying inline error messages for invalid uploads without page reload.
- **FR-033**: The RSVP form MUST detect network interruption during submission and display a retry option without losing form data.
- **FR-034**: The total CSS payload for guest-facing pages MUST not exceed 100KB (global design system + active preset) to meet the 2.5s FCP target.
- **FR-035**: Template images MUST be optimized on upload (WebP conversion, max 1200px width, 80% quality) to ensure fast loading.
- **FR-036**: All theme color combinations MUST pass WCAG 2.1 AA contrast ratio validation (4.5:1 for normal text, 3:1 for large text) via automated testing on all preset/theme combinations.
- **FR-037**: A Content Security Policy (CSP) MUST allow inline styles (`style-src 'self' 'unsafe-inline'`) for preset-specific CSS delivery while restricting other sources.
- **FR-038**: When a guest's RSVP token cookie expires mid-session, the form submission MUST validate the token server-side and show "Please submit again" if expired, without losing form data.
- **FR-039**: All dynamic content updates (RSVP confirmation, map fallback, preset preview) MUST include ARIA live regions (`aria-live="polite"`) to announce changes to screen readers.
- **FR-040**: All interactive elements MUST manage focus explicitly: when the RSVP inline edit flow opens, focus MUST move to the first form field; when a modal opens, focus MUST move to the close button.
- **FR-041**: The color palette MUST be tested for color blindness accessibility (protanopia, deuteranopia, tritanopia) via simulation, with text labels or patterns supplementing color-coded information where needed.

### Key Entities

- **Wedding Landing Page**: The public-facing page for a specific wedding, composed of modular sections rendered within a bento grid system. Key attributes: layout preset, theme colors, template image, focal point, glassmorphism intensity.
- **Bento Module**: A self-contained content block (hero, date, venue, RSVP, stats) rendered as a glassmorphism card. Each module has a type, content configuration, and responsive behavior rules.
- **Theme Configuration**: The aesthetic settings for a wedding page including primary pastel color, earthy accent, glass blur radius, and border opacity. Stored per-wedding in the database, inheriting from a global platform default when unset. Applied globally across public pages, admin dashboards, and couple dashboards.
- **RSVP Form State**: The guest-facing RSVP interaction including form fields, validation state, submission status, and confirmation display. Must function identically across all layout presets.
- **Admin Dashboard Interface**: The authenticated admin experience including wedding list, wedding detail editing, floor plan editor, and RSVP management. All screens share the glassmorphism and bento design language.
- **Couple Dashboard Interface**: The authenticated couple experience including RSVP summary, RSVP table, venue editor, floor plan editor, and public page preview. All screens share the glassmorphism and bento design language.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of guests who begin the RSVP form successfully complete and submit it on their first visit, measured via Supabase `rsvps` table query counts (first_visit = true) over a 30-day period. Analytics implemented via session cookie marking first visit.
- **SC-002**: Guests can complete an RSVP submission on mobile in under 60 seconds from page load (measured from `load` event to submission success toast visible), verified on 90% of successful submissions via session timing cookie.
- **SC-003**: Mobile bounce rate on wedding landing pages decreases by at least 15% within the first month of deployment, measured via Google Analytics 4. Baseline: current 30-day bounce rate before deployment.
- **SC-004**: The page meets WCAG 2.1 Level AA accessibility standards across all interactive elements, verified via automated axe-core scans in Playwright E2E tests. Specific criteria: 1.4.3 contrast (4.5:1), 2.1.1 keyboard navigation, 4.1.2 name/role/value.
- **SC-005**: 100% of wedding landing pages render correctly without a template image using the pastel gradient fallback system, verified via visual regression testing.
- **SC-006**: The page renders its primary content (hero image, couple names, and wedding date) within 2.5 seconds on simulated slow mobile networks (Chrome DevTools 4G throttling, 375px viewport) for 95% of page loads, measured via Lighthouse FCP.
- **SC-007**: Admin and couple users report a preview-to-published consistency rating of 4.5+ out of 5 in post-deployment email surveys (N=50 minimum, 4 weeks after launch).
- **SC-008**: The redesigned pages maintain full functionality across iOS Safari, Android Chrome, and Samsung Internet browsers covering 98%+ of mobile traffic, verified via BrowserStack or Playwright mobile project tests.
- **SC-009**: Admin users can complete core management tasks (toggle lock, edit venue, view RSVP counts) on mobile in under 90 seconds from page load to task completion confirmation, measured via E2E test timers.
- **SC-010**: Couple users can complete core dashboard tasks (view RSVP summary, edit venue, preview public page) on mobile in under 60 seconds from page load to task completion confirmation, measured via E2E test timers.
- **SC-011**: All interactive elements across public, admin, and couple interfaces have a minimum touch target of 44x44px, verified via axe-core automated accessibility scanning in Playwright E2E tests.

---

## Traceability

### User Story to FR Mapping

| User Story | FRs |
|------------|-----|
| US-1 (Guest RSVPs) | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-022, FR-023, FR-028, FR-029, FR-030, FR-032, FR-033, FR-034, FR-035, FR-036, FR-038, FR-039, FR-040, FR-041 |
| US-2 (Admin Mobile) | FR-002, FR-012, FR-014, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-024, FR-026, FR-029, FR-030, FR-031, FR-037, FR-039, FR-040 |
| US-3 (Couple Mobile) | FR-002, FR-012, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-025, FR-026, FR-029, FR-030, FR-031, FR-032, FR-037, FR-039, FR-040, FR-041 |

### FR to Acceptance Scenario Mapping

| FR | Scenarios |
|----|-----------|
| FR-001 | US-1 AS-1 |
| FR-005 | US-1 AS-2, US-1 AS-3 |
| FR-009 | US-1 AS-2 |
| FR-011 | US-2 AS-6 |
| FR-022 | US-1 AS-6 |
| FR-023 | US-1 AS-5 |
| FR-024 | US-2 AS-7 |
| FR-025 | US-3 AS-7 |
| FR-026 | US-2 AS-8, US-3 AS-9 |
| FR-027 | US-3 AS-8 |

### SC to FR Mapping

| SC | Verified By |
|----|-------------|
| SC-001 | FR-005, FR-023 |
| SC-002 | FR-001, FR-005, FR-013 |
| SC-003 | FR-001, FR-007, FR-013 |
| SC-004 | FR-004, FR-008, FR-021, FR-036, FR-039, FR-040, FR-041 |
| SC-005 | FR-007 |
| SC-006 | FR-013, FR-034, FR-035 |
| SC-007 | FR-012 |
| SC-008 | FR-021, FR-031 |
| SC-009 | FR-014, FR-017, FR-018, FR-019, FR-020 |
| SC-010 | FR-015, FR-017, FR-018, FR-019, FR-020 |
| SC-011 | FR-017 |

---

## Assumptions

- The existing glassmorphism design system in the application will be extended to public-facing pages, maintaining visual consistency with the admin and couple dashboards.
- The bento layout grid will use modern layout techniques with appropriate fallbacks for older browsers, with the primary target being current-generation mobile browsers.
- Pastel/earthy color defaults will be drawn from a curated palette of 6 primary colors and 4 accent colors, with the option for admins to customize per wedding in a future phase.
- 3D depth effects will be implemented via standard styling techniques rather than heavy graphics libraries to ensure performance and accessibility.
- The RSVP form logic (validation, submission, deduplication) remains functionally unchanged; only the visual presentation and mobile interaction patterns are modified.
- Social sharing metadata generation will use the existing image storage and public URL pipeline with cache-busting parameters.
- The redesign applies to all pages and components EXCEPT password reset, account settings, and auth-related pages beyond `/auth/login`. Specific pages included: public pages (`/`, `/auth/login`, `/w/[slug]`), admin dashboards (`/admin` and sub-routes including `/admin/weddings/create`), couple dashboards (`/dashboard` and sub-routes), error boundaries (`error.tsx`, `not-found.tsx`, `loading.tsx`), and all shared components (forms, tables, dialogs, navigation, canvas controls, etc.).
- Guest users do not need to authenticate to view wedding pages or submit RSVPs; this unauthenticated flow is preserved.
- The existing template image upload and storage pipeline is reused without modification.
- Mobile RSVP completion success criterion uses a user-facing task completion metric rather than a comparative baseline (see SC-001).
- Admins will have exactly 7 layout presets to choose from per wedding: minimalist, bento (default), storytelling, magazine, card-stack, asymmetric, and cinematic. MVP includes bento + minimalist + magazine; remaining 4 presets are stretch goals.
- Global default theme hex values: primary `#E8D5C4`, accent `#C4B5A0`, with 4 additional primary variants (`#D4E5D2`, `#E5D4E0`, `#D4D8E5`, `#E5DED4`) and 4 accent variants (`#A8C4B5`, `#C4A8B5`, `#B5A8C4`, `#C4C4A8`) for admin selection.
- Migration strategy: existing weddings default to `layout_preset = 'bento'` and `theme_json = NULL` (inherit global default). No breaking changes to existing queries.
- The `platform_settings` table is mandatory for storing the global theme default and other platform-wide configuration.
- RSVP deduplication logic remains unchanged; the edit RSVP flow (FR-023) updates the existing RSVP record atomically via the same unique constraint on `(wedding_id, LOWER(guest_name))`.

