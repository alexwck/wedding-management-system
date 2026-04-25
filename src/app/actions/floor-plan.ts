"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { floorPlanInputSchema } from "@/lib/validations/floor-plan";
import {
  deserializeFloorPlan,
} from "@/lib/floor-plan/serializers";
import { isItemOutOfBounds } from "@/lib/floor-plan/collision";
import { verifyWeddingNotLocked } from "@/lib/auth-guards";
import { cleanupOrphanedAssignments } from "@/app/actions/seat-assignment";
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

  const lockCheck = await verifyWeddingNotLocked(weddingId);
  if (!lockCheck.ok) {
    return { success: false as const, error: lockCheck.error };
  }

  const oobCount = parsed.data.items.filter((item) =>
    isItemOutOfBounds(item, parsed.data.width, parsed.data.height)
  ).length;
  if (oobCount > 0) {
    return { success: false as const, error: `${oobCount} item(s) are outside the canvas bounds` };
  }

  const adminClient = createAdminClient();

  const { data: upserted, error: upsertError } = await adminClient
    .from("floor_plans")
    .upsert(
      {
        wedding_id: weddingId,
        width: parsed.data.width,
        height: parsed.data.height,
        items: parsed.data.items as Record<string, unknown>[],
      },
      { onConflict: "wedding_id" },
    )
    .select("*")
    .single();

  if (upsertError) {
    return { success: false as const, error: "Failed to save floor plan." };
  }

  await cleanupOrphanedAssignments(weddingId);

  return {
    success: true as const,
    floorPlan: deserializeFloorPlan(upserted),
  };
}
