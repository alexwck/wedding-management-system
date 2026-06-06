# Model Routing Policy

The orchestrator (the assistant the user is talking to) and the Ollama cloud
model (`ollama run minimax-m3:cloud`) split work by role. The orchestrator
stays on its primary model (currently GPT 5.5) for judgment-heavy work; Ollama
is the default delegate for execution.

## Default Routing

| Task | Default model |
|---|---|
| Code implementation (drafts, refactors, mechanical rewrites) | Ollama `minimax-m3:cloud` via the `ollama-executor` skill |
| Lint execution (`npm run lint`) | Ollama `minimax-m3:cloud` (orchestrator runs the command, Ollama interprets the captured output) |
| Test execution (`npm run test`, `npm run test:e2e`) | Ollama `minimax-m3:cloud` (same; always include `--workers=1` for Playwright) |
| Other execution (build, type-check, dev server, dependency resolution) | Ollama `minimax-m3:cloud` |
| Research, planning, architecture, code review, codebase investigation | Orchestrator (GPT 5.5) |
| Repository edits, file writes, git commits | Orchestrator — never delegate |

The orchestrator always runs the actual shell commands. Ollama is asked to
interpret captured output, not to execute commands itself. The
`ollama-executor` skill's safety rails (no secrets, no shell exec, no
filesystem writes) still apply to lint and test runs.

## Fallback

When the delegated Ollama run returns an error that requires a model to
actually solve it — for example, an analysis that needs stronger reasoning,
or a hallucination that needs a correct rewrite — retry the delegation once
with a sharper, smaller prompt. If it still fails, escalate that single
step to a **cheaper GPT model variant** (a `gpt-*-mini` / `nano` tier).
Surface the escalation in the final report so it is auditable. Do not
escalate for transient I/O failures; only when the model output itself is
wrong or unworkable.

## How To Delegate

- **Implementation**: follow `.agents/skills/ollama-executor/SKILL.md`. That
  skill defines the prompt packet format, the review checklist, and the
  completion report.
- **Lint and test runs**: invoke `ollama run minimax-m3:cloud` with a thin
  prompt that asks the model to summarize the captured command output and
  propose the next narrow command. The orchestrator runs the command,
  captures stdout/stderr, and feeds the relevant excerpt to Ollama.

## What The Orchestrator Still Owns

- Reading local context and choosing the narrow execution packet.
- Defining the constraints and verification target for Ollama.
- Reviewing Ollama output before applying any change.
- Running the actual shell commands (lint, test, build).
- Editing files and committing.
- Reporting delegation outcomes and any escalations to the user.
