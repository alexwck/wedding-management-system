"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthAndVerifyAccess, verifyWeddingNotLocked } from "@/lib/auth-guards";
import { rsvpSchema } from "@/lib/validations/rsvp";

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[+\/=]/g, "").slice(0, 64);
}

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

  const lockCheck = await verifyWeddingNotLocked(wedding.id);
  if (!lockCheck.ok) {
    return { success: false, error: "locked" as const, message: lockCheck.error };
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

  const { data: insertedRsvp, error: insertError } = await supabase
    .from("rsvps")
    .insert({
      wedding_id: wedding.id,
      guest_name: parsed.data.guestName,
      status: parsed.data.status,
      dietary_notes: parsed.data.dietaryNotes ?? null,
      is_vegetarian: parsed.data.isVegetarian,
      needs_baby_chair: parsed.data.needsBabyChair,
    })
    .select("id")
    .single();

  if (insertError || !insertedRsvp) {
    if (insertError?.code === "23505") {
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

  // Generate token for returning guest edit flow
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: tokenError } = await supabase.from("rsvp_tokens").insert({
    token,
    rsvp_id: insertedRsvp.id,
    wedding_id: wedding.id,
    expires_at: expiresAt,
  });

  if (!tokenError) {
    try {
      const cookieStore = await cookies();
      cookieStore.set(`rsvp_token_${wedding.id}`, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(expiresAt),
        path: "/",
      });
    } catch (e) {
      console.error("Failed to set RSVP token cookie:", e);
    }
  }

  return {
    success: true,
    message: "Your RSVP has been submitted. Thank you!",
  };
}

export async function getRsvpByToken(weddingId: number, token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rsvp_tokens")
    .select("rsvp_id, expires_at, rsvps(id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair)")
    .eq("token", token)
    .eq("wedding_id", weddingId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error) {
    throw new Error(`getRsvpByToken query error: ${error.message}`);
  }

  if (!data) {
    throw new Error("getRsvpByToken: no token row found");
  }

  const rsvps = data.rsvps as unknown as Array<{
    id: number;
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
  }>;

  if (!rsvps || rsvps.length === 0) {
    throw new Error("getRsvpByToken: no RSVP found for token");
  }

  return rsvps[0];
}

export async function updateRsvpStatus(input: {
  weddingId: number;
  rsvpId: number;
  status: "attending" | "declining";
}) {
  const auth = await getAuthAndVerifyAccess(input.weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }
  if (auth.isLocked) {
    return { success: false as const, error: "This wedding has been locked. No edits are permitted." };
  }

  const adminClient = createAdminClient();

  const { data: rsvp, error: updateError } = await adminClient
    .from("rsvps")
    .update({ status: input.status })
    .eq("id", input.rsvpId)
    .eq("wedding_id", input.weddingId)
    .select("id, status")
    .single();

  if (updateError || !rsvp) {
    return { success: false as const, error: "Failed to update RSVP." };
  }

  if (input.status === "declining") {
    await adminClient
      .from("seat_assignments")
      .delete()
      .eq("rsvp_id", input.rsvpId);
  }

  return { success: true as const, rsvp };
}
