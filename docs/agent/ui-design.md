# UI And Design

## Sources

- Design system: `DESIGN.md`
- Global Tailwind v4 config and theme variables: `src/app/globals.css`
- Glass components: `src/components/glassmorphism`
- shadcn/ui primitives: `src/components/ui`
- Public landing page: `src/components/landing-page.tsx`
- Venue display: `src/components/venue-section.tsx`

## Tailwind And Theme

- Tailwind v4 is configured through CSS in `src/app/globals.css`; there is no
  `tailwind.config.js`.
- Use existing CSS variables such as `--glass-medium`, `--glass-light`, `--glass-dark`,
  `--bg-gradient`, `--button-primary`, and `--input-base`.
- Do not invent one-off palettes for features. Extend tokens deliberately in `DESIGN.md`
  and `globals.css` together.

## Nova Glass

Read `DESIGN.md` before broad UI work. Current system:

- pastel gradient app background,
- three glass variants for hierarchy,
- backdrop blur on card-like surfaces,
- entrance motion with the project easing curve,
- serif display typography for wedding-facing headings.

Use existing `GlassPanel`, `GlassCard`, `GlassButton`, and local class patterns. Avoid
new decorative ambient elements unless the task explicitly modifies the design system and
the implementation is checked across responsive viewports.

## Public Wedding Page

- `/w/[slug]` is one scrollable page: hero, venue, RSVP.
- RSVP CTA scrolls to `#rsvp`.
- Template images use object-cover crop display with focal/crop adjustment.
- Weddings without images use the existing gradient fallback.
- Venue section includes map embed and navigation buttons when valid venue data exists.

## Forms And Controls

- Use shadcn/ui and existing glass components for form surfaces.
- Inputs that can be cleared must submit empty strings; server actions normalize to `null`.
- Disabled locked states should be visible and enforced server-side.
- Use lucide icons where existing patterns do so.
- Keep interactive targets at least 44px when editing mobile or touch flows.

## Motion And E2E Stability

- `GlassButton` hover uses scale-only motion to avoid Playwright element-stability failures.
- Avoid layout-shifting hover states on controls that E2E tests click.
- For responsive changes, verify mobile and desktop layouts. Text must fit its container and
  not overlap adjacent content.

## Tables And Mobile

`ResponsiveTable` renders a sortable table on desktop and card-style items on mobile.
Do not assume table headers or sorting controls exist below the `md` breakpoint.
