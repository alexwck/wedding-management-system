# Data Model: Venue Details with Embedded Maps

**Feature**: 007-venue-details-maps | **Date**: 2026-04-24

## Entity Changes

### Wedding (existing table — extended)

| Column              | Type              | Nullable | Default | Notes                          |
|---------------------|-------------------|----------|---------|--------------------------------|
| venue               | text              | YES      | NULL    | Display name (e.g., "The Grand Ballroom") |
| venue_address       | text              | YES      | NULL    | Formatted address from geocoding |
| venue_lat           | double precision  | YES      | NULL    | Latitude (-90 to 90)           |
| venue_lng           | double precision  | YES      | NULL    | Longitude (-180 to 180)        |
| welcome_message     | text              | YES      | NULL    | Max 500 characters             |

**Constraints**:
- `venue_lat` and `venue_lng` MUST both be present or both be NULL (coordinate pair integrity)
- `welcome_message` CHECK `(length(welcome_message) <= 500)`
- All venue columns are nullable — wedding can exist without venue info

**Existing columns (unchanged)**:
- id, slug, user_id, couple_name, template_image_url, wedding_date, created_at, updated_at

### Venue Address Search Result (transient — client-side only)

| Field          | Type    | Notes                              |
|----------------|---------|------------------------------------|
| display_name   | string  | Full formatted address from Nominatim |
| lat            | string  | Latitude as decimal string         |
| lon            | string  | Longitude as decimal string        |
| place_id       | number  | Nominatim place identifier         |

Not persisted — only the selected result's data is stored on the Wedding.

## Validation Rules

### Wedding Update (Zod schema)

```
venue: z.string().max(200).optional()
venue_address: z.string().max(500).optional()
venue_lat: z.number().min(-90).max(90).optional()
venue_lng: z.number().min(-180).max(180).optional()
welcome_message: z.string().max(500).optional()
```

- If `venue_lat` is provided, `venue_lng` MUST also be provided (and vice versa)
- Clearing `venue_address` also clears `venue_lat` and `venue_lng` (FR-014)

## Relationships

No new relationships. Venue fields are columns on the existing `weddings` table.
One venue per wedding (1:1, embedded).
