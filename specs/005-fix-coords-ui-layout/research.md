# Research: Coordinate System Fix and UI Layout Overhaul

**Date**: 2026-04-21 | **Feature**: 005-fix-coords-ui-layout

## Research Task 1: Konva Circle vs Rect Coordinate Mismatch

### Problem
Konva's `Circle` component uses `(x, y)` as the **center** of the circle, while `Rect` uses `(x, y)` as the **top-left corner**. The data model stores all positions as top-left bounding box coordinates in feet. Chair generation correctly computes `cx = table.x + radius` (converting top-left to center), but the round table's `Circle` renders at `x * FEET_TO_PIXELS` — treating top-left as center, causing the table to appear offset from its chairs.

### Decision
Convert top-left to center in the rendering layer only. The data model keeps top-left coordinates. Round table renders `Circle` at `centerX = (x + diameter/2) * FEET_TO_PIXELS`.

### Rationale
- Preserves existing data model — no migration, no serializer changes
- Minimal code change — only affects rendering components
- Chair generation already computes center correctly from top-left

### Alternatives Considered
1. **Store center coordinates in data model** — rejected: would require migration of all existing floor plan data, breaks bounding-box convention
2. **Use Konva Group with centered children** — rejected: adds complexity, Group coordinates still need conversion in drag handlers

## Research Task 2: Long Table Rotation Around Corner

### Problem
Konva `Rect` rotates around its `(x, y)` point (top-left corner). When rotated, the table swings like a door hinge instead of spinning in place. Child chairs rotate with it but the visual center shifts.

### Decision
Add `offsetX` and `offsetY` to the Rect to shift the rotation anchor to center: `offsetX = pixelWidth / 2`, `offsetY = pixelHeight / 2`. Position the Rect at center coordinates: `x = (item.x + item.width/2) * FEET_TO_PIXELS`, same for y.

### Rationale
- Konva's `offset` property shifts the transform origin without changing visual position
- This is the standard Konva pattern for center-based rotation
- Combined with center positioning, rotation naturally happens around visual center

### Alternatives Considered
1. **Wrap in Group and rotate Group** — rejected: adds nesting, complicates drag handlers
2. **Manual rotation matrix in handleRotationEnd** — rejected: more complex, harder to maintain

## Research Task 3: Drag Handler Coordinate Conversion

### Problem
After drag, `node.x()` returns pixel coordinates. For Circle nodes, this is the center position. For Rect nodes with offset, `node.x()` is the position minus the offset. Both need conversion back to top-left feet coordinates for storage.

### Decision
In `handleDragEnd` and `handleDragMove`, detect table type and convert:
- Round table: `newX = node.x() / FEET_TO_PIXELS - item.width / 2` (center to top-left)
- Long table (with offset): `newX = node.x() / FEET_TO_PIXELS - item.width / 2` (center to top-left, since offset shifts position)
- Other items: `newX = node.x() / FEET_TO_PIXELS` (no conversion needed)

### Rationale
- Both table types will be rendered at center coordinates, so both need center-to-top-left conversion on drag
- Non-table items (chairs, stage, etc.) remain top-left based — no conversion change
- Snap-back logic in `handleDragMove` must also use center coordinates for tables

### Alternatives Considered
1. **Store center for all items** — rejected: breaks non-table items, unnecessary model change
2. **Per-type drag handler** — rejected: code duplication, harder to maintain

## Research Task 4: UI Layout Density Patterns

### Problem
Pages use `min-h-screen` with centered content in narrow containers (`max-w-sm`, `max-w-md`), creating excessive whitespace. Floor plan has unnecessary heading above canvas. Admin couples page stacks form and table vertically on wide screens.

### Decision
Apply Tailwind utility classes for better density:
- Login card: `max-w-sm` → `max-w-lg`
- RSVP form: `max-w-md` → `max-w-lg`
- Error/404: `min-h-screen` → `min-h-[60vh]`
- Admin couples: `space-y-8` → `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Floor plan: Remove heading, canvas fills `h-[calc(100vh-3rem)]`
- Item catalog: Add collapse toggle, `w-64` → `w-12` when collapsed
- Toolbar: Float as absolute overlay on canvas
- All auth pages: Add `max-w-4xl mx-auto` for readability on ultra-wide

### Rationale
- Uses existing Tailwind utilities — no new CSS
- Glassmorphism design system (`.glass-panel`) preserved
- Responsive breakpoints already in place via `md:` and `lg:` prefixes

### Alternatives Considered
1. **CSS Grid for all pages** — rejected: overkill for simple content pages
2. **New layout components** — rejected: YAGNI, utility classes sufficient
3. **Different design system** — rejected: user confirmed keeping glassmorphism

## Research Task 5: Collapsible Item Catalog

### Problem
Item catalog sidebar takes fixed width even when not actively used, wasting canvas space.

### Decision
Add a toggle button. When collapsed, sidebar shows only icons in a narrow strip (`w-12`). State stored in component state (session-only, no persistence needed per spec assumption). Canvas expands to fill freed space via flex layout.

### Rationale
- Simple state toggle — no complex animation library needed
- Flex layout automatically redistributes space
- Per-session state keeps it simple (no localStorage dependency)

### Alternatives Considered
1. **Auto-hide on inactivity** — rejected: surprises users, adds complexity
2. **Overlay catalog** — rejected: overlaps canvas content, confusing
3. **localStorage persistence** — rejected: spec says session-only is acceptable
