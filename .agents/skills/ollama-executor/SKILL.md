---
name: "ollama-executor"
description: "Delegate bounded implementation drafts and heavy file rewrites to a local Ollama model through the CLI, while Codex remains the architect, reviewer, editor, and verifier."
metadata:
  author: "wedding-management-system"
  version: "1.0.0"
  default_model: "minimax-m3:cloud"
  command: "ollama run minimax-m3:cloud"
---

## Purpose

Use this skill when the user wants Codex to stay in high-level architecture/review mode while
delegating a scoped implementation draft to Ollama through the local terminal.

This is useful for:
- Large mechanical rewrites where the desired transformation is clear
- First-pass implementation drafts for isolated files or modules
- Converting prose requirements into a proposed unified diff
- Refactoring repetitive code after Codex has identified exact boundaries

Codex remains responsible for final judgment. Ollama may propose code, but Codex owns the actual
repo edits, test selection, verification, and final report.

## When to Invoke

Invoke this skill when:
- The user explicitly asks to use Ollama, `minimax-m3:cloud`, or "Subscription Mode"
- The user asks to delegate heavy execution or file rewrites to a local model
- A task is large but can be bounded to a known set of files and a crisp prompt

Do not invoke this skill for:
- Security-sensitive code involving secrets, credentials, auth tokens, or private data
- Database migrations or destructive data operations without direct Codex review
- Vague tasks where the implementation boundaries are not yet understood
- Simple edits that Codex can complete faster directly

## Operating Model

1. Codex reads the relevant repository context first.
2. Codex defines a narrow execution packet for Ollama:
   - Goal
   - Files in scope
   - Constraints and existing conventions
   - Expected output format
   - Tests or checks the result must satisfy
3. Codex runs Ollama from the terminal with `ollama run minimax-m3:cloud`.
4. Ollama returns a draft, preferably a unified diff.
5. Codex reviews the draft, rejects unsafe or unrelated changes, and applies only acceptable edits.
6. Codex runs the appropriate verification commands.
7. Codex summarizes what was delegated, what was accepted, and what was verified.

## Safety Rails

- Never give Ollama secrets, `.env` contents, tokens, private keys, production data, or user PII.
- Never ask Ollama to run shell commands, install packages, modify the filesystem, or commit changes.
- Never accept broad, unrelated rewrites. Keep changes scoped to the user's request.
- Prefer unified diffs over full-file replacements.
- If Ollama returns prose instead of a patch, convert it into a reviewed Codex patch manually.
- If Ollama's patch conflicts with project conventions, discard or rewrite it.
- If the output is too large or low quality, reduce scope and retry once with a smaller packet.

## CLI Preflight

Before the first delegation in a thread, check whether Ollama is available:

```sh
command -v ollama
```

Optionally check whether the model is available:

```sh
ollama list
```

If the model is missing, ask the user whether to pull/run it, or continue with direct Codex
implementation. The expected model command is:

```sh
ollama run minimax-m3:cloud
```

## Prompt Template

Use a temporary prompt file for non-trivial requests so quoting stays reliable:

```sh
ollama run minimax-m3:cloud < /tmp/ollama-executor-prompt.md
```

The prompt should follow this structure:

````markdown
You are a local implementation assistant. Produce a narrow, reviewable code draft.

Goal:
<one concrete implementation goal>

Repository context:
<framework, conventions, important gotchas>

Files in scope:
- <path>: <why this file is relevant>

Current code excerpts:
```text
<only the excerpts needed for this task>
```

Constraints:
- Return a unified diff only, with no commentary outside the diff.
- Do not add dependencies unless explicitly requested.
- Preserve existing public APIs unless the goal says otherwise.
- Keep edits limited to the files in scope.
- Follow the project's TypeScript, React, Supabase, Tailwind, and testing conventions.

Verification target:
<lint/test/build command Codex will run after applying the reviewed patch>
````

## Execution Pattern

1. Create the prompt packet from reviewed local context.
2. Run:

```sh
ollama run minimax-m3:cloud < /tmp/ollama-executor-prompt.md
```

3. Save or inspect the output in the terminal.
4. Apply only the accepted parts using Codex editing tools.
5. Run targeted checks such as:

```sh
npm run lint
npm run test -- <target>
npm run build
```

Choose the smallest verification set that proves the change, then broaden if the risk warrants it.

## Review Checklist

Before applying any Ollama-produced draft, verify:
- The patch touches only intended files.
- The patch compiles mentally against nearby imports and types.
- The patch follows local component, action, validation, and testing patterns.
- No secrets, logging of sensitive data, or test-only shortcuts were introduced.
- User-facing text and UI behavior remain consistent with the design system.
- Tests are added or updated at the lowest appropriate layer.

## Completion Report

When finished, report:
- The Ollama model used: `minimax-m3:cloud`
- The scoped task delegated
- Files changed by Codex after review
- Verification commands run and their results
- Any Ollama suggestions that were intentionally rejected

## Done When

- [ ] Relevant local context was read by Codex before delegation
- [ ] Ollama was invoked with a scoped prompt through the CLI
- [ ] Ollama output was reviewed before any edit was applied
- [ ] Accepted edits were applied by Codex
- [ ] Appropriate verification commands were run or explicitly noted as skipped
- [ ] Final response distinguishes delegated draft work from accepted repo changes
