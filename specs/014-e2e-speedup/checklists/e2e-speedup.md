# Quality Checklist: Speed Up Playwright E2E Suite

**Purpose**: Validate the spec, plan, and tasks are aligned before any implementation starts.

## Coverage

- [x] Every user story in `spec.md` has at least one task in `tasks.md`.
- [x] Every functional requirement (FR-001..FR-007) has at least one task.
- [x] Every success criterion (SC-001..SC-005) has a corresponding verification step.
- [x] Spec inventory (37 spec files, 32 in scope, 5 out of scope) matches the actual `ls tests/e2e/*.spec.ts` output and the inline-login audit (`grep -c "page.goto.*auth/login"`).

## Constitution compliance

- [x] Spec-driven (no implementation started before spec is in `specs/014-e2e-speedup/spec.md`).
- [x] Red-green proven by execution. Baseline measurement of `npx playwright test --project=chromium` is captured before changes; final measurement is taken after.
- [x] `workers: 1` is preserved globally.
- [x] No experimental features. Playwright's `setup` project is a stable documented feature.
- [x] AGENTS.md "E2E test resilience" and "Test data isolation" rules are not weakened.
- [x] DESIGN.md / Nova Glass unaffected. This is a tooling change, no UI touched.

## Spec quality

- [ ] No [NEEDS CLARIFICATION] markers remain.
- [ ] Edge cases section explicitly covers stale storageState, login-flow specs, logout, mobile parity gap, and seed-data isolation.
- [ ] Acceptance scenarios are Given/When/Then and testable.
- [ ] Open questions are resolved or marked explicitly.

## Plan quality

- [ ] Technical Context is fully filled in.
- [ ] Project Structure lists every file that will be touched.
- [ ] Phase 0 research is grounded in real artifacts (audit of `tests/e2e/*.spec.ts`, AGENTS.md gotchas, Playwright docs).
- [ ] Risks section calls out `storageState` staleness, mobile default flip, and dual-role specs.

## Tasks quality

- [ ] Every task has an ID, an optional [P] marker, a [Story] tag, and an exact file path.
- [ ] Tasks are ordered by dependency (Setup -> Foundational -> User Stories -> Docs -> Verification).
- [ ] T001-T005 establish infrastructure; T006-T040 are spec refactors; T041-T044 are config verifications; T045-T046 are docs; T047-T051 are final verification.
- [ ] No task asks the agent to weaken or delete an existing assertion.

## Verification plan

- [ ] Baseline `npx playwright test --project=chromium` wall time recorded.
- [ ] After each phase, a representative subset is re-run.
- [ ] Final pass: `npm run test:e2e -- --project=chromium` and `CI=1 npm run test:e2e` both green.
- [ ] `npm run test` (unit) still green.

## Out-of-scope reaffirmation

- [ ] Webwright (microsoft/Webwright) is not adopted in this feature. Mentioned only as future eval.
- [ ] Konva canvas perf is not part of this work.
- [ ] CI workflow YAML is unchanged; the speedup benefits CI automatically via the config change.
