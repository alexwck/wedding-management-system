# Feature Specification: Homepage Redesign for Mobile Conversion

**Feature Branch**: `011-homepage-redesign`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Redesign wedding planning website homepage/landing page to increase mobile conversion with glassmorphism, bento box layouts, and soft pastel/earthy tones. Mobile friendly first."

---

## Overview

The wedding management system currently serves two primary audiences on its public-facing pages: **guests** who visit wedding landing pages to RSVP, and **prospective couples** who may encounter the site before signing up. The existing landing page design, while functional, was not optimized for mobile-first engagement. Industry data shows that over 70% of wedding RSVPs and event page visits occur on mobile devices, yet mobile conversion rates lag desktop by a significant margin.

This feature delivers a complete visual and structural redesign of the public-facing homepage and wedding landing pages, driven by 2026 UX trends: **frosted glass effects (glassmorphism)**, **bento box modular layouts with 3D depth**, and **soft pastel/earthy color palettes**. The redesign prioritizes mobile usability above all else, with the explicit goal of increasing RSVP submission rates and reducing bounce rates on mobile devices.

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

---

### User Story 2 - Admin Customizes Wedding Landing Page (Priority: P2)

A wedding planner or admin creates a new wedding and wants the public landing page to reflect the couple's aesthetic. They browse a gallery of 6+ layout presets inspired by 2026 design trends, select one that matches the couple's style, upload a Canva-designed invitation template, set a focal point for the hero image, and preview how the page will look on both mobile and desktop before sharing the link with guests.

**Why this priority**: The admin/couple customization flow determines the quality and consistency of the guest-facing experience. If admins cannot easily create beautiful pages that match diverse couple aesthetics, guest conversion suffers regardless of the underlying design system. Offering multiple layout presets maximizes the chance that every couple finds a design that resonates with their wedding theme.

**Independent Test**: Can be fully tested by having an admin create a wedding, browse layout presets, select one, upload a template, configure page settings, and verify the preview matches the published page on mobile and desktop.

**Acceptance Scenarios**:

1. **Given** an admin is configuring a wedding page, **When** they browse and select from the 6+ available layout presets, **Then** a live preview updates instantly showing how their template and content will render in the selected layout.
2. **Given** an admin uploads a template image, **When** they use the crop adjustment tool, **Then** the focal point they set is respected across all screen sizes without awkward cropping on mobile.
3. **Given** an admin has set a wedding to locked, **When** a guest visits the page, **Then** the RSVP form is replaced with a glassmorphism "RSVP is now closed" message while preserving the rest of the page design.

---

### User Story 3 - Couple Previews Their Public Page (Priority: P3)

A couple logs into their dashboard and wants to see exactly what their guests will experience. They open their public page preview and share it with each other for approval before sending invitations.

**Why this priority**: Couples are emotionally invested in their wedding page appearance. A preview that accurately reflects the guest experience builds trust and reduces support requests about "why does my page look different?"

**Independent Test**: Can be fully tested by having a couple user navigate from their dashboard to their public page and confirming the visual consistency.

**Acceptance Scenarios**:

1. **Given** a couple views their public page from the dashboard, **When** they open it on their phone, **Then** the page renders identically to what an unauthenticated guest would see.
2. **Given** a couple shares their page link via messaging app, **When** the link generates a preview card, **Then** the Open Graph image and description are derived from their template and couple name.

---

### Edge Cases

- What happens when a guest's device has reduced motion preferences enabled?
- How does the design accommodate weddings without a uploaded template image (gradient fallback)?
- What happens when venue coordinates are set but the map service is unavailable?
- How does the RSVP form behave when a guest has already submitted an RSVP and revisits the page?
- What is the experience for guests using screen readers or assistive technologies?
- How does the page perform on slow 3G connections or low-end devices?

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

- **FR-001**: The public wedding landing page MUST use a mobile-first responsive layout where all primary content (couple names, wedding date, venue details, RSVP form) is accessible within two screenfuls on a standard mobile device (375px width).
- **FR-002**: The design system MUST implement glassmorphism effects using frosted glass panels with consistent blur intensity, semi-transparent white backgrounds, and subtle borders across all card-like surfaces.
- **FR-003**: The landing page MUST support a bento box modular layout where content is organized into distinct glass-panel cards (hero, date/time, venue, welcome message, RSVP form, quick stats) that stack vertically on mobile and grid on desktop.
- **FR-004**: The color palette MUST use soft pastel and earthy tones as the default theme, with sufficient contrast ratios to meet WCAG AA accessibility standards for text readability against both light and dark backgrounds.
- **FR-005**: The RSVP form MUST be optimized for mobile input with appropriately sized touch targets (minimum 44x44px), clear input grouping, and inline validation that does not obstruct other fields.
- **FR-006**: The RSVP call-to-action MUST remain visually prominent throughout the mobile scrolling experience, either via a sticky button or through high-contrast placement within the bento grid.
- **FR-007**: Weddings without an uploaded template image MUST display a gradient fallback hero using the soft pastel palette, maintaining visual consistency with glassmorphism-themed pages.
- **FR-008**: All interactive elements MUST respect the user's `prefers-reduced-motion` system setting, disabling parallax, fade-ins, and 3D depth transitions when this preference is active.
- **FR-009**: The venue section MUST display embedded map content within a rounded glassmorphism container, with navigation buttons (Get Directions, Save to Calendar) styled as glass-panel buttons.
- **FR-010**: The page MUST generate accurate Open Graph metadata (title, description, image) derived from the wedding's couple name and template image for proper social sharing previews.
- **FR-011**: When a wedding is locked, the RSVP form MUST be replaced with a glassmorphism "RSVP is now closed" message while preserving all other page content and styling.
- **FR-012**: The admin/couple preview mode MUST render the page identically to the guest-facing version, including the same responsive breakpoints and glassmorphism effects.
- **FR-013**: The page MUST render primary content within 2.5 seconds and become interactive within 4 seconds on a simulated slow mobile network connection.

### Key Entities

- **Wedding Landing Page**: The public-facing page for a specific wedding, composed of modular sections rendered within a bento grid system. Key attributes: layout preset, theme colors, template image, focal point, glassmorphism intensity.
- **Bento Module**: A self-contained content block (hero, date, venue, RSVP, stats) rendered as a glassmorphism card. Each module has a type, content configuration, and responsive behavior rules.
- **Theme Configuration**: The aesthetic settings for a wedding page including primary pastel color, earthy accent, glass blur radius, and border opacity. Defined per-wedding or inherited from a global default.
- **RSVP Form State**: The guest-facing RSVP interaction including form fields, validation state, submission status, and confirmation display. Must function identically across all layout presets.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of guests who begin the RSVP form successfully complete and submit it on their first visit, measured via session analytics over a 30-day period.
- **SC-002**: Guests can complete an RSVP submission on mobile in under 60 seconds from page load, measured via session timing analytics on 90% of successful submissions.
- **SC-003**: Mobile bounce rate on wedding landing pages decreases by at least 15% within the first month of deployment.
- **SC-004**: The page meets WCAG 2.1 Level AA accessibility standards across all interactive elements, ensuring inclusive access for users with assistive technologies.
- **SC-005**: 100% of wedding landing pages render correctly without a template image using the pastel gradient fallback system.
- **SC-006**: The page renders its primary content (hero image, couple names, and wedding date) within 2.5 seconds on simulated slow mobile networks for 95% of page loads.
- **SC-007**: Admin and couple users report a preview-to-published consistency rating of 4.5+ out of 5 in post-deployment feedback surveys.
- **SC-008**: The redesigned landing pages maintain full functionality across iOS Safari, Android Chrome, and Samsung Internet browsers covering 98%+ of mobile traffic.

---

## Assumptions

- The existing glassmorphism design system in the application will be extended to public-facing pages, maintaining visual consistency with the admin and couple dashboards.
- The bento layout grid will use modern layout techniques with appropriate fallbacks for older browsers, with the primary target being current-generation mobile browsers.
- Pastel/earthy color defaults will be drawn from a curated palette of 6 primary colors and 4 accent colors, with the option for admins to customize per wedding in a future phase.
- 3D depth effects will be implemented via standard styling techniques rather than heavy graphics libraries to ensure performance and accessibility.
- The RSVP form logic (validation, submission, deduplication) remains functionally unchanged; only the visual presentation and mobile interaction patterns are modified.
- Social sharing metadata generation will use the existing image storage and public URL pipeline with cache-busting parameters.
- The redesign applies to all public-facing pages including the root homepage (`/`), authentication pages (`/auth/login`), and individual wedding landing pages (`/w/[slug]`). Admin dashboards and couple dashboards remain out of scope unless explicitly noted in future specifications.
- Guest users do not need to authenticate to view wedding pages or submit RSVPs; this unauthenticated flow is preserved.
- The existing template image upload and storage pipeline is reused without modification.
- The redesign applies to all public-facing pages: the root homepage (`/`), authentication pages (`/auth/login`), and individual wedding landing pages (`/w/[slug]`). Admin dashboards and couple dashboards remain out of scope.
- Mobile RSVP completion success criterion uses a user-facing task completion metric rather than a comparative baseline (see SC-001).
- Admins will have a curated selection of 6+ layout presets to choose from per wedding, each representing a distinct 2026 design trend approach. The exact selection will be finalized after design review.

