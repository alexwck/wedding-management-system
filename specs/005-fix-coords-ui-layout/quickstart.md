# Quickstart: Coordinate System Fix and UI Layout Overhaul

**Date**: 2026-04-21 | **Feature**: 005-fix-coords-ui-layout

## Prerequisites

- Dev server running: `npm run dev`
- Supabase local: `supabase start`
- Clean floor plan data (dev-only — delete any saved floor plans before testing)

## Test Scenarios

### Scenario 1: Round Table Chair Centering (US1)

1. Open floor plan editor (`/dashboard/floor-plan`)
2. Place a 5ft round table from catalog
3. **Verify**: Table circle and chairs share the same visual center
4. Drag table to new position
5. **Verify**: Chairs stay centered around table at new position
6. Increase chair count via item controls
7. **Verify**: New chairs appear at correct positions around center

### Scenario 2: Table Rotation Around Center (US2)

1. Place a long table (6ft) from catalog
2. Use rotation handle to rotate 90 degrees
3. **Verify**: Table spins around visual center (not corner)
4. **Verify**: Chairs maintain correct relative positions
5. Drag rotated table to new position
6. **Verify**: Table and chairs move together in rotated orientation
7. Repeat with a round table

### Scenario 3: Floor Plan Canvas Space (US3)

1. Open floor plan editor
2. **Verify**: Canvas fills all vertical space below breadcrumbs (no heading)
3. **Verify**: Toolbar controls float as overlays
4. Collapse item catalog via toggle
5. **Verify**: Canvas expands to use freed width
6. **Verify**: No horizontal scrollbar at 768px+ viewport

### Scenario 4: Page Content Density (US4)

1. Navigate to each page:
   - Login: card is wide enough, not floating in whitespace
   - Dashboard: content fills main area
   - Admin couples: form and table side by side on wide screens
   - Error/404: compact message, not full-height centered
   - RSVP form: wide enough for comfortable input
2. **Verify**: Each page uses at least 60% of viewport for content at 1280x800

### Scenario 5: Mockup Review (US5)

1. Navigate to mockups folder
2. **Verify**: Visual mockups exist for all 12+ pages
3. **Verify**: At least two layout options per page for comparison

## Verification Commands

```bash
npm run test          # Unit tests pass
npm run build         # Clean build
npm run lint          # No lint errors
npm run test:e2e -- --workers=1  # E2E tests pass (desktop + mobile)
```

## Key Files to Verify

| File | What to Check |
|------|--------------|
| `src/components/floor-plan/items/round-table.tsx` | Circle renders at computed center |
| `src/components/floor-plan/items/long-table.tsx` | Rect has offset for center rotation |
| `src/components/floor-plan/floor-plan-canvas.tsx` | Drag handlers convert center to top-left for tables |
| `src/app/(auth)/dashboard/floor-plan/page.tsx` | No heading, canvas fills viewport |
| `src/app/(public)/auth/login/page.tsx` | Card wider than max-w-sm |
| `src/app/error.tsx` | Not min-h-screen centered |
