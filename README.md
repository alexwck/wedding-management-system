# Wedding Management System

A wedding RSVP management system where admins upload Canva-designed invitation templates as landing pages with shareable links. Guests view the landing page and submit RSVPs without authentication. Couples log in to view their RSVP responses and design interactive floor plans. Admins manage all weddings, couples, and templates.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript (strict mode)
- **UI**: shadcn/ui, Tailwind CSS, react-hook-form, zod
- **Canvas**: react-konva + konva (interactive 2D floor plan editor)
- **Database & Auth**: Supabase (PostgreSQL with RLS, Auth, Storage)
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) — install via [Homebrew](https://brew.sh/): `brew install supabase/tap/supabase`
- [Podman](https://podman.io/) — install via Homebrew: `brew install podman` (Supabase CLI uses it under the hood instead of Docker)

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
supabase init   # only needed once
supabase start  # starts all local services via Podman
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable key from the "🔑 Authentication Keys" section>
SUPABASE_SERVICE_ROLE_KEY=<Secret key from the "🔑 Authentication Keys" section>
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

Seed data includes 2 weddings, 6 sample RSVP responses, and a sample floor plan (for wedding 1).

To reset the database to a clean state:

```bash
supabase db reset
```

## Database Schema

To browse the database in VS Code, use [DBCode](https://marketplace.visualstudio.com/items?itemName=diev.dbcode) with the connection string:

```
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `public.users` | App users with roles (admin/couple) | `id` → `auth.users`, `role`, `display_name` |
| `public.weddings` | Wedding records with shareable slugs | `slug`, `user_id`, `couple_name`, `template_image_url`, `wedding_date` |
| `public.rsvps` | Guest RSVP submissions per wedding | `wedding_id`, `guest_name`, `status`, `dietary_notes`, `is_vegetarian`, `needs_baby_chair` |
| `public.floor_plans` | Interactive venue floor plan per wedding | `wedding_id`, `width`, `height`, `items` (JSONB) |

All tables have Row-Level Security (RLS) enabled. Migrations live in `supabase/migrations/`.

## Key URLs

| URL | Description |
|-----|-------------|
| `/auth/login` | Login page |
| `/admin` | Admin dashboard |
| `/admin/weddings` | Manage weddings |
| `/admin/couples` | Create couple accounts |
| `/admin/weddings/[id]/floor-plan` | Admin floor plan editor for a wedding |
| `/dashboard` | Couple dashboard |
| `/dashboard/rsvps` | View RSVP responses |
| `/dashboard/floor-plan` | Couple floor plan editor |
| `/w/{slug}` | Public landing page |
| `/w/{slug}/rsvp` | Public RSVP form |

## Git Hooks

Shared git hooks are stored in `.githooks/` and committed to the repo. After cloning, run once:

```bash
git config core.hooksPath .githooks
```

| Hook | What it does |
|------|--------------|
| `prepare-commit-msg` | Automatically strips `Co-Authored-By` lines from commit messages |

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

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (landing page, RSVP, login)
│   ├── (auth)/             # Protected routes (admin, dashboard)
│   └── actions/            # Server actions (rsvp, upload, admin, floor-plan)
├── components/
│   ├── floor-plan/         # Konva canvas floor plan editor
│   │   ├── items/          # Shape components (round-table, long-table, chair, etc.)
│   │   └── hooks/          # State, auto-save, collision, undo-redo, chair generation
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── floor-plan/         # Constants, collision detection, serializers
│   ├── supabase/           # Supabase clients (browser, server, admin)
│   ├── validations/        # Zod schemas (rsvp, admin, floor-plan)
│   └── utils.ts            # Utilities
├── proxy.ts                 # Auth proxy (renamed from middleware.ts for Next.js 16 compat)
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
- **Auth** — Supabase Auth with `proxy.ts` (not `middleware.ts` — renamed for Next.js 16 compat) protecting `/dashboard/*` and `/admin/*` routes; admin role checked via `app_metadata`
- **Floor plan editor** — Interactive 2D canvas built with react-konva; supports drag-and-drop, rotation, collision detection, auto-chair population around tables, pan/zoom, undo/redo, and auto-save

## Troubleshooting

**Supabase won't start** — Make sure Podman is running (`podman info`). If containers are stuck, try `supabase stop && supabase start`.

**`Failed to fetch` errors in tests** — Supabase isn't running. Run `supabase start` before E2E tests.

**Port conflicts** — Supabase uses ports 54321 (API), 54322 (DB), 54323 (Studio). Make sure they're free.

**E2E tests flaky with duplicate names** — Tests generate unique guest names with timestamps to avoid collisions when running across parallel browser projects.
