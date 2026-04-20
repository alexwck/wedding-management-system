# Quickstart: UX Polish & Floor Plan Fixes

**Date**: 2026-04-20

## Prerequisites

- Node.js 24 LTS
- Supabase CLI running locally (`supabase start`)
- Dev server: `npm run dev`
- Tests: `npm run test` (unit), `npm run test:e2e` (E2E)

## Implementation Order

Tasks should be implemented in dependency order:

1. **Floor plan data reset** (FR-016) — Clear existing floor plans before changing chair defaults
2. **Chair rendering + spacing** (FR-010, FR-011, FR-012) — Change default to 1x1, Circle shape, fix spacing
3. **Long table max chairs** (FR-013) — Remove +1 from getMaxChairCount for long tables
4. **Null error fix** (FR-015) — Add null guard in handleSelectItem
5. **Root page redirect** (FR-001, FR-002, FR-003) — Replace page.tsx, update proxy.ts
6. **Logout feature** (FR-004, FR-005) — Add signOut action, logout button in Nav
7. **Cross-role access control** (FR-006, FR-007) — Update proxy.ts with role-based redirects
8. **Upload constraints** (FR-008, FR-009) — Update constants and error messages

## Key Files to Modify

| File | Change |
|------|--------|
| `src/lib/floor-plan/constants.ts` | DEFAULT_CHAIR_SIZE → {1,1}, LONG_TABLE_LENGTHS maxChairs |
| `src/components/floor-plan/items/chair.tsx` | Rect → Circle rendering |
| `src/components/floor-plan/hooks/use-chair-generation.ts` | Spacing fix, getMaxChairCount conditional |
| `src/components/floor-plan/hooks/use-floor-plan-state.ts` | Remove "chair" from DIMENSION_EDITABLE_TYPES |
| `src/components/floor-plan/floor-plan-canvas.tsx` | Null guard in handleSelectItem |
| `src/app/page.tsx` | Server component redirect |
| `src/proxy.ts` | Root redirect, cross-role access control |
| `src/components/nav.tsx` | Logout button |
| `src/app/actions/upload.ts` | 5MB limit, JPG/PNG only |
| `src/app/actions/auth.ts` | New signOut server action |

## Testing Strategy

- **Unit tests**: Chair spacing calculations, getMaxChairCount logic, upload validation
- **E2E tests**: Root redirect, logout flow, cross-role access, file upload rejection, floor plan item add
