# Research: Wedding Floor Plan Designer

## Decision 1: Canvas Library

**Decision**: Konva.js with react-konva

**Rationale**:
- Best React integration via declarative `react-konva` components (Stage, Layer, Rect, Circle, Text, Transformer)
- Built-in drag-and-drop with constraint support
- Built-in Transformer for rotation handles (free rotation)
- Full touch event support (pinch-to-zoom, two-finger pan, tap)
- Lightweight (~80-100KB core)
- State serialization via `layer.toJSON()` / `Node.create()` for easy persistence
- Active maintenance and large community

**Alternatives Considered**:
- **Fabric.js**: Heavier (~300KB), manual React integration via useRef. Overkill for this use case.
- **PixiJS**: WebGL-focused, better for games. UI interaction support weaker.
- **Native HTML5 Canvas**: Maximum control but too much boilerplate for drag/rotate/touch/collision.
- **SVG (d3)**: Performance degrades with many interactive elements. Collision detection expensive.

## Decision 2: Collision Detection Approach

**Decision**: Custom rotated bounding box collision detection on top of Konva

**Rationale**:
- Konva provides `getClientRect()` which returns axis-aligned bounding boxes, but for rotated items we need Separating Axis Theorem (SAT) for accurate detection
- SAT handles rectangles at any rotation angle
- Circle-table collision uses distance-from-center vs sum-of-radii
- Collision check runs on every drag move via Konva's `onDragMove` event

**Alternatives Considered**:
- **AABB only**: Too inaccurate for rotated items — false positives at angles
- **Physics engine (Matter.js)**: Overkill, adds significant bundle size for static layout collision
- **Grid-based**: Not suitable for free rotation and arbitrary positioning

## Decision 3: State Management

**Decision**: React useState + useRef pattern with auto-save hook

**Rationale**:
- Floor plan state is local to the canvas component — no need for global state
- `useState` for items array triggers re-renders on changes
- `useRef` for Konva node references (imperative access for Transformer)
- Auto-save via debounced effect that calls server action
- Undo/redo via history stack (array of snapshots, max 20)

**Alternatives Considered**:
- **Zustand/Redux**: Overkill for single-component state
- **URL state**: Too complex for canvas item positions

## Decision 4: Data Persistence Strategy

**Decision**: Store floor plan layout as JSON in a `floor_plans` table, with items as a JSONB array

**Rationale**:
- Items are always loaded/saved together as a complete layout
- No need for relational queries across items — simplifies CRUD
- JSONB supports indexing if needed for future queries
- Single row per wedding (one-to-one)
- Server actions handle load/save, keeping client logic simple

**Alternatives Considered**:
- **Separate items table**: More normalized but adds complexity for what is essentially a document (the full layout)
- **localStorage only**: No cross-device access, lost on browser clear
- **Supabase Realtime sync**: Not needed — single user edits at a time

## Decision 5: Chair Auto-Generation Algorithm

**Decision**: Procedural placement based on table type and size

**Rationale**:
- Round tables: chairs placed at evenly-spaced angles around circumference, facing center
- Long tables: chairs placed at evenly-spaced positions along top and bottom edges, facing inward
- Chair count defaults to midpoint of recommended range, adjustable 0 to max+1
- Chairs are child items of the table — stored with `parentItemId` reference
- When table moves, chairs recalculate positions relative to table center

**Alternatives Considered**:
- **Manual chair placement only**: Defeats the purpose — auto-generation is a key requirement
- **AI-assisted placement**: Overkill for v1
