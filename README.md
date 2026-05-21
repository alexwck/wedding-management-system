# Wedding Management System

A wedding RSVP management system where admins upload Canva-designed invitation templates as landing pages with shareable links. Guests view the landing page and submit RSVPs without authentication. Couples log in to view their RSVP responses and design interactive floor plans. Admins manage all weddings, couples, and templates.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript (strict mode)
- **UI**: shadcn/ui, Tailwind CSS v4, react-hook-form, zod, motion (animations)
- **Design System**: Nova Glass v2.0.0 — glassmorphism with pastel gradients, custom glass panel/button/input primitives
- **Canvas**: react-konva + konva (interactive 2D floor plan editor)
- **Database & Auth**: Supabase (PostgreSQL with RLS, Auth, Storage)
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) — install via [Homebrew](https://brew.sh/): `brew install supabase/tap/supabase`
- [Vercel CLI](https://vercel.com/docs/cli) — install via [Homebrew](https://brew.sh/): `brew install vercel-cli`
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

Seed data includes 2 weddings (test-wedding-1 has venue data), 6 sample RSVP responses, and 3 test users.

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
| `public.weddings` | Wedding records with shareable slugs | `slug`, `user_id`, `couple_name`, `template_image_url`, `wedding_date`, `timezone`, `template_focal_x`, `template_focal_y`, `venue`, `venue_address`, `venue_lat`, `venue_lng`, `welcome_message` |
| `public.rsvps` | Guest RSVP submissions per wedding | `wedding_id`, `guest_name`, `status`, `dietary_notes`, `is_vegetarian`, `needs_baby_chair` |
| `public.floor_plans` | Interactive venue floor plan per wedding | `wedding_id`, `width`, `height`, `items` (JSONB) |
| `public.seat_assignments` | Guest-to-chair assignments per wedding | `wedding_id`, `rsvp_id`, `chair_item_id`, `table_name`, `seat_label` |

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
| `/w/{slug}` | Public landing page (hero + venue + RSVP in single scrollable page) |

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
npm run test:e2e                              # run all (uses --workers=1 to avoid cookie race conditions)
npx playwright test --project=chromium         # desktop only
npx playwright test --project="Mobile Chrome"  # mobile only
npx playwright test --ui                       # interactive mode
```

The test suite runs against two projects: **Desktop Chrome** and **Mobile Chrome** (Pixel 5 viewport).

**Test isolation**: Floor-plan E2E tests mutate DB state (save items, change dimensions). Run `supabase db reset` before the full E2E suite if prior runs mutated floor-plan data.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (landing page, RSVP, login)
│   ├── (auth)/             # Protected routes (admin, dashboard)
│   └── actions/            # Server actions (rsvp, upload, admin, auth, floor-plan, export)
├── components/
│   ├── floor-plan/         # Konva canvas floor plan editor
│   │   ├── canvas-stats.tsx    # Always-visible table/chair/assignment stats
│   │   ├── guest-panel.tsx     # Collapsible unassigned + assigned guests
│   │   ├── items/          # Shape components (round-table, long-table, chair, etc.)
│   │   └── hooks/          # State, auto-save, collision, undo-redo, seat assignments, chair generation
│   ├── landing-page.tsx    # Wedding landing page (venue info overlay, object-cover crop display)
│   ├── lock-toggle.tsx     # Admin lock/unlock toggle for weddings
│   ├── rsvp-form.tsx       # RSVP form with react-hook-form + zod (isLocked prop shows "RSVP is closed")
│   ├── rsvp-table.tsx      # Sortable RSVP response table
│   ├── rsvp-section.tsx    # Collapsible RSVP section with embedded export
│   ├── template-preview.tsx # Template preview with drag-to-crop repositioning
│   ├── template-upload.tsx # Template image upload with preview button
│   ├── wedding-date-picker.tsx # Wedding date/time picker with timezone
│   ├── timezone-combobox.tsx   # Searchable IANA timezone dropdown (cmdk)
│   ├── venue-editor.tsx    # Admin/couple venue editing (client, Nominatim autocomplete)
│   ├── venue-section.tsx   # Public venue display with OSM map embed + nav buttons (server)
│   ├── editable-couple-name.tsx # Click-to-edit inline couple name component
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── floor-plan/         # Constants, collision detection, serializers
│   ├── geocoding.ts        # Nominatim geocoding client (searchAddress)
│   ├── supabase/           # Supabase clients (browser, server, admin)
│   ├── validations/        # Zod schemas and validation constants (rsvp, admin, floor-plan, upload, wedding)
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
    ├── actions/            # Server action tests
    ├── components/         # React component tests
    ├── hooks/              # React hook tests
    └── helpers/            # Shared mocks (supabase-mock.ts) and factories (factories.ts)
```

## Architecture Notes

- **Server Components by default** — only interactive forms use Client Components
- **RLS (Row-Level Security)** — couples can only access their own wedding data; admin uses service role to bypass
- **RSVP deduplication** — unique constraint on `(wedding_id, LOWER(guest_name))` plus application-level check
- **Auth** — Supabase Auth with `proxy.ts` (not `middleware.ts` — renamed for Next.js 16 compat) protecting `/dashboard/*` and `/admin/*` routes; root `/` redirects based on auth state; cross-role blocking (admins can't reach `/dashboard`, couples can't reach `/admin`); logout via server action
- **Image uploads** — stored in Supabase Storage `wedding-templates` bucket; 5MB max, PNG/JPG only; client + server validation
- **Floor plan editor** — Interactive 2D canvas with react-konva. Supports drag-and-drop, rotation/resize, collision detection, chair generation, pan/zoom, undo/redo, auto-save, and guest-to-chair seat assignments. Compact glass-panel top bar. Mobile uses progressive disclosure: bottom action bar + drawers for guest list and item catalog, plus a touch-friendly item editor sheet.
- **Design system** — Nova Glass v2.0.0 (DESIGN.md): pastel gradient background, 3 glass variants (`.glass-medium`/`.glass-light`/`.glass-dark`), 800ms entrance animations with custom easing. All card-like surfaces use glass variants with `backdrop-filter: blur(16px)`. Dropdown overlays use `bg-background shadow-md` for opaque readability.
- **RSVP management** — Collapsible RSVP section with sortable table, summary cards, and embedded XLSX export (base64 buffer transfer). Google Sheets export removed.
- **Wedding date/timezone** — Native `datetime-local` input for wedding date with searchable IANA timezone selector (cmdk). Stored as TIMESTAMPTZ with UTC conversion. Displayed with `shortOffset` timezone format.
- **Template crop repositioning** — Drag-to-crop on template preview image to choose visible portion. Stored as 0-100 percentages (`template_focal_x`, `template_focal_y`). Landing page uses `object-cover` with CSS `object-position` for display. Reset to NULL on image replace.
- **Venue details** — Weddings have optional venue fields (name, address, lat/lng, welcome message). Address autocomplete uses Nominatim (free, client-side, no API key). Public RSVP page shows an OpenStreetMap iframe embed with Google Maps/Waze navigation buttons. Landing page shows venue info overlay in the gradient area above the RSVP button.

## Production Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for complete production deployment instructions including:
- Supabase project setup and migrations
- Vercel deployment and environment configuration
- Sentry error monitoring setup
- Admin account bootstrap
- Free plan monitoring and backups

## Troubleshooting

**Supabase won't start** — Make sure Podman is running (`podman info`). If containers are stuck, try `supabase stop && supabase start`.

**`Failed to fetch` errors in tests** — Supabase isn't running. Run `supabase start` before E2E tests.

**Port conflicts** — Supabase uses ports 54321 (API), 54322 (DB), 54323 (Studio). Make sure they're free.

**E2E tests flaky with duplicate names** — Tests generate unique guest names with timestamps to avoid collisions when running across parallel browser projects.

**E2E floor-plan test isolation** — Floor-plan E2E tests mutate DB state (save items, change dimensions). Run `supabase db reset` before the full E2E suite if prior runs mutated floor-plan data.

**Mobile floor-plan editing** — The editor is fully functional on mobile via bottom drawers and a touch-optimized item editor. A soft warning banner appears on very small screens (`<640px`) but editing remains possible.

**"Body exceeded 1 MB limit" on upload** — The Next.js server action body size limit is configured to 6MB in `next.config.ts`. If you see this error after changing the upload size limit, make sure `experimental.serverActions.bodySizeLimit` is set higher than your `MAX_FILE_SIZE` validation constant.
