# UI Contracts: Floor Plan UX Redesign and App-Wide Design System

**Feature**: 004-app-wide-ux-redesign
**Date**: 2026-04-20

This feature is purely frontend/UI with no new API endpoints, server actions, or database changes. The contracts below define the component interfaces.

## Glassmorphism Utility Classes

### `.glass-panel`

```
 Applies frosted-glass effect to any container element.
 - Background: var(--glass-bg) with backdrop-filter fallback
 - Border: 1px solid var(--glass-border)
 - Shadow: var(--glass-shadow)
 - Border-radius: var(--radius-glass)
 - Fallback: solid oklch(1 0 0 / 0.85) background when backdrop-filter unsupported
```

### `.glass-panel-heavy`

```
 Variant for elevated surfaces (modals, dialogs, dropdowns).
 - Background: var(--glass-bg-heavy)
 - Same border, shadow, radius as .glass-panel
```

## Component Props Contracts

### GradientBackdrop

```typescript
interface GradientBackdropProps {
  className?: string;
  variant?: "default" | "landing"; // "landing" omits blobs (image replaces)
}
```

### Breadcrumbs

```typescript
interface BreadcrumbsProps {
  className?: string;
}
// Internally uses usePathname() to derive trail
// Renders: Link > Link > CurrentSpan
```

### NavSidebar (redesigned)

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavSidebarProps {
  sections: NavSection[];
  activeHref: string; // current pathname for highlighting
}
```

### RotationTransformer (new)

```typescript
interface RotationTransformerProps {
  selectedItemId: string | null;
  stageRef: React.RefObject<Konva.Stage>;
  onRotationEnd: (itemId: string, rotation: number) => void;
  snapEnabled?: boolean; // default true
}
```

### Item hitFunc expansion (applied to each item component)

```typescript
// Constants
const HIT_PADDING = 8; // pixels

// Applied to: round-table, long-table, stage-item, pillar-item, walkway-item, misc-item
// NOT applied to: chair (not directly draggable)
```

## Label Format Contracts

### Chair Labels

```
Old: "Chair 1", "Chair 2", "Chair 3"
New: "1", "2", "3"
Custom (after user edit): whatever the user typed
```

### Table Labels

```
Old: "Round Table 1", "Long Table 2"
New: "Table 1", "Table 2"
Custom (after user edit): whatever the user typed
```
