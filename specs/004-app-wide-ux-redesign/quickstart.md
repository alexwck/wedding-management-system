# Quickstart: Floor Plan UX Redesign and App-Wide Design System

**Feature**: 004-app-wide-ux-redesign
**Date**: 2026-04-20

## Prerequisites

- Node.js 24 LTS
- Supabase CLI running locally (`supabase start`)
- Dev server running (`npm run dev`)

## Development Order

> **Note**: Steps 3–7 can be done in parallel after steps 1–2 are complete. The dependency graph in tasks.md shows US5 must complete before US6, but navigation work (step 3) only needs the glassmorphism tokens from step 1.

### 1. Glassmorphism Design Tokens (start here)

Edit `src/app/globals.css`:
- Add glassmorphism CSS custom properties to `:root`
- Add glassmorphism theme tokens to `@theme inline`
- Add `.glass-panel` utility in `@layer utilities`
- Add blob keyframe animations
- Add `@supports` fallback

Verify: Apply `glass-panel` class to any existing card — should see frosted-glass effect.

### 2. Gradient Backdrop Component

Create `src/components/gradient-backdrop.tsx`:
- Fixed-position gradient with 3 blob circles
- Use on all authenticated pages (dashboard, admin)
- Landing pages use couple's uploaded image instead

Verify: Navigate to `/dashboard` — should see rose-to-lavender-to-blue gradient behind glass panels.

### 3. Navigation Redesign

Modify `src/components/nav.tsx`:
- Add section grouping with headers
- Add lucide-react icons to each nav item
- Add glassmorphism styling via `.glass-panel`
- Add active-item highlighting
- Update mobile Sheet nav to match

Create `src/components/breadcrumbs.tsx`:
- Parse `usePathname()` into breadcrumb segments
- Render with `>` separators, last item as plain text
- Add to dashboard and admin layouts

Verify: Sidebar shows icons + grouped sections. Breadcrumbs appear on child pages.

### 4. Floor Plan: Chair Spacing Fix

Modify `src/components/floor-plan/hooks/use-chair-generation.ts`:
- Separate chair center calculation from top-left offset
- Verify angular spacing produces even distribution for all table sizes

Verify: Place round tables (3ft–7ft) with default chairs — all chairs equidistant.

### 5. Floor Plan: Label Fixes

Modify `use-chair-generation.ts`:
- Change chair label from `"Chair ${i + 1}"` to `"${i + 1}"`

Modify item creation logic:
- Change table label from `"Round Table ${n}"` / `"Long Table ${n}"` to `"Table ${n}"`

Verify: Chair labels show "1", "2", "3". Table labels show "Table 1", "Table 2".

### 6. Floor Plan: Wider Hit Areas

Modify each interactive item component:
- Add `hitFunc` with 8px padding to: round-table, long-table, stage-item, pillar-item, walkway-item, misc-item
- Skip chair (not directly draggable)

Verify: Click near (but not on) an item — it should grab the item, not pan the canvas.

### 7. Floor Plan: Rotation via Transformer

Create `src/components/floor-plan/rotation-transformer.tsx`:
- Konva Transformer with rotation-only config
- `rotationSnaps` for 15-degree increments
- `onTransformEnd` persists rotation to state + undo history

Modify `src/components/floor-plan/floor-plan-canvas.tsx`:
- Add RotationTransformer to the item Layer
- Wire selection state to Transformer node attachment

Verify: Select an item, grab rotation handle, rotate. Item rotates with child chairs. Collision detection works with rotation.

### 8. App-Wide Glassmorphism Application

Apply `.glass-panel` + gradient backdrop to:
- `src/app/(public)/auth/login/page.tsx` — login card
- `src/app/(auth)/dashboard/page.tsx` — RSVP summary cards
- `src/app/(auth)/dashboard/rsvps/page.tsx` — table container
- `src/app/(auth)/admin/page.tsx` — admin summary cards
- `src/app/(auth)/admin/couples/page.tsx` — form + table containers
- `src/app/(auth)/admin/weddings/page.tsx` — table container
- `src/app/(auth)/admin/weddings/[id]/page.tsx` — detail cards
- `src/app/error.tsx` — error container
- `src/app/not-found.tsx` — not-found container
- `src/components/landing-page.tsx` — RSVP button overlay
- `src/components/rsvp-form.tsx` — form card
- `src/components/floor-plan/floor-plan-toolbar.tsx` — toolbar
- `src/components/floor-plan/item-catalog.tsx` — sidebar catalog

Verify: Every page shows consistent frosted-glass panels on gradient backdrop.

## Key Files Modified

| File | Change |
|------|--------|
| `src/app/globals.css` | Glassmorphism tokens, utilities, blob animations |
| `src/components/gradient-backdrop.tsx` | New — gradient + blob background |
| `src/components/nav.tsx` | Sections, icons, glassmorphism |
| `src/components/breadcrumbs.tsx` | New — breadcrumb trail |
| `src/components/floor-plan/hooks/use-chair-generation.ts` | Label format + spacing fix |
| `src/components/floor-plan/items/*.tsx` | hitFunc on each item |
| `src/components/floor-plan/rotation-transformer.tsx` | New — Konva Transformer wrapper |
| `src/components/floor-plan/floor-plan-canvas.tsx` | Wire Transformer, selection |
| `src/app/layout.tsx` | Add GradientBackdrop to root |
| All page components | Apply glass-panel classes |

## Testing

```bash
npm run test          # Unit tests for spacing math, label format
npm run test:e2e --workers=1  # E2E tests for drag, rotation, nav, visual
```
