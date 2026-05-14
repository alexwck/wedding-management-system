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

- What happens when the Supabase production database hits its connection limit? The application uses Supabase's built-in pgbouncer (Transaction mode) to pool connections and prevent exhaustion. If the pooler itself is at capacity, the application displays a user-friendly error page rather than crashing.
- What happens when a database migration fails in production? The migration should be wrapped in a transaction so it rolls back cleanly, and the site continues running on the previous schema version.
- How does the system behave when Sentry is temporarily unreachable? The application must continue functioning normally — Sentry failure must never block page rendering or API responses.
- How are existing database backups handled? Production data must be backed up regularly — Supabase automatic backups are sufficient for recovery.
- What happens when Vercel deploys a broken build? Vercel should keep the last known-good deployment serving traffic until the issue is resolved (instant rollback capability).
- How are RSVP submission failures handled in production? If the database is temporarily unavailable during an RSVP submission, the user sees a clear error message and is prompted to try again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have a production Supabase project with all migrations applied and RLS policies enabled.
- **FR-002**: System MUST have a production Vercel project linked to the GitHub repository for automatic deployments.
- **FR-003**: System MUST deploy to production automatically when commits are pushed to the main branch.
- **FR-004**: System MUST run lint, type-check, and all unit tests via GitHub Actions on every pull request before merging is allowed (branch protection).
- **FR-004a**: GitHub repository MUST have branch protection rules enabled on `main` with "Require status checks to pass before merging" for checks: `lint`, `type-check`, `test`.
- **FR-005**: System MUST report unhandled production errors to a centralized monitoring service (Sentry) within 30 seconds of occurrence.
- **FR-005a**: System MUST use `@sentry/nextjs` SDK (v8+) with App Router support for automatic error capture, source maps, and performance monitoring.
- **FR-006**: Error monitoring MUST NOT activate in local development — only production builds report errors.
- **FR-007**: Repository MUST include a `.env.example` file documenting all required environment variables with descriptions.
- **FR-008**: Repository MUST include `DEPLOYMENT.md` in the root directory with documented steps for creating the first admin account on a fresh deployment.
- **FR-008a**: `DEPLOYMENT.md` MUST be tracked in git and use redacted placeholders (e.g., `<YOUR_VALUE>`) for sensitive values rather than committing real secrets.
- **FR-009**: All production secrets (database URLs, API keys) MUST be stored as encrypted environment variables — never in the repository.
- **FR-010**: The application MUST continue serving traffic normally when the error monitoring service is unreachable (observability must never break core functionality).
- **FR-011**: Database migrations in production MUST run before deploying the new application code to avoid schema mismatch.
- **FR-011a**: Migrations MUST be executed automatically via GitHub Actions using the Supabase CLI as a pre-deployment step before triggering Vercel deploy.
- **FR-012**: The production deployment MUST use the same build output as local development (no environment-specific code paths that alter application behavior).
- **FR-012a**: System MUST use Supabase's built-in pgbouncer connection pooler (Transaction mode) to prevent database connection exhaustion from Vercel Functions.

### Key Entities

- **Environment Configuration**: A set of key-value pairs required for application operation. Includes database connection strings, API keys, service URLs, and feature flags. Each environment (local, production) has its own configuration set derived from a shared template.
- **Deployment**: A versioned, immutable snapshot of the application running on the hosting platform. Each deployment has a unique URL, build logs, and can be promoted or rolled back instantly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can go from clone to running local dev server in under 15 minutes by following documented setup steps.
- **SC-002**: Production deployment completes in under 5 minutes from the time a commit is pushed to main.
- **SC-003**: 100% of unhandled production errors are captured with actionable context (stack trace, route, browser info).
- **SC-004**: A pull request cannot be merged if any check (lint, type-check, tests) fails — zero failing code reaches main.
- **SC-005**: Production uptime is 99.5% or higher (excluding planned maintenance during provider-level incidents).
- **SC-006**: Production database migrations can be executed without application downtime (the app continues serving traffic during schema changes).
- **SC-007**: The first admin account can be created in under 5 minutes by following the documented bootstrapping procedure.

## Clarifications

### Session 2026-05-14

- Q: Which Sentry integration approach should be used? → A: Use `@sentry/nextjs` SDK (v8+) with App Router support for automatic error capture, source maps, and performance monitoring.
- Q: How should database migrations be executed in production? → A: Automated pre-deployment via GitHub Actions using Supabase CLI before Vercel deploy.
- Q: How should branch protection be enforced for pull requests? → A: Enable GitHub Branch Protection rules on `main` requiring status checks (lint, type-check, test) to pass before merging.
- Q: Where should admin bootstrap documentation live and should it be gitignored? → A: `DEPLOYMENT.md` in repository root, tracked in git with redacted placeholders for sensitive values (not gitignored).
- Q: How should database connections be pooled for Vercel Functions? → A: Use Supabase's built-in pgbouncer connection pooler (Transaction mode) via the pooled connection string.

---

## Assumptions

- **No EKS, Helm, or Terraform needed**: Vercel is the hosting platform and handles infrastructure provisioning natively. There is no Kubernetes cluster to manage. Supabase is a managed Postgres service — no self-hosted database infrastructure. Terraform would add unnecessary complexity for a single-project Vercel + Supabase stack.
- **No ArgoCD**: ArgoCD is a GitOps tool designed for Kubernetes deployments. Since the application runs on Vercel (which has native Git-based auto-deploy), ArgoCD has no cluster to deploy to and would provide no value. Vercel's built-in Git integration serves the same role (git push → auto deploy).
- **No staging environment**: Only local development and production are maintained, as specified by the user. Preview deployments per PR are available via Vercel at no extra cost but are not treated as a formal staging environment.
- **Supabase production project** will be on a paid plan (the free tier has usage limits unsuitable for production). The exact plan depends on expected usage.
- **Vercel production project** will be on Hobby or Pro plan depending on team size and bandwidth needs.
- **Email delivery** for Supabase Auth (magic links, password resets) uses Supabase's built-in email service by default. A custom SMTP provider can be configured later.
- **Domain name** is out of scope — the app will use the default Vercel provided domain unless the user separately configures a custom domain.
- **Supabase backups** are handled automatically by Supabase on paid plans (daily backups with point-in-time recovery).
