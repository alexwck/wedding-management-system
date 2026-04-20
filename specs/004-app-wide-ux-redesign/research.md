# Research: Floor Plan UX Redesign and App-Wide Design System

**Feature**: 004-app-wide-ux-redesign
**Date**: 2026-04-20

## Decision 1: Round Table Chair Spacing Fix

**Decision**: Rewrite chair center calculation to explicitly separate center-point computation from top-left offset adjustment.

**Rationale**: The angular formula `(2π * i) / count - π/2` is mathematically correct and produces even angular intervals. The bug is likely in how chair width/height offsets interact with the center calculation. The current code computes `cx + cos(angle) * offset - chairWidth/2` in a single expression, making it hard to verify the center point is correct before the offset adjustment. Separating these steps makes the math auditable.

**Alternatives considered**:
- Recalculating from scratch with a different offset formula — rejected because the angular formula is correct
- Using a different starting angle — rejected because -π/2 (12 o'clock) is the standard convention

## Decision 2: Glassmorphism Design System with Tailwind CSS v4

**Decision**: Use CSS custom properties in `:root` + `@theme inline` blocks for token definitions, `@layer utilities` for a reusable `.glass-panel` class, and `@supports (backdrop-filter: blur(1px))` for progressive enhancement fallback.

**Rationale**: Tailwind v4 uses CSS-based configuration. The project already has `@theme inline` in globals.css. Adding glassmorphism tokens follows the same pattern. Browser support for `backdrop-filter` is 96.7% globally (Chrome 76+, Firefox 103+, Safari 9+, Edge 17+). The `@supports` fallback provides solid backgrounds for the remaining 3.3%.

**Key tokens**:
- `--glass-bg`: oklch(1 0 0 / 0.3) — translucent white
- `--glass-border`: oklch(1 0 0 / 0.2) — subtle white border
- `--glass-shadow`: 0 8px 32px oklch(0 0 0 / 0.08) — soft depth
- `--glass-blur`: 16px — backdrop blur intensity

**Gradient backdrop**: Diagonal gradient (rose-50 → white → violet-50) with 3 semi-transparent blob circles using `blur-3xl` and slow CSS keyframe animations for organic movement.

**Alternatives considered**:
- Tailwind plugin — rejected because Tailwind v4 prefers CSS-native configuration
- Inline styles for glassmorphism — rejected because tokens must be consistent across all surfaces
- CSS-in-JS — rejected because the project uses Tailwind utility classes

## Decision 3: Konva Rotation via Transformer

**Decision**: Use `Konva.Transformer` with `rotateEnabled={true}`, `resizeEnabled={false}`, `enabledAnchors={[]}` (rotation only), and `rotationSnaps` for 15-degree increments.

**Rationale**: The Transformer is a built-in Konva component that provides a rotation handle, selection border, and automatic touch support. It requires minimal code — attach to selected node via `useEffect`, read rotation angle on `onTransformEnd`. The `rotationSnaps` array provides the 15-degree snap behavior specified in the requirements, with free rotation available between snap points. The Transformer handles both mouse and touch drag automatically, satisfying the Mobile Parity constitution principle.

**Key implementation details**:
- `rotationSnaps`: Array of 0, 15, 30, ... 345 degrees
- `rotationSnapTolerance`: 5 degrees
- `rotateAnchorOffset`: 30px above shape
- Read `node.rotation()` on `onTransformEnd`, persist to state
- Push undo history entry on rotation commit

**Alternatives considered**:
- Custom rotation handle (separate draggable Circle) — more code, same result, no built-in selection border
- CSS transform on wrapper div — doesn't work with Konva canvas

## Decision 4: Wider Hit Areas via hitFunc

**Decision**: Add `hitFunc` to each interactive Konva shape to expand the clickable/draggable region by 8px padding beyond visual bounds.

**Rationale**: `hitFunc` replaces the shape's hit detection region with a custom-drawn path. For Rect items (long tables, stages, pillars, walkways, misc), draw a larger rect. For Circle items (round tables), draw a larger circle. Chairs are not directly draggable (they move with their parent table), so they don't need hitFunc. The expanded hit region only affects drag initiation — once a drag begins, Konva tracks the pointer globally regardless of hit regions.

**Alternatives considered**:
- `hitStrokeWidth` — only widens stroke hit area, not fill; less uniform than hitFunc
- Invisible overlay shapes — doubles rendered shapes, worse performance, rotation complexity
- Modifier key for canvas pan — undiscoverable for non-technical users

## Decision 5: Navigation Redesign with Breadcrumbs

**Decision**: Redesign the sidebar nav component with icon + text items grouped into sections, glassmorphism styling, active-item highlighting, and a breadcrumb component on interior pages using Next.js App Router's `usePathname()` and `useSegments()`.

**Rationale**: Next.js App Router provides `usePathname()` which returns the current path. A breadcrumb component can parse this path and render links for each segment. The sidebar nav items need icons (lucide-react, already used by shadcn/ui) and section headers. Both the sidebar and breadcrumbs get glassmorphism styling via the `.glass-panel` utility.

**Alternatives considered**:
- Static breadcrumbs hardcoded per page — rejected because it doesn't scale and is error-prone
- Third-party breadcrumb library — rejected because it's simple enough to build inline

## Decision 6: Glassmorphism Scope — HTML Panels Only

**Decision**: Glassmorphism applies only to HTML-rendered panels (sidebar, toolbar, overlays, cards, forms, navigation). Konva canvas items retain solid fills with refined colors.

**Rationale**: Konva renders to a `<canvas>` element where `backdrop-filter: blur()` doesn't apply. Simulating frosted-glass on canvas items would require custom pixel manipulation (expensive and complex). The HTML overlay panels are where glassmorphism provides the most visual impact. Canvas items can use subtler color refinements (softer fills, refined strokes) that complement the glass panels without true blur effects.

**Alternatives considered**:
- Canvas-based blur simulation — rejected for performance and complexity
- Semi-transparent Konva fills without blur — considered as "refined colors" (adopted as complementary enhancement)
