# Floor Plan Editor

## Source Files

- Canvas shell: `src/components/floor-plan/floor-plan-canvas.tsx`
- Toolbar/top bar: `src/components/floor-plan/floor-plan-toolbar.tsx`
- Memoized item renderer: `src/components/floor-plan/canvas-item.tsx`
- Guest panel: `src/components/floor-plan/guest-panel.tsx`
- Catalog: `src/components/floor-plan/item-catalog.tsx`
- Transformer: `src/components/floor-plan/rotation-transformer.tsx`
- Hooks: `src/components/floor-plan/hooks`
- Utilities: `src/lib/floor-plan`
- Types: `src/types/floor-plan.ts`
- Server actions: `src/app/actions/floor-plan.ts`

## Data Model And Coordinates

- Floor-plan item IDs are arbitrary non-empty strings, not UUIDs.
- The stored model uses top-left coordinates in feet.
- Konva renders items from center position with `offsetX` and `offsetY` equal to half the
  rendered dimensions.
- Use `topLeftFeetToCenterPixels` for render conversion and `centerPixelsToTopLeftFeet`
  after drag or transform.
- Keep serialization validation at the boundary with the floor-plan Zod schemas.

## Konva Interaction Invariants

- Every interactive Konva shape needs an `id` for `stage.findOne()` lookups.
- Interactive Konva shapes need both `onClick` and `onTap` for mobile parity. Do not add
  Konva-only `onTap` props to regular HTML elements.
- `CanvasItem` is memoized; callbacks passed into it must be stable with `useCallback` or
  refs.
- Labels are siblings, not children, of draggable shapes. During drag, labels are found by
  `#${itemId}-label` and moved by the same pixel delta.
- Chair circles do not independently rotate. Table rotation updates chair positions via
  trig but omits a chair `rotation` update.

## Tables And Chairs

- Round tables use `maxChairs`, including the extra chair already accounted for.
- Long tables use `maxChairs` directly.
- Long table 6ft defaults to 7 chairs and maxes at 8.
- Long table 7ft defaults to 9 chairs and maxes at 10.
- `getMaxChairCount` delegates to `getMaxChairs()` for both table shapes.

## Autosave And Bounds

`useAutoSave` exposes five states:

| State | Meaning |
|---|---|
| `unsaved` | Local changes need saving. |
| `saving` | Save in progress. |
| `saved` | Last save succeeded. |
| `error` | Save failed and can be retried. |
| `blocked` | One or more items are outside canvas bounds; save is prevented. |

The save button is visible for `unsaved` and `error`. The blocked state announces the
number of out-of-bounds items and uses warning styling.

## Placement And Undo

- `canPlaceItem()` in `src/lib/floor-plan/placement.ts` dry-runs spiral placement and
  disables catalog buttons when no in-bounds, non-overlapping position exists.
- Catalog actions are also disabled when the wedding is locked.
- `canUndo` is true only when the undo history index is greater than zero. Tests that need
  undo enabled must create at least two changes.
- Dimension and chair-count inputs use edit-started refs so history pushes once per edit,
  then resets on blur.

## Layout And Mobile UX

- The editor uses one compact glass top bar for dimensions, undo/redo, zoom, and save.
- `containerRef` belongs on the inner canvas area so the Konva stage excludes the top bar.
- `handleFitToScreen()` runs once after `ResizeObserver` reports actual dimensions.
- Mobile view uses progressive disclosure: bottom action bar, bottom drawers for guests
  and catalog, and `MobileItemEditor` for selected items.
- Transformer anchors scale with zoom so they remain touchable.
- `FloorPlanDeviceCheck` is a soft warning on small screens, not a hard block.

## Seat Assignments

`useSeatAssignments.restoreAssignments` uses cloned snapshots for diffing and handles:

- removed chairs,
- new chairs,
- same chair with a different guest.

Server calls are parallelized. Preserve that shape when touching assignment restoration.
