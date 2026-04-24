import { describe, it, expect } from "vitest";
import { weddingUpdateSchema } from "@/lib/validations/wedding";

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
