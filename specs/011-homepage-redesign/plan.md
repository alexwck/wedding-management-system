# Implementation Plan: Homepage Redesign for Mobile Conversion

**Branch**: `011-homepage-redesign` | **Date**: 2026-04-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/011-homepage-redesign/spec.md`

## Summary

Redesign all pages, components, and UI elements in the wedding management system using a cohesive glassmorphism and bento box design system. The redesign prioritizes mobile-first usability across public-facing pages (`/`, `/auth/login`, `/w/[slug]`), admin dashboards (`/admin/*`), and couple dashboards (`/dashboard/*`). The implementation introduces 7 layout presets for wedding landing pages (bento default), a per-wedding theme configuration system, and comprehensive mobile optimizations for forms, tables, dialogs, navigation, and the floor plan editor.

**Primary approach**: Extend the existing `.glass-panel` CSS utility into a full design system, introduce bento grid layout primitives, refactor all components to use the new system, and implement lazy-loaded preset CSS for guests.

## Technical Context

**Language/Version**: TypeScript 5.4 (strict mode), Next.js 16 (App Router), React 19
**Primary Dependencies**: Tailwind CSS v4 (CSS-based config), shadcn/ui (Nova theme), react-konva + konva, react-hook-form, zod, cmdk
**Storage**: Supabase PostgreSQL (`weddings` table extended with `theme_json` column)
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E on desktop + mobile Chrome)
**Target Platform**: Web (mobile-first responsive, iOS Safari, Android Chrome, Samsung Internet)
**Project Type**: Web application (Next.js App Router, single codebase)
**Performance Goals**: First Contentful Paint < 2.5s on simulated 4G for 95% of page loads; 60fps scrolling on admin/couple card grids
**Constraints**:
- Tailwind v4 CSS-based configuration only (no `tailwind.config.js`)
- No custom CSS frameworks beyond Tailwind + existing shadcn/ui
- All presets share a single semantic DOM structure (CSS-only visual differences)
- Lazy-loaded preset CSS for guests (all presets loaded for admin preview)
- Floor plan editor blocked on screens < 640px (read-only preview only)
**Scale/Scope**: ~40+ components, 15+ pages, 7 layout presets, 10+ shared UI primitives

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven Development | Pass | Spec complete with 28 FRs, 11 SCs, 3 user stories |
| Test Verification (Red-Green) | Pass | Plan includes unit, component, and E2E tests for every user story |
| Type Safety | Pass | All new theme/config types added to Supabase schema + Zod schemas |
| Component-First Architecture | Pass | New glassmorphism primitives are shared components |
| User Experience First | Pass | Mobile-first design, 2.5s FCP target, inline validation |
| Simplicity | Pass | Extends existing design system rather than replacing; single semantic DOM for all presets |
| Security by Default | Pass | No auth changes; RSVP edit uses short-lived random token cookie |
| Mobile Parity | Pass | All interactive elements optimized for touch; `onTap` + `onClick` for Konva |
| Data Integrity | Pass | Theme config validated at serialization boundary (Zod); atomic upsert for theme updates |
| Glassmorphism Design System | Pass | Extends existing `.glass-panel` utility; no hardcoded values |

*No violations requiring justification.*

## Project Structure

### Documentation (this feature)

```text
specs/011-homepage-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── ui-api.md        # Component API contracts
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Redesigned root homepage
│   │   ├── auth/login/page.tsx   # Redesigned login page
│   │   └── w/[slug]/page.tsx    # 7 layout presets for wedding landing
│   ├── (auth)/
│   │   ├── admin/
│   │   │   ├── weddings/
│   │   │   │   ├── page.tsx      # Admin wedding list (card grid)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Wedding detail tabs (bento layout)
│   │   │   │       └── floor-plan/page.tsx  # Tablet-optimized editor
│   │   │   └── page.tsx          # Admin dashboard
│   │   └── dashboard/
│   │       ├── page.tsx          # Couple dashboard (bento RSVP summary)
│   │       └── floor-plan/page.tsx  # Tablet-optimized editor
│   ├── layout.tsx                # Root layout with global theme provider
│   └── globals.css               # Extended glassmorphism + bento CSS
├── components/
│   ├── ui/                       # shadcn/ui primitives (updated styling)
│   ├── glassmorphism/            # NEW: GlassCard, GlassPanel, GlassButton
│   ├── bento/                    # NEW: BentoGrid, BentoItem
│   ├── layout-presets/           # NEW: PresetA..PresetG (CSS-only wrappers)
│   ├── landing-page.tsx          # Refactored: layout preset wrapper
│   ├── rsvp-form.tsx             # Refactored: mobile-optimized inputs
│   ├── rsvp-section.tsx          # Refactored: glassmorphism styling
│   ├── lock-toggle.tsx           # Refactored: glassmorphism styling
│   ├── template-preview.tsx      # Refactored: preset preview
│   ├── template-upload.tsx       # Refactored: glassmorphism styling
│   ├── venue-editor.tsx          # Refactored: mobile touch targets
│   ├── venue-section.tsx         # Refactored: glassmorphism + map fallback
│   ├── editable-couple-name.tsx  # Refactored: glassmorphism styling
│   ├── rsvp-table.tsx            # Refactored: mobile pagination
│   ├── rsvp-summary.tsx          # Refactored: bento grid layout
│   ├── export-buttons.tsx        # Refactored: glassmorphism styling
│   ├── floor-plan/               # Refactored: canvas + glassmorphism controls
│   └── navigation/               # NEW: MobileNav, AdminSidebar, CoupleSidebar
├── lib/
│   ├── design-system/            # NEW: theme.ts, preset-loader.ts, glass-utils.ts
│   ├── validations/
│   │   └── theme.ts              # NEW: Zod schema for theme config
│   └── supabase/
│       └── types.ts              # UPDATED: ThemeConfig DB type
├── types/
│   └── theme.ts                  # NEW: ThemeConfiguration type
└── styles/
    └── presets/                  # NEW: preset-a.css ... preset-g.css
```

### Test Structure

```text
tests/
├── unit/
│   ├── lib/
│   │   └── design-system/        # theme.ts, preset-loader.ts tests
│   └── validations/
│       └── theme.test.ts         # Zod schema tests
├── component/
│   ├── glassmorphism/            # GlassCard, GlassPanel tests
│   ├── bento/                    # BentoGrid, BentoItem tests
│   ├── layout-presets/           # Preset rendering tests
│   ├── landing-page.test.tsx     # Layout preset switching tests
│   ├── rsvp-form.test.tsx        # Mobile input validation tests
│   ├── venue-section.test.tsx    # Map fallback tests
│   └── navigation.test.tsx       # Mobile nav collapse tests
└── e2e/
    ├── guest-rsvp-mobile.spec.ts   # US-1: Guest mobile RSVP flow
    ├── admin-mobile.spec.ts        # US-2: Admin mobile management
    └── couple-mobile.spec.ts       # US-3: Couple mobile dashboard
```

## Complexity Tracking

No violations. All complexity is justified:
- 7 layout presets share a single semantic DOM — complexity is CSS-only, not structural
- Per-wedding theme config stored in existing `weddings` table; two new tables (`rsvp_tokens`, `platform_settings`) for RSVP edit flow and global theme default
- Lazy-loaded preset CSS uses dynamic `import()` — standard Next.js pattern
- Floor plan editor small-screen blocking is a guard clause, not a redesign

## Implementation Phases

### Phase 1: Design System Foundation
1. Extend `globals.css` with bento grid primitives and expanded glassmorphism CSS variables
2. Create `components/glassmorphism/` primitives (GlassCard, GlassPanel, GlassButton)
3. Create `components/bento/` primitives (BentoGrid, BentoItem)
4. Implement theme configuration types (`types/theme.ts`, `lib/validations/theme.ts`)
5. Add Supabase migration: `weddings.theme_json` column

### Phase 2: Public Page Redesign
1. Refactor `src/app/(public)/w/[slug]/page.tsx` to support 7 layout presets
2. Implement layout preset components (`components/layout-presets/preset-a.tsx` ... `preset-g.tsx`)
3. Refactor RSVP form for mobile optimization (touch targets, inline validation)
4. Implement venue section with map fallback (FR-022)
5. Implement "already RSVPed" confirmation card with inline edit (FR-023)
6. Create lazy-loaded preset CSS system (`lib/design-system/preset-loader.ts`)
7. Redesign root homepage (`/`) and login page (`/auth/login`)

### Phase 3: Admin & Couple Dashboard Redesign
1. Refactor admin wedding list (`/admin/weddings`) to card grid with glassmorphism
2. Refactor couple dashboard (`/dashboard`) with bento RSVP summary cards
3. Implement mobile-responsive tables (RSVP table, wedding list) with pagination
4. Refactor modal dialogs for mobile full-screen/bottom-sheet presentation
5. Implement mobile navigation (hamburger menus for admin/couple sidebars)
6. Add floor plan editor small-screen blocking (FR-026)

### Phase 4: Testing
1. Write unit tests for theme config validation and preset loading
2. Write component tests for glassmorphism primitives, bento grid, and layout presets
3. Write E2E tests for all 3 user stories on mobile Chrome
4. Run full test suite: `npm run test` and `npm run test:e2e --workers=1`

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Single semantic DOM for all presets | Ensures WCAG compliance is maintained without per-preset testing; visual differences are CSS-only |
| Lazy-loaded preset CSS | Guest-facing pages only load active preset; admins load all for instant preview |
| Random token cookie for RSVP edit | No PII stored client-side; short-lived token maps server-side to RSVP record |
| Floor plan blocked under 640px | Canvas editing requires precision; read-only preview still available |
| Theme stored in `weddings.theme_json` | Minimal schema change; inherits global default when unset |
