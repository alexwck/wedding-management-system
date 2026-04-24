import { z } from "zod";

export const weddingDateSchema = z
  .string()
  .nullable()
  .refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date format");

export const timezoneSchema = z.string().refine((val) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: val });
    return true;
  } catch {
    return false;
  }
}, "Invalid IANA timezone");

export const focalPointSchema = z
  .object({
    focalX: z.number().min(0).max(100).nullable(),
    focalY: z.number().min(0).max(100).nullable(),
  })
  .refine(
    (data) => {
      const hasX = data.focalX !== null && data.focalX !== undefined;
      const hasY = data.focalY !== null && data.focalY !== undefined;
      if (hasX !== hasY) return false;
      return true;
    },
    { message: "Focal point coordinates must be both present or both null" },
  );

export const weddingUpdateSchema = z
  .object({
    venue: z.string().max(200).nullable().optional(),
    venue_address: z.string().max(500).nullable().optional(),
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
    welcome_message: z.string().max(500).nullable().optional(),
    timezone: z.string().optional(),
    templateFocalX: z.number().min(0).max(100).nullable().optional(),
    templateFocalY: z.number().min(0).max(100).nullable().optional(),
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
      if (data.venue_address === null && data.venue_lat != null) return false;
      return true;
    },
    {
      message: "Cannot have coordinates when address is cleared",
    },
  )
  .refine(
    (data) => {
      const hasX = data.templateFocalX !== undefined && data.templateFocalX !== null;
      const hasY = data.templateFocalY !== undefined && data.templateFocalY !== null;
      if (hasX !== hasY) return false;
      return true;
    },
    { message: "Focal point coordinates must be both present or both null" },
  );
