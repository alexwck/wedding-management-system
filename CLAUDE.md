# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding management system — currently scaffolded from the Specify template (speckit v0.6.2.dev0) with no application code yet. The project uses a specification-driven development workflow via speckit skills.

## Speckit Workflow

The core development workflow follows this sequence, each driven by a slash-command skill:

1. `/speckit-constitution` — Define project principles and governance in `.specify/memory/constitution.md`
2. `/speckit-specify` — Write feature specifications into `specs/###-feature-name/spec.md`
3. `/speckit-clarify` — Clarify ambiguities in specs
4. `/speckit-plan` — Generate implementation plan (research, data model, contracts, quickstart) into `specs/###-feature-name/`
5. `/speckit-tasks` — Break plan into dependency-ordered tasks in `specs/###-feature-name/tasks.md`
6. `/speckit-analyze` — Check spec/plan/tasks consistency and quality
7. `/speckit-implement` — Execute tasks.md in dependency order
8. `/speckit-checklist` — Validate requirements quality (not implementation)

Git hooks are configured in `.specify/extensions.yml` to auto-commit at each workflow stage (before/after each skill). The git extension handles branch creation (`speckit.git.feature`), commits (`speckit.git.commit`), and initialization (`speckit.git.initialize`).

## Key Directory Structure

- `.specify/` — Speckit configuration, templates, scripts, and project memory
  - `memory/constitution.md` — Project principles and governance rules
  - `templates/` — Templates for specs, plans, tasks, checklists
  - `extensions/` — Git extension with hooks and scripts
  - `extensions.yml` — Hook configuration for the speckit workflow
- `.claude/skills/` — Claude Code skill definitions for all speckit commands
- `specs/` — Feature specifications, plans, and task files (created during workflow)

## Launching Claude

Use `./glm-claude.sh` from the repo root. This script:
- Sets `ANTHROPIC_BASE_URL` and auth token from `.env.local` (GLM_AUTH_TOKEN)
- Maps model overrides (Haiku → glm-4.5-air, Sonnet/Opus → glm-5.1)
- Blocks macOS Keychain access to force credential file storage

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 15 (App Router), Supabase JS Client, shadcn/ui, react-hook-form, zod, Tailwind CSS (001-rsvp-landing-page)
- Supabase PostgreSQL (database), Supabase Storage (image uploads) (001-rsvp-landing-page)

## Recent Changes
- 001-rsvp-landing-page: Added TypeScript 5.x (strict mode) + Next.js 15 (App Router), Supabase JS Client, shadcn/ui, react-hook-form, zod, Tailwind CSS
