# Quickstart: Dashboard UX Redesign & Bug Fixes

**Branch**: `008-dashboard-ux-fixes` | **Date**: 2026-04-25

## Implementation Order

Tasks are ordered by dependency and priority. P1 items first, P2 items after.

### Batch 1: Database & Cleanup (no UI dependencies)

1. **Migration: Add focal point columns** — ALTER weddings table
2. **Migration: Drop oauth_tokens** — DROP TABLE
3. **Remove Google Sheets code** — Delete functions from export.ts, remove button from export-buttons.tsx, delete types/oauth.ts, remove googleapis dependency

### Batch 2: P1 Bug Fixes (standalone)

4. **Fix XLSX export** — Fix buffer serialization in server action return, sanitize filename (replace `&` with "and", collapse hyphens)
5. **Fix floor plan catalog overflow** — Add height constraints to item-catalog.tsx
6. **Fix chair count editing** — Debug and fix selectedItem type matching or visibility issue in floor-plan-canvas.tsx

### Batch 3: P1 New Features

7. **Add wedding date picker** — New component WeddingDatePicker, update admin page and couple dashboard, update wedding validation schema, update admin action to return wedding_date
8. **Restructure dashboard layout** — Two-column layout for admin wedding page and couple dashboard (template left, everything right)

### Batch 4: P2 Features

9. **Add RSVP table sorting** — Client-side sort state in rsvp-table.tsx for name, status, date, table name
10. **Add collapsible RSVP section** — New RSVPSection wrapper component with expand/collapse toggle
11. **Add template preview & focal point** — TemplatePreview component with full-size dialog, click-to-set focal point, update landing page to use object-position

### Batch 5: Testing & Verification

12. **Unit tests** — WeddingDatePicker validation, focal point calculation, RSVP sorting logic, XLSX filename sanitization
13. **Component tests** — WeddingDatePicker states, TemplatePreview interaction, RSVPSection collapse/expand
14. **E2E tests** — Wedding date set/display, two-column layout verification, RSVP table sort, focal point set/render, XLSX download

## Key File Change Summary

| File | Change | Risk |
|------|--------|------|
| `supabase/migrations/xxx_add_focal_point.sql` | NEW | Low |
| `supabase/migrations/xxx_drop_oauth_tokens.sql` | NEW | Low |
| `src/app/actions/export.ts` | Major remove + fix | Medium |
| `src/components/export-buttons.tsx` | Remove Google button | Low |
| `src/types/oauth.ts` | DELETE | Low |
| `src/app/(auth)/admin/weddings/[id]/page.tsx` | Major restructure | High |
| `src/app/(auth)/dashboard/page.tsx` | Major restructure | High |
| `src/components/wedding-date-picker.tsx` | NEW | Low |
| `src/components/template-preview.tsx` | NEW | Medium |
| `src/components/rsvp-table.tsx` | Add sorting | Medium |
| `src/components/rsvp-section.tsx` | NEW | Low |
| `src/components/floor-plan/item-catalog.tsx` | Fix overflow | Low |
| `src/components/floor-plan/floor-plan-canvas.tsx` | Fix chair edit | Medium |
| `src/lib/validations/wedding.ts` | Add fields | Low |
| `src/types/database.ts` | Add focal point fields | Low |
| `src/app/(public)/w/[slug]/page.tsx` | Add focal point CSS | Low |

## Testing Strategy

### Unit Tests (Vitest)
- Wedding date validation schema (valid/invalid dates, null)
- Focal point validation (0-100 range, null, both-or-neither)
- XLSX filename sanitization (special chars, ampersand, multiple hyphens)
- RSVP sorting comparator functions

### Component Tests (Vitest + RTL)
- WeddingDatePicker: renders with/without date, fires onChange
- RSVPSection: expanded by default, collapses on click, shows count
- TemplatePreview: renders image, click sets focal point indicator

### E2E Tests (Playwright)
- Admin sets wedding date → appears on landing page
- Couple dashboard shows two-column layout on desktop
- RSVP table sorts by clicking column headers
- Download XLSX → file opens without errors
- Floor plan catalog collapse/expand stays in viewport
- Table selection shows chair count controls
- Template focal point set → landing page centers on focal point

## Run & Verify

```bash
# 1. Reset database with new migrations
supabase db reset

# 2. Run unit tests
npm run test

# 3. Start dev server
npm run dev

# 4. Run E2E tests
npm run test:e2e
```
