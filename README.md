# Wedding Management System

A wedding RSVP management system where admins upload Canva-designed invitation templates as landing pages with shareable links. Guests view the landing page and submit RSVPs without authentication. Couples log in to view their RSVP responses. Admins manage all weddings, couples, and templates.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript (strict mode)
- **UI**: shadcn/ui, Tailwind CSS, react-hook-form, zod
- **Database & Auth**: Supabase (PostgreSQL with RLS, Auth, Storage)
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
- **Container Runtime**: Podman (local Supabase)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- [Podman](https://podman.io/) (Supabase CLI uses it under the hood instead of Docker)

> **Note**: The Supabase CLI detects Podman automatically if Docker is not installed. No extra configuration needed — just make sure Podman is running before starting Supabase.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Initialize and start Supabase

```bash
npx supabase init   # only needed once
npx supabase start  # starts all local services via Podman
```

The `supabase start` command outputs your local credentials. You'll need these for the next step.

### 4. Configure environment variables

Copy the example file and fill in the values from `supabase start` output:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data

The database is automatically seeded on `supabase start` and `supabase db reset` with:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@example.com | admin123 | admin |
| Couple 1 | alex@example.com | couple123 | couple |
| Couple 2 | jordan@example.com | couple123 | couple |

Seed data includes 2 weddings and 6 sample RSVP responses.

To reset the database to a clean state:

```bash
npx supabase db reset
```

## Key URLs

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

### Unit Tests (Vitest)

```bash
npm run test           # run once
npm run test:watch     # watch mode
```

### E2E Tests (Playwright)

E2E tests require the Supabase stack and a Next.js dev server. Playwright starts the dev server automatically via `webServer` config.

```bash
npm run test:e2e                              # run all
npx playwright test --project=chromium         # desktop only
npx playwright test --project="Mobile Chrome"  # mobile only
npx playwright test --ui                       # interactive mode
```

The test suite runs against two projects: **Desktop Chrome** and **Mobile Chrome** (Pixel 5 viewport).

### Run all tests

```bash
npm run test && npm run test:e2e
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (landing page, RSVP, login)
│   ├── (auth)/             # Protected routes (admin, dashboard)
│   └── actions/            # Server actions (rsvp, upload, admin)
├── components/             # React components
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── supabase/           # Supabase clients (browser, server, admin)
│   ├── validations/        # Zod schemas (rsvp, admin)
│   └── utils.ts            # Utilities
├── middleware.ts            # Auth middleware
└── types/                  # TypeScript types
supabase/
├── config.toml             # Supabase configuration
├── migrations/             # Database migrations
└── seed.sql                # Development seed data
tests/
├── e2e/                    # Playwright E2E tests
└── unit/                   # Vitest unit tests
```

## Architecture Notes

- **Server Components by default** — only interactive forms use Client Components
- **RLS (Row-Level Security)** — couples can only access their own wedding data; admin uses service role to bypass
- **RSVP deduplication** — unique constraint on `(wedding_id, LOWER(guest_name))` plus application-level check
- **Image uploads** — stored in Supabase Storage `wedding-templates` bucket; admin-only upload, public read
- **Auth** — Supabase Auth with Next.js middleware protecting `/dashboard/*` and `/admin/*` routes; admin role checked via `app_metadata`

## Troubleshooting

**Supabase won't start** — Make sure Podman is running (`podman info`). If containers are stuck, try `npx supabase stop && npx supabase start`.

**`Failed to fetch` errors in tests** — Supabase isn't running. Run `npx supabase start` before E2E tests.

**Port conflicts** — Supabase uses ports 54321 (API), 54322 (DB), 54323 (Studio). Make sure they're free.

**E2E tests flaky with duplicate names** — Tests generate unique guest names with timestamps to avoid collisions when running across parallel browser projects.
