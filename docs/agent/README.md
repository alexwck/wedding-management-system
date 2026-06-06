# Agent Documentation

This directory holds task-specific context for coding agents. The root `AGENTS.md`
and `CLAUDE.md` files are intentionally short entry points; read only the files here
that match the current task.

## How To Use These Docs

1. Run `find docs/agent -name "*.md" | sort`.
2. Choose the smallest set of files that match the task.
3. Verify volatile details against source-of-truth files before acting.
4. After discovering a reusable lesson, update the most specific doc here instead
   of expanding `AGENTS.md` or `CLAUDE.md`.

## Doc Map

| File | Read when |
|---|---|
| `project-map.md` | You need architecture, stack, commands, directory layout, or key source files. |
| `workflows.md` | You are using Speckit, updating specs, touching git hooks, or maintaining agent docs. |
| `testing.md` | You are adding tests, fixing tests, planning QA, or debugging Playwright/Vitest. |
| `data-auth-rsvp.md` | You touch Supabase, auth, admin/couple access, RSVP, venues, uploads, or wedding locks. |
| `floor-plan.md` | You touch the Konva floor-plan editor, placement, collision, seats, canvas UI, or autosave. |
| `ui-design.md` | You touch visual design, Tailwind v4, glassmorphism, responsive UI, or public wedding pages. |
| `deployment.md` | You touch production config, Vercel, Supabase deployment, Sentry, CI preview, or admin bootstrap. |
| `model-routing.md` | You need to know which model runs implementation, lint, and test execution, or when to escalate. |

## Maintenance Rules

- Keep root entry files under roughly 80 lines each.
- Prefer pointers to source files over copied code snippets.
- Do not include generated counts unless the command to refresh them is nearby.
- Split recurring, sequence-sensitive work into action docs rather than prose in root files.
- If a doc grows large, split it by task area before adding more bullets.
- Keep `AGENTS.md` and `CLAUDE.md` synchronized for shared entry-point guidance.

## Rationale

This structure follows two agent-context practices:

- Keep the root file as a small workflow entry point, then let agents discover relevant docs.
  See [You Don't Need a CLAUDE.md](https://dev.to/byme8/you-dont-need-a-claudemd-jgf).
- Use progressive disclosure: root files should cover why, what, and how at a high level,
  while task-specific instructions live in separate files. See
  [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md).
