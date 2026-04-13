# Quickstart: RSVP Landing Page & Form

**Feature Branch**: `001-rsvp-landing-page`
**Date**: 2026-04-14

## Prerequisites

- Node.js 20+
- npm
- Supabase CLI (`npx supabase`)
- Vercel CLI (`npx vercel`) — optional, for deployment

## Setup

### 1. Create Next.js project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

### 2. Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install nanoid
npx shadcn@latest init
npx shadcn@latest add button input textarea checkbox label card form select table badge dialog sheet
```

### 3. Configure Supabase

```bash
npx supabase init
npx supabase start
```

Copy the output values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 4. Run migrations

```bash
npx supabase db push
```

### 5. Seed development data

```bash
npx supabase db seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- 2 couple users with weddings and sample RSVPs

## Development

```bash
npm run dev
```

### Key URLs

| URL | Description |
|-----|-------------|
| `/auth/login` | Login page |
| `/admin` | Admin dashboard |
| `/admin/weddings` | Manage weddings |
| `/admin/couples` | Create couple accounts |
| `/dashboard` | Couple dashboard |
| `/dashboard/rsvps` | View RSVP responses |
| `/w/{slug}` | Public landing page |
| `/w/{slug}/rsvp` | Public RSVP form |

## Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npx playwright install
npm run test:e2e
```

## Deployment

```bash
npx vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
