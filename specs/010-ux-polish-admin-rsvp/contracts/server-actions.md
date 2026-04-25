# Server Action Contracts

**Feature**: 010-ux-polish-admin-rsvp | **Date**: 2026-04-25

## New Server Actions

### `toggleWeddingLock`

Toggles the lock status of a wedding. Admin-only. The only mutation permitted on a locked wedding.

```
Input:  { weddingId: string }
Output: { ok: true, isLocked: boolean }
     |  { ok: false, error: string }

Auth:   Admin only (app_metadata.role === "admin")
Lock:   No lock check (this IS the lock toggle)
```

### `updateCoupleName`

Updates the couple/wedding name displayed to guests.

```
Input:  { weddingId: string, coupleName: string }
Output: { ok: true, coupleName: string }
     |  { ok: false, error: string }

Auth:   Admin or couple owner (via verifyWeddingAccess)
Lock:   CHECKED — rejects if wedding is locked
Valid:  coupleName: z.string().min(1).max(100)
```

## Modified Server Actions

### `submitRSVP` (rsvp.ts)

```
BEFORE: Input { slug, guestName, status, dietaryNotes?, isVegetarian, needsBabyChair }
        → Inserts RSVP (public, no auth)

AFTER:  Same input, same flow, BUT after wedding lookup (~line 46):
        if (wedding.is_locked) return { ok: false, error: "RSVP is closed for this wedding" }
```

### `saveFloorPlan` (floor-plan.ts)

```
BEFORE: Input { weddingId, data: { width, height, items[] } }
        → Validates with Zod → upserts floor_plans

AFTER:  Same input, same flow, BUT after access verification (~line 85):
        1. verifyWeddingNotLocked(weddingId) — rejects if locked
        2. OOB validation: for each item, isItemOutOfBounds(item, width, height)
           → if any OOB: return { ok: false, error: "N item(s) are outside the canvas bounds" }
        3. Proceed with upsert
```

### `uploadTemplateImage` (upload.ts)

```
BEFORE: Input FormData { file, weddingId }
        → Validates → uploads to storage → updates weddings.template_image_url

AFTER:  Same input, same flow, BUT:
        1. Lock check before storage upload (~line 33)
        2. Cache-bust: append ?t=${Date.now()} to publicUrl before storing
           → weddings.template_image_url = "${publicUrl}?t=${timestamp}"
```

### `updateWeddingDetails` (admin.ts)

```
BEFORE: Input { weddingId, venue?, venue_address?, venue_lat?, venue_lng?, welcome_message? }
        → Updates weddings row

AFTER:  Same input + lock check after access verification (~line 388)
```

### `updateWeddingDate` (admin.ts)

```
BEFORE: Input { weddingId, weddingDate }
        → Updates weddings.wedding_date

AFTER:  Same input + lock check after access verification (~line 452)
```

### `updateWeddingTimezone` (admin.ts)

```
BEFORE: Input { weddingId, timezone }
        → Updates weddings.timezone

AFTER:  Same input + lock check before update (~line 486)
```

### `updateTemplateFocalPoint` (admin.ts)

```
BEFORE: Input { weddingId, focalX, focalY }
        → Updates weddings.template_focal_x/y

AFTER:  Same input + lock check after access verification (~line 524)
```

## Return Type Convention

All actions follow the project's discriminated union pattern:
```ts
type ActionResult<T> = { ok: true; ...data: T } | { ok: false; error: string };
```
