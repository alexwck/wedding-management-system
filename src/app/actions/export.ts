"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthAndVerifyAccess } from "@/lib/auth-guards";
import { resolveSeatLabels } from "@/lib/seat-resolution";
import { exportSchema } from "@/lib/validations/export";
import ExcelJS from "exceljs";
import type { RsvpWithAssignment } from "@/types/seat-assignment";
import type { FloorPlanItem } from "@/types/floor-plan";
import { sanitizeFilename } from "@/lib/filename";

async function getRsvpsWithAssignments(weddingId: number) {
  const adminClient = createAdminClient();

  const [rsvpsResult, assignmentsResult, floorPlanResult] = await Promise.all([
    adminClient
      .from("rsvps")
      .select("id, guest_name, status, is_vegetarian, dietary_notes, needs_baby_chair, submitted_at")
      .eq("wedding_id", weddingId)
      .order("guest_name"),
    adminClient
      .from("seat_assignments")
      .select("rsvp_id, chair_item_id, table_item_id")
      .eq("wedding_id", weddingId),
    adminClient
      .from("floor_plans")
      .select("items")
      .eq("wedding_id", weddingId)
      .maybeSingle(),
  ]);

  if (rsvpsResult.error || !rsvpsResult.data) return [];

  const assignmentMap = new Map(
    (assignmentsResult.data ?? []).map((a) => [a.rsvp_id, { chairItemId: a.chair_item_id, tableItemId: a.table_item_id }]),
  );

  const items = (floorPlanResult.data?.items ?? []) as FloorPlanItem[];

  return rsvpsResult.data.map((r) => {
    const assignment = assignmentMap.get(r.id) ?? null;
    const { tableName, seatLabel } = assignment
      ? resolveSeatLabels(items, assignment.chairItemId, assignment.tableItemId)
      : { tableName: null, seatLabel: null };

    return {
      id: r.id,
      weddingId,
      guestName: r.guest_name,
      status: r.status,
      vegetarian: r.is_vegetarian,
      dietaryNotes: r.dietary_notes,
      babyChair: r.needs_baby_chair,
      submittedAt: r.submitted_at,
      seatAssignment: assignment,
      tableName,
      seatLabel,
    } satisfies RsvpWithAssignment;
  });
}

export async function exportToXlsx(weddingId: number) {
  const parsed = exportSchema.safeParse({ weddingId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const [rsvps, weddingResult] = await Promise.all([
    getRsvpsWithAssignments(weddingId),
    createAdminClient().from("weddings").select("couple_name").eq("id", weddingId).single(),
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("RSVPs");

  sheet.columns = [
    { header: "Guest Name", key: "guestName", width: 25 },
    { header: "Status", key: "status", width: 12 },
    { header: "Vegetarian", key: "vegetarian", width: 12 },
    { header: "Dietary Notes", key: "dietaryNotes", width: 25 },
    { header: "Baby Chair", key: "babyChair", width: 12 },
    { header: "Table", key: "table", width: 20 },
    { header: "Seat", key: "seat", width: 12 },
    { header: "Submitted At", key: "submittedAt", width: 18 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  for (const r of rsvps) {
    sheet.addRow({
      guestName: r.guestName,
      status: r.status,
      vegetarian: r.vegetarian ? "Yes" : "No",
      dietaryNotes: r.dietaryNotes ?? "",
      babyChair: r.babyChair ? "Yes" : "No",
      table: r.tableName ?? "Unassigned",
      seat: r.seatLabel ?? "Unassigned",
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const weddingName = sanitizeFilename(weddingResult.data?.couple_name ?? "");

  return {
    success: true as const,
    data: base64,
    filename: `rsvp-export-${weddingName}.xlsx`,
  };
}
