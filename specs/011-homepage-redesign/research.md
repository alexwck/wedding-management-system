# Research: Homepage Redesign for Mobile Conversion

**Date**: 2026-04-26 | **Feature**: specs/011-homepage-redesign

## Decisions

### Layout Preset CSS Delivery
- **Decision**: Only the active preset's CSS is loaded for guests; admins get all preset CSS for instant preview switching.
- **Rationale**: Guest-facing pages must meet the 2.5s FCP target (FR-013). Loading 7 preset CSS files upfront would add ~50-100KB uncompressed. Dynamic `import()` with Next.js `next/dynamic` allows per-preset CSS chunks.
- **Alternatives considered**: 
  - Single bundled CSS (rejected: heavy payload for guests)
  - All presets loaded upfront (rejected: violates performance target)

### Theme Configuration Storage
- **Decision**: Per-wedding `theme_json` column in `weddings` table, inheriting from global default.
- **Rationale**: Minimal schema change. No new table needed. Global default stored in a new `platform_settings` table or hardcoded in code as fallback.
- **Alternatives considered**:
  - Separate `themes` table (rejected: overkill for key-value config)
  - Global-only theme (rejected: doesn't allow per-wedding customization)

### Returning Guest Identification (Edit RSVP)
- **Decision**: Short-lived random token cookie set after RSVP submission.
- **Rationale**: No PII stored client-side. Token maps server-side to RSVP record. Simple and secure for the unauthenticated RSVP flow.
- **Alternatives considered**:
  - Name matching (rejected: insecure, anyone with same name could edit)
  - Email + magic link (rejected: adds friction, spec says "make RSVP easier")

### Semantic DOM Structure for Presets
- **Decision**: All presets share a single semantic DOM; visual differences are CSS-only.
- **Rationale**: WCAG 2.1 AA compliance must hold across all presets without per-preset screen reader testing. Screen reader users get identical heading hierarchy, landmark roles, and form field order.
- **Alternatives considered**:
  - Per-preset unique DOM (rejected: massive accessibility testing burden)
  - Dedicated "accessibility preset" (rejected: segregates users, violates inclusive design)

### Bento Grid Implementation
- **Decision**: Use CSS Grid with Tailwind v4 utilities (`grid`, `grid-cols-*`, `gap-*`).
- **Rationale**: Tailwind v4 has excellent CSS Grid support via `@theme` blocks in `globals.css`. No custom CSS framework needed. Grid collapses to single column on mobile naturally.
- **Alternatives considered**:
  - Custom bento grid component (rejected: YAGNI, Tailwind grid is sufficient)

### Glassmorphism Fallback
- **Decision**: `@supports (backdrop-filter: blur(16px))` CSS guard with solid semi-transparent fallback.
- **Rationale**: Firefox < 103 and some older mobile browsers lack support. The fallback must still look polished.
- **Implementation**: 
  ```css
  .glass-panel {
    background: rgba(255,255,255,0.3);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }
  @supports (backdrop-filter: blur(16px)) {
    .glass-panel {
      backdrop-filter: blur(16px);
    }
  }
  ```

### Mobile Table Strategy
- **Decision**: Card-based alternative for mobile tables (RSVP list, wedding list).
- **Rationale**: Horizontal scrolling tables are poor UX on mobile. Card grids with key information visible and "View details" expansion provide better scannability.
- **Implementation**: `Table` component renders `TableDesktop` (traditional table) on `md:` breakpoint and `TableMobile` (card grid) below.

## Open Questions Resolved During Clarification

All 5 clarification questions from `/speckit-clarify` were resolved:
1. Edit RSVP flow: inline replacement with pre-filled form
2. Theme storage: per-wedding DB column with global fallback
3. Screen reader DOM: single semantic structure across all presets
4. CSS delivery: lazy-loaded per-preset for guests
5. Returning guest ID: short-lived random token cookie

## Dependencies

No new major dependencies. All changes use existing stack:
- Tailwind CSS v4 (already in use)
- shadcn/ui (already in use)
- Next.js dynamic imports (built-in)
- Existing Supabase client (no changes)

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| 7 preset CSS files | Lazy-loaded; only active preset loads for guests |
| Glassmorphism blur | Use `will-change: transform` sparingly; blur only on static cards, not during scroll |
| Mobile 2.5s FCP | Image optimization via Next.js Image; gradient fallback for no-template weddings |
| Large admin wedding list | Pagination at 20 items; virtual scrolling considered for 100+ |
| Large RSVP table | Pagination at 25 rows; search/filter server-side |
