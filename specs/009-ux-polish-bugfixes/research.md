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

## 2. Undo Bug Fix

### Decision
The bug is in `floor-plan-canvas.tsx`, not in the `use-undo-redo` hook itself. The `handleSelectItem` function calls `pushHistory()` before adding the item, but there may be duplicate state pushes happening.

### Root Cause Analysis
Research found that `handleSelectItem` at line ~341 calls `pushHistory()` (which calls `pushState`) before `state.addItem()`. The initial state is also pushed on mount via useEffect. The double-undo happens because:
1. `pushHistory()` saves current state (pre-item)
2. `state.addItem()` adds the item
3. A subsequent state change or re-render may trigger another push

### Fix
Remove the separate `pushHistory()` call from `handleSelectItem`. Instead, have `addItem` in `use-floor-plan-state.ts` return the new state, and push the pre-add state once within the same callback. Alternatively, push state inside `addItem` itself so it's atomic.

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
Add Konva `Transformer` resize handles for non-table items (Stage, Pillar, Walkway, Misc). Round tables and long tables show no resize handles.

### Rationale
- Konva's `Transformer` component already supports resize handles natively — just need to conditionally enable it.
- Current `RotationTransformer` already wraps selected items. Extend it to show resize handles when item type is not a table.
- Min/max dimension limits enforced in the `transformend` handler.

### Implementation Approach
- Modify `canvas-item.tsx` or the Transformer component to conditionally enable resize based on item type.
- Add `minWidth`/`maxWidth`/`minHeight`/`maxHeight` to item constants in `constants.ts`.
- Convert resize delta from pixels to feet for storage (using `FEET_TO_PIXELS = 20`).
- Include resize in undo history by pushing state before resize starts.
