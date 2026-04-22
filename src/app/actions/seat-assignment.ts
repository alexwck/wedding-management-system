"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  assignSeatSchema,
  unassignSeatSchema,
  getSeatAssignmentsSchema,
  getUnassignedGuestsSchema,
  cleanupOrphanedAssignmentsSchema,
} from "@/lib/validations/seat-assignment";
import type { SeatAssignment } from "@/types/seat-assignment";

async function getAuthAndVerifyAccess(weddingId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: "Not authenticated." } as const;
  }

  const isAdmin = user.app_metadata?.role === "admin";
  if (!isAdmin) {
    const { data } = await supabase
      .from("weddings")
      .select("id")
      .eq("id", weddingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      return { user: null, error: "Access denied." } as const;
    }
  }

  return { user, error: null } as const;
}

export async function assignSeat(input: {
  weddingId: number;
  rsvpId: number;
  chairItemId: string;
  tableItemId: string;
}) {
  const parsed = assignSeatSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(parsed.data.weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const adminClient = createAdminClient();
  const { weddingId, rsvpId, chairItemId, tableItemId } = parsed.data;

  // Check RSVP exists, belongs to wedding, is attending
  const { data: rsvp } = await adminClient
    .from("rsvps")
    .select("id, wedding_id, status")
    .eq("id", rsvpId)
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (!rsvp) {
    return { success: false as const, error: "RSVP not found." };
  }
  if (rsvp.status !== "attending") {
    return { success: false as const, error: "Only attending guests can be assigned." };
  }

  // Check RSVP not already assigned
  const { data: existingAssignment } = await adminClient
    .from("seat_assignments")
    .select("id")
    .eq("rsvp_id", rsvpId)
    .maybeSingle();

  if (existingAssignment) {
    return { success: false as const, error: "This guest is already assigned to a seat." };
  }

  // Check chair not already occupied
  const { data: chairAssignment } = await adminClient
    .from("seat_assignments")
    .select("id")
    .eq("wedding_id", weddingId)
    .eq("chair_item_id", chairItemId)
    .maybeSingle();

  if (chairAssignment) {
    return { success: false as const, error: "This seat is already occupied." };
  }

  // Verify chair/table exist in floor plan items
  const { data: floorPlan } = await adminClient
    .from("floor_plans")
    .select("items")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (!floorPlan) {
    return { success: false as const, error: "Floor plan not found." };
  }

  const items = floorPlan.items as Array<{ id: string; type: string; parentItemId: string | null }>;
  const chairItem = items.find((i) => i.id === chairItemId);
  if (!chairItem) {
    return { success: false as const, error: "Chair not found in floor plan." };
  }
  if (chairItem.parentItemId !== tableItemId) {
    const tableItem = items.find((i) => i.id === tableItemId);
    if (!tableItem) {
      return { success: false as const, error: "Table not found in floor plan." };
    }
  }

  // Insert assignment
  const { data: assignment, error: insertError } = await adminClient
    .from("seat_assignments")
    .insert({
      wedding_id: weddingId,
      rsvp_id: rsvpId,
      chair_item_id: chairItemId,
      table_item_id: tableItemId,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false as const, error: "Seat is already occupied." };
    }
    return { success: false as const, error: "Failed to assign seat." };
  }

  return {
    success: true as const,
    assignment: {
      id: assignment.id,
      weddingId: assignment.wedding_id,
      rsvpId: assignment.rsvp_id,
      chairItemId: assignment.chair_item_id,
      tableItemId: assignment.table_item_id,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    } satisfies SeatAssignment,
  };
}

export async function unassignSeat(input: {
  weddingId: number;
  chairItemId: string;
}) {
  const parsed = unassignSeatSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(parsed.data.weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("seat_assignments")
    .delete()
    .eq("wedding_id", parsed.data.weddingId)
    .eq("chair_item_id", parsed.data.chairItemId);

  if (error) {
    return { success: false as const, error: "Failed to unassign seat." };
  }

  return { success: true as const };
}

export async function getSeatAssignments(weddingId: number) {
  const parsed = getSeatAssignmentsSchema.safeParse({ weddingId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const adminClient = createAdminClient();

  const { data: assignments, error } = await adminClient
    .from("seat_assignments")
    .select("*, rsvps(guest_name)")
    .eq("wedding_id", weddingId);

  if (error) {
    return { success: false as const, error: "Failed to fetch assignments." };
  }

  return {
    success: true as const,
    assignments: assignments.map((a) => ({
      id: a.id,
      weddingId: a.wedding_id,
      rsvpId: a.rsvp_id,
      chairItemId: a.chair_item_id,
      tableItemId: a.table_item_id,
      guestName: (a.rsvps as { guest_name: string }).guest_name,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    })),
  };
}

export async function getUnassignedGuests(weddingId: number) {
  const parsed = getUnassignedGuestsSchema.safeParse({ weddingId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const adminClient = createAdminClient();

  // Get attending RSVPs that have no seat_assignment
  const { data: rsvps, error } = await adminClient
    .from("rsvps")
    .select("id, guest_name, status, wedding_id")
    .eq("wedding_id", weddingId)
    .eq("status", "attending");

  if (error) {
    return { success: false as const, error: "Failed to fetch guests." };
  }

  const { data: assignments } = await adminClient
    .from("seat_assignments")
    .select("rsvp_id")
    .eq("wedding_id", weddingId);

  const assignedRsvpIds = new Set((assignments ?? []).map((a) => a.rsvp_id));
  const unassigned = (rsvps ?? []).filter((r) => !assignedRsvpIds.has(r.id));

  return {
    success: true as const,
    guests: unassigned.map((r) => ({
      id: r.id,
      guestName: r.guest_name,
    })),
  };
}

export async function cleanupOrphanedAssignments(weddingId: number) {
  const parsed = cleanupOrphanedAssignmentsSchema.safeParse({ weddingId });
  if (!parsed.success) {
    return { deletedCount: 0 };
  }

  const auth = await getAuthAndVerifyAccess(weddingId);
  if (auth.error) {
    return { deletedCount: 0 };
  }

  const adminClient = createAdminClient();

  // Get current floor plan item IDs
  const { data: floorPlan } = await adminClient
    .from("floor_plans")
    .select("items")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (!floorPlan) {
    // No floor plan — delete all assignments for this wedding
    const { count } = await adminClient
      .from("seat_assignments")
      .delete({ count: "exact" })
      .eq("wedding_id", weddingId);
    return { deletedCount: count ?? 0 };
  }

  const items = floorPlan.items as Array<{ id: string }>;
  const currentItemIds = new Set(items.map((i) => i.id));

  // Get all assignments for this wedding
  const { data: assignments } = await adminClient
    .from("seat_assignments")
    .select("id, chair_item_id, table_item_id")
    .eq("wedding_id", weddingId);

  if (!assignments || assignments.length === 0) {
    return { deletedCount: 0 };
  }

  // Find orphaned assignments
  const orphanedIds = assignments
    .filter(
      (a) =>
        !currentItemIds.has(a.chair_item_id) ||
        !currentItemIds.has(a.table_item_id),
    )
    .map((a) => a.id);

  if (orphanedIds.length === 0) {
    return { deletedCount: 0 };
  }

  const { count } = await adminClient
    .from("seat_assignments")
    .delete({ count: "exact" })
    .in("id", orphanedIds);

  return { deletedCount: count ?? 0 };
}
