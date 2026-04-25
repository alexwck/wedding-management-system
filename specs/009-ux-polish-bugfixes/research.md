# Research: UX Polish & Bugfixes

**Feature**: 009-ux-polish-bugfixes | **Date**: 2026-04-25

## 1. Template Image Crop & Reposition

### Decision
Replace click-to-set focal point with drag-to-crop interaction. The preview frame matches the exact landing page container dimensions (free-form, no fixed aspect ratio). Crop offsets reuse existing `template_focal_x`/`template_focal_y` columns.

### Rationale
- The landing page renders the template image inside a responsive container (`max-w-3xl` full height). Using `object-position` with percentage-based focal point already works for this case.
- Drag-to-crop is more intuitive than click-to-set for choosing a visible portion. The user drags the image within the frame — the frame represents the landing page viewport.
- The existing DB columns store 0-100 percentages and are already wired to the landing page via `object-position`. No schema change needed — just change how the values are set (drag vs click).

### Alternatives Considered
- **True cropping (sub-image extraction)**: Would require generating a cropped image file. Overkill — `object-position` already handles viewport selection.
- **Fixed aspect ratio preview**: User explicitly chose free-form to match the landing page exactly.

### Implementation Approach
- `template-preview.tsx`: Replace click handler with mouse/touch drag handler. Track drag delta, convert to percentage offset, clamp to 0-100.
- `landing-page.tsx`: Change from `object-position: ${focalX}% ${focalY}%` to `object-position: ${cropX}% ${cropY}%` with `object-cover` instead of `object-contain` to fill the frame.
- The image should use `object-cover` (fills frame, crops overflow) instead of `object-contain` (fits image, may leave blank space). This is the key change — `object-cover` + crop offset = user controls which part fills the frame.

## 2. Undo Bug Fix & Assignment Tracking

### Decision
The double-undo bug was in `floor-plan-canvas.tsx` (a duplicate `pushState` in the mount useEffect), not in the `use-undo-redo` hook. Fix: remove the duplicate push.

Additionally, the undo system was extended to track ALL canvas state, not just item positions. Every snapshot now includes items, venue dimensions, guest assignment map, and unassigned guests list.

### Root Cause Analysis
Research found multiple undo-related bugs during implementation:
1. **Double-undo on item add**: `handleSelectItem` called `pushHistory()` before `state.addItem()`, plus a mount `useEffect` pushed initial state, creating duplicate entries
2. **Number input keystroke spam**: Venue dimension and chair count inputs pushed one history entry per keystroke
3. **Double-undo on resize+rotate**: Separate `onRotationEnd` and `onResizeEnd` handlers each pushed history — a single transform gesture created two entries
4. **Missing assignment tracking**: Undo only restored items and dimensions, not guest seat assignments

### Fix
1. Removed duplicate `pushState` from mount useEffect (initial push already happens via `useUndoRedo`)
2. Added edit-started ref guards for number inputs — `pushHistory` fires on first keystroke, skips subsequent, resets on blur
3. Merged rotation and resize into single `onTransformEnd` handler — one push per gesture
4. Extended `Snapshot` type to include `assignmentMap` and `unassignedGuests`
5. Added `restoreAssignments` to `useSeatAssignments` — diffs old vs new maps, parallelizes server calls (unassignes first, then assigns)
6. Used refs to read assignment state in `pushHistory` — prevents callback cascade that would recreate all handlers and defeat CanvasItem memoization

## 3. Guest Panel with Assigned Guests

### Decision
Refactor `unassigned-guests-panel.tsx` into `guest-panel.tsx` containing two collapsible sections:
1. **Unassigned Guests** — expanded by default
2. **Assigned Guests** — collapsed by default, shows "Guest Name — Table N"

### Rationale
- Current panel already has the unassigned guest list. Adding an assigned section is a natural extension.
- Collapsible sections keep the panel manageable when guest counts are high.
- The `useSeatAssignments` hook already tracks both assigned and unassigned guests — no new data fetching needed.

### Implementation Approach
- New `guest-panel.tsx` replaces `unassigned-guests-panel.tsx`
- Uses shadcn/ui `Collapsible` component for each section
- Assigned guests list derived from `assignmentMap` — map chair→guest, group by parent table
- Table numbers derived from item IDs or sequential numbering

## 4. Canvas Statistics Component

### Decision
New `canvas-stats.tsx` component pinned at top of left panel (always visible, not collapsible). Shows:
- Round Tables: N | Long Tables: N
- Total Chairs: N | Assigned: N | Empty: N

### Rationale
- Stats are computed from existing `items` array and `assignmentMap` — no new data needed.
- Always-visible at top ensures users see the summary without interaction.
- Compact enough (2-3 lines) to not crowd the guest sections below.

## 5. Password Confirmation

### Decision
Add `confirmPassword` field to `create-couple-form.tsx` and update Zod schema with `.refine()` check.

### Rationale
- Standard pattern for password confirmation — Zod `.refine()` validates `password === confirmPassword`.
- Client-side only — the server action doesn't need the confirm field (strip it before submitting).
- Browser autofill support: use `autoComplete="new-password"` on password, `autoComplete="new-password"` on confirm.

## 6. Item Resize (Non-Table Items Only)

### Decision
Add Konva `Transformer` resize handles for non-table items (Stage, Pillar, Walkway, Misc). Round tables and long tables show no resize handles. All items use center-based rendering with offsetX/Y for correct rotation behavior.

### Rationale
- Konva's `Transformer` component already supports resize handles natively — just need to conditionally enable it.
- Current `RotationTransformer` already wraps selected items. Extend it to show resize handles when item type is not a table.
- Min/max dimension limits enforced in the `boundBoxFunc` callback.

### Implementation Approach
- Modify `rotation-transformer.tsx` to conditionally enable resize anchors based on item type via `isResizable()`.
- Add `RESIZE_BOUNDS` to `constants.ts` with per-item min/max width/height in feet.
- `boundBoxFunc` clamps pixel dimensions to bounds and venue limits.
- On transform end: reset `scaleX/Y` to 1, compute new width/height from `node.width() * scaleX`, convert center pixel position to top-left feet via `centerPixelsToTopLeftFeet`, and emit single `TransformResult`.

### Center-Based Rendering
All items now use center-based Konva positioning with `offsetX = pixelWidth / 2` and `offsetY = pixelHeight / 2`. This ensures:
- Rotation pivots around the visual center (not top-left)
- Labels stay centered after rotation and resize
- The Transformer reports center pixel positions, converted to top-left feet for storage

Items affected: Stage, Pillar, Walkway, Misc (changed from top-left to center). RoundTable and LongTable already used center positioning.

### Performance Considerations
- `pushHistory` reads assignment state via refs (not deps) to prevent callback cascade on seat changes
- `onChairClick` uses stable `useCallback` instead of inline arrow function to avoid defeating `CanvasItem.memo()`
- `handleDragMove` doesn't trigger React state updates during drag (collision uses refs, labels use Konva imperative API)
