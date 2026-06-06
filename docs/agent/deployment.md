# Deployment

## Source Guide

Use `DEPLOYMENT.md` as the authoritative production runbook. This file is only a short
agent map for deployment-related code or docs changes.

## Production Stack

- Vercel hosts the Next.js app.
- Supabase hosts PostgreSQL, Auth, and Storage.
- Sentry records production errors and replays with privacy masking.
- GitHub Actions runs checks and deploys the `staging` branch to Vercel Preview
  and `main` to Vercel Production.

## Build And Runtime Notes

- `npm run build` uses `next build --webpack`.
- Preview and production deployments should set `TURBOPACK=0` in Vercel to avoid
  known middleware chunking issues.
- `npm run test:e2e:prod` runs Playwright with `PW_USE_PROD=1` against a production server.
- Node.js `module.register()` warnings from Next.js/Sentry can be ignored until upstream
  changes.

## Environment Flow

| Environment | Trigger | Supabase target | Vercel target |
|---|---|---|---|
| Local | Developer machine | Local Supabase CLI stack | `npm run dev` with `.env.local` |
| Staging | Push to `staging` or manual `staging` dispatch | GitHub `staging` environment secrets | Vercel Preview |
| Production | Push to `main` or manual `production` dispatch | GitHub `production` environment secrets | Vercel production |

## Required Vercel Environment Variables

Read `DEPLOYMENT.md` for exact setup. Critical Vercel variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SENTRY_DSN`
- `TURBOPACK=0`

Never expose service-role or database credentials to the browser.

## Required GitHub Environment Values

Create GitHub environments named `staging` and `production`. Each environment needs:

- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`,
  `VERCEL_TOKEN`
- Variables: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

Point the Supabase values at separate Supabase projects for staging and production.

## Supabase Deployment

- Apply migrations with `supabase db push`; CI links to the target project using
  `SUPABASE_PROJECT_ID`.
- Verify schema drift with `supabase db diff --use-migra`.
- Free-tier projects use direct database connections and require manual backup discipline.

## Admin Bootstrap

Admin access depends on `user.app_metadata?.role`. If creating an admin manually in the
Supabase dashboard, update `auth.users.raw_app_meta_data` so `role` is `"admin"`.

## Staging Deployments

GitHub Actions deploys the `staging` branch after checks pass. Pull requests to
`main` or `staging` run checks only; deployment happens after merge/push to the target
branch or by manual workflow dispatch. Vercel target naming follows Vercel's built-in
environments: staging branch deploys to `preview`, and `main` deploys to `production`.
