# Deployment Guide

**Last Updated**: 2026-05-14  
**Version**: 1.0  
**Branch**: `012-production-deployment`

---

## Overview

This guide walks you through deploying the wedding management system to production using **free tier** services:

| Service | Plan | Limits | Cost |
|---------|------|--------|------|
| Supabase | Free | 500MB DB, 2GB bandwidth, 50K MAU, 60 connections | $0/mo |
| Vercel | Hobby | 100GB bandwidth, personal use only | $0/mo |
| Sentry | Free | 10K errors/month, 7-day retention | $0/mo |
| GitHub Actions | Free | 2000 minutes/month (public repos) | $0/mo |

**Total Cost**: $0/month (suitable for small wedding apps with limited traffic)

**Time to Complete**: 20-30 minutes

---

## Prerequisites

- [ ] GitHub account with write access to the repository
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Supabase account (sign up at [supabase.com](https://supabase.com))
- [ ] Sentry account (sign up at [sentry.io](https://sentry.io))
- [ ] Node.js 20+ installed locally (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase CLI installed (`npm install -g supabase`)

---

## Step 1: Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**

2. Fill in:
   - **Name**: `wedding-management-system` (or your preferred name)
   - **Database Password**: Generate a strong password using a password manager — **save this!**
   - **Region**: Choose closest to your target users (e.g., `us-east-1` for US East Coast)

3. Wait ~2 minutes for provisioning

4. Go to **Settings → API** and copy:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **anon public key**: `eyJhbGc...` (starts with `eyJ`)
   - **service_role key**: `eyJhbGc...` (⚠️ **KEEP SECRET** — never expose to browser)

5. Go to **Settings → Database** and copy:
   - **Connection string** (URI mode, port 5432):
     ```
     postgresql://postgres.<PROJECT_REF>:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
     ```

6. **Important Free Plan Notes**:
   - No pgbouncer available (direct connection only, port 5432)
   - 60 max connections — monitor usage
   - No automated backups — manual exports required (see Step 9)

---

## Step 2: Run Migrations (3 min)

```bash
# Link to your Supabase project
supabase link --project-ref <YOUR_PROJECT_REF>

# Apply all migrations to production
supabase db push
```

**Verify migrations succeeded**:
```bash
# Should show no differences between local and production schema
supabase db diff --use-migra
```

**Troubleshooting**:
- "Not logged in": Run `supabase login` first
- "Project not found": Verify project ref is correct
- "Password failed": Check database password from Step 1

---

## Step 3: Create Vercel Project (3 min)

From repository root:

```bash
# Login to Vercel (first time only)
vercel login

# Create production deployment
vercel --prod
```

**Follow the prompts**:
- **Set up and link?** Yes
- **Link to existing project?** No (create new)
- **Project name**: `wedding-management-system` (or your preferred name)
- **Directory**: `.` (current directory)

Vercel will create your project and deploy — note your production URL:
```
https://wedding-management-system-<hash>.vercel.app
```

---

## Step 4: Configure Vercel Environment Variables (5 min)

1. Go to Vercel Dashboard → Your Project → **Settings → Environment Variables**

2. Add the following variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key-from_step_1>` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-key-from_step_1>` | **Production only** |
| `DATABASE_URL` | `postgresql://...:5432/postgres` (from Step 1) | **Production only** |
| `SENTRY_DSN` | `https://...` (from Step 6) | **Production only** |

3. Click **Save** after each variable

**⚠️ Critical Security Notes**:
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — **NEVER** prefix with `NEXT_PUBLIC_`
- `DATABASE_URL` contains password — **NEVER** commit to git
- Vercel encrypts all environment variables at rest

---

## Step 5: Install and Configure Sentry (5 min)

```bash
# Install Sentry SDK
npm install @sentry/nextjs

# Run Sentry wizard (automates setup)
npx @sentry/wizard@latest -i nextjs
```

**Follow the wizard**:
1. Sign in to Sentry (or create account)
2. Create new project (select "Next.js")
3. Wizard auto-configures:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
4. Copy the **DSN** shown in wizard

**Add DSN to Vercel** (Step 4 table):
- Variable: `SENTRY_DSN`
- Value: `https://<key>@<org>.ingest.sentry.io/<id>`
- Environment: **Production only**

**Verify Sentry is working**:
1. Deploy to production: `vercel --prod`
2. Trigger a test error (temporarily add `throw new Error("test")` to a server action)
3. Check Sentry Dashboard → Issues — test error should appear within 30 seconds
4. Revert the test error and redeploy

---

## Step 6: Create First Admin Account (5 min)

**Important**: The wedding management system uses Supabase Auth with email-based authentication. Follow these steps to create the first admin account:

### Option A: Email Signup (Recommended)

1. Navigate to your production URL: `https://<your-app>.vercel.app`

2. Click **Login** → **Sign Up**

3. Enter admin email and password:
   - Use a real email address you control
   - Choose a strong password (12+ characters)

4. Check email for magic link from Supabase

5. Click magic link to verify email

6. You will be redirected to the admin dashboard

### Option B: Manual Admin Creation (If Email Unavailable)

If you cannot receive emails (e.g., custom domain not configured):

1. Go to Supabase Dashboard → Authentication → Users

2. Click **Add User** → **Create new user**

3. Fill in:
   - **Email**: `<YOUR_ADMIN_EMAIL>`
   - **Password**: `<GENERATE_STRONG_PASSWORD>`
   - **Confirm Password**: (same)
   - **Auto Confirm User**: ✓ Yes (skip email verification for initial setup)

4. Click **Create user**

5. Navigate to production URL and login with credentials

### Granting Admin Role

By default, new users have `couple` role. To grant `admin` role:

1. Go to Supabase Dashboard → Authentication → Users

2. Find your admin user in the list

3. Click user → **Edit user metadata**

4. Add custom claim:
   ```json
   {
     "role": "admin"
   }
   ```

5. Click **Save**

6. Logout and login again — you should now see the admin dashboard

---

## Step 7: Configure GitHub Branch Protection (3 min)

1. Go to GitHub → Your Repository → **Settings → Branches**

2. Click **Add branch protection rule**

3. Fill in:
   - **Branch name pattern**: `main`
   - ☑ **Require a pull request before merging**
   - ☑ **Require status checks to pass before merging**
   - **Select required checks**: Search and select `lint`, `type-check`, `test`
   - ☑ **Require branches to be up to date before merging** (recommended)

4. Click **Create**

**Verify branch protection**:
1. Create a feature branch with a small change
2. Open a pull request
3. Wait for GitHub Actions to run — all checks must pass
4. Try to merge — GitHub should block merge if any check fails

---

## Step 8: Create `.env.local` for Local Development (2 min)

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local` with **local development values**:

```bash
# Local Supabase (from `npx supabase start`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>

# Production values NOT needed for local dev
# DATABASE_URL=<leave empty for local>
# SENTRY_DSN=<leave empty for local>
```

**Run local development**:
```bash
npm run dev
```

Navigate to `http://localhost:3000` — login page should load.

---

## Step 9: Monthly Manual Backup (Supabase Free Plan)

**⚠️ Free Plan Limitation**: Supabase Free does NOT include automated backups.

**Monthly backup procedure**:

1. Go to Supabase Dashboard → Database → **Backups**

2. Click **New Backup** → **Full Backup**

3. Wait for backup to complete (~2-5 minutes)

4. Click **Download** → Save `.sql` file to secure location:
   - External hard drive
   - Encrypted cloud storage (e.g., Proton Drive, Cryptomator)
   - Password manager attachment

5. **Verify backup** (optional but recommended):
   ```bash
   # Check file is non-empty and valid SQL
   head -20 backup-2026-05.sql
   # Should show: BEGIN; SET statement_timeout = 0; ...
   ```

6. **Document backup date** in a log:
   ```
   Backup Log
   ----------
   2026-05-14: backup-wedding-mgmt-2026-05.sql (12MB)
   2026-04-14: backup-wedding-mgmt-2026-04.sql (11MB)
   ```

**Restore from backup** (emergency only):
1. Go to Supabase Dashboard → Database → Backups
2. Click **Restore** next to desired backup
3. Confirm restoration — **this overwrites current data**

---

## Step 10: Monitor Free Plan Usage (Weekly)

**⚠️ Free plan requires active monitoring to avoid service interruption.**

### Supabase Usage (Check Weekly)

1. Go to Supabase Dashboard → **Settings → Usage**

2. Monitor these metrics:

| Metric | Free Limit | Alert at 80% | Action When Exceeded |
|--------|------------|--------------|---------------------|
| Database size | 500MB | 400MB | Archive old RSVPs, delete test data, or upgrade |
| Bandwidth | 2GB/month | 1.6GB | Optimize images, enable caching, or upgrade |
| Monthly active users | 50K MAU | 40K | Upgrade to Pro plan |
| API connections | 60 max | 48 | Optimize queries, reduce function concurrency |

3. **Set a calendar reminder** to check usage every Monday

### Vercel Usage (Check Weekly)

1. Go to Vercel Dashboard → Project → **Analytics**

2. Monitor:
   - **Bandwidth**: Free limit 100GB/month
   - **Serverless function execution**: 100GB-hours/month

3. **Commercial use warning**: Vercel Hobby plan is for **personal use only**. If you're running a commercial wedding business, upgrade to Pro ($20/mo).

### Sentry Usage (Check Monthly)

1. Go to Sentry Dashboard → Project → **Settings → Usage**

2. Monitor:
   - **Errors**: 10K/month (alert at 8K)
   - **Session replays**: 1K/month (alert at 800)

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| **Supabase migration fails** | Check `SUPABASE_ACCESS_TOKEN` and database password. Run `supabase login` first. |
| **Vercel build fails** | Check Node.js version (20+ required). Review build logs in Vercel Dashboard. |
| **Login redirect loop** | Verify `NEXT_PUBLIC_SUPABASE_URL` matches production URL exactly (https, no trailing slash). |
| **No errors in Sentry** | Check `SENTRY_DSN` is set. Verify `NODE_ENV=production` (Vercel sets this automatically). |
| **Database connection timeout** | Free plan limit (60 connections). Optimize queries or upgrade to Pro for pgbouncer. |
| **"Service unavailable" error** | Database at connection limit. Wait for connections to release, then retry. |
| **RSVP submission fails** | Check Supabase RLS policies. Verify `service_role` key is set in Vercel. |
| **Preview deployment shows wrong data** | Preview deployments use development env vars. Ensure preview connects to correct Supabase project. |

---

## Rollback Procedure

If production deployment introduces bugs:

### Instant Rollback via Vercel (Recommended)

1. Go to Vercel Dashboard → Your Project → **Deployments**

2. Find last known-good deployment (green checkmark)

3. Click deployment → **Promote to Production**

4. Confirm promotion — rollback completes in <30 seconds

5. Verify production URL serves correct version

### Rollback via Git (If Code Revert Needed)

1. Identify broken commit: `git log --oneline -5`

2. Revert commit: `git revert <BROKEN_COMMIT_SHA>`

3. Push to main: `git push origin main`

4. Vercel auto-deploys reverted code

5. Monitor deployment logs — should complete in 2-3 minutes

---

## Upgrade Path (Free → Pro)

When your wedding app outgrows Free plan limits:

### Supabase Free → Pro ($25/mo)

1. Go to Supabase Dashboard → **Settings → Billing**

2. Click **Upgrade to Pro**

3. Benefits:
   - 8GB database (vs 500MB)
   - Unlimited bandwidth
   - 200K MAU (vs 50K)
   - **Pgbouncer connection pooling** (port 6543)
   - Daily automated backups

4. **After upgrade**: Update `DATABASE_URL` to pooled connection string:
   ```
   # Old (direct):
   postgresql://...@db.<PROJECT_REF>.supabase.co:5432/postgres

   # New (pgbouncer):
   postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres
   ```

5. Update Vercel environment variable → Redeploy

### Vercel Hobby → Pro ($20/mo)

1. Go to Vercel Dashboard → **Settings → Billing**

2. Click **Upgrade to Pro**

3. Benefits:
   - Commercial use allowed
   - Unlimited bandwidth
   - More serverless function execution
   - Priority support

---

## Post-Deployment Checklist

- [ ] Supabase project created and migrations applied
- [ ] Vercel project created and linked to GitHub
- [ ] All environment variables configured in Vercel
- [ ] Sentry installed and DSN configured
- [ ] First admin account created and verified
- [ ] GitHub branch protection enabled
- [ ] Local development environment working
- [ ] Monthly backup reminder set in calendar
- [ ] Weekly usage monitoring reminder set in calendar
- [ ] Test RSVP submission works end-to-end
- [ ] Test error monitoring (trigger test error, verify in Sentry)

---

## Next Steps

After deployment:

1. **Configure custom domain** (optional): Vercel → Project Settings → Domains
2. **Set up custom SMTP** (optional): Supabase → Settings → Auth → Email Templates
3. **Configure Sentry alerts**: Sentry → Project Settings → Alerts
4. **Review wedding-specific settings**: Admin dashboard → Wedding Settings

---

## Support

- **Documentation**: See `specs/012-production-deployment/` for technical details
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Sentry Support**: [docs.sentry.io](https://docs.sentry.io)
- **GitHub Issues**: Repository → Issues tab for bug reports
