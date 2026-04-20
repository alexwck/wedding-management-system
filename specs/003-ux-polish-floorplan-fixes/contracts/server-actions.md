# Server Action Contracts: UX Polish & Floor Plan Fixes

**Date**: 2026-04-20

## signOut Action (New)

**File**: `src/app/actions/auth.ts`

```
Input:  (none)
Output: { success: boolean, error?: string }

Behavior:
  1. Read Supabase session from cookies
  2. Call supabase.auth.signOut()
  3. Return { success: true }

Error cases:
  - Session not found → { success: true } (idempotent logout)
  - signOut fails → { success: false, error: "Failed to sign out" }
```

## uploadTemplateImage Action (Modified)

**File**: `src/app/actions/upload.ts`

```
Input:  FormData { file: File, weddingId: string }
Output: { success: boolean, error?: "validation" | "invalid_type" | "file_too_large" | "upload_failed" | "update_failed", message: string }

Changed constraints:
  MAX_FILE_SIZE: 10MB → 5MB
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"] → ["image/png", "image/jpeg"]

Error messages:
  - file_too_large → "File size must be under 5MB."
  - invalid_type → "Only PNG and JPG images are allowed."
```

## resetFloorPlans Action (New)

**File**: `src/app/actions/floor-plan.ts`

```
Input:  (none)
Output: { success: boolean, error?: string }

Behavior:
  1. Delete all rows from floor_plans table using adminClient
  2. Return { success: true }

Note: One-time migration action. Can be a standalone script or server action.
```
