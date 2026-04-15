"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { createCoupleSchema } from "@/lib/validations/admin";

export async function getWeddingRSVPs(weddingId: number) {
  const supabase = createAdminClient();

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, wedding_date, template_image_url")
    .eq("id", weddingId)
    .single();

  if (weddingError || !wedding) {
    return {
      success: false,
      error: "not_found" as const,
      message: "Wedding not found.",
    };
  }

  const { data: rsvps, error: rsvpsError } = await supabase
    .from("rsvps")
    .select("id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair, created_at")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  if (rsvpsError) {
    return {
      success: false,
      error: "fetch_failed" as const,
      message: "Failed to fetch RSVPs.",
    };
  }

  const rsvpList = rsvps ?? [];
  const summary = {
    total: rsvpList.length,
    attending: rsvpList.filter((r) => r.status === "attending").length,
    declining: rsvpList.filter((r) => r.status === "declining").length,
    vegetarian: rsvpList.filter((r) => r.is_vegetarian).length,
    babyChairs: rsvpList.filter((r) => r.needs_baby_chair).length,
  };

  return {
    success: true,
    wedding: {
      id: wedding.id,
      coupleName: wedding.couple_name,
      slug: wedding.slug,
      weddingDate: wedding.wedding_date,
      templateImageUrl: wedding.template_image_url,
    },
    rsvps: rsvpList.map((r) => ({
      id: r.id,
      guestName: r.guest_name,
      status: r.status as "attending" | "declining",
      dietaryNotes: r.dietary_notes,
      isVegetarian: r.is_vegetarian,
      needsBabyChair: r.needs_baby_chair,
      createdAt: r.created_at,
    })),
    summary,
  };
}

export async function getAllWeddings() {
  const supabase = createAdminClient();

  const { data: weddings, error } = await supabase
    .from("weddings")
    .select("id, slug, couple_name, template_image_url, wedding_date, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "fetch_failed" as const, message: "Failed to fetch weddings." };
  }

  return { success: true, weddings: weddings ?? [] };
}

async function insertWeddingWithRetry(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  coupleName: string,
  maxRetries = 3,
) {
  let lastError: { code?: string; message?: string; details?: string; hint?: string } | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const slug = nanoid(8);
    const result = await supabase
      .from("weddings")
      .insert({ slug, user_id: userId, couple_name: coupleName })
      .select("id, slug")
      .single();

    if (!result.error) return { data: result.data, error: null };
    lastError = result.error;

    console.warn(
      `[createCoupleAccount/wedding] Attempt ${attempt + 1} failed`,
      { code: result.error.code, message: result.error.message },
    );

    if (attempt >= maxRetries) break;
  }
  return { data: null, error: lastError };
}

export async function createCoupleAccount(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    displayName: formData.get("displayName") as string,
    coupleName: formData.get("coupleName") as string,
  };

  const parsed = createCoupleSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "validation" as const,
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("[createCoupleAccount] Auth user creation failed:", {
      code: authError?.code,
      message: authError?.message,
      status: authError?.status,
    });
    return {
      success: false,
      error: "auth_failed" as const,
      message: authError?.message || "Failed to create user account.",
    };
  }

  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    role: "couple",
    display_name: parsed.data.displayName,
  });

  if (profileError) {
    console.error("[createCoupleAccount] Profile insert failed:", {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
    });
    // Clean up auth user if profile insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      error: "profile_failed" as const,
      message: "Failed to create user profile.",
    };
  }

  const { data: wedding, error: weddingError } = await insertWeddingWithRetry(
    supabase,
    authData.user.id,
    parsed.data.coupleName,
  );

  if (weddingError || !wedding) {
    console.error("[createCoupleAccount] Wedding insert failed after retries:", {
      code: weddingError?.code,
      message: weddingError?.message,
      details: weddingError?.details,
      hint: weddingError?.hint,
      userId: authData.user.id,
    });
    // Full cleanup: remove profile then auth user
    await supabase.from("users").delete().eq("id", authData.user.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      error: "wedding_failed" as const,
      message: weddingError?.message || "Failed to create wedding.",
    };
  }

  // Revalidate couples page to show new couple in the table
  revalidatePath("/admin/couples");

  return {
    success: true,
    userId: authData.user.id,
    weddingId: wedding.id,
    slug: wedding.slug,
  };
}

export async function getMyWeddingRSVPs() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "unauthorized" as const, message: "Not authenticated." };
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, wedding_date, template_image_url")
    .eq("user_id", user.id)
    .single();

  if (weddingError || !wedding) {
    return {
      success: false,
      error: "not_found" as const,
      message: "No wedding found for your account.",
    };
  }

  const adminClient = createAdminClient();

  const { data: rsvps, error: rsvpsError } = await adminClient
    .from("rsvps")
    .select("id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair, created_at")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });

  if (rsvpsError) {
    return {
      success: false,
      error: "fetch_failed" as const,
      message: "Failed to fetch RSVPs.",
    };
  }

  const rsvpList = rsvps ?? [];
  const summary = {
    total: rsvpList.length,
    attending: rsvpList.filter((r) => r.status === "attending").length,
    declining: rsvpList.filter((r) => r.status === "declining").length,
    vegetarian: rsvpList.filter((r) => r.is_vegetarian).length,
    babyChairs: rsvpList.filter((r) => r.needs_baby_chair).length,
  };

  return {
    success: true,
    wedding: {
      id: wedding.id,
      coupleName: wedding.couple_name,
      slug: wedding.slug,
      weddingDate: wedding.wedding_date,
      templateImageUrl: wedding.template_image_url,
    },
    rsvps: rsvpList.map((r) => ({
      id: r.id,
      guestName: r.guest_name,
      status: r.status as "attending" | "declining",
      dietaryNotes: r.dietary_notes,
      isVegetarian: r.is_vegetarian,
      needsBabyChair: r.needs_baby_chair,
      createdAt: r.created_at,
    })),
    summary,
  };
}

export async function getCouples() {
  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, display_name, created_at")
    .eq("role", "couple")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "fetch_failed" as const, message: "Failed to fetch couples." };
  }

  return { success: true, couples: users ?? [] };
}
