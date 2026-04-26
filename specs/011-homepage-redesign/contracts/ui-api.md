# UI API Contracts: Homepage Redesign

**Feature**: specs/011-homepage-redesign | **Date**: 2026-04-26

## Glassmorphism Primitives

### GlassCard

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'heavy' | 'light';
  as?: 'div' | 'section' | 'article';
}
```

- `variant='default'`: Standard glassmorphism (`blur(16px)`, `rgba(255,255,255,0.3)`)
- `variant='heavy'`: Darker background (`rgba(255,255,255,0.5)`) for overlays
- `variant='light'`: Subtler effect (`rgba(255,255,255,0.15)`) for nested cards
- Renders with `@supports (backdrop-filter)` fallback

### GlassPanel

```typescript
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'glass';
}
```

- Canonical glassmorphism surface per constitution IX
- `padding` maps to Tailwind utilities (`p-0`, `p-4`, `p-6`, `p-8`)
- `radius` maps to CSS variables (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-glass`)

### GlassButton

```typescript
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}
```

- Minimum touch target: 44x44px (enforced via `min-w-[44px] min-h-[44px]`)
- `variant='primary'`: Solid pastel background with glass border
- `variant='secondary'`: Transparent with glass border
- `variant='ghost'`: No border, hover glass effect

## Bento Grid Primitives

### BentoGrid

```typescript
interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}
```

- Mobile: always `grid-cols-1` (vertical stack)
- Desktop: respects `cols` prop
- Gap maps to Tailwind (`gap-2`, `gap-4`, `gap-6`)

### BentoItem

```typescript
interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}
```

- Mobile: `colSpan` and `rowSpan` are ignored (always full width)
- Desktop: `colSpan` maps to `col-span-*` classes
- Always renders inside a `GlassCard`

## Layout Presets

### Preset Component Contract

All preset components MUST conform to:

```typescript
interface LayoutPresetProps {
  wedding: Wedding;           // From server component
  theme: ThemeConfiguration;  // Merged global + per-wedding
  rsvpState?: RsvpFormState;  // For returning guests
}
```

### Preset Registry

```typescript
type PresetName = 'minimalist' | 'bento' | 'storytelling' | 'magazine' | 'card-stack' | 'asymmetric' | 'cinematic';

const PRESET_REGISTRY: Record<PresetName, {
  component: React.ComponentType<LayoutPresetProps>;
  css: () => Promise<void>; // dynamic import
}>;
```

### Lazy Loading

```typescript
// Guest view: loads only active preset
const loadPreset = (name: PresetName) => PRESET_REGISTRY[name].css();

// Admin preview: preloads all presets
const preloadAllPresets = () => Promise.all(
  Object.values(PRESET_REGISTRY).map(p => p.css())
);
```

## Theme Provider

### ThemeContext

```typescript
interface ThemeContextValue {
  theme: ThemeConfiguration;
  isGlobalDefault: boolean;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isGlobalDefault: true,
});
```

### useTheme Hook

```typescript
function useTheme(): ThemeContextValue;
```

- Returns merged theme (global default + per-wedding overrides)
- Used by all glassmorphism primitives and layout presets
- Updates when `wedding.theme_json` changes

## RSVP Components

### RsvpForm

```typescript
interface RsvpFormProps {
  weddingId: string;
  initialData?: RsvpFormData;  // For edit mode
  onSubmit: (data: RsvpFormData) => Promise<void>;
}
```

- Mobile: full-width inputs, stacked layout
- Touch targets: minimum 44px height for all inputs
- Inline validation: shows error below field, does not obstruct others

### RsvpConfirmationCard

```typescript
interface RsvpConfirmationCardProps {
  rsvp: Rsvp;           // Submitted RSVP data
  onEdit: () => void;   // Replaces card with RsvpForm
}
```

- Glassmorphism card showing submitted response
- "Edit RSVP" button visible only if wedding is not locked

## Navigation Components

### MobileNav

```typescript
interface MobileNavProps {
  items: NavItem[];
  activeItem: string;
}

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}
```

- Collapses to hamburger menu on screens < 768px
- Full-screen overlay with glassmorphism background
- Active state indicated via border-left accent

## Table Components

### ResponsiveTable

```typescript
interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
  emptyState?: React.ReactNode;
}
```

- Desktop: traditional `table` element
- Mobile: card grid with key-value pairs
- Pagination controls always visible at bottom

## Modal Components

### MobileModal

```typescript
interface MobileModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}
```

- Mobile (< 640px): full-screen or bottom-sheet presentation
- Desktop (≥ 640px): centered modal with backdrop
- Close action always visible (X button or swipe down on mobile)
- Keyboard-aware: scrolls/repositions to keep focused input visible
