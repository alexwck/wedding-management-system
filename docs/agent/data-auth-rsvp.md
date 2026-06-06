# Data, Auth, RSVP, And Venue Rules

## Supabase Clients

| Client | File | Use |
|---|---|---|
| Browser client | `src/lib/supabase/client.ts` | Client components only. |
| Server client | `src/lib/supabase/server.ts` | Server components and request-scoped auth. |
| Admin client | `src/lib/supabase/admin.ts` | Service-role operations that must bypass RLS. Server only. |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or prefix it with `NEXT_PUBLIC_`.

## Auth And Roles

- Root redirect logic lives in `src/app/page.tsx`.
- Auth enforcement lives in `src/proxy.ts`; this file is intentionally not named
  `middleware.ts` for Next.js 16 compatibility.
- Admin role checks use `user.app_metadata?.role`.
- Creating an admin user in the Supabase dashboard is not enough; set
  `raw_app_meta_data.role` to `"admin"` for the user.
- `LogoutButton` calls `signOut()` in `src/app/actions/auth.ts`; the action is idempotent.

## Server Actions

Server actions live in `src/app/actions`. Preserve these patterns:

- Validate incoming data with Zod schemas in `src/lib/validations`.
- Use atomic upserts where the existing action does so; do not reintroduce read-then-write
  races.
- Convert empty text fields to `null` server-side when the schema allows clearing.
- Send all clearable text fields in `FormData`; conditional omission prevents clearing.

## Wedding Lock

`weddings.is_locked` is enforced server-side. Every mutation action must call the lock
guard before changing wedding-owned state unless the action is `toggleWeddingLock`.

When locked:

- Floor-plan editing is view-only.
- Admin and couple edit forms are disabled.
- Guest assignments cannot change.
- RSVP form displays the closed state.

## RSVP

- RSVP deduplication is enforced by a unique constraint on `(wedding_id, lower(guest_name))`
  and by application-level checks.
- Public wedding pages are single-page routes at `/w/[slug]`: hero, venue, then RSVP.
- The RSVP CTA smooth-scrolls to the `#rsvp` anchor.
- After a successful RSVP, a token cookie can show the server-rendered confirmation card
  on later visits.

## Venue And Geocoding

- Venue coordinate integrity requires `venue_lat` and `venue_lng` to be both present or
  both null. This is enforced by both database checks and Zod refinements.
- Clearing `venue_address` while coordinates remain set is invalid.
- `src/lib/geocoding.ts` returns a discriminated union, not a flat array:
  success includes results; failures distinguish API error, no results, and timeout.
- The venue editor address field uses custom `onChange` handling for debounced search.
- Autocomplete suggestions use an opaque readable background; transparent glass makes text
  unreadable over page content.

## Uploads And Templates

- Template image uploads are validated before storage writes.
- `next.config.ts` raises `serverActions.bodySizeLimit` so the app-level upload validator
  can reject oversize files cleanly.
- `uploadTemplateImage` appends a cache-busting timestamp to the public URL.
- `TemplatePreview` uses the uploaded URL after upload and exposes crop adjustment through
  the `Adjust Crop` button.

## Common Next.js Gotcha

Do not put `"use client"` in modules that only export constants or objects imported by
server components. Next.js client reference proxying can strip methods from exported arrays
or objects; move constants to a server-safe module instead.
