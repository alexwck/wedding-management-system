# Research: RSVP Landing Page & Form

**Feature Branch**: `001-rsvp-landing-page`
**Date**: 2026-04-14
**Status**: Complete

## R1: Authentication & Authorization

**Decision**: Use Supabase Auth with Next.js middleware for session management.

**Rationale**: The constitution mandates preferring platform-native features. Supabase Auth handles email/password login, session tokens, and integrates directly with RLS policies. Next.js middleware checks auth state on protected routes. Admin creates couple accounts via Supabase Admin API (server-side, using service role key). No public signup page needed.

**Implementation approach**:
- `supabase/auth-helpers-nextjs` for client/server auth utilities
- Next.js middleware (`middleware.ts`) protects `/dashboard/*` and `/admin/*` routes
- Admin uses `supabase.auth.admin.createUser()` with service role key
- Couples log in with email/password; guests need no auth
- Role stored in `users` table: `admin` or `couple`

**Alternatives considered**:
- NextAuth.js — more flexible but requires self-hosting user management;
  Supabase Auth provides this out of the box
- Clerk — excellent DX but adds a third-party dependency when Supabase
  already provides auth

## R2: Row-Level Security for Data Isolation

**Decision**: Use PostgreSQL RLS policies with `auth.uid()` for couple isolation
and service role bypass for admin access.

**Rationale**: Database-enforced isolation is the most secure approach. RLS
policies ensure couples can only access their own wedding data even if the
API layer has a bug. Admin operations use the service role key which
bypasses RLS. Always wrap `auth.uid()` in a subquery for performance.

**Implementation approach**:
- `weddings` table has `user_id` referencing `auth.users`
- RLS policy: `USING ((select auth.uid()) = user_id)` for couple access
- Admin routes use Supabase admin client (service role key, server-side only)
- RSVP submissions from guests use an anonymous key with INSERT-only policy
  scoped to the specific wedding

**Alternatives considered**:
- Application-level filtering — insecure if a single API endpoint is missed
- Separate schemas per couple — overkill for this scale

## R3: Image Upload for Canva Templates

**Decision**: Use Supabase Storage for image uploads with a `wedding-templates`
bucket.

**Rationale**: Supabase Storage provides signed URLs, image transformations,
and CDN delivery out of the box. No need for a separate file hosting service.
Uploads go directly from the browser to Supabase Storage via the client SDK,
reducing server load.

**Implementation approach**:
- Supabase Storage bucket: `wedding-templates`
- Admin uploads via Supabase client SDK (authenticated)
- File validation: client-side check for PNG/JPG, max 10MB
- Storage policy: admin can upload; public read for the landing page
- Landing page uses the public URL or signed URL for display
- Next.js `Image` component with `unoptimized` prop for user-uploaded images
  (dimensions unknown at build time)

**Alternatives considered**:
- Uploadh
- Vercel Blob — good option but Supabase Storage is already included

## R4: Duplicate RSVP Prevention

**Decision**: Use a unique constraint on `(wedding_id, LOWER(guest_name))` with
an application-level check before insert.

**Rationale**: A database unique constraint is the most reliable way to prevent
duplicates, even under concurrent submissions. The `LOWER()` function ensures
case-insensitive matching. The application checks first for a friendly error
message; the constraint is the safety net.

**Implementation approach**:
- Unique index: `CREATE UNIQUE INDEX rsvps_wedding_guest_name_uniq ON rsvps (wedding_id, LOWER(guest_name))`
- Server action checks for existing RSVP before insert
- Returns a friendly error message: "A guest with this name has already
  submitted an RSVP"
- The unique constraint catches any race condition the application check misses

**Alternatives considered**:
- Application-only check — vulnerable to race conditions
- UPSERT with `ON CONFLICT DO NOTHING` — silently swallows the duplicate;
  we want to show a message instead

## R5: Form Validation Framework

**Decision**: Use react-hook-form + zod for client-side validation, with
matching server-side validation via zod schemas.

**Rationale**: shadcn/ui's Form component is built on react-hook-form. Zod
provides a single source of truth for validation rules that works on both
client and server. The form pattern from the shadcn/ui skill uses
`zodResolver` to connect them.

**Implementation approach**:
- Shared zod schemas in `lib/validations/` directory
- Client: `useForm` with `zodResolver` and shadcn/ui Form components
- Server: validate input with the same zod schema before database insert
- RSVP form fields: guest name (string, required), status (enum:
  attending/declining), dietary notes (string, max 500, optional),
  vegetarian (boolean), baby chair (boolean)

**Alternatives considered**:
- Plain HTML validation — no custom error messages or complex rules
- Yup — less TypeScript integration than zod

## R6: Public Landing Page Access

**Decision**: Landing pages use a unique slug in the URL (`/w/[slug]`).
RSVP form at `/w/[slug]/rsvp`. No auth required for these routes.

**Rationale**: Simple URL structure that's easy to share. The slug is
generated when the admin creates/uploads the wedding template. It's
unguessable enough for privacy (UUID-based) while being shareable.

**Implementation approach**:
- `weddings` table has a `slug` column (UUIDv4 or nanoid)
- `/w/[slug]` route renders the landing page (Server Component)
- `/w/[slug]/rsvp` route renders the RSVP form (Client Component)
- Server Component fetches wedding data by slug, passes to client
- If slug not found, show a "Wedding not found" page

**Alternatives considered**:
- Numeric IDs in URL — guessable, less private
- Custom subdomain per wedding — requires wildcard DNS setup

## R7: Project Structure (Next.js App Router)

**Decision**: Use Next.js App Router with a clear route structure separating
public pages, authenticated couple dashboard, and admin area.

**Rationale**: App Router is the modern Next.js standard. Route groups
organize code by access level. Server Components by default; Client
Components only for interactive forms.

**Implementation approach**:
```
app/
├── layout.tsx                 # Root layout
├── (public)/
│   ├── w/[slug]/
│   │   ├── page.tsx           # Landing page (Server Component)
│   │   └── rsvp/
│   │       └── page.tsx       # RSVP form (Client Component)
│   └── auth/
│       └── login/
│           └── page.tsx       # Login page
├── (auth)/
│   ├── dashboard/
│   │   ├── layout.tsx         # Dashboard layout with nav
│   │   ├── page.tsx           # Couple dashboard (Server Component)
│   │   └── rsvps/
│   │       └── page.tsx       # RSVP list/detail
│   └── admin/
│       ├── layout.tsx         # Admin layout
│       ├── page.tsx           # Admin dashboard
│       ├── weddings/
│       │   ├── page.tsx       # Wedding list
│       │   └── [id]/
│       │       └── page.tsx   # Manage specific wedding
│       └── couples/
│           └── page.tsx       # Create/manage couple accounts
├── api/
│   └── rsvp/
│       └── route.ts           # RSVP submission endpoint
└── actions/
    ├── rsvp.ts                # RSVP server actions
    ├── upload.ts              # Image upload server action
    └── admin.ts               # Admin server actions
```

**Alternatives considered**:
- Pages Router — legacy, no longer recommended
- Monorepo with separate frontend/backend — overkill for this project size
