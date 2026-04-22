# Quickstart: Guest Seat Assignment

**Feature Branch**: `006-guest-seat-assignment` | **Date**: 2026-04-22

## Overview

Couples and admins can assign attending RSVP guests to specific chairs on the floor plan canvas. Occupied chairs show a visual indicator (color fill + guest name label). A sidebar panel tracks unassigned guests. Seat assignments appear in the dashboard RSVP table and Google Sheets exports.

## Key Files to Create/Modify

### New Files
- `supabase/migrations/*_add_seat_assignments.sql` — new table + RLS
- `src/types/seat-assignment.ts` — TypeScript types
- `src/lib/validations/seat-assignment.ts` — Zod schemas
- `src/app/actions/seat-assignment.ts` — server actions
- `src/components/floor-plan/guest-assignment-dialog.tsx` — assignment/reassignment dialog
- `src/components/floor-plan/unassigned-guests-panel.tsx` — sidebar panel
- `src/components/floor-plan/hooks/use-seat-assignments.ts` — assignment state hook

### Modified Files
- `src/components/floor-plan/items/chair.tsx` — visual indicator for occupied chairs
- `src/components/floor-plan/floor-plan-canvas.tsx` — click handler for chair assignment
- `src/app/actions/floor-plan.ts` — cleanup orphaned assignments after save
- `src/app/(auth)/dashboard/rsvps/page.tsx` — add assignment columns to RSVP table
- `src/app/(auth)/admin/weddings/[id]/page.tsx` — add assignment info to admin view
- Google Sheets export action — add table/seat columns

## Implementation Order

1. **Database migration** — create `seat_assignments` table
2. **Types + validations** — TypeScript types and Zod schemas
3. **Server actions** — assign, unassign, get, cleanup
4. **Canvas integration** — chair click handler, occupied chair rendering
5. **Assignment dialog** — shadcn Dialog + Command for guest selection
6. **Unassigned panel** — sidebar panel in floor plan editor
7. **Dashboard integration** — RSVP table columns
8. **Sheets export** — extend existing export with seat columns
