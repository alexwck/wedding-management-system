# Server Action Contracts: Dashboard UX Redesign & Bug Fixes

**Branch**: `008-dashboard-ux-fixes` | **Date**: 2026-04-25

## New Server Actions

### updateWeddingDate

```
updateWeddingDate(weddingId: number, weddingDate: string | null)
→ { success: true } | { success: false, message: string }
```

- **Auth**: Admin or couple (owner check)
- **Validation**: `weddingDate` must be parseable ISO datetime string or null
- **DB operation**: `UPDATE weddings SET wedding_date = $1, updated_at = now() WHERE id = $2`
- **Note**: Date is stored as UTC TIMESTAMPTZ; display conversion uses wedding's `timezone` column

### updateWeddingTimezone

```
updateWeddingTimezone(weddingId: number, timezone: string)
→ { success: true } | { success: false, message: string }
```

- **Auth**: Admin only (role check required)
- **Validation**: `timezone` must be a valid IANA timezone string (e.g., "Asia/Kuala_Lumpur")
- **DB operation**: `UPDATE weddings SET timezone = $1, updated_at = now() WHERE id = $2`

### updateTemplateFocalPoint

```
updateTemplateFocalPoint(weddingId: number, focalX: number | null, focalY: number | null)
→ { success: true } | { success: false, message: string }
```

- **Auth**: Admin or couple (owner check)
- **Validation**: focalX/focalY must be 0-100 or both null
- **DB operation**: `UPDATE weddings SET template_focal_x = $1, template_focal_y = $2, updated_at = now() WHERE id = $3`

## Modified Server Actions

### exportToXlsx (fix)

```
exportToXlsx(weddingId: number)
→ { success: true, data: string (base64), filename: string }
  | { success: false, message: string }
```

**Changes**:
- Return buffer as base64 string instead of raw ArrayBuffer
- Sanitize filename: replace `&` with "and", collapse multiple hyphens, trim leading/trailing hyphens
- Client converts base64 back to Blob for download

### getWeddingRSVPs (modify)

```
getWeddingRSVPs(weddingId?: number)
→ { success: true, wedding: WeddingData, rsvps: RSVP[], summary: Summary }
  | { success: false, message: string }
```

**Changes**:
- `WeddingData` now includes `weddingDate`, `timezone` (default "Asia/Kuala_Lumpur"), `templateFocalX`, `templateFocalY` fields

## Removed Server Actions

- `getGoogleAuthUrl()` — DELETED
- `handleGoogleCallback()` — DELETED
- `getGoogleAuthStatus()` — DELETED
- `exportToGoogleSheets()` — DELETED
