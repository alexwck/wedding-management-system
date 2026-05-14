# Feature Specification: Production Deployment

**Feature Branch**: `012-production-deployment`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "Deploy the app with Sentry, GitHub Actions, ArgoCD, Vercel, Supabase. Do I need EKS with Helm charts and Terraform? Document how to create account in the first place. No staging environment — only local and production."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Production Infrastructure Provisioning (Priority: P1)

An administrator sets up the production Supabase project and Vercel project so the application is live and accessible to end users via a public URL.

**Why this priority**: Without production infrastructure, the application cannot be accessed by real users. This is the foundation for all subsequent deployment work.

**Independent Test**: Can be fully tested by navigating to the production URL and verifying the login page loads correctly.

**Acceptance Scenarios**:

1. **Given** the administrator has access to Supabase and Vercel accounts, **When** they create a new Supabase project and run all migrations, **Then** the production database schema matches local development exactly.
2. **Given** the Supabase project is provisioned, **When** the administrator configures environment variables in Vercel pointing to the production Supabase instance, **Then** the application connects to the production database successfully.
3. **Given** the Vercel project is created and linked to the GitHub repository, **When** code is pushed to the main branch, **Then** Vercel builds and deploys the application automatically.
4. **Given** the production deployment is complete, **When** a visitor navigates to the public wedding page (`/w/[slug]`), **Then** the page loads with venue details, RSVP form, and all styling intact.

---

### User Story 2 - CI/CD Pipeline with Quality Gates (Priority: P2)

Every push and pull request triggers automated checks (lint, type-check, unit tests) before code can be merged to main. Merges to main deploy to production automatically.

**Why this priority**: Ensures only verified code reaches production, preventing regressions and maintaining quality without manual gatekeeping.

**Independent Test**: Can be tested by opening a PR, observing all checks run, merging it, and confirming the production URL reflects the change.

**Acceptance Scenarios**:

1. **Given** a pull request is opened against main, **When** GitHub Actions runs, **Then** lint, type-check, and all unit tests execute and must pass before merge is allowed.
2. **Given** a pull request is merged to main, **When** the code reaches the main branch, **Then** Vercel automatically deploys the updated application to production.
3. **Given** a pull request is opened, **When** the developer pushes additional commits, **Then** checks re-run automatically on the latest commit.
4. **Given** a check fails (lint error, test failure), **When** the developer views the PR, **Then** the failure is clearly reported with actionable error messages.

---

### User Story 3 - Error Monitoring with Sentry (Priority: P3)

Production runtime errors are captured and reported to Sentry so the administrator can identify, triage, and fix issues proactively.

**Why this priority**: Production visibility is critical post-launch, but the app can function without it during initial setup. Added after the deployment pipeline is stable.

**Independent Test**: Can be tested by triggering a deliberate error in production and verifying it appears in the Sentry dashboard with stack trace and context.

**Acceptance Scenarios**:

1. **Given** Sentry is configured in the application, **When** an unhandled exception occurs in production, **Then** the error is reported to Sentry with stack trace, page URL, and user context within 30 seconds.
2. **Given** an error is reported in Sentry, **When** the administrator views the issue, **Then** they can see the affected route, error frequency, and browser/device information.
3. **Given** Sentry is configured for both client and server-side code, **When** errors occur in server actions, API routes, and React components, **Then** all errors are captured regardless of where they originate.
4. **Given** the app is running locally, **When** errors occur in development, **Then** they are NOT sent to Sentry (only production errors are reported).

---

### User Story 4 - First Admin Account Bootstrapping (Priority: P1)

A new administrator can create the first admin account and log into the system, with clear documentation for the setup process.

**Why this priority**: Without the ability to create accounts, the deployed application is unusable. This is a prerequisite for any admin or couple activity.

**Independent Test**: Can be tested by following the documented steps on a fresh production deployment and successfully logging into the admin dashboard.

**Acceptance Scenarios**:

1. **Given** a fresh production deployment with no user accounts, **When** the administrator follows the bootstrap documentation, **Then** they can create an admin account and log into the admin dashboard.
2. **Given** an admin account exists, **When** the admin navigates to the admin panel, **Then** they can create additional admin accounts and couple accounts for wedding management.
3. **Given** the bootstrap documentation exists in the repository, **When** a new team member reads it, **Then** they can independently set up a working local development environment and create their first local account.

---

### User Story 5 - Environment Configuration Management (Priority: P2)

Environment variables and secrets are managed consistently between local development and production, with clear documentation of which values differ per environment.

**Why this priority**: Misconfiguration is a leading cause of deployment failures. Standardized config management prevents drift between local and production.

**Independent Test**: Can be tested by comparing the local `.env.example` template against production environment variables and verifying all required keys are documented.

**Acceptance Scenarios**:

1. **Given** a developer clones the repository for the first time, **When** they copy `.env.example` and follow setup instructions, **Then** they have a working local development environment.
2. **Given** the production deployment, **When** environment variables are audited, **Then** no development-only values are present in production, and no secrets are committed to the repository.
3. **Given** sensitive values (API keys, database URLs), **When** they are stored in Vercel environment variables, **Then** they are encrypted at rest and never exposed in client-side code.

---

### Edge Cases

- **Connection limit (Free plan: 60 max)**: Application displays error page with message "Service temporarily unavailable — please try again in a few moments." Error logged to Sentry with connection count context. Mitigation: optimize queries, reduce function concurrency, or upgrade to Pro plan for pgbouncer.
- **Migration failure**: Migration wrapped in transaction; rolls back cleanly on error. Site continues serving traffic on previous schema version. GitHub Actions job fails, blocking deployment. Administrator notified via GitHub status check failure.
- **Sentry unreachable**: Application continues functioning normally — Sentry failure never blocks page rendering or API responses. Errors queued locally and dropped after 5 retry attempts (logged to console in development only).
- **Database backups (Free plan limitation)**: Supabase Free plan does NOT include automated backups. Administrator MUST perform manual exports monthly via Supabase Dashboard → Database → Backup → Download SQL dump. Export stored securely offline.
- **Broken build deployment**: Vercel retains last known-good deployment serving traffic. Administrator uses Vercel Dashboard → Deployments → Click previous successful deploy → "Promote to Production" for instant rollback.
- **RSVP submission failure**: User sees error message "Unable to submit RSVP — database temporarily unavailable. Please try again." Form data preserved in browser localStorage for retry.
- **Free plan resource exhaustion**: When approaching 80% of any Free plan limit (500MB DB, 2GB bandwidth, 50K MAU), administrator SHOULD receive alert via manual monitoring at Supabase/Vercel dashboards. Upgrade to Pro plan recommended before limits reached.
- **Preview deployments**: Pull requests from feature branches automatically generate preview URLs at `*-wedding-management-system.vercel.app`. Preview deployments use same build output as production but connect to development Supabase project.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have a production Supabase project with all migrations applied and RLS policies enabled.
- **FR-002**: System MUST have a production Vercel project linked to the GitHub repository for automatic deployments.
- **FR-003**: System MUST deploy to production within 5 minutes when commits are pushed to the main branch (Vercel auto-trigger, no manual intervention required).
- **FR-004**: System MUST run lint, type-check, and all unit tests via GitHub Actions on every pull request before merging is allowed (branch protection).
- **FR-004a**: GitHub repository MUST have branch protection rules enabled on `main` with "Require status checks to pass before merging" for checks: `lint`, `type-check`, `test`.
- **FR-004b**: CI failure messages MUST include: failing job name, link to GitHub Actions run, first 10 lines of error output, and suggested fix when available.
- **FR-005**: System MUST report unhandled production errors to a centralized monitoring service (Sentry) within 30 seconds of occurrence.
- **FR-005a**: System MUST use `@sentry/nextjs` SDK (v8+) with App Router support for automatic error capture, source maps, and performance monitoring.
- **FR-006**: Error monitoring MUST NOT activate in local development — only production builds report errors.
- **FR-007**: Repository MUST include a `.env.example` file documenting all required environment variables with descriptions.
- **FR-008**: Repository MUST include `DEPLOYMENT.md` in the root directory with documented steps for creating the first admin account on a fresh deployment. File MUST be tracked in git and use redacted placeholders (e.g., `<YOUR_VALUE>`) for sensitive values rather than committing real secrets.
- **FR-009**: All production secrets (database URLs, API keys) MUST be stored as encrypted environment variables — never in the repository.
- **FR-010**: The application MUST continue serving traffic normally when the error monitoring service is unreachable (observability must never break core functionality).
- **FR-011**: Database migrations in production MUST run before deploying the new application code to avoid schema mismatch.
- **FR-011a**: Migrations MUST be executed automatically via GitHub Actions using the Supabase CLI as a pre-deployment step before triggering Vercel deploy.
- **FR-012**: The production deployment MUST use the same build output as local development (no environment-specific code paths that alter application behavior).
- **FR-012a**: System MUST use direct database connection (Supabase Free plan does not include pgbouncer). Application SHOULD monitor connection usage and alert if approaching 60-connection limit.
- **FR-013**: System MUST provide rollback capability via Vercel "Promote to Production" — administrator can restore last known-good deployment within 2 minutes.
- **FR-014**: System MUST monitor Free plan resource usage (database size, bandwidth, MAU) — administrator MUST check Supabase Dashboard → Usage weekly.
- **FR-015**: System MUST alert administrator when any Free plan resource exceeds 80% utilization (database >400MB, bandwidth >1.6GB, MAU >40K). Alert mechanism: administrator MUST check Supabase Dashboard → Usage and Vercel Dashboard → Usage weekly — automated alerts not available on Free plans.
- **FR-016**: System MUST support upgrade path from Free to Pro plan — enabling pgbouncer requires only connection string change in Vercel environment variables.
- **FR-017**: GitHub Actions CI workflow MUST file location be `.github/workflows/ci.yml` with jobs: `lint`, `type-check`, `test`.
- **FR-018**: Sentry configuration MUST include three files: `sentry.client.config.ts` (browser errors), `sentry.server.config.ts` (server actions/API), `sentry.edge.config.ts` (edge functions).
- **FR-019**: Supabase service_role key MUST be stored only in Vercel Production environment variables — never exposed to client-side code or browser.
- **FR-020**: Admin bootstrap process MUST require password confirmation for first admin account creation to prevent accidental account creation.
- **FR-021**: `.env.example` MUST document all 10+ required environment variables with descriptions, example values using `<PLACEHOLDER>` syntax, and which environments each variable applies to (production/development/all).

### Key Entities

- **Environment Configuration**: A set of key-value pairs required for application operation. Includes database connection strings, API keys, service URLs, and feature flags. Each environment (local, production) has its own configuration set derived from a shared template.
- **Deployment**: A versioned, immutable snapshot of the application running on the hosting platform. Each deployment has a unique URL, build logs, and can be promoted or rolled back instantly.
- **User-Friendly Error Page**: Error UI displayed to end users when system failures occur. MUST include: (1) clear problem description in plain language, (2) suggested user action (e.g., "try again in a few moments"), (3) no technical stack traces exposed to users, (4) glass-panel styling consistent with app design, (5) HTTP 503 status code for server errors.

---

### Security Requirements

- **SEC-001**: All secrets (database URLs, API keys, Sentry DSN) MUST be stored in Vercel encrypted environment variables — never in repository, `.env` files, or client-side code.
- **SEC-002**: Supabase `service_role` key MUST only be used server-side in server actions — never exposed to browser via `NEXT_PUBLIC_` prefix.
- **SEC-003**: RLS (Row-Level Security) policies MUST be enabled on all Supabase tables before production deployment.
- **SEC-004**: Admin bootstrap process MUST require email verification for first admin account — Supabase Auth magic link or password confirmation.
- **SEC-005**: Authentication session tokens MUST use secure, httpOnly cookies with SameSite=strict attribute.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can go from clone to running local dev server in under 15 minutes by following documented setup steps.
- **SC-002**: Production deployment completes in under 5 minutes from the time a commit is pushed to main.
- **SC-003**: 100% of unhandled production errors are captured with actionable context (stack trace, route, browser info).
- **SC-004**: A pull request cannot be merged if any check (lint, type-check, tests) fails — zero failing code reaches main.
- **SC-005**: Production uptime is 99.5% or higher (excluding planned maintenance during provider-level incidents).
- **SC-006**: Production database migrations can be executed without application downtime (the app continues serving traffic during schema changes).
- **SC-007**: The first admin account can be created in under 5 minutes by following the documented bootstrapping procedure.
- **SC-008**: Rollback from broken deployment to known-good deployment completes in under 2 minutes via Vercel "Promote to Production".
- **SC-009**: Free plan resource monitoring — administrator checks usage dashboard weekly; alerts trigger at 80% utilization threshold.
- **SC-010**: Preview deployments generate unique URLs per pull request within 3 minutes of PR creation.

## Clarifications

### Session 2026-05-14

- Q: Which Sentry integration approach should be used? → A: Use `@sentry/nextjs` SDK (v8+) with App Router support for automatic error capture, source maps, and performance monitoring.
- Q: How should database migrations be executed in production? → A: Automated pre-deployment via GitHub Actions using Supabase CLI before Vercel deploy.
- Q: How should branch protection be enforced for pull requests? → A: Enable GitHub Branch Protection rules on `main` requiring status checks (lint, type-check, test) to pass before merging.
- Q: Where should admin bootstrap documentation live and should it be gitignored? → A: `DEPLOYMENT.md` in repository root, tracked in git with redacted placeholders for sensitive values (not gitignored).
- Q: How should database connections be pooled for Vercel Functions? → A: Use direct connection (port 5432) — pgbouncer NOT available on Supabase Free plan. Monitor connection usage; upgrade to Pro if approaching 60-connection limit.
- Q: Should production use paid or free plans? → A: **Free plans** for both Vercel (Hobby) and Supabase (Free tier). Suitable for small wedding apps with limited traffic.

### Session 2026-05-14 (Gap Resolution)

- Q: What are the exact Free plan limits and monitoring requirements? → A: Supabase Free: 500MB DB (alert at 400MB), 2GB bandwidth/month (alert at 1.6GB), 50K MAU (alert at 40K), 60 max connections. Vercel Hobby: 100GB bandwidth/month, personal use only. Sentry Free: 10K errors/month, 7-day retention.
- Q: How are rollback/recovery scenarios handled? → A: Vercel "Promote to Production" for instant rollback (<2 min). Migration failures rollback via transaction. Manual Supabase backups monthly (Free plan limitation).
- Q: What security requirements apply to secrets and admin bootstrap? → A: Secrets in Vercel encrypted env vars only, `.env.example` with `<PLACEHOLDER>` syntax, service_role key server-side only, RLS enabled on all tables, admin bootstrap requires email verification.
- Q: What file locations are required for CI/CD and Sentry config? → A: `.github/workflows/ci.yml` for CI, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` for Sentry.
- Q: What does "user-friendly error page" mean? → A: Plain language problem description, suggested user action, no stack traces exposed, glass-panel styling, HTTP 503 status for server errors.

---

## Assumptions

- **No EKS, Helm, or Terraform needed**: Vercel is the hosting platform and handles infrastructure provisioning natively. There is no Kubernetes cluster to manage. Supabase is a managed Postgres service — no self-hosted database infrastructure. Terraform would add unnecessary complexity for a single-project Vercel + Supabase stack.
- **No ArgoCD**: ArgoCD is a GitOps tool designed for Kubernetes deployments. Since the application runs on Vercel (which has native Git-based auto-deploy), ArgoCD has no cluster to deploy to and would provide no value. Vercel's built-in Git integration serves the same role (git push → auto deploy).
- **No staging environment**: Only local development and production are maintained, as specified by the user. Preview deployments per PR are available via Vercel at no extra cost but are not treated as a formal staging environment.

### Free Plan Limits (Supabase Free Tier)

| Resource | Limit | Alert Threshold | Mitigation When Exceeded |
|----------|-------|-----------------|-------------------------|
| Database size | 500MB | 400MB (80%) | Delete old data, archive RSVPs, or upgrade to Pro |
| Bandwidth | 2GB/month | 1.6GB (80%) | Reduce image sizes, enable caching, or upgrade |
| Monthly active users | 50K MAU | 40K (80%) | Upgrade to Pro plan |
| Database connections | 60 max | 48 (80%) | Optimize queries, reduce function concurrency, or upgrade |
| Backups | NOT included | N/A | Manual monthly exports required |

### Free Plan Limits (Vercel Hobby)

| Resource | Limit | Alert Threshold | Mitigation When Exceeded |
|----------|-------|-----------------|-------------------------|
| Bandwidth | 100GB/month | 80GB (80%) | Optimize assets, enable CDN caching, or upgrade to Pro |
| Serverless function execution | 100GB-hours/month | 80GB-hours | Optimize function duration |
| Use case | Personal only | N/A | Commercial use requires Pro plan ($20/mo) |

### Free Plan Limits (Sentry Free Tier)

| Resource | Limit | Alert Threshold | Mitigation When Exceeded |
|----------|-------|-----------------|-------------------------|
| Errors | 10K/month | 8K (80%) | Increase sampling, reduce noise, or upgrade |
| Retention | 7 days | N/A | Export important data before expiration |
| Session replay | 1K sessions/month | 800 (80%) | Reduce sample rate |

- **Email delivery** for Supabase Auth (magic links, password resets) uses Supabase's built-in email service by default. A custom SMTP provider can be configured later.
- **Domain name** is out of scope — the app will use the default Vercel provided domain unless the user separately configures a custom domain.
