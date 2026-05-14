# Phase 0: Research & Technical Decisions

**Branch**: `012-production-deployment`  
**Date**: 2026-05-14  
**Spec**: [spec.md](./spec.md)

---

## Research Summary

All technical unknowns from the specification have been resolved through the clarification process. This document consolidates the decisions, rationale, and implementation patterns.

---

## Technical Decisions

### 1. Sentry Integration

**Decision**: Use `@sentry/nextjs` SDK v8+ with App Router support

**Rationale**:
- Official Sentry SDK for Next.js with automatic error capture for client, server, and edge
- Built-in source map upload for production error deobfuscation
- Performance monitoring included (Web Vitals, function duration)
- Minimal configuration — no manual error boundaries required for most cases
- **Free tier**: Sentry has a generous free tier (10K errors/month, 7-day retention)

**Alternatives Considered**:
- Manual `@sentry/browser` + `@sentry/node`: More control but requires manual instrumentation and risks missing server action errors
- Vercel Analytics only: Provides performance metrics but lacks error tracking and stack traces

**Implementation Pattern**:
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",
  enabled: process.env.NODE_ENV === "production",
  integrations: [
    Sentry.replayIntegration({ maskAllText: false }),
  ],
  tracesSampleRate: 0.1, // 10% sampling for performance
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "production",
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
});
```

**Package**: `npm install @sentry/nextjs`

**Free Plan Note**: Sentry Free tier includes 10K errors/month, 7-day retention — sufficient for small wedding app.

---

### 2. Database Migration Strategy

**Decision**: Automated pre-deployment via GitHub Actions using Supabase CLI

**Rationale**:
- Ensures schema is always deployed before application code that depends on it
- Eliminates manual migration steps and human error
- Migrations run in a transaction — rollback on failure
- Supabase CLI handles auth and project linking
- **Free plan compatible**: Supabase Free tier includes full migration support

**Alternatives Considered**:
- Manual migration: Fast for one-off deploys but error-prone and not auditable
- Vercel build command: Would couple migration to build lifecycle; harder to rollback

**Implementation Pattern**:
```yaml
# .github/workflows/ci.yml (deploy job)
- name: Run Supabase Migrations
  run: npx supabase db push
  env:
    SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

- name: Deploy to Vercel
  run: vercel --prod --yes
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

**Prerequisites**:
- Supabase CLI installed in CI (`supabase/cli` GitHub Action)
- `SUPABACE_ACCESS_TOKEN` (generate at supabase.com/dashboard/account/tokens)
- `SUPABASE_DB_PASSWORD` for migration auth

---

### 3. GitHub Branch Protection

**Decision**: Enable GitHub Branch Protection rules on `main` requiring status checks

**Rationale**:
- GitHub-native enforcement — no external dependencies
- Integrates directly with GitHub Actions workflow
- Prevents accidental merges of failing code

**Configuration Steps** (manual, one-time):
1. Go to repository Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Check "Require a pull request before merging"
4. Check "Require status checks to pass before merging"
5. Search and select required checks: `lint`, `type-check`, `test`
6. Optionally check "Require branches to be up to date before merging"

**GitHub Actions Workflow**:
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm exec tsc -- --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
```

---

### 4. Documentation Location & Format

**Decision**: `DEPLOYMENT.md` in repository root, tracked in git with redacted placeholders

**Rationale**:
- Version-controlled documentation stays in sync with code
- Placeholders prevent accidental secret commits
- Root directory ensures immediate visibility

**Alternatives Considered**:
- Gitignored runbook: Risks documentation drift and loss
- Encrypted sections: Adds complexity without clear benefit

**DEPLOYMENT.md Structure**:
```markdown
# Deployment Guide

## Prerequisites

- Supabase account (paid plan recommended for production)
- Vercel account (Hobby or Pro)
- GitHub account with repository access

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL (e.g., `https://xyzcompany.supabase.co`)
3. Go to Settings → Database → Copy your `connection string`
4. Go to Settings → API → Copy your `service_role` key (keep secret!)

## Step 2: Run Migrations

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

## Step 3: Create Vercel Project

```bash
vercel --prod
```

## Step 4: Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key>` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-key>` | Production |
| `SENTRY_DSN` | `https://...` | Production |

## Step 5: Create First Admin Account

[Document the admin bootstrap process here — depends on auth method]

## Step 6: Configure Branch Protection

[Link to GitHub branch protection setup steps]
```

---

### 5. Database Connection Pooling

**Decision**: Use **direct connection** (pgbouncer is NOT available on Supabase Free plan)

**Rationale**:
- Supabase pgbouncer requires **Pro plan** ($25/mo) — not available on Free tier
- Free tier uses direct connection on port 5432
- For small wedding apps with limited concurrent traffic, connection exhaustion is unlikely
- If connection limits become an issue, upgrade to Pro plan or implement application-level connection management

**Connection String Format**:
```
# Direct connection (FREE PLAN - REQUIRED)
postgresql://postgres:[PASSWORD]@db.xyzcompany.supabase.co:5432/postgres

# Pooled connection (PRO PLAN ONLY - not available on Free tier)
# postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Configuration**:
1. In Supabase Dashboard → Settings → Database
2. Copy the direct connection string (port 5432)
3. Use for Vercel environment variable `DATABASE_URL`

**Free Plan Limits**:
- Max connections: 60 (shared CPU)
- If approaching limit: reduce Vercel function concurrency, optimize queries, or upgrade

**Why This Matters**:
- Vercel serverless functions create new connections per invocation
- Without pooling, concurrent traffic can exhaust 60 connections
- Mitigation: Keep queries fast, use connection-efficient patterns, monitor usage

---

## Dependencies & Installation

### NPM Packages

| Package | Purpose | Install Command |
|---------|---------|-----------------|
| `@sentry/nextjs` v8+ | Error monitoring | `npm install @sentry/nextjs` |
| `@sentry/profiling-node` | Optional: CPU profiling | `npm install @sentry/profiling-node` |

### GitHub Actions

| Action | Purpose |
|--------|---------|
| `actions/checkout@v4` | Repository checkout |
| `actions/setup-node@v4` | Node.js setup with npm caching |
| `supabase/setup-cli@v1` | Supabase CLI installation |

### Vercel Configuration

No `vercel.json` required for basic deployment. Optional `vercel.ts` for advanced routing:

```typescript
// vercel.ts (optional)
import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  installCommand: 'npm ci',
};
```

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase migration failure | Low | High | Transactional rollback, instant Vercel rollback |
| Sentry outage | Low | Low | App continues functioning (FR-010) |
| Vercel deployment failure | Medium | Medium | Last known-good deployment serves traffic |
| Connection exhaustion | Low | High | Pgbouncer prevents this by design |
| Secret exposure in repo | Medium | Critical | `.env.example` with placeholders, never commit real values |

---

## Next Steps (Phase 1)

1. Create `DEPLOYMENT.md` in repository root
2. Add `.env.example` with all required variables documented
3. Create Sentry configuration files (client, server, edge)
4. Create `.github/workflows/ci.yml` with lint, type-check, test jobs
5. Configure Supabase pgbouncer connection string
6. Document branch protection setup in `DEPLOYMENT.md`
