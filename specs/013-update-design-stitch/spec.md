# Feature Specification: Update Design Based on Stitch Redesign

**Feature Branch**: `013-update-design-stitch`  
**Created**: 2026-05-17  
**Status**: In Progress  
**Input**: Google Stitch redesign screenshots in `/design/` folder + DESIGN.md glassmorphic design system

## Clarifications

### Session 2026-05-17

- Q: How should existing weddings with saved `layout_preset` values be handled when removing the preset system? → A: Hard removal - drop `layout_preset` column immediately. No backup needed (no deployment made).
- Q: Should motion/animation performance have a measurable target? → A: 60fps target, verified via browser devtools during testing.
- Q: How should SC-003's "reasonable implementation variance" be defined for the visual audit? → A: ±4px spacing/sizing tolerance, colors match DESIGN.md tokens exactly.
- Q: Should the floor plan editor redesign apply to both admin and couple editors? → A: Both editors — admin and couple floor plan editors redesigned identically.
- Q: How should custom icons/fonts/assets from Stitch be handled? → A: Pragmatic replication — lucide-react where possible, inline SVG for custom icons, system fonts.

### Session 2026-05-17 (Gap Closure)

- Q: What accessibility standards apply? → A: WCAG 2.1 Level AA — keyboard navigation, 4.5:1 contrast, 44x44px touch targets, aria-labels for icons.
- Q: What mobile viewports must be supported? → A: Down to 320px width (iPhone SE); hamburger nav < 768px; single-column floor plan editor on mobile.
- Q: What are the error handling requirements? → A: Image failures → gradient fallback; geocoding failures → "Unable to search" with retry; timeouts > 10s → error with retry.
- Q: What recovery mechanisms are required? → A: Floor plan undo for all design changes; form input autosave to localStorage on navigation.
- Q: What zero-states are required? → A: Admin dashboard "No weddings yet" + CTA; weddings table "No weddings found"; floor plan "No items placed" hint.
- Q: What loading states are required? → A: Skeleton loaders matching final layout; design tokens applied within 100ms; canvas loading spinner during Konva init.
- Q: What browsers must be supported? → A: Chrome 120+, Safari 17+, Firefox 121+ (last 2 versions); mobile Chrome/Safari on iOS 16+ and Android 13+; graceful degradation on unsupported browsers.
- Q: What are the bundle size constraints? → A: No custom font files; lucide-react tree-shaken; inline SVG optimized (< 2KB per icon).
- Q: What SEO requirements apply to public wedding pages? → A: Meta title/description/OG tags; semantic HTML (header/main/footer); alt text on template images.
- Q: What happens on low-performance devices or with reduced motion preference? → A: Respect `prefers-reduced-motion: reduce` — disable entrance animations and hover lift, maintain glass styling.

## User Scenarios & Testing

### User Story 1 - Consistent Glassmorphic Layout (Priority: P1)

**Description**: Users experience a unified, polished glassmorphic design across all pages (login, admin dashboard, weddings table, floor plan editor, RSVP experience) that follows DESIGN.md tokens precisely.

**Why this priority**: The Stitch redesigns establish a cohesive visual language that eliminates the need for multiple layout presets. A single, well-executed glassmorphic layout reduces cognitive load and maintenance burden.

**Independent Test**: Can be verified by comparing each page against Stitch screenshots and DESIGN.md compliance — all glass panels, shadows, and motion should match the design tokens.

**Acceptance Scenarios**:

1. **Given** a user visits any page (login, admin, dashboard, public wedding), **When** the page renders, **Then** all surfaces use consistent glassmorphic styling from DESIGN.md (backdrop blur 16px, `rgba(255,255,255,0.25)` light mode surfaces, dual-shadow depth)
2. **Given** a user interacts with any button or card, **When** hovering or clicking, **Then** motion follows DESIGN.md guidelines (`translateY(-2px)` hover, `scale(0.98)` click, 300ms transitions)

---

### User Story 2 - Preset Layout Removal Decision (Priority: P2)

**Description**: Based on the Stitch redesigns, determine whether the current layout preset system (bento, minimalist, cinematic, etc.) should be removed in favor of a single unified glassmorphic layout.

**Why this priority**: The Stitch redesigns show a consistent layout approach across all pages. If presets are no longer needed, removing them simplifies the codebase and reduces technical debt.

**Independent Test**: Can be verified by analyzing whether Stitch redesigns show distinct layout variations vs. a single consistent layout pattern.

**Acceptance Scenarios**:

1. **Given** the Stitch redesign screenshots for all 5 pages, **When** comparing layout structures, **Then** determine if presets add value or if a single glassmorphic layout suffices
2. **Given** a decision to remove presets, **When** implemented, **Then** the `layout_preset` database column, `PresetWrapper` components, and preset CSS files are removed or simplified

---

### User Story 3 - Page-Specific Design Implementation (Priority: P3)

**Description**: Implement the specific design details from each Stitch redesign screenshot (login page, admin dashboard, weddings table, floor plan editor, RSVP experience).

**Why this priority**: Each page has unique design refinements (spacing, component styling, motion details) that need to be applied systematically.

**Independent Test**: Each page can be tested independently against its corresponding Stitch screenshot.

**Acceptance Scenarios**:

1. **Given** the login page redesign, **When** implemented, **Then** the glass panel card, input fields, and button match the Stitch design with proper recessed styling and focus glow
2. **Given** the admin dashboard redesign, **Then** stats cards, action buttons, and layout follow glassmorphic tokens
3. **Given** the weddings table redesign, **Then** table rows, hover states, and action buttons follow the design
4. **Given** the floor plan editor redesign (admin AND couple), **Then** toolbar, canvas, and panels use consistent glass styling on both `/admin/weddings/[id]/floor-plan/` and `/dashboard/floor-plan/`
5. **Given** the RSVP experience redesign, **Then** form fields, buttons, and confirmation card match the design

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST apply DESIGN.md glassmorphic tokens consistently across all pages (no hardcoded color/shadow values)
- **FR-002**: All interactive elements MUST implement DESIGN.md motion guidelines (hover lift, click press, 300ms transitions)
- **FR-003**: Login page MUST use recessed input styling with focus glow per DESIGN.md
- **FR-004**: Admin pages MUST use glass panel cards with consistent elevation hierarchy
- **FR-005**: Floor plan editor toolbar MUST use compact top bar glass panel design
- **FR-006**: RSVP forms MUST use recessed glass fields with smooth border transitions
- **FR-007**: System MUST document decision on layout preset system (keep/remove) with rationale
- **FR-008**: System MUST drop `layout_preset` column from weddings table (safe: no production deployment yet)

### Accessibility Requirements

- **FR-009**: All interactive elements MUST support keyboard navigation (Tab/Enter/Escape) per WCAG 2.1 Level AA
- **FR-010**: Color contrast ratios MUST meet WCAG 2.1 Level AA (4.5:1 for text, 3:1 for UI components)
- **FR-011**: Touch targets MUST be minimum 44x44 CSS pixels for mobile viewports (< 768px width)
- **FR-012**: All non-text icons MUST have aria-label or aria-describedby for screen reader accessibility

### Responsive Design Requirements

- **FR-013**: System MUST support mobile viewports down to 320px width (iPhone SE, small Android devices)
- **FR-014**: Mobile navigation MUST use hamburger menu pattern for screen widths < 768px
- **FR-015**: Floor plan editor MUST switch to single-column layout on mobile (catalog → canvas → panels stacked vertically)

### Error Handling Requirements

- **FR-016**: Image load failures MUST display fallback UI (gradient hero for wedding templates, icon placeholder for avatars)
- **FR-017**: Geocoding API failures MUST show "Unable to search" error state with retry option
- **FR-018**: Network timeouts (> 10s) MUST display user-visible error message with retry action

### Recovery Requirements

- **FR-019**: Floor plan editor MUST support undo for all design changes (item placement, movement, rotation, resize, deletion)
- **FR-020**: Form inputs MUST preserve user data on navigation away from page (localStorage autosave)

### Zero-State Requirements

- **FR-021**: Admin dashboard MUST display "No weddings yet" empty state with "Create First Wedding" CTA when wedding count is zero
- **FR-022**: Weddings table MUST display "No weddings found" empty state when filters return zero results
- **FR-023**: Floor plan editor MUST display "No items placed" hint when canvas is empty (first-time users)

### Loading State Requirements

- **FR-024**: Page transitions MUST display skeleton loader matching final layout structure
- **FR-025**: Design token application MUST complete within 100ms of page load (no flash of unstyled content)
- **FR-026**: Floor plan canvas MUST display loading spinner while Konva Stage initializes

### Browser Compatibility Requirements

- **FR-027**: System MUST support Chrome 120+, Safari 17+, Firefox 121+ (last 2 major versions)
- **FR-028**: System MUST support mobile Chrome and Safari on iOS 16+ and Android 13+
- **FR-029**: System MUST degrade gracefully on unsupported browsers (basic functionality preserved)

### Bundle Size Requirements

- **FR-030**: No custom font files allowed — system fonts only (Inter, system-ui stack)
- **FR-031**: lucide-react MUST be tree-shaken — only imported icons included in bundle (verified via webpack-bundle-analyzer)
- **FR-032**: Inline SVG icons MUST be optimized (SVGO, < 2KB per icon)

### SEO Requirements (Public Wedding Pages)

- **FR-033**: Public wedding pages MUST include meta title, description, and Open Graph tags
- **FR-034**: Public wedding pages MUST use semantic HTML (header, main, footer, h1-h6 hierarchy)
- **FR-035**: Template images MUST have alt text derived from couple name

### Key Entities

- **Glass Panel Surfaces**: All card-like UI elements (forms, cards, toolbars, modals)
- **Motion States**: Hover, active, focus, entrance animations
- **Layout Preset**: Current system for switching between bento/minimalist/cinematic layouts (to be removed)

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of UI surfaces use CSS variables from DESIGN.md (zero hardcoded glassmorphic values in components)
- **SC-002**: All interactive elements pass motion design audit (hover, active, focus states match DESIGN.md)
- **SC-003**: Visual design audit passes — all 5 redesigned pages match Stitch screenshots (±4px spacing/sizing tolerance measured via Playwright screenshot comparison with pixelmatch, colors match DESIGN.md tokens exactly)
- **SC-004**: Layout preset decision documented with clear rationale (remove = simplified codebase, keep = user value justification)
- **SC-005**: All animations maintain 60fps during interaction, verified via browser devtools performance panel
- **SC-006**: Accessibility audit passes — keyboard navigation works for all interactive elements, contrast ratios ≥ 4.5:1 (text) and ≥ 3:1 (UI), touch targets ≥ 44x44px
- **SC-007**: Mobile viewport audit passes — all pages functional at 320px width, hamburger nav active < 768px, floor plan editor stacks vertically
- **SC-008**: Error handling audit passes — image fallbacks display, geocoding errors show retry, timeouts > 10s show error UI
- **SC-009**: Zero-state audit passes — empty dashboard CTA, empty table message, empty canvas hint all present
- **SC-010**: Loading state audit passes — skeleton loaders present, no FOUC (tokens applied < 100ms), canvas spinner shows during init
- **SC-011**: Browser compatibility audit passes — Chrome 120+, Safari 17+, Firefox 121+, iOS 16+, Android 13+ all functional
- **SC-012**: Bundle audit passes — no font files added, lucide-react tree-shaken (verified via bundle analyzer), inline SVG < 2KB each
- **SC-013**: SEO audit passes — public wedding pages have meta tags, semantic HTML, alt text on images

## Assumptions

- Stitch redesigns are approved and ready for implementation (design sign-off required before merge)
- DESIGN.md remains the source of truth for glassmorphic tokens (owned by Design Lead, updated via PR)
- Layout presets (bento, minimalist, etc.) were for structural variation — Stitch shows a single preferred layout
- The current `layout_preset` database column exists but may be deprecated if presets are removed
- No new dependencies required — uses existing Tailwind CSS v4 and React 19 stack
- Icons replicated via lucide-react or inline SVG; system fonts used (no custom font files)
- `layout_preset` column validated in current schema (present in `supabase/migrations/20260426000001_add_theme_to_weddings.sql`)
- No production deployment yet — safe to drop column without data migration backup

## Dependencies

| Dependency | Type | Version | Usage |
|------------|------|---------|-------|
| lucide-react | npm package | Existing | Icon library (95% coverage) |
| react-konva, konva | npm package | Existing | Floor plan canvas rendering |
| DESIGN.md | Project document | 1.0.0 | Glassmorphic token source of truth |
| globals.css | Project file | Existing | CSS variable definitions |
| Stitch redesign screenshots | Design assets | `/design/` folder | Visual reference for 5 pages |

## Edge Cases

- What happens if Stitch redesign conflicts with existing functionality? → DESIGN.md compliance takes priority, functionality preserved
- How does the system handle existing weddings with saved `layout_preset` values? → Hard removal: `layout_preset` column dropped via migration, all weddings use single glassmorphic layout (safe: no production deployment yet)
- What if dark mode Stitch redesigns differ from light mode? → Both themes must follow DESIGN.md dual-theme tokens
- What happens on mobile touch devices for Konva floor plan editor? → Use `{ force: true }` for Playwright clicks; `onTap` handlers alongside `onClick` for production (Mobile Parity principle)
- What happens for users on low-performance devices or with reduced motion preferences? → Respect `prefers-reduced-motion: reduce` media query; disable entrance animations and hover lift; maintain glass styling without motion
- What happens if DESIGN.md tokens conflict with globals.css values? → DESIGN.md YAML frontmatter is authoritative; globals.css must be updated to match
- What happens if Stitch screenshots show conflicting design patterns across pages? → Escalate to Design Lead for resolution; default to most common pattern
