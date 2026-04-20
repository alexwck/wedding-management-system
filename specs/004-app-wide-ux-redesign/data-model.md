# Data Model: Floor Plan UX Redesign and App-Wide Design System

**Feature**: 004-app-wide-ux-redesign
**Date**: 2026-04-20

## Overview

This feature does not introduce new database tables or migrations. All changes are to the frontend presentation layer and client-side interaction model. The existing `floor_plans` table stores a JSON blob of `FloorPlanItem[]` — this structure gains an active `rotation` field.

## Existing Entities Modified

### FloorPlanItem (Type Definition)

**File**: `src/types/floor-plan.ts`

The `rotation` field already exists on the type. No type changes needed. Currently initialized to `0` and never modified by user interaction. This plan surfaces it via the Transformer UI.

### Chair Label Format

**Default generation**: `use-chair-generation.ts` generates labels. Currently produces labels like "Chair 1". Change to produce "1" (number only).

### Table Label Format

**Default generation**: Item creation logic generates labels. Currently produces "Round Table 1" or "Long Table 1". Change to produce "Table 1".

## New Client-Side Entities

### Glassmorphism Design Tokens

CSS custom properties defined in `globals.css`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--glass-bg` | oklch(1 0 0 / 0.3) | Panel background (translucent white) |
| `--glass-bg-heavy` | oklch(1 0 0 / 0.5) | Heavier panels (modals, dialogs) |
| `--glass-bg-light` | oklch(1 0 0 / 0.15) | Subtle surfaces |
| `--glass-border` | oklch(1 0 0 / 0.2) | Panel border |
| `--glass-shadow` | 0 8px 32px oklch(0 0 0 / 0.08) | Depth shadow |
| `--glass-blur` | 16px | Backdrop blur intensity |
| `--radius-glass` | 1rem | Glass panel corner radius |

Tailwind theme mapping in `@theme inline`:
- `--color-glass-*` → `bg-glass-*`, `border-glass-*` utilities
- `--blur-glass` → `backdrop-blur-glass` utility
- `--shadow-glass` → `shadow-glass` utility

### Navigation Structure

Client-side configuration (not database-backed):

```typescript
const navSections = [
  {
    label: "Planning",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "RSVPs", href: "/dashboard/rsvps", icon: Users },
      { label: "Floor Plan", href: "/dashboard/floor-plan", icon: Grid },
    ],
  },
];

const adminNavSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Couples", href: "/admin/couples", icon: UserPlus },
      { label: "Weddings", href: "/admin/weddings", icon: Heart },
    ],
  },
];
```

### Breadcrumb Trail

Derived from `usePathname()`. Map path segments to display labels:

| Path Pattern | Breadcrumb |
|-------------|------------|
| `/dashboard` | Dashboard |
| `/dashboard/rsvps` | Dashboard > RSVPs |
| `/dashboard/floor-plan` | Dashboard > Floor Plan |
| `/admin` | Admin |
| `/admin/couples` | Admin > Couples |
| `/admin/weddings` | Admin > Weddings |
| `/admin/weddings/[id]` | Admin > Weddings > [Wedding Name] |
| `/admin/weddings/[id]/floor-plan` | Admin > Weddings > [Wedding Name] > Floor Plan |

### Rotation Snap Configuration

| Property | Value | Purpose |
|----------|-------|---------|
| snap angles | [0, 15, 30, ... 345] | 15-degree increments |
| snap tolerance | 5 degrees | Proximity for snap activation |
| anchor offset | 30px | Distance above shape for rotation handle |

### Hit Area Padding

| Property | Value | Purpose |
|----------|-------|---------|
| hit padding | 8px | Extra clickable area around all interactive shapes |
