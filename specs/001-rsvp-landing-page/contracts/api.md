# API Contracts: RSVP Landing Page & Form

**Feature Branch**: `001-rsvp-landing-page`
**Date**: 2026-04-14

## Route: Public Landing Page

**URL**: `GET /w/{slug}`
**Auth**: None (public)
**Response**: HTML page (Server Component)

Renders the wedding landing page with Canva template image and CTA button.
If slug not found, returns 404 page.

---

## Route: RSVP Form Page

**URL**: `GET /w/{slug}/rsvp`
**Auth**: None (public)
**Response**: HTML page (Server Component for data, Client Component for form)

Renders the RSVP form. If slug not found, returns 404.
If guest name already submitted, shows already-RSVPed message.

---

## Server Action: Submit RSVP

**Action**: `submitRSVP`
**Auth**: None (public, anonymous Supabase client)
**Input**:

```typescript
{
  slug: string              // Wedding slug from URL
  guestName: string         // Required, min 1 char
  status: "attending" | "declining"
  dietaryNotes?: string     // Optional, max 500 chars
  isVegetarian: boolean     // Default false
  needsBabyChair: boolean   // Default false
}
```

**Success Response**:

```typescript
{
  success: true
  message: "Your RSVP has been submitted. Thank you!"
}
```

**Error Responses**:

```typescript
// Duplicate guest name
{
  success: false
  error: "duplicate_name"
  message: "A guest with this name has already submitted an RSVP."
}

// Validation error
{
  success: false
  error: "validation"
  message: "Please check the form fields and try again."
}

// Wedding not found
{
  success: false
  error: "not_found"
  message: "Wedding not found."
}
```

---

## Server Action: Upload Template Image

**Action**: `uploadTemplateImage`
**Auth**: Admin only
**Input**: FormData with `file` (File object) and `weddingId` (number)

**Constraints**:
- File type: PNG or JPG only
- Max size: 10MB
- Stored in Supabase Storage bucket `wedding-templates`

**Success Response**:

```typescript
{
  success: true
  imageUrl: string   // Public URL of uploaded image
}
```

**Error Responses**:

```typescript
{
  success: false
  error: "file_too_large" | "invalid_type" | "unauthorized"
  message: string
}
```

---

## Server Action: Create Couple Account

**Action**: `createCoupleAccount`
**Auth**: Admin only
**Input**:

```typescript
{
  email: string
  password: string     // Min 8 chars
  displayName: string
  coupleName: string   // e.g. "Alex & Sam"
}
```

**Success Response**:

```typescript
{
  success: true
  userId: string       // New user UUID
  weddingId: number    // Auto-created wedding
  slug: string         // Auto-generated wedding slug
}
```

---

## Server Action: Get Wedding RSVPs

**Action**: `getWeddingRSVPs`
**Auth**: Couple (own wedding only) or Admin (any wedding)
**Input**: `{ weddingId: number }`

**Success Response**:

```typescript
{
  success: true
  wedding: {
    id: number
    coupleName: string
    slug: string
    weddingDate: string | null
    templateImageUrl: string | null
  }
  rsvps: Array<{
    id: number
    guestName: string
    status: "attending" | "declining"
    dietaryNotes: string | null
    isVegetarian: boolean
    needsBabyChair: boolean
    createdAt: string
  }>
  summary: {
    total: number
    attending: number
    declining: number
    vegetarian: number
    babyChairs: number
  }
}
```

---

## Server Action: Update Template Image

**Action**: `updateTemplateImage`
**Auth**: Admin only
**Input**: FormData with `file` (File object) and `weddingId` (number)

Same constraints as upload. Replaces existing image. Existing RSVPs preserved.

**Success Response**:

```typescript
{
  success: true
  imageUrl: string   // New public URL
}
```
