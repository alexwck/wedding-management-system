# Implementation Plan: Production Deployment

**Branch**: `012-production-deployment` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-production-deployment/spec.md`

---

## Summary

Deploy the wedding management system to production using Vercel (hosting) and Supabase (database/auth). The technical approach uses: GitHub Actions for CI/CD with automated migrations, `@sentry/nextjs` for error monitoring, direct database connection (port 5432, no pgbouncer on Free plan), and comprehensive `DEPLOYMENT.md` documentation. No staging environment — local development and production only.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 24 LTS, Next.js 16 (App Router), React 19  
**Primary Dependencies**: `@sentry/nextjs` v8+, `@supabase/supabase-js`, GitHub Actions  
**Storage**: Supabase PostgreSQL (Free plan: 500MB database, 60 max connections, direct connection only)  
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E, desktop + mobile, `workers: 1`)  
**Target Platform**: Vercel Hobby (Free) plan — serverless Node.js functions, 100GB bandwidth/month  
**Project Type**: Full-stack web application (Next.js App Router with server actions)  
**Performance Goals**: Page loads <2s, production deploy <5min from push to live, error reporting <30s  
**Constraints**: Vercel function timeout 300s max, Supabase 60 connection limit (no pgbouncer on Free plan), no staging environment  
**Scale/Scope**: Single production deployment, ~450 unit tests, 22 E2E spec files, **Free plan limits**: Supabase (500MB DB, 2GB bandwidth, 50K MAU), Vercel (100GB bandwidth, personal use only)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | **PASS** | Spec complete with user stories, acceptance criteria, clarifications |
| II. Type Safety | **PASS** | TypeScript strict mode maintained; no `any` introduced |
| III. Component-First Architecture | **N/A** | Infrastructure feature — no new UI components |
| IV. User Experience First | **PASS** | Documentation reduces admin cognitive load (SC-001, SC-007) |
| V. Simplicity | **PASS** | Vercel-native deployment, no Kubernetes/Helm/Terraform overhead; Free plan reduces cost/complexity |
| VI. Security by Default | **PASS** | Secrets in Vercel env vars (encrypted), `.env.example` with placeholders |
| VII. Mobile Parity | **N/A** | Infrastructure feature — no interactive UI |
| VIII. Data Integrity | **PASS** | Migrations run pre-deploy; direct DB connection (Free plan) — monitor connection limits |
| IX. Glassmorphism Design System | **N/A** | Infrastructure feature — no UI surfaces |

**GATE RESULT**: PASS — All applicable principles satisfied. Proceeding to Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/012-production-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output — N/A for infrastructure feature
├── quickstart.md        # Phase 1 output → DEPLOYMENT.md (root)
├── contracts/           # Phase 1 output — N/A (no external API contracts)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── actions/
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
│   └── supabase/
├── types/
└── proxy.ts
tests/
├── unit/
│   └── helpers/
└── e2e/
.github/
├── workflows/
│   └── ci.yml           # Created: lint, type-check, test
supabase/
├── migrations/
├── config.toml
└── seed.sql
```

**Structure Decision**: Existing Next.js 16 App Router structure retained. New files:
- `.github/workflows/ci.yml` (CI/CD pipeline)
- `DEPLOYMENT.md` (admin bootstrap documentation)
- `.env.example` (if not already present)
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (Sentry configs)

**Free Plan Considerations**:
- Supabase Free: 500MB database, 2GB bandwidth/month, 50K MAU, 60 max connections, no pgbouncer
- Vercel Hobby: 100GB bandwidth/month, personal use only (commercial requires Pro)
- Sentry Free: 10K errors/month, 7-day retention

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This infrastructure feature simplifies the stack by using platform-native solutions (Vercel, Supabase) rather than self-hosted alternatives.
