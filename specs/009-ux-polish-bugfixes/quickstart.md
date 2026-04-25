# Quickstart: UX Polish & Bugfixes

**Feature**: 009-ux-polish-bugfixes | **Date**: 2026-04-25

## Prerequisites

- Dev server: `npm run dev`
- Local Supabase: `supabase db reset` (if schema changes were needed — none for this feature)
- Test infrastructure: Vitest + Playwright configured

## Implementation Order

Tasks should be implemented in this order (dependencies):

1. **Undo bug fix** (P1, standalone) — fixes a broken core interaction, no dependencies
2. **Password confirmation** (P2, standalone) — small, isolated change to admin form
3. **Template crop repositioning** (P1) — replaces focal point with drag-to-crop
4. **Guest panel refactor** (P1) — prerequisite for stats component
5. **Canvas statistics** (P2) — depends on guest panel being refactored
6. **Item resize** (P3) — independent, lowest priority

## Key Files to Touch

| Feature | Primary Files | Test Files |
|---------|--------------|------------|
| Undo fix | `floor-plan-canvas.tsx`, `use-floor-plan-state.ts` | `use-undo-redo.test.ts` |
| Password confirm | `create-couple-form.tsx`, `validations/admin.ts` | `create-couple-form.test.tsx` |
| Template crop | `template-preview.tsx`, `landing-page.tsx` | `template-crop.test.tsx`, `template-crop.spec.ts` |
| Guest panel | `unassigned-guests-panel.tsx` → `guest-panel.tsx` | `guest-panel.test.tsx`, `guest-panel.spec.ts` |
| Canvas stats | `canvas-stats.tsx` (new) | `canvas-stats.test.tsx` |
| Item resize | `canvas-item.tsx`, `constants.ts` | `item-resize.spec.ts` |

## Verification

After each task:
1. `npm run test` — unit + component tests pass
2. `npm run test:e2e` — E2E tests pass (desktop + mobile)
3. Visual check: `npm run dev` → verify in browser

Final verification:
```bash
npm run build        # No type errors
npm run lint         # No lint errors
npm run test         # All unit tests pass
npm run test:e2e     # All E2E tests pass
```
