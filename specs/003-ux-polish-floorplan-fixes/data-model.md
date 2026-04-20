# Data Model: UX Polish & Floor Plan Fixes

**Date**: 2026-04-20

## Entity Changes

### Chair Item (Floor Plan)

| Field | Before | After | Notes |
|-------|--------|-------|-------|
| width | 2 (ft) | 1 (ft) | Fixed, not configurable |
| height | 2 (ft) | 1 (ft) | Fixed, not configurable |
| renderShape | Rect | Circle | Center-anchored at (x+0.5, y+0.5) |
| radius | N/A | 0.5 ft (10px) | Half of 1ft diameter |

**Validation**: `DEFAULT_CHAIR_SIZE = { width: 1, height: 1 }` in constants.ts
**Storage**: Existing floor plan data cleared (FR-016)

### Long Table Max Chair Count

| Table Size | defaultChairs | maxChairs (before) | maxChairs (after) |
|------------|---------------|--------------------|-------------------|
| 6 ft | 7 | 8 | 7 |
| 7 ft | 9 | 10 | 9 |

**Note**: The `LONG_TABLE_LENGTHS` constants remain unchanged. The `+1` is removed from `getMaxChairCount()` in use-chair-generation.ts for long_table type only.

### Upload Constraints

| Constraint | Before | After |
|------------|--------|-------|
| maxFileSize | 10 MB | 5 MB |
| allowedTypes | image/png, image/jpeg, image/jpg | image/png, image/jpeg |

**Note**: "image/jpg" is not a standard MIME type — remove it, keep only "image/jpeg" and "image/png". The `.jpg` and `.jpeg` extensions both map to "image/jpeg".

## No New Entities

This feature modifies existing entities only. No new database tables, columns, or relationships required.

## State Transitions

### User Session (Logout)

```
Authenticated → [signOut action] → Session Cleared → Redirect to /auth/login
```

### Root Page Routing

```
"/" + unauthenticated → redirect("/auth/login")
"/" + couple user     → redirect("/dashboard")
"/" + admin user      → redirect("/admin")
```

### Cross-Role Access Control

```
/dashboard/* + admin user   → redirect("/admin")
/admin/*     + couple user  → redirect("/dashboard")
```
