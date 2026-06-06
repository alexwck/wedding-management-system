# Requirements Quality Checklist: Speed Up Playwright E2E Suite

**Purpose**: Test the spec/plan for requirement quality - are the requirements themselves unambiguous, complete, measurable, and free of implementation leaks? This is the PR-review lens for the spec artifacts, distinct from `requirements.md` (template coverage) and `e2e-speedup.md` (task quality).
**Created**: 2026-06-06
**Feature**: [spec.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md) | [plan.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/plan.md) | [research.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/research.md)
**Audience**: PR reviewer
**Depth**: Standard (12-18 items)

---

## Requirement Completeness

- [x] **CHK001** — Is the spec's "What" cleanly separated from the plan's "How"? (i.e. the spec names what the developer observes, the plan names the config/code that produces it; the spec does not pre-decide the implementation.) [Completeness]
- [x] **CHK002** — Is the in-scope vs out-of-scope spec inventory (37 files, 32 in scope, 5 out) consistent between `spec.md §Spec inventory`, `plan.md §Testing`, and the actual `ls tests/e2e/*.spec.ts` output? [Consistency]
- [x] **CHK003** — Are all 7 functional requirements (FR-001..FR-007) each addressed by at least one task in `tasks.md`? (Cross-check by FR ID, not just by counting tasks.) [Coverage]
- [x] **CHK004** — Does the spec name *which* Playwright projects load *which* storageState by default, with the per-spec opt-out shape called out for the 2 specs that need the non-default role? (See [FR-002](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md).) [Completeness]

## Requirement Clarity

- [x] **CHK005** — Is SC-001's "<= 4 min wall time AND <= 40% of captured baseline" gate unambiguous about *which* command is being timed, *which* machine is the reference, and *which* run is the denominator? (Spec pinpoints T000 in [tasks.md](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/tasks.md) for the denominator and calls out the developer machine.) [Clarity]
- [x] **CHK006** — Is the build-reuse policy for `test:e2e:prod` stated in testable terms — i.e. does it name the specific staleness condition (`.next/BUILD_ID` older than `package.json` mtime) so a reviewer can verify it on disk? (See [FR-005](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/spec.md) and [research.md §R-3](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/research.md).) [Clarity]
- [x] **CHK007** — Are the per-spec opt-out shapes (`test.use({ storageState: "..." })` for non-default role, vs `{ cookies: [], origins: [] }` for fresh context) named explicitly so an implementer can copy-paste the right one? [Clarity]

## Requirement Consistency

- [x] **CHK008** — Does the spec say `workers: 1` stays global, and is that consistent with `playwright.config.ts`'s current value? (Spec NFR-003; current config has `workers: 1` per AGENTS.md gotcha.) [Consistency]
- [x] **CHK009** — Are the 4 user stories' priorities (P1, P1, P2, P3) consistent with the task phase ordering in `tasks.md` (Phase 3 covers US1+US2, Phase 4 covers US3, Phase 5 covers US4)? [Consistency]
- [x] **CHK010** — Does the spec avoid contradicting the constitution's "No Experimental Features" principle? (Playwright's `setup` project is stable; no `experimental.*` keys are touched; the production-build path uses the existing `--webpack` flag already in `package.json`.) [Consistency]

## Acceptance Criteria Quality

- [x] **CHK011** — Is each success criterion (SC-001..SC-005) verifiable by a single observable signal (timed shell command, file count, project-list output, network trace, or pass/fail parity)? [Measurability]
- [x] **CHK012** — Is the "no spec is dropped or weakened" guarantee (NFR-001, SC-002) anchored to a specific verification step in `tasks.md` (T052 covers the 5 out-of-scope specs; T006-T036 cover the 32 in scope)? [Measurability]

## Edge Case Coverage

- [x] **CHK013** — Is the stale-storageState failure mode (DB reseed invalidates saved cookies) called out in the spec's Edge Cases AND given a recovery action in [quickstart.md §"Verify a stale storage state fix"](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/quickstart.md)? [Edge Cases]
- [x] **CHK014** — Is the mobile-parity gap (local runs skip `Mobile Chrome` unless `CI=1`) called out in the spec's Edge Cases AND documented in [quickstart.md §"Run with mobile coverage"](/Users/alexabelle/Documents/Development/wedding-management-system/specs/014-e2e-speedup/quickstart.md) so a contributor running locally knows they are not seeing mobile coverage? [Edge Cases]

## Non-Functional Requirements

- [x] **CHK015** — Is the "same pass/fail outcome" guarantee (NFR-001) testable without modifying any spec assertions, and is the verification plan (final `npm run test:e2e -- --project=chromium` matches pre-change behavior) pinned to a specific command? [NFR]
- [x] **CHK016** — Is the constitution's "E2E test resilience" rule (use `isVisible().catch(() => false)` for optional seed data) preserved in the new `auth.setup.ts`? (i.e. the setup script should not assume specific seed state, only that login succeeds.) [NFR]

## Dependencies & Assumptions

- [x] **CHK017** — Does the spec explicitly call out the assumption that Supabase local is running and that the seed users (`admin@example.com` / `alex@example.com`) exist with passwords `admin123` / `couple123`? (Spec mentions them in FR-001; they come from `supabase/seed.sql`.) [Assumptions]
- [x] **CHK018** — Does the spec note the dependency on AGENTS.md's "E2E hydration waits" rule (`waitForLoadState("networkidle")`) for the new setup script? (Plan §R-5 mentions it; verify the implementer follows it.) [Dependencies]

## Notes

- This checklist is the "PR review of the spec" lens. Use it before `/speckit-implement` starts, not after.
- Items marked incomplete require a spec/plan update before `/speckit-implement`.
- The companion `e2e-speedup.md` covers task quality (T001..T051 alignment); this file covers *requirement* quality.
- Re-evaluate after `/speckit-analyze` if any spec edits are made.
