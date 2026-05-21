---
name: Nova Glass
version: 2.0.0
description: Romantic glassmorphic design system for wedding management platform
tokens:
  colors:
    light:
      background_gradient: "linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #d1fae5 100%)"
      background_base: "#FFFFFF"
      ambient_accent_pink: "#fce7f3"
      ambient_accent_lavender: "#e0e7ff"
      ambient_accent_mint: "#d1fae5"
      glass_surface_medium: "rgba(255, 255, 255, 0.10)"
      glass_surface_light: "rgba(255, 255, 255, 0.20)"
      glass_surface_dark: "rgba(0, 0, 0, 0.20)"
      stroke_border_medium: "rgba(255, 255, 255, 0.20)"
      stroke_border_light: "rgba(255, 255, 255, 0.30)"
      stroke_border_dark: "rgba(255, 255, 255, 0.10)"
      text_primary: "#1A1D24"
      text_secondary: "rgba(26, 29, 36, 0.65)"
      button_primary: "rgba(26, 29, 36, 0.80)"
      button_primary_hover: "rgba(26, 29, 36, 0.90)"
      input_base: "rgba(255, 255, 255, 0.40)"
      input_focus: "rgba(255, 255, 255, 0.60)"
      input_ring: "rgba(255, 255, 255, 0.50)"
  effects:
    backdrop_blur_standard: "16px"
    backdrop_blur_elevated: "24px"
    backdrop_blur_subtle: "8px"
    shadow_outer: "0 8px 32px 0 rgba(0, 0, 0, 0.08)"
    shadow_inner_recessed: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)"
    corner_radius_xl: "12px"
    corner_radius_2xl: "16px"
    corner_radius_3xl: "24px"
  typography:
    font_family_sans: "Inter, system-ui, sans-serif"
    font_family_display: "Playfair Display, Cormorant Garamond"
    font_family_accent: "Manrope, sans-serif"
    weights:
      regular: 400
      medium: 500
      semibold: 600
    scale:
      h1: "2.5rem"
      h2: "1.75rem"
      body: "1rem"
      small: "0.875rem"
  motion:
    duration_entrance: "800ms"
    duration_standard: "300ms"
    duration_micro: "150ms"
    easing_custom: "cubic-bezier(0.16, 1, 0.3, 1)"
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    hover_transform: "translateY(-2px)"
    active_transform: "scale(0.98)"
    entrance_opacity: "0 to 1"
    entrance_translate: "20px to 0px"
  layout:
    sidebar_width: "280px"
    canvas_padding: "40px"
  components:
    button_primary_glow_blur: "8px"
    form_input_focus_glow: "4px"
    status_pill_opacity: "0.50"
    gradient_blob_blur: "100px"
---

# Nova Glass Design System

Romantic glassmorphic design system for the wedding management platform with pastel gradients, layered glass surfaces, and elegant motion.

## Overview

This design system defines glassmorphic UI patterns for a premium wedding planning experience. The system reduces cognitive load through consistent visual hierarchy, smooth motion, and translucent surfaces that create depth without visual weight.

**Key Principles:**
- **Clarity through translucency**: Glass surfaces maintain context awareness while separating content layers
- **Romantic elegance**: Pastel gradients and serif typography create a wedding-appropriate aesthetic
- **Smooth motion**: 800ms entrances with custom easing for premium feel
- **Layered depth**: Multiple glass variants create visual hierarchy
- **Playful touches**: Animated gradient blobs, decorative elements

## Background System

### Pastel Gradient Background

The base page background uses a soft pastel gradient that evokes romance and elegance:

```css
--bg-gradient: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #d1fae5 100%);
```

| Stop | Color | Name |
|------|-------|------|
| 0% | `#fce7f3` | Pink (rose-100) |
| 50% | `#e0e7ff` | Lavender (indigo-100) |
| 100% | `#d1fae5` | Mint (emerald-100) |

### Gradient Blob Decorations

Ambient decorative elements with heavy blur for soft, drifting accent shapes:

```css
--gradient-blob-blur: 100px;
```

Use absolute-positioned divs with radial gradients and `blur(100px)` for ambient background accents.

## Colors

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#FFFFFF` | Base for gradient overlays |
| `--glass-medium` | `rgba(255, 255, 255, 0.10)` | Standard glass surfaces |
| `--glass-light` | `rgba(255, 255, 255, 0.20)` | Elevated glass surfaces |
| `--glass-dark` | `rgba(0, 0, 0, 0.20)` | Dark glass (footers, overlays) |
| `--glass-border-medium` | `rgba(255, 255, 255, 0.20)` | Standard borders |
| `--glass-border-light` | `rgba(255, 255, 255, 0.30)` | Light borders |
| `--text-primary` | `#1A1D24` | Headings, primary content |
| `--text-secondary` | `rgba(26, 29, 36, 0.65)` | Secondary text |
| `--button-primary` | `rgba(26, 29, 36, 0.80)` | Primary button bg |
| `--button-primary-hover` | `rgba(26, 29, 36, 0.90)` | Primary button hover |
| `--input-base` | `rgba(255, 255, 255, 0.40)` | Input field background |
| `--input-focus` | `rgba(255, 255, 255, 0.60)` | Input field focused |
| `--input-ring` | `rgba(255, 255, 255, 0.50)` | Input focus ring |

## Glass Surface Variants

Three distinct glass variants for different contexts and hierarchy levels:

| Variant | CSS | Usage |
|---------|-----|-------|
| `glass-medium` | `bg-white/10 backdrop-blur-md border-white/20` | Standard cards, panels |
| `glass-light` | `bg-white/20 backdrop-blur-sm border-white/30` | Stats cards, elevated surfaces |
| `glass-dark` | `bg-black/20 backdrop-blur-md border-white/10` | Footers, dark overlays |

### Backdrop Blur Levels

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | `8px` | Input fields, inline elements |
| Standard | `16px` | Cards, panels, modals |
| Elevated | `24px` | High-elevation surfaces |

## Typography

### Font Families

```css
--font-sans: Inter, system-ui, sans-serif;
--font-display: Playfair Display, Cormorant Garamond;
--font-accent: Manrope, sans-serif;
```

| Family | Usage |
|--------|-------|
| Display Serif | H1, H2, elegant headings |
| Sans-Serif | Body text, UI elements |
| Accent (Manrope) | Numeric displays, stats |

### Scale & Weights

| Element | Size | Weight | Family |
|---------|------|--------|--------|
| H1 | 2.5rem | 600 | Display Serif |
| H2 | 1.75rem | 600 | Display Serif |
| Body | 1rem | 400 | Sans-Serif |
| Small/Caption | 0.875rem | 500 | Sans-Serif |

## Layout

### Structure

- **Sidebar**: Fixed `280px` width, full-height glass panel (left)
- **Main Canvas**: Responsive container with `40px` padding
- **Layering**: Increasing backdrop-blur and border-opacity by hierarchy

## Elevation & Depth

### Shadows

```css
/* Outer shadow (cards, panels) */
--shadow-outer: 0 8px 32px 0 rgba(0, 0, 0, 0.08);

/* Inner shadow (recessed inputs) */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
```

### Corner Radius

| Size | Value | Usage |
|------|-------|-------|
| `xl` | `12px` | Buttons, status pills, small elements |
| `2xl` | `16px` | Buttons, inputs, medium elements |
| `3xl` | `24px` | Cards, panels, large containers |

## Components

### Button Variants

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `bg-slate-900/80` | `text-white` | None | `bg-slate-800/90` |
| Secondary | `glass-light` | `text-slate-800` | `border-white/30` | `bg-white/30` |
| Ghost | `bg-transparent` | `text-slate-700` | None | `bg-white/10` |

### Primary Button (Translucent)

```css
background: rgba(26, 29, 36, 0.80);
color: white;
border-radius: 16px;
backdrop-filter: blur(8px);
transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
```

Hover state:
```css
background: rgba(26, 29, 36, 0.90);
transform: translateY(-2px);
```

### Form Inputs

**Base styling:**
```css
background: rgba(255, 255, 255, 0.40);
border: 1px solid rgba(255, 255, 255, 0.40);
border-radius: 16px;
backdrop-filter: blur(8px);
```

**Focus state:**
```css
background: rgba(255, 255, 255, 0.60);
border-color: rgba(255, 255, 255, 0.50);
ring: 2px solid rgba(255, 255, 255, 0.50);
```

### Status Pills

Rounded glass pills at `50%` opacity for status indicators:

```css
border-radius: 9999px;
padding: 4px 12px;
font-size: 12px;
opacity: 0.50;
```

| Status | Color | Usage |
|--------|-------|-------|
| Success | `emerald-500` | Open, available, confirmed |
| Warning | `amber-500` | Missing, pending, attention |
| Error | `rose-500` | Declined, closed, error |
| Neutral | `slate-500` | Locked, disabled, info |

### Status Badge Example

```html
<span class="rounded-full px-3 py-1 text-xs bg-emerald-500/50 text-emerald-900">
  Confirmed
</span>
```

## Motion & Animation

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-entrance` | `800ms` | Page/section entrances |
| `--duration-standard` | `300ms` | Hover, focus, transitions |
| `--duration-micro` | `150ms` | Micro-interactions |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--easing-custom` | `cubic-bezier(0.16, 1, 0.3, 1)` | Premium entrances |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |

### Interaction States

| State | Transform | Duration |
|-------|-----------|----------|
| Hover | `translateY(-2px)` | 300ms |
| Active | `scale(0.98)` | 150ms |
| Entrance | `opacity: 0→1`, `translateY: 20px→0px` | 800ms |

### Entrance Animation

```css
@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entrance {
  animation: entrance 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### Staggered List Entrance

```css
.stagger-list > *:nth-child(1) { animation-delay: 0ms; }
.stagger-list > *:nth-child(2) { animation-delay: 100ms; }
.stagger-list > *:nth-child(3) { animation-delay: 200ms; }
.stagger-list > *:nth-child(4) { animation-delay: 300ms; }
.stagger-list > *:nth-child(5) { animation-delay: 400ms; }
```

## Do's and Don'ts

### Do

- ✅ Use glass surfaces consistently across all cards and panels
- ✅ Apply motion for feedback and orientation
- ✅ Use pastel gradient background as base layer
- ✅ Layer glass variants (medium/light/dark) for hierarchy
- ✅ Use 800ms entrance animations with custom easing
- ✅ Use recessed styling for form inputs
- ✅ Apply gradient blob decorations for ambient accents

### Don't

- ❌ Mix hardcoded color values — use CSS variables
- ❌ Skip motion on interactive elements
- ❌ Use more than 3 elevation levels
- ❌ Apply heavy blur (>24px) except for decorative blobs
- ❌ Use solid backgrounds where glass is appropriate
- ❌ Use standard easing for entrance animations

## Page Patterns

### Login Page

- Centered frosted glass card with `glass-light` variant
- Gradient blob decorations with `blur(100px)` in background
- High-fidelity backdrop blur for premium feel
- Elegant typography with Playfair Display headings

### Admin Dashboard

- Floating glass stats cards using `glass-light` variant
- Side navigation with `glass-medium` panel
- "Recent Weddings" feed with glass-tinted status badges
- Dual-shadow depth on elevated cards

### Weddings Table

- Information-dense data table in translucent glass container
- Glass-tinted status badges (emerald/rose/slate at 50% opacity)
- Refined typography hierarchy
- Action shortcuts per row with ghost buttons

### Floor Plan Editor

- Interactive canvas-based layout (react-konva)
- Floating glass toolbar with zoom controls
- Drag-and-drop elements with smooth motion
- Professional workspace with glassmorphic aesthetic
- **Mobile progressive disclosure**: Sidebars collapse into a bottom action bar (Guests / Catalog / Menu FAB). Tapping opens bottom drawers for guest list and item catalog. Canvas remains fully interactive on mobile.
- **Touch-optimized controls**: All buttons `min-w-[44px] min-h-[44px]`. Transformer anchors scale inversely with zoom (`anchorSize = max(10 / stageScale, 15)`) to stay finger-friendly.
- **Select → Edit pattern on mobile**: Tapping a node opens a bottom sheet with large numeric inputs for rotation, dimensions, chair count, and label editing — replacing imprecise drag-resize on small screens.
- **Canvas skeleton**: Pulsing shimmer overlay while floor plan data loads.

### Guest RSVP Experience

- Hero section with large blurred image overlay
- Elegant serif headings (Playfair Display)
- Venue details with map integration
- Clear glass-morphic forms for RSVP submission

## Mobile Layout Shifts

Complex tools use progressive disclosure on mobile rather than hard blocks:

- **Floor plan editor**: Fixed sidebars become bottom drawers (`<Sheet side="bottom">`).
- **Touch targets**: Minimum `44×44` physical pixels (`min-w-[44px] min-h-[44px]`) on all interactive elements.
- **Canvas editing**: Tapping a tiny node opens a dedicated `MobileItemEditor` sheet instead of requiring direct manipulation.
- **Motion on mobile**: `whileHover` uses `scale` only (no `y` translation) to avoid Playwright stability issues and prevent layout shift on touch devices where hover is absent.
