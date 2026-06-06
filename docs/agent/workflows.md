# Workflows

## Speckit

This repository uses specification-driven development via Speckit skills and artifacts.

| Step | Output |
|---|---|
| `/speckit-constitution` | `.specify/memory/constitution.md` |
| `/speckit-specify` | `specs/###-feature-name/spec.md` |
| `/speckit-clarify` | Clarified requirements in the spec |
| `/speckit-plan` | `plan.md`, `research.md`, `data-model.md`, `quickstart.md` |
| `/speckit-tasks` | Dependency-ordered `tasks.md` |
| `/speckit-analyze` | Cross-artifact consistency analysis |
| `/speckit-implement` | Execution of `tasks.md` |
| `/speckit-checklist` | Requirements quality checklist |

The constitution at `.specify/memory/constitution.md` is binding for feature work.
Important principles include test verification, security by default, mobile parity,
data integrity, and the glassmorphism design system.

## Current Plan Pointer

The `<!-- SPECKIT START -->` block in `AGENTS.md` and `CLAUDE.md` points to the latest
active plan. The Speckit agent-context extension currently manages `AGENTS.md` via
`.specify/extensions/agent-context/agent-context-config.yml`; if it updates only
`AGENTS.md`, mirror the managed block into `CLAUDE.md` when keeping both entry points
in sync matters for the task.

## Speckit Context Hygiene

- Keep detailed Speckit guidance in specs, the constitution, or this file.
- Do not paste plan summaries into root agent files beyond the managed plan pointer.
- When a generated agent template is changed, keep `.specify/templates/agent-file-template.md`
  aligned with the progressive-disclosure layout.
- Use project-relative paths in generated docs; use absolute paths only when a tool or UI
  specifically requires them.

## Git Hooks

Shared hooks live in `.githooks/`. Each collaborator should run:

```bash
git config core.hooksPath .githooks
```

Current hook:

| Hook | Purpose |
|---|---|
| `prepare-commit-msg` | Strips `Co-Authored-By` lines from commit messages. |

Speckit extension hooks in `.specify/extensions.yml` may auto-commit or run extra steps
at each stage. Read that file before changing Speckit workflows.

## Agent Documentation Workflow

Use this process after a session produces reusable project knowledge:

1. Run `find docs/agent -name "*.md" | sort`.
2. Pick the narrowest matching file.
3. Add the lesson with a source pointer or affected file path.
4. Avoid restating commands, schemas, or code that already have source-of-truth files.
5. If no existing file fits, create a focused doc with a descriptive name and add it to
   `docs/agent/README.md`, `AGENTS.md`, and `CLAUDE.md`.
