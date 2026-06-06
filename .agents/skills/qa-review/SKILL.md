---
name: "qa-review"
description: "Review a code change against the project's 3-tier testing pyramid (Unit / Component / E2E). Returns a layered test plan that pushes behaviors down to the lowest layer that can verify them, with one-sentence justifications. Invoked by the user (or another skill) when a feature is being planned, implemented, or reviewed."
metadata:
  author: "wedding-management-system"
  source: "specs/014-e2e-speedup/qa/testing-strategy.md"
  version: "1.0.0"
  constitution_ref: ".specify/memory/constitution.md §XI Testing Pyramid"
---


## Purpose

This agent reviews a code change and produces three lists of test cases — one per testing
tier — that together prove the change is correct, while keeping the overall test suite fast
and maintainable. The three tiers are:

| Tier | Tool | Time per test | Network | Browser | DB |
|---|---|---|---|---|---|
| **Unit** | Vitest | 1-50 ms | mocked | none | mocked |
| **Component / Integration** | Vitest + RTL + jsdom | 50-500 ms | mocked at module boundary | none | mocked |
| **E2E** | Playwright | 1-5 s+ | real (Supabase local) | real Chromium / Mobile Chrome | real (local Supabase) |

The pyramid is enforced by the project constitution
([.specify/memory/constitution.md §XI](/Users/alexabelle/Documents/Development/wedding-management-system/.specify/memory/constitution.md))
and documented per-feature in `specs/<feature>/qa/testing-strategy.md`. This agent produces
the contents of that file in response to a review request.

## When to invoke

Invoke this agent when:
- A new feature is being planned (after `/speckit-plan`) and the implementer needs a test plan
- A code change is being reviewed (PR or local) and the reviewer wants to verify the change has
  the right test coverage at each layer
- A test pyramid audit is needed (e.g. a feature only added E2E tests, or only Unit tests)
- The user explicitly asks "what should I test?" for a change

## How to invoke

Provide the agent with:
1. A description of the change being reviewed (paths to files modified, or a feature name)
2. (Optional) the existing test files in the project, if the agent should not re-discover them
3. (Optional) any specific test scenarios the user wants covered

The agent will read the project context (test files, `AGENTS.md`, `docs/agent/testing.md`,
the constitution, and the relevant spec) and produce three lists.

## Operating procedure

### 1. Discover the project context

- Read `AGENTS.md` as the entry point and `docs/agent/testing.md` for test-specific rules
- Read any other `docs/agent/*.md` file that directly matches the changed area
- Read `.specify/memory/constitution.md` for the binding principles (especially §XI)
- Run `find tests/unit -type f | sort` and `find tests/e2e -type f | sort` to learn the
  existing test inventory
- Read the latest commit's spec file at `specs/<feature>/spec.md` and `plan.md` if they exist

### 2. Analyze the change

For each file being changed, ask:
- **What is the unit of behavior?** (a function, a React component, a server action, a UI flow)
- **Where does its input come from?** (pure argument, env var, network call, DOM event, user click)
- **Where does its output go?** (return value, side effect, network call, DOM update, file write)
- **What are the failure modes?** (null inputs, network errors, race conditions, invalid state)

### 3. Apply the test pyramid / trophy rule

For each behavior, ask: **"What's the lowest layer that can still prove this works?"**

- If the behavior is a pure function with no I/O → **Unit**
- If the behavior is a component render with controlled state and no real network → **Component**
- If the behavior crosses a network boundary (Supabase, geocoding, file upload) or a browser
  API that jsdom does not model (Konva, FileReader) → **E2E**
- If the behavior is a critical user journey (sign-in, RSVP submission, floor-plan save) → **E2E**
  even if lower-layer coverage exists; E2E is the regression lock

### 4. Avoid duplication

Before listing a test, check whether the existing test inventory already covers it. If yes,
reference the existing test instead of duplicating.

### 5. Output format

Return three lists in the following structure:

```markdown
# Testing Strategy: <feature name>

## Tier 1 — Unit Tests (Vitest)

| Test ID | Test name (1 sentence) | Why it belongs at Unit |
|---|---|---|
| T-UNIT-01 | ... | ... |

## Tier 2 — Component / Integration Tests (Vitest + RTL + jsdom)

| Test ID | Test name (1 sentence) | Why it belongs at Component |
|---|---|---|
| T-COMP-01 | ... | ... |

## Tier 3 — E2E Tests (Playwright)

| Test ID | Test name (1 sentence) | Why it belongs at E2E |
|---|---|---|
| T-E2E-01 | ... | ... |

## Net new test count

| Layer | New tests | Cumulative | Per-run cost |
|---|---|---|---|

## What I deliberately did NOT add

- Behaviors that are already covered by existing tests (cite the test file)
- Behaviors that are pure Playwright API calls (no value in a unit test)
- Lighthouse / a11y audits unless the feature is specifically about accessibility
- Tests for trivial config (e.g. "the .gitignore contains line X")
```

### 6. Pyramid health check

After producing the three lists, compute the cumulative ratio of unit : component : E2E test
files (after the new tests are added) and flag any drift. Healthy ratio is roughly 3 : 1 : 1 or
better on the unit side.

## Tone

- One sentence per test, with the **why** belonging at that layer (not just what is tested)
- Tables, not prose — this is a reference document
- Concrete file paths and test names; no "and so on" or "etc."
- Acknowledge gaps honestly. If a behavior cannot be unit-tested (e.g. it requires a real
  browser), say so and explain why it goes to E2E

## Output target

By default, the agent prints the three lists to the chat. If invoked as part of a feature
worktree (the user is on a feature branch with a `specs/<feature>/` directory), also write
the output to `specs/<feature>/qa/testing-strategy.md` for future reference.

## Done when

- [ ] Three lists produced (Unit / Component / E2E), each with one-sentence tests and a why-column
- [ ] Net new test count table produced
- [ ] Pyramid ratio health check performed
- [ ] "What I deliberately did NOT add" section produced with concrete citations
- [ ] Output either printed to chat, written to `specs/<feature>/qa/testing-strategy.md`, or both
- [ ] If the constitution lacks a Testing Pyramid principle, flag this and offer to add it
- [ ] If a behavior cannot be tested at all (e.g. requires undocumented platform behavior), flag it
