"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { floorPlanInputSchema } from "@/lib/validations/floor-plan";
import {
  deserializeFloorPlan,
  serializeItems,
} from "@/lib/floor-plan/serializers";
import type { FloorPlanItem } from "@/types/floor-plan";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

async function verifyWeddingAccess(
  weddingId: number,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function getFloorPlan(weddingId: number) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const isAdmin = user.app_metadata?.role === "admin";
  if (!isAdmin) {
    const hasAccess = await verifyWeddingAccess(weddingId, user.id);
    if (!hasAccess) {
      return { success: false as const, error: "Access denied." };
    }
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("floor_plans")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (error) {
    return { success: false as const, error: "Failed to fetch floor plan." };
  }

  if (!data) {
    return { success: true as const, floorPlan: null };
  }

  return {
    success: true as const,
    floorPlan: deserializeFloorPlan(data),
  };
}

export async function saveFloorPlan(
  weddingId: number,
  data: { width: number; height: number; items: FloorPlanItem[] },
) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const isAdmin = user.app_metadata?.role === "admin";
  if (!isAdmin) {
    const hasAccess = await verifyWeddingAccess(weddingId, user.id);
    if (!hasAccess) {
      return { success: false as const, error: "Access denied." };
    }
  }

  const parsed = floorPlanInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("floor_plans")
    .select("id")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (existing) {
    const { data: updated, error: updateError } = await adminClient
      .from("floor_plans")
      .update({
        width: parsed.data.width,
        height: parsed.data.height,
        items: serializeItems(parsed.data.items),
      })
      .eq("wedding_id", weddingId)
      .select("*")
      .single();

    if (updateError) {
      return { success: false as const, error: "Failed to update floor plan." };
    }

    return {
      success: true as const,
      floorPlan: deserializeFloorPlan(updated),
    };
  }

  const { data: inserted, error: insertError } = await adminClient
    .from("floor_plans")
    .insert({
      wedding_id: weddingId,
      width: parsed.data.width,
      height: parsed.data.height,
      items: serializeItems(parsed.data.items),
    })
    .select("*")
    .single();

  if (insertError) {
    return { success: false as const, error: "Failed to create floor plan." };
  }

  return {
    success: true as const,
    floorPlan: deserializeFloorPlan(inserted),
  };
}
