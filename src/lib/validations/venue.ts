import { z } from "zod";

export const venueFormSchema = z.object({
  venue: z.string().max(200, "Venue name is too long").optional(),
  venue_address: z.string().max(500).optional(),
  venue_lat: z.number().min(-90).max(90).nullable().optional(),
  venue_lng: z.number().min(-180).max(180).nullable().optional(),
  welcome_message: z.string().max(500).optional(),
}).refine(
  (data) => {
    // venue_lat and venue_lng must both be present or both null
    const lat = data.venue_lat;
    const lng = data.venue_lng;
    return (lat === null || lat === undefined) === (lng === null || lng === undefined);
  },
  {
    message: "Latitude and longitude must both be set or both be empty",
    path: ["venue_address"],
  }
);

export type VenueFormData = z.infer<typeof venueFormSchema>;
