# Deployment Runbook

Last updated: 2026-06-07

Source of truth: `.github/workflows/ci.yml`, `.env.example`, `package.json`, and
`supabase/`.

## Environment Map

| Environment | Trigger | Supabase | Vercel | Env source |
|---|---|---|---|---|
| Local | Developer machine | Local CLI stack | `npm run dev` | `.env.local` |
| Staging | Push to `staging` or manual dispatch | Staging project | Preview | GitHub `staging` env + Vercel Preview env |
| Production | Push to `main` or manual dispatch | Production project | Production | GitHub/Vercel `production` envs |

Staging and production must use separate Supabase projects. In Vercel, the
staging branch deploys to the built-in `preview` target, not `development`.

## Local

```bash
supabase start
cp .env.example .env.local
supabase status
supabase db reset
npm run dev
```

Required `.env.local` values:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service_role key>
```

Useful checks:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Hosted Configuration

Create GitHub environments named `staging` and `production`. Each environment
needs these secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`
- `VERCEL_TOKEN`

Each GitHub environment also needs these variables:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Configure these Vercel env vars for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `TURBOPACK=0`

Production also requires `SENTRY_DSN`; Preview may set it if error capture is
wanted for staging deployments.

To get Vercel IDs:

```bash
vercel link
cat .vercel/project.json
```

Copy `orgId` to `VERCEL_ORG_ID` and `projectId` to `VERCEL_PROJECT_ID`. The
`.vercel/` directory is ignored, so CI must receive these through GitHub
environment variables.

## Staging

The `deploy-staging` job runs after `lint`, `type-check`, and `test` pass. It
uses GitHub/Supabase `staging` values and Vercel `preview` values.

Flow:

1. Push or merge to `staging`.
2. CI runs `supabase link --project-ref "$SUPABASE_PROJECT_ID"`.
3. CI runs `supabase db push`.
4. CI runs `vercel pull --environment=preview`.
5. CI runs `vercel build --target=preview`.
6. CI runs `vercel deploy --prebuilt --target=preview`.

## Production

The `deploy-production` job runs after `lint`, `type-check`, and `test` pass.
Protect the GitHub `production` environment with required reviewers.

Flow:

1. Merge to `main`.
2. CI runs `supabase link --project-ref "$SUPABASE_PROJECT_ID"`.
3. CI runs `supabase db push`.
4. CI runs `vercel pull --environment=production`.
5. CI runs `vercel build --prod`.
6. CI runs `vercel deploy --prebuilt --prod`.

## Migrations

- Committed schema changes live in `supabase/migrations/`.
- Create migrations with `supabase migration new <name>`.
- Validate locally with `supabase db reset`.
- CI applies committed migrations with `supabase db push`.
- If a hosted project changes through the dashboard, pull that change into a
  migration before relying on CI:

  ```bash
  supabase link --project-ref <project-ref>
  supabase db pull
  ```

## Verification

- Local: run `npm run lint`, `npm run test`, and `npm run build`.
- Staging: confirm `deploy-staging` succeeds, then smoke test login, admin,
  public wedding page, and RSVP.
- Production: confirm `deploy-production` succeeds after approval, then smoke
  test login, admin, public wedding page, and RSVP.

## Rollback

- Vercel: promote the last known-good deployment from Vercel Dashboard ->
  Project -> Deployments.
- Database: treat migrations as forward-only; prefer corrective migrations.
  Restore from a Supabase backup only for data-loss incidents.

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are server-only secrets. Never
  expose them with `NEXT_PUBLIC_`.
- Free-tier Supabase projects need manual backups.
- Admin access depends on `auth.users.raw_app_meta_data.role = "admin"` and a
  matching `public.users` row.
