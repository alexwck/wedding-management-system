# Quickstart: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22

## Overview

Couples and admins can assign attending RSVP guests to specific chairs on the floor plan canvas. Occupied chairs show a teal/green fill + guest name label (truncated to 15 chars). A left sidebar panel tracks unassigned guests (item catalog moves to right). Seat assignments appear in the dashboard RSVP table and can be exported to Google Sheets (new) or downloaded as XLSX.

## Key Files to Create/Modify

### New Files
- `supabase/migrations/*_add_seat_assignments.sql` — seat_assignments table + RLS
- `supabase/migrations/*_add_oauth_tokens.sql` — oauth_tokens table + RLS
- `src/types/seat-assignment.ts` — TypeScript types for assignments
- `src/types/oauth.ts` — TypeScript types for OAuth tokens
- `src/lib/validations/seat-assignment.ts` — Zod schemas for assignment inputs
- `src/lib/validations/export.ts` — Zod schemas for export inputs
- `src/app/actions/seat-assignment.ts` — assign, unassign, get, cleanup actions
- `src/app/actions/export.ts` — Google Sheets export, XLSX export, OAuth actions
- `src/app/api/auth/google/callback/route.ts` — Google OAuth callback API route
- `src/components/floor-plan/guest-assignment-dialog.tsx` — assignment/reassignment dialog
- `src/components/floor-plan/unassigned-guests-panel.tsx` — left sidebar panel
- `src/components/floor-plan/hooks/use-seat-assignments.ts` — assignment state hook
- `src/components/ui/command.tsx` — shadcn Command component (install via CLI)

### Modified Files
- `src/components/floor-plan/items/chair.tsx` — teal/green fill for occupied, guest name label
- `src/components/floor-plan/floor-plan-canvas.tsx` — chair click → dialog, sidebar swap
- `src/app/actions/floor-plan.ts` — cleanup orphaned assignments after save
- `src/app/actions/rsvp.ts` — add updateRsvpStatus action with assignment cleanup
- `src/app/(auth)/dashboard/rsvps/page.tsx` — assignment columns + export buttons
- `src/app/(auth)/admin/weddings/[id]/page.tsx` — assignment columns + export button

### New Test Files
- `tests/unit/actions/seat-assignment.test.ts` — unit tests for assign/unassign actions
- `tests/unit/actions/export.test.ts` — unit tests for XLSX export

## Implementation Order

1. **Database migrations** — create `seat_assignments` and `oauth_tokens` tables
2. **Types + validations** — TypeScript types and Zod schemas for both domains
3. **Dependencies** — install shadcn Command, googleapis, exceljs
4. **Server actions** — assign, unassign, get, cleanup, RSVP update, export, OAuth
5. **Tests (Red)** — write failing tests for assign/unassign and export
6. **Canvas integration** — chair click handler, occupied chair rendering, sidebar swap
7. **Assignment dialog** — shadcn Dialog + Command for guest selection
8. **Unassigned panel** — left sidebar panel in floor plan editor
9. **Tests (Green)** — make all tests pass
10. **Dashboard integration** — RSVP table columns + export buttons
11. **Export implementation** — Google Sheets API integration + XLSX fallback
12. **Polish** — lint, build, E2E, glass-panel verification, mobile parity

## Environment Variables Required

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```
