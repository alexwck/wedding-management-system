# Implementation Plan: Dashboard UX Redesign & Bug Fixes

**Branch**: `008-dashboard-ux-fixes` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-dashboard-ux-fixes/spec.md`

## Summary

Redesign the admin wedding detail page and couple dashboard into a two-column layout (template on left, event details on right), add wedding date/time editing, collapsible sortable RSVP table, template image focal point picker, fix XLSX export bug, fix floor plan catalog overflow, fix chair count editing, and remove Google Sheets export.

## Technical Context

**Language/Version**: TypeScript (strict mode) with Next.js 16 (App Router) + React 19
**Primary Dependencies**: react-hook-form, zod, ExcelJS, react-konva, Supabase JS, shadcn/ui, Tailwind CSS v4
**Storage**: Supabase PostgreSQL (existing `weddings` table, new `oauth_tokens` drop migration, new focal point columns)
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E, workers=1)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Page loads < 2s, interactions < 200ms
**Constraints**: Glassmorphism design system, Tailwind v4 (CSS-based config), mobile parity required
**Scale/Scope**: Small — wedding-scale data (tens to hundreds of RSVPs per wedding)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec written, clarified, ready for plan → tests → implementation |
| II. Type Safety | PASS | All new data has Zod schemas; DB types updated via migrations |
| III. Component-First Architecture | PASS | New components: WeddingDatePicker, TemplatePreview, RSVPTable sortable wrapper |
| IV. User Experience First | PASS | Two-column layout reduces scrolling; collapsible table; focal point preview |
| V. Simplicity | PASS | Uses existing shadcn/ui components; no new libraries for date picker |
| VI. Security by Default | PASS | Wedding date/focal point edits go through existing server actions with auth checks |
| VII. Mobile Parity | PASS | Layout stacks vertically on mobile; RSVP table responsive; focal point works on touch |
| VIII. Data Integrity | PASS | Zod validation for date and focal point; atomic upsert for focal point save |
| IX. Glassmorphism Design | PASS | All new panels use `.glass-panel` class |

## Project Structure

### Documentation (this feature)

```text
specs/008-dashboard-ux-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── admin/weddings/[id]/
│   │   │   └── page.tsx              # MODIFY: two-column layout + wedding date
│   │   └── dashboard/
│   │       ├── page.tsx              # MODIFY: two-column layout + wedding date
│   │       └── rsvps/page.tsx        # MODIFY: collapsible section
│   ├── actions/
│   │   ├── admin.ts                  # MODIFY: add updateWeddingDate, updateWeddingTimezone, updateTemplateFocalPoint; getWeddingRSVPs returns wedding_date/timezone/focal point
│   │   ├── export.ts                 # MODIFY: remove Google Sheets code, fix XLSX filename
│   │   └── upload.ts                 # MODIFY: add focal point save to upload
│   ├── (public)/w/[slug]/
│   │   └── page.tsx                  # MODIFY: use focal point for template display
├── components/
│   ├── wedding-date-picker.tsx       # NEW: datetime picker component
│   ├── timezone-combobox.tsx         # NEW: searchable IANA timezone dropdown (cmdk)
│   ├── template-preview.tsx          # NEW: full-size preview + focal point picker
│   ├── rsvp-table.tsx                # MODIFY: add sorting state and handlers
│   ├── export-buttons.tsx            # MODIFY: remove Google Sheets button; now embedded in RSVPSection
│   ├── rsvp-summary.tsx              # MODIFY: remove Total card (4-card grid)
│   ├── rsvp-section.tsx              # NEW: collapsible wrapper with embedded ExportButtons
│   ├── venue-editor.tsx              # MODIFY: opaque bg on address suggestions
│   ├── template-upload.tsx           # MODIFY: add preview button, focal point indicator
│   ├── floor-plan/
│   │   ├── item-catalog.tsx          # MODIFY: fix overflow with max-height constraints, no transition
│   │   ├── floor-plan-canvas.tsx     # MODIFY: chair count in toolbar, collision detection, canvas deselect, undo initial state
│   │   └── canvas-item.tsx           # NEW: memoized Konva item renderer
├── lib/
│   └── validations/
│       ├── wedding.ts                # MODIFY: add weddingDate and focalPoint fields
│       └── upload.ts                 # KEEP: existing upload validation
├── types/
│   ├── database.ts                   # MODIFY: add focal point columns to WeddingRow
│   └── oauth.ts                      # DELETE: remove OAuth types
supabase/
├── migrations/
│   ├── ...existing...
│   └── xxx_drop_oauth_tokens.sql     # NEW: drop oauth_tokens table
│   └── xxx_add_focal_point.sql       # NEW: add focal_x, focal_y columns to weddings
```

**Structure Decision**: Follows existing project conventions — single src/ directory with App Router pages, components, lib, and types. Migrations in supabase/migrations/.

## Phase 0: Research

See [research.md](./research.md) for detailed findings on:
- XLSX export bug root cause analysis
- shadcn/ui date picker component availability
- Focal point CSS implementation (object-position)
- Floor plan catalog overflow fix approach
- Chair count editing visibility issue diagnosis

## Phase 1: Design

See [data-model.md](./data-model.md) for:
- Wedding entity changes (focal point columns, date validation)
- Migration plan (add columns, drop oauth_tokens)
- Zod schema updates

See [quickstart.md](./quickstart.md) for:
- Implementation order and dependencies
- Key file change summary
- Testing strategy

## Phase 2: Tasks

Tasks will be generated by `/speckit-tasks` after plan approval.
