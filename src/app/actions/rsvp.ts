"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpSchema } from "@/lib/validations/rsvp";

export async function submitRSVP(data: {
  slug: string;
  guestName: string;
  status: "attending" | "declining";
  dietaryNotes?: string;
  isVegetarian: boolean;
  needsBabyChair: boolean;
}) {
  const parsed = rsvpSchema.safeParse({
    guestName: data.guestName,
    status: data.status,
    dietaryNotes: data.dietaryNotes,
    isVegetarian: data.isVegetarian,
    needsBabyChair: data.needsBabyChair,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "validation" as const,
      message: "Please check the form fields and try again.",
    };
  }

  const supabase = createAdminClient();

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (weddingError || !wedding) {
    return {
      success: false,
      error: "not_found" as const,
      message: "Wedding not found.",
    };
  }

  const { data: existing } = await supabase
    .from("rsvps")
    .select("id")
    .eq("wedding_id", wedding.id)
    .ilike("guest_name", data.guestName)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "duplicate_name" as const,
      message: "A guest with this name has already submitted an RSVP.",
    };
  }

  const { error: insertError } = await supabase.from("rsvps").insert({
    wedding_id: wedding.id,
    guest_name: parsed.data.guestName,
    status: parsed.data.status,
    dietary_notes: parsed.data.dietaryNotes ?? null,
    is_vegetarian: parsed.data.isVegetarian,
    needs_baby_chair: parsed.data.needsBabyChair,
  });

  if (insertError) {
    // Check for unique constraint violation (race condition safety net)
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "duplicate_name" as const,
        message: "A guest with this name has already submitted an RSVP.",
      };
    }
    return {
      success: false,
      error: "insert_failed" as const,
      message: "Failed to submit RSVP. Please try again.",
    };
  }

  return {
    success: true,
    message: "Your RSVP has been submitted. Thank you!",
  };
}
