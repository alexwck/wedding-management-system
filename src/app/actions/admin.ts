"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { createCoupleSchema, coupleNameSchema } from "@/lib/validations/admin";
import { weddingUpdateSchema, weddingDateSchema, timezoneSchema, focalPointSchema } from "@/lib/validations/wedding";
import type { User } from "@supabase/supabase-js";
import type { FloorPlanItem } from "@/types/floor-plan";
import { resolveSeatLabels } from "@/lib/seat-resolution";
import { verifyWeddingNotLocked } from "@/lib/auth-guards";

async function enrichRsvpsWithSeats(
  supabase: ReturnType<typeof createAdminClient>,
  weddingId: number,
  rsvpList: Array<{
    id: number;
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
    created_at: string;
  }>,
) {
  const [assignmentsResult, floorPlanResult] = await Promise.all([
    supabase
      .from("seat_assignments")
      .select("rsvp_id, chair_item_id, table_item_id")
      .eq("wedding_id", weddingId),
    supabase
      .from("floor_plans")
      .select("items")
      .eq("wedding_id", weddingId)
      .maybeSingle(),
  ]);

  const assignmentMap = new Map(
    (assignmentsResult.data ?? []).map((a) => [a.rsvp_id, { chairItemId: a.chair_item_id, tableItemId: a.table_item_id }]),
  );

  const items = (floorPlanResult.data?.items ?? []) as FloorPlanItem[];

  return rsvpList.map((r) => {
    const assignment = assignmentMap.get(r.id);
    const { tableName, seatLabel } = assignment
      ? resolveSeatLabels(items, assignment.chairItemId, assignment.tableItemId)
      : { tableName: null as string | null, seatLabel: null as string | null };

    return {
      id: r.id,
      guestName: r.guest_name,
      status: r.status as "attending" | "declining",
      dietaryNotes: r.dietary_notes,
      isVegetarian: r.is_vegetarian,
      needsBabyChair: r.needs_baby_chair,
      createdAt: r.created_at,
      tableName,
      seatLabel,
    };
  });
}

export async function getWeddingRSVPs(weddingId: number) {
  const supabase = createAdminClient();

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, wedding_date, template_image_url, venue, venue_address, venue_lat, venue_lng, welcome_message, timezone, template_focal_x, template_focal_y, is_locked")
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
      venue: wedding.venue,
      venueAddress: wedding.venue_address,
      venueLat: wedding.venue_lat,
      venueLng: wedding.venue_lng,
      welcomeMessage: wedding.welcome_message,
      timezone: wedding.timezone,
      templateFocalX: wedding.template_focal_x,
      templateFocalY: wedding.template_focal_y,
      isLocked: wedding.is_locked,
    },
    rsvps: await enrichRsvpsWithSeats(supabase, weddingId, rsvpList),
    summary,
  };
}

export async function getAllWeddings() {
  const supabase = createAdminClient();

  const { data: weddings, error } = await supabase
    .from("weddings")
    .select("id, slug, couple_name, template_image_url, wedding_date, created_at, is_locked, rsvps(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "fetch_failed" as const, message: "Failed to fetch weddings." };
  }

  const mapped = (weddings ?? []).map((w) => ({
    id: w.id,
    slug: w.slug,
    couple_name: w.couple_name,
    template_image_url: w.template_image_url,
    wedding_date: w.wedding_date,
    created_at: w.created_at,
    is_locked: w.is_locked,
    rsvpCount: Array.isArray(w.rsvps) ? w.rsvps.length : (w.rsvps as unknown as { count: number })?.count ?? 0,
  }));

  return { success: true, weddings: mapped };
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
    coupleName: (formData.get("coupleName") as string) || (formData.get("displayName") as string),
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
    .select("id, couple_name, slug, wedding_date, template_image_url, venue, venue_address, venue_lat, venue_lng, welcome_message, timezone, template_focal_x, template_focal_y, is_locked")
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
      venue: wedding.venue,
      venueAddress: wedding.venue_address,
      venueLat: wedding.venue_lat,
      venueLng: wedding.venue_lng,
      welcomeMessage: wedding.welcome_message,
      timezone: wedding.timezone,
      templateFocalX: wedding.template_focal_x,
      templateFocalY: wedding.template_focal_y,
      isLocked: wedding.is_locked,
    },
    rsvps: await enrichRsvpsWithSeats(adminClient, wedding.id, rsvpList),
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

  const userIds = (users ?? []).map((u) => u.id);
  const { data: weddings } = await supabase
    .from("weddings")
    .select("user_id, id, couple_name, is_locked")
    .in("user_id", userIds);

  const weddingMap = new Map((weddings ?? []).map((w) => [w.user_id, w]));

  const couples = (users ?? []).map((u) => {
    const wedding = weddingMap.get(u.id);
    return {
      ...u,
      weddingId: wedding?.id ?? null,
      coupleName: wedding?.couple_name ?? null,
      isLocked: wedding?.is_locked ?? false,
    };
  });

  return { success: true, couples };
}

function revalidateWeddingPaths(weddingId: number, slug: string) {
  revalidatePath(`/admin/weddings/${weddingId}`);
  revalidatePath(`/w/${slug}`);
  revalidatePath("/dashboard");
}

async function verifyWeddingAccess(
  user: User,
  weddingId: number,
  adminClient: ReturnType<typeof createAdminClient>,
): Promise<{ success: false; error: string } | { success: true; isLocked: boolean }> {
  if (user.app_metadata?.role === "admin") {
    const { data: wedding } = await adminClient
      .from("weddings")
      .select("is_locked")
      .eq("id", weddingId)
      .single();
    if (!wedding) return { success: false, error: "Wedding not found." };
    return { success: true, isLocked: wedding.is_locked };
  }
  const { data: wedding } = await adminClient
    .from("weddings")
    .select("user_id, is_locked")
    .eq("id", weddingId)
    .single();
  if (!wedding || wedding.user_id !== user.id) {
    return { success: false, error: "Not authorized." };
  }
  return { success: true, isLocked: wedding.is_locked };
}

export async function updateWeddingDetails(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "unauthorized" as const, message: "Not authenticated." };
  }

  const weddingId = Number(formData.get("weddingId"));
  if (!weddingId) {
    return { success: false, error: "validation" as const, message: "Wedding ID required." };
  }

  const adminClient = createAdminClient();
  const authCheck = await verifyWeddingAccess(user, weddingId, adminClient);
  if (!authCheck.success) return { success: false, error: "unauthorized" as const, message: authCheck.error };
  if (authCheck.isLocked) return { success: false, error: "locked" as const, message: "This wedding has been locked. No edits are permitted." };

  const rawData: Record<string, unknown> = {};
  const fields = ["venue", "venue_address", "venue_lat", "venue_lng", "welcome_message"] as const;

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) {
      if (field === "venue_lat" || field === "venue_lng") {
        rawData[field] = value === "" ? null : Number(value);
      } else {
        rawData[field] = value === "" ? null : value;
      }
    }
  }

  const parsed = weddingUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "validation" as const,
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { data, error } = await adminClient
    .from("weddings")
    .update(parsed.data)
    .eq("id", weddingId)
    .select("slug")
    .single();

  if (error) {
    return {
      success: false,
      error: "update_failed" as const,
      message: "Failed to update wedding details.",
    };
  }

  revalidateWeddingPaths(weddingId, data.slug);

  return { success: true, wedding: data };
}

export async function updateWeddingDate(weddingId: number, weddingDate: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const parsed = weddingDateSchema.safeParse(weddingDate);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid date format." };
  }

  const adminClient = createAdminClient();
  const authCheck = await verifyWeddingAccess(user, weddingId, adminClient);
  if (!authCheck.success) return { success: false as const, error: authCheck.error };
  if (authCheck.isLocked) return { success: false as const, error: "This wedding has been locked. No edits are permitted." };

  const { data, error } = await adminClient
    .from("weddings")
    .update({ wedding_date: weddingDate ? new Date(weddingDate).toISOString() : null })
    .eq("id", weddingId)
    .select("slug")
    .single();

  if (error || !data) {
    return { success: false as const, error: "Failed to update wedding date." };
  }

  revalidateWeddingPaths(weddingId, data.slug);

  return { success: true as const };
}

export async function updateWeddingTimezone(weddingId: number, timezone: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { success: false as const, error: "Admin access required." };
  }

  const parsed = timezoneSchema.safeParse(timezone);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid timezone." };
  }

  const adminClient = createAdminClient();

  const lockCheck = await verifyWeddingNotLocked(weddingId);
  if (!lockCheck.ok) return { success: false as const, error: lockCheck.error };

  const { data, error } = await adminClient
    .from("weddings")
    .update({ timezone })
    .eq("id", weddingId)
    .select("slug")
    .single();

  if (error || !data) {
    return { success: false as const, error: "Failed to update timezone." };
  }

  revalidateWeddingPaths(weddingId, data.slug);

  return { success: true as const };
}

export async function updateTemplateFocalPoint(weddingId: number, focalX: number | null, focalY: number | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const parsed = focalPointSchema.safeParse({ focalX, focalY });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const adminClient = createAdminClient();
  const authCheck = await verifyWeddingAccess(user, weddingId, adminClient);
  if (!authCheck.success) return { success: false as const, error: authCheck.error };
  if (authCheck.isLocked) return { success: false as const, error: "This wedding has been locked. No edits are permitted." };

  const { data, error } = await adminClient
    .from("weddings")
    .update({ template_focal_x: focalX, template_focal_y: focalY })
    .eq("id", weddingId)
    .select("slug")
    .single();

  if (error || !data) {
    return { success: false as const, error: "Failed to update focal point." };
  }

  revalidatePath(`/admin/weddings/${weddingId}`);
  revalidatePath(`/w/${data.slug}`);

  return { success: true as const };
}

export async function toggleWeddingLock(weddingId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { success: false as const, error: "Admin access required." };
  }

  const adminClient = createAdminClient();

  const { data: wedding, error: fetchError } = await adminClient
    .from("weddings")
    .select("is_locked, slug")
    .eq("id", weddingId)
    .single();

  if (fetchError || !wedding) {
    return { success: false as const, error: "Wedding not found." };
  }

  const newLockState = !wedding.is_locked;

  const { data, error: updateError } = await adminClient
    .from("weddings")
    .update({ is_locked: newLockState })
    .eq("id", weddingId)
    .select("slug, is_locked")
    .single();

  if (updateError || !data) {
    return { success: false as const, error: "Failed to toggle lock." };
  }

  revalidatePath(`/admin/weddings/${weddingId}`);
  revalidatePath(`/w/${data.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/floor-plan");

  return { success: true as const, isLocked: data.is_locked };
}

export async function updateCoupleName(weddingId: number, coupleName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const parsed = coupleNameSchema.safeParse(coupleName);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const adminClient = createAdminClient();
  const authCheck = await verifyWeddingAccess(user, weddingId, adminClient);
  if (!authCheck.success) return { success: false, error: "unauthorized" as const, message: authCheck.error };
  if (authCheck.isLocked) return { success: false as const, error: "This wedding has been locked. No edits are permitted." };

  const { data, error } = await adminClient
    .from("weddings")
    .update({ couple_name: parsed.data })
    .eq("id", weddingId)
    .select("slug, couple_name")
    .single();

  if (error || !data) {
    return { success: false as const, error: "Failed to update couple name." };
  }

  revalidateWeddingPaths(weddingId, data.slug);

  return { success: true as const, coupleName: data.couple_name };
}
