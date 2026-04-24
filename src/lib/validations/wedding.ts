import { z } from "zod";

export const weddingUpdateSchema = z
  .object({
    venue: z.string().max(200).optional(),
    venue_address: z.string().max(500).optional(),
    venue_lat: z
      .number()
      .min(-90)
      .max(90)
      .nullable()
      .optional(),
    venue_lng: z
      .number()
      .min(-180)
      .max(180)
      .nullable()
      .optional(),
    welcome_message: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const hasLat = data.venue_lat !== undefined && data.venue_lat !== null;
      const hasLng = data.venue_lng !== undefined && data.venue_lng !== null;
      if (hasLat && !hasLng) return false;
      if (hasLng && !hasLat) return false;
      return true;
    },
    { message: "Coordinates must be provided as a pair" },
  )
  .refine(
    (data) => {
      if (data.venue_address === "" && data.venue_lat != null) return false;
      return true;
    },
    {
      message:
        "Cannot have coordinates when address is cleared",
    },
  );
