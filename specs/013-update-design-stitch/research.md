# Research Report: Stitch Redesign Implementation

**Date**: 2026-05-17  
**Feature**: 013-update-design-stitch

---

## R-001: Asset Audit (Icons, Fonts, Illustrations)

### Icons: 95% lucide-react coverage

All standard UI icons have direct lucide-react equivalents:

| Page | Icons Needed | lucide-react Mapping |
|------|--------------|---------------------|
| **Login** | Eye, Lock, User, Arrow | `Eye`/`EyeOff`, `Lock`, `User`, `ArrowRight` |
| **Admin Dashboard** | Search, Bell, Calendar, Users, Dollar, Trending, MoreVertical, Plus, Settings, LogOut | All available |
| **Weddings Table** | Search, Filter, Plus, Edit, Trash, Chevron, ExternalLink, Download | All available |
| **Floor Plan** | Grid, Zoom, Undo, Redo, Save, Rotate, Trash, Move, Lock | All available |
| **RSVP** | CheckCircle, User, Mail, Utensils, Wine, Music, Heart, Arrow, Info | All available |

### Custom Inline SVG Required

Only floor plan furniture icons need custom SVG:
- Round table (circle + chair indicators)
- Rectangle table (rect + chair indicators)

**Recommendation**: Create `FurnitureIcons.tsx` with 3-4 inline SVGs.

### Fonts: System fonts suffice

No custom fonts required. Recommended stack:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

---

## R-002: layout_preset Removal Inventory

### Files to Delete (21 total)

| Path | Type |
|------|------|
| `src/lib/design-system/preset-loader.ts` | Module |
| `src/components/preset-wrapper.tsx` | Component |
| `src/components/preset-selector.tsx` | Component |
| `src/components/layout-presets/*.tsx` (7 files) | Preset components |
| `src/styles/presets/*.css` (7 files) | Preset stylesheets |
| `tests/unit/actions/admin-preset.test.ts` | Test |
| `tests/component/layout-presets/preset-rendering.test.tsx` | Test |
| `tests/component/preset-selector.test.tsx` | Test |
| `tests/unit/lib/design-system/preset-loader.test.ts` | Test |

### Files to Modify (4 total)

| File | Changes |
|------|---------|
| `src/app/actions/admin.ts` | Remove `layout_preset` from select queries (lines 71, 293), remove from return objects (lines 123, 347), delete `updateWeddingPreset()` function (lines 636-669) |
| `src/app/(public)/w/[slug]/page.tsx` | Remove preset imports (lines 11-13), remove `layout_preset` from select (line 56), remove `activePreset` logic (lines 68-70) |
| `src/app/(auth)/admin/weddings/[id]/page.tsx` | Remove `PresetSelector` import (line 10), remove `DEFAULT_PRESET` import (line 11), remove `<PresetSelector>` component (lines 103-107) |
| `src/lib/design-system/layout-preset-props.ts` | Delete `layout_preset: string;` field or delete entire file |

### Migration Required

Create migration to:
1. `ALTER TABLE weddings DROP COLUMN layout_preset;`
2. `ALTER TABLE weddings DROP CONSTRAINT weddings_layout_preset_check;`

Source: `supabase/migrations/20260426000001_add_theme_to_weddings.sql` (lines 3, 7-9, 11)

---

## R-003: DESIGN.md Gap Analysis (Updated)

### DESIGN.md Created and Validated

DESIGN.md now exists at project root and passes `npx @google/design.md lint` with zero errors.

**Format**: Google design.md standard with YAML frontmatter containing machine-readable design tokens.

### Design Tokens (YAML Frontmatter)

| Category | Tokens Defined |
|----------|----------------|
| **Colors** | Light/Dark mode: `--bg-base`, `--glass-surface`, `--glass-border`, `--text-primary`, `--text-secondary`, `--accent-indigo`, `--accent-rose/violet` |
| **Effects** | `--backdrop-blur-standard: 16px`, `--backdrop-blur-elevated: 24px`, `--shadow-outer`, `--shadow-inner-recessed`, corner radii (SM: 12px, MD: 24px, LG: 32px) |
| **Typography** | `--font-sans: Inter`, `--font-display: Playfair Display/Cormorant Garamond`, scale (H1: 2.5rem, H2: 1.75rem, Body: 1rem, Small: 0.875rem) |
| **Motion** | `--duration-standard: 300ms`, `--duration-micro: 150ms`, `--easing: cubic-bezier(0.4, 0, 0.2, 1)`, `--hover-transform: translateY(-2px)`, `--active-transform: scale(0.98)` |
| **Layout** | `--sidebar-width: 280px`, `--canvas-padding: 40px` |
| **Components** | Button glows, form input focus glow, status pill opacity |

### globals.css Alignment Needed

The CSS variables in `src/app/globals.css` should be updated to match DESIGN.md token names for consistency:

| globals.css | DESIGN.md | Action |
|-------------|-----------|--------|
| `--glass-bg` | `--glass-surface` | Rename or alias |
| `--glass-shadow` | `--shadow-outer` | Rename or alias |
| (missing) | `--hover-transform`, `--active-transform` | Add motion tokens |
| (missing) | `--duration-standard`, `--easing` | Add transition tokens |

### Recommendation

1. Keep DESIGN.md as the source of truth for design tokens
2. Update `globals.css` to export CSS variables that match DESIGN.md token names
3. Add motion/transition tokens to `globals.css` for component usage

---

## R-004: Floor Plan Editor Parity

### Key Finding: Editors Are Structurally Identical

Both admin and couple floor plan editors use the same `FloorPlanCanvas` component and shared hooks.

### Differences (Non-Styling)

| Aspect | Admin | Couple |
|--------|-------|--------|
| Auth Check | `user.app_metadata?.role === "admin"` | Any authenticated user |
| Wedding Lookup | By URL param `[id]` | By `user_id` from session |

### Shared Components (Already Glassmorphic)

| Component | Glass Class Used |
|-----------|-----------------|
| Top Toolbar | `glass-panel border-b` |
| Guest Panel | `glass-panel` |
| Item Catalog | `glass-panel` |
| Label Edit Dialog | `glass-panel rounded-lg` |
| Dimension Edit Overlay | `glass-panel rounded-lg` |
| Empty State Card | `glass-panel rounded-xl` |
| Device Check Warning | `GlassCard variant="heavy"` |

### Components Needing Updates

| Component | Current | Recommendation |
|-----------|---------|----------------|
| `CanvasStats` | Plain `border-b` | Add `glass-panel--light` |
| `FloorPlanToolbar` buttons | shadcn `Button variant="outline"` | Consider `GlassButton` variant |

### Conclusion

Both editors automatically receive identical styling when shared components are updated. No separate implementation needed.

---

## Technical Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Use lucide-react for 95% of icons | Zero new dependencies, consistent style |
| Inline SVG for furniture icons | Only 3-4 custom icons needed |
| System fonts only | No custom fonts in Stitch redesign |
| Delete preset system entirely | 21 files removed, simplifies codebase |
| Update globals.css with motion tokens | Missing hover/click/transition tokens |
| Single implementation for both floor plan editors | Shared component architecture |
