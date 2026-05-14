# Quickstart: Production Deployment

**Branch**: `012-production-deployment`  
**Date**: 2026-05-14

---

## Overview

This guide walks you through deploying the wedding management system to production using Vercel and Supabase. The entire process takes approximately 15-20 minutes.

---

## Prerequisites

- [ ] GitHub account with repository access
- [ ] Vercel account (Hobby/Free plan — personal use only)
- [ ] Supabase account (Free plan — 500MB database, 2GB bandwidth/month)
- [ ] Node.js 20+ and npm installed locally
- [ ] Sentry account (Free tier — 10K errors/month)

---

## Step 1: Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Fill in:
   - **Name**: Your wedding management app
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
3. Wait ~2 minutes for provisioning
4. **Important**: Free plan limits — 500MB database, 2GB bandwidth/month, 50K monthly active users
5. Go to **Settings → API** and copy:
   - `Project URL` (e.g., `https://xyzcompany.supabase.co`)
   - `anon` public key
   - `service_role` key (⚠️ keep secret!)
6. Go to **Settings → Database** and copy:
   - Connection string (port 5432, direct connection — pgbouncer NOT available on Free plan)

---

## Step 2: Link and Migrate (3 min)

```bash
# Link to your project
supabase link --project-ref <YOUR_PROJECT_REF>

# Apply all migrations to production
supabase db push
```

Verify migrations succeeded:
```bash
supabase db diff --use-migra
# Should show no differences
```

---

## Step 3: Create Vercel Project (2 min)

From repository root:

```bash
vercel --prod
```

Follow the prompts:
- **Set up and link?** Yes
- **Project name**: (accept default or customize)
- **Directory**: `.` (current)

---

## Step 4: Configure Environment Variables (5 min)

In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key>` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-key>` | Production only |
| `DATABASE_URL` | `postgresql://postgres:...@db.<project>.supabase.co:5432/postgres` | Production only |
| `SENTRY_DSN` | `https://...` (from Sentry setup) | Production only |

**Important**: Use the **direct** connection string (port 5432) — pgbouncer is NOT available on Supabase Free plan.

---

## Step 5: Install Sentry (2 min)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard to:
1. Create/link Sentry project
2. Auto-configure `sentry.client.config.ts` and `sentry.server.config.ts`
3. Copy the DSN to Vercel environment variables (Step 4)

---

## Step 6: Create First Admin Account

[TODO: Document the admin bootstrap process — depends on auth method implemented]

---

## Step 7: Configure Branch Protection (3 min)

1. GitHub → Repository → Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Check:
   - ☑ Require a pull request before merging
   - ☑ Require status checks to pass before merging
   - ☑ Select checks: `lint`, `type-check`, `test`
4. Click **Create**

---

## Verification

### Test Production Deployment

1. Navigate to your Vercel production URL
2. Verify login page loads
3. Create admin account and log in
4. Create a test wedding
5. Navigate to `/w/[slug]` — verify venue details and RSVP form render

### Test CI/CD Pipeline

1. Create a feature branch with a small change
2. Open a pull request
3. Verify all checks run (lint, type-check, test)
4. Merge to main
5. Verify Vercel auto-deploys and production URL reflects the change

### Test Error Monitoring

1. Temporarily add a bug (e.g., throw new Error("test") in a server action)
2. Deploy to production
3. Check Sentry dashboard — error should appear within 30 seconds
4. Revert the bug

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Supabase migration fails | Check `SUPABASE_ACCESS_TOKEN` and database password |
| Vercel build fails | Check Node.js version compatibility (20+) |
| Login redirect loop | Verify `NEXT_PUBLIC_SUPABASE_URL` matches production |
| No errors in Sentry | Check `SENTRY_DSN` and `NODE_ENV=production` |
| Database connection timeout | Free plan limit (60 connections) — optimize queries or upgrade to Pro |
| Approaching Supabase limits | Monitor at Dashboard → Settings → Usage; upgrade or reduce traffic |

---

## Next Steps

- [ ] Configure custom domain (Vercel → Project Settings → Domains)
- [ ] Set up custom SMTP for Supabase Auth emails (Free plan uses Supabase default email)
- [ ] Configure Sentry alerts and on-call rotation
- [ ] Monitor Supabase usage (Free plan: 500MB DB, 2GB bandwidth — backups not available on Free tier)
- [ ] Review Vercel Hobby plan limits (personal use only, commercial use requires Pro)

---

## Rollback Procedure

If production deployment fails:

1. Vercel → Deployments → Click last known-good deployment
2. Click **Promote to Production**
3. Verify site is serving traffic
4. Investigate broken deployment in isolation

---

**For detailed documentation, see**: [DEPLOYMENT.md](../../DEPLOYMENT.md) (repository root)
