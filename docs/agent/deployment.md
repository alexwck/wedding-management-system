# Deployment

## Source Guide

Use `DEPLOYMENT.md` as the authoritative production runbook. This file is only a short
agent map for deployment-related code or docs changes.

## Production Stack

- Vercel hosts the Next.js app.
- Supabase hosts PostgreSQL, Auth, and Storage.
- Sentry records production errors and replays with privacy masking.
- GitHub Actions runs checks and preview deployment jobs.

## Build And Runtime Notes

- `npm run build` uses `next build --webpack`.
- Production deployments set `TURBOPACK=0` to avoid known middleware chunking issues.
- `npm run test:e2e:prod` runs Playwright with `PW_USE_PROD=1` against a production server.
- Node.js `module.register()` warnings from Next.js/Sentry can be ignored until upstream
  changes.

## Required Vercel Environment Variables

Read `DEPLOYMENT.md` for exact setup. Critical variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SENTRY_DSN`
- `TURBOPACK=0`

Never expose service-role or database credentials to the browser.

## Supabase Deployment

- Apply migrations with `supabase db push`.
- Verify schema drift with `supabase db diff --use-migra`.
- Free-tier projects use direct database connections and require manual backup discipline.

## Admin Bootstrap

Admin access depends on `user.app_metadata?.role`. If creating an admin manually in the
Supabase dashboard, update `auth.users.raw_app_meta_data` so `role` is `"admin"`.

## Preview Deployments

GitHub Actions has a preview job on pull requests after checks pass. Vercel may also
auto-deploy PRs; the CI job provides gated status checks.
