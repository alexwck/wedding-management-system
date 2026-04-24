import { describe, it, expect } from "vitest";
import {
  weddingUpdateSchema,
  weddingDateSchema,
  timezoneSchema,
  focalPointSchema,
} from "@/lib/validations/wedding";

describe("weddingUpdateSchema", () => {
  it("accepts empty object (no fields to update)", () => {
    const result = weddingUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts all valid venue fields", () => {
    const result = weddingUpdateSchema.safeParse({
      venue: "The Grand Ballroom",
      venue_address: "123 Main St, Springfield, IL",
      venue_lat: 39.7817,
      venue_lng: -89.6501,
      welcome_message: "Welcome to our wedding!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts venue name only", () => {
    const result = weddingUpdateSchema.safeParse({
      venue: "The Grand Ballroom",
    });
    expect(result.success).toBe(true);
  });

  it("accepts welcome message only", () => {
    const result = weddingUpdateSchema.safeParse({
      welcome_message: "We're so glad you're here!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts coordinates as a valid pair", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: 40.7128,
      venue_lng: -74.006,
    });
    expect(result.success).toBe(true);
  });

  it("rejects lat without lng", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: 40.7128,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lng without lat", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lng: -74.006,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lat out of range (too high)", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: 91,
      venue_lng: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lat out of range (too low)", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: -91,
      venue_lng: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lng out of range (too high)", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: 0,
      venue_lng: 181,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lng out of range (too low)", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: 0,
      venue_lng: -181,
    });
    expect(result.success).toBe(false);
  });

  it("rejects welcome_message over 500 chars", () => {
    const result = weddingUpdateSchema.safeParse({
      welcome_message: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts welcome_message at exactly 500 chars", () => {
    const result = weddingUpdateSchema.safeParse({
      welcome_message: "a".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("rejects venue name over 200 chars", () => {
    const result = weddingUpdateSchema.safeParse({
      venue: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts venue name at exactly 200 chars", () => {
    const result = weddingUpdateSchema.safeParse({
      venue: "a".repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it("rejects venue_address over 500 chars", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_address: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("clearing address with coordinates still present is rejected", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_address: null,
      venue_lat: 40.7128,
      venue_lng: -74.006,
    });
    expect(result.success).toBe(false);
  });

  it("allows explicitly null coordinates", () => {
    const result = weddingUpdateSchema.safeParse({
      venue_lat: null,
      venue_lng: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows boundary lat values (-90, 90)", () => {
    const r1 = weddingUpdateSchema.safeParse({ venue_lat: -90, venue_lng: 0 });
    const r2 = weddingUpdateSchema.safeParse({ venue_lat: 90, venue_lng: 0 });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("allows boundary lng values (-180, 180)", () => {
    const r1 = weddingUpdateSchema.safeParse({ venue_lat: 0, venue_lng: -180 });
    const r2 = weddingUpdateSchema.safeParse({ venue_lat: 0, venue_lng: 180 });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

describe("weddingDateSchema", () => {
  it("accepts valid ISO date string", () => {
    expect(weddingDateSchema.safeParse("2026-06-15T14:00:00Z").success).toBe(true);
  });

  it("accepts null (no date set)", () => {
    expect(weddingDateSchema.safeParse(null).success).toBe(true);
  });

  it("accepts datetime-local format", () => {
    expect(weddingDateSchema.safeParse("2026-12-25T18:30").success).toBe(true);
  });

  it("accepts leap year Feb 29", () => {
    expect(weddingDateSchema.safeParse("2028-02-29T10:00").success).toBe(true);
  });

  it("rejects non-date string", () => {
    expect(weddingDateSchema.safeParse("not-a-date").success).toBe(false);
  });
});

describe("timezoneSchema", () => {
  it("accepts valid IANA timezone", () => {
    expect(timezoneSchema.safeParse("Asia/Kuala_Lumpur").success).toBe(true);
  });

  it("accepts UTC", () => {
    expect(timezoneSchema.safeParse("UTC").success).toBe(true);
  });

  it("accepts America/New_York", () => {
    expect(timezoneSchema.safeParse("America/New_York").success).toBe(true);
  });

  it("rejects invalid timezone", () => {
    expect(timezoneSchema.safeParse("Invalid/Timezone").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(timezoneSchema.safeParse("").success).toBe(false);
  });
});

describe("focalPointSchema", () => {
  it("accepts valid focal point pair", () => {
    expect(focalPointSchema.safeParse({ focalX: 50, focalY: 50 }).success).toBe(true);
  });

  it("accepts both null", () => {
    expect(focalPointSchema.safeParse({ focalX: null, focalY: null }).success).toBe(true);
  });

  it("accepts boundary values (0, 100)", () => {
    expect(focalPointSchema.safeParse({ focalX: 0, focalY: 0 }).success).toBe(true);
    expect(focalPointSchema.safeParse({ focalX: 100, focalY: 100 }).success).toBe(true);
  });

  it("rejects X without Y", () => {
    expect(focalPointSchema.safeParse({ focalX: 50, focalY: null }).success).toBe(false);
  });

  it("rejects Y without X", () => {
    expect(focalPointSchema.safeParse({ focalX: null, focalY: 50 }).success).toBe(false);
  });

  it("rejects X over 100", () => {
    expect(focalPointSchema.safeParse({ focalX: 101, focalY: 50 }).success).toBe(false);
  });

  it("rejects negative X", () => {
    expect(focalPointSchema.safeParse({ focalX: -1, focalY: 50 }).success).toBe(false);
  });
});
