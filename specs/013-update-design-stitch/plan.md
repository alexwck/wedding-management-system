# Implementation Plan: Update Design Based on Stitch Redesign

**Branch**: `013-update-design-stitch` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-update-design-stitch/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement Google Stitch redesign across 5 pages (login, admin dashboard, weddings table, floor plan editor, RSVP experience) using a unified glassmorphic design system. Remove the legacy layout preset system (bento/minimalist/cinematic) in favor of a single consistent glassmorphic layout. Drop `layout_preset` column from weddings table. DESIGN.md (Google design.md format, lint-validated) is the source of truth for all design tokens.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16 (App Router)  
**Primary Dependencies**: Tailwind CSS v4, shadcn/ui (Nova theme), react-konva (floor plan), lucide-react (icons)  
**Storage**: Supabase PostgreSQL (layout_preset column removal via migration)  
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E visual audits)  
**Target Platform**: Web (desktop + mobile Chrome viewports)  
**Project Type**: Web application (admin + couple dashboards, public wedding pages)  
**Performance Goals**: 60fps animations, ±4px visual tolerance on spacing/sizing  
**Constraints**: DESIGN.md tokens via globals.css; system fonts only; lucide-react + inline SVG for icons  
**Scale/Scope**: 5 redesigned pages, 2 floor plan editors (admin + couple), 1 database migration, DESIGN.md creation + validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ Pass | Spec completed with 5 clarifications; E2E tests required for all 5 user stories |
| II. Type Safety | ✅ Pass | TypeScript strict mode; no `any` types needed for CSS/design changes |
| III. Component-First Architecture | ✅ Pass | Existing component structure preserved; styling updates only |
| IV. User Experience First | ✅ Pass | Stitch redesign reduces cognitive load; 60fps target ensures smooth UX |
| V. Simplicity | ✅ Pass | Removing preset system reduces complexity; single glassmorphic layout |
| VI. Security by Default | ✅ Pass | No security-impacting changes; auth boundaries unchanged |
| VII. Mobile Parity | ✅ Pass | E2E tests cover mobile Chrome; `onTap` handlers already present |
| VIII. Data Integrity | ✅ Pass | `layout_preset` removal is safe (no production data) |
| IX. Design System Adherence | ✅ Pass | DESIGN.md created (Google format, lint-validated); FR-001/SC-001 enforce token usage |
| X. No Experimental Features | ✅ Pass | Stable releases only; webpack for production builds |

**GATE RESULT**: Pass — proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/013-update-design-stitch/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if applicable)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   │   └── auth/login/        # Login page redesign
│   │   └── w/[slug]/          # RSVP experience redesign
│   ├── (auth)/
│   │   ├── admin/             # Admin dashboard + weddings table redesign
│   │   │   └── weddings/[id]/floor-plan/  # Floor plan editor redesign
│   │   └── dashboard/
│   │       └── floor-plan/    # Couple floor plan editor redesign
│   ├── components/
│   │   ├── floor-plan/        # Canvas components (glassmorphic updates)
│   │   ├── ui/                # shadcn components (token compliance)
│   │   ├── landing-page.tsx   # Glassmorphic updates
│   │   └── ...                # Other components (token audit)
│   └── globals.css            # CSS variables mirroring DESIGN.md tokens
supabase/
└── migrations/
    └── drop_layout_preset_column.sql  # Remove layout_preset from weddings
```

**Structure Decision**: Single project structure — all changes are within the existing Next.js app. No new projects or packages needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All principles pass.

## Phase 0: Research & Outline

### Unknowns to Resolve

1. **Stitch asset audit**: What custom icons/fonts/illustrations exist in Stitch screenshots vs. lucide-react equivalents?
2. **Preset system inventory**: Which files reference `layout_preset` — database column, components, CSS files?
3. **DESIGN.md gap analysis**: DESIGN.md created with Google design.md format (YAML frontmatter, lint-validated)
4. **Floor plan editor parity**: What are the exact differences between admin and couple floor plan editors that need identical styling?

### Research Tasks

| Task | Research Question | Output |
|------|-------------------|--------|
| R-001 | Audit Stitch screenshots for custom assets | `research.md` — asset inventory with lucide-react mappings |
| R-002 | Inventory `layout_preset` references in codebase | `research.md` — file list for removal |
| R-003 | Create DESIGN.md with Google design.md format | `research.md` — token mapping, globals.css alignment |
| R-004 | Compare admin vs. couple floor plan editors | `research.md` — component file list for parity updates |

**Output**: `research.md` with all NEEDS CLARIFICATION resolved

**Status**: ✅ Complete — all 4 research tasks dispatched and consolidated

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Data Model Changes** → `data-model.md`:
   - `weddings` table: drop `layout_preset` column
   - Migration file: `drop_layout_preset_column.sql`
   - ✅ Complete: `data-model.md` created

2. **Interface Contracts** → `/contracts/`:
   - N/A — no external API changes; internal component styling only

3. **Agent Context Update**:
   - Update `CLAUDE.md` to reference this plan file between `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` markers
   - ✅ Complete: CLAUDE.md updated

**Output**: data-model.md, quickstart.md, updated agent context

**Status**: ✅ Complete — Phase 1 artifacts generated

## Phase 2: Task Breakdown

**Prerequisites:** Phase 1 complete

Dispatch `/speckit-tasks` to generate dependency-ordered tasks from spec + plan.

## Gates & Validation

| Gate | Criteria | Status |
|------|----------|--------|
| G-001 | Constitution Check passes | ✅ Pass |
| G-002 | All research unknowns resolved | ✅ Complete (research.md) |
| G-003 | Data model migration reviewed | ✅ Complete (data-model.md) |
| G-004 | E2E tests cover all 5 user stories | ⏳ Pending tasks |
| G-005 | Visual audit passes (±4px tolerance) | ⏳ Pending implementation |
| G-006 | DESIGN.md lint validation passes | ✅ Complete (0 errors, 0 warnings) |

---

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/013-update-design-stitch/plan.md (Update Design Based on Stitch Redesign)
<!-- SPECKIT END -->
