"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { exportSchema, handleGoogleCallbackSchema } from "@/lib/validations/export";
import { google } from "googleapis";
import ExcelJS from "exceljs";
import type { RsvpWithAssignment } from "@/types/seat-assignment";

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

async function getRsvpsWithAssignments(weddingId: number) {
  const adminClient = createAdminClient();

  const { data: rsvps, error: rsvpError } = await adminClient
    .from("rsvps")
    .select("id, guest_name, status, is_vegetarian, dietary_notes, needs_baby_chair, submitted_at")
    .eq("wedding_id", weddingId)
    .order("guest_name");

  if (rsvpError || !rsvps) return [];

  const { data: assignments } = await adminClient
    .from("seat_assignments")
    .select("rsvp_id, chair_item_id, table_item_id")
    .eq("wedding_id", weddingId);

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [a.rsvp_id, { chairItemId: a.chair_item_id, tableItemId: a.table_item_id }]),
  );

  // Get floor plan for table/seat labels
  const { data: floorPlan } = await adminClient
    .from("floor_plans")
    .select("items")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  type FloorPlanItem = { id: string; label: string; type: string; parentItemId: string | null; metadata: { chairIndex?: number } };
  const items = (floorPlan?.items ?? []) as FloorPlanItem[];
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return rsvps.map((r) => {
    const assignment = assignmentMap.get(r.id) ?? null;
    let tableName: string | null = null;
    let seatLabel: string | null = null;

    if (assignment) {
      const tableItem = itemMap.get(assignment.tableItemId);
      tableName = tableItem?.label ?? null;

      const chairItem = itemMap.get(assignment.chairItemId);
      if (chairItem?.metadata?.chairIndex != null) {
        seatLabel = `Seat ${chairItem.metadata.chairIndex + 1}`;
      } else {
        // Count siblings (chairs with same parent) to find ordinal position
        const siblings = items.filter(
          (i) => i.parentItemId === assignment.tableItemId && i.type === "chair",
        );
        const idx = siblings.findIndex((i) => i.id === assignment.chairItemId);
        seatLabel = idx >= 0 ? `Seat ${idx + 1}` : "Seat ?";
      }
    }

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

// --- Google OAuth ---

export async function getGoogleAuthUrl() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { url: "" };
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
    state: user.id,
  });

  return { url };
}

export async function handleGoogleCallback(input: { code: string; state: string }) {
  const parsed = handleGoogleCallbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid callback data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false as const, error: "Not authenticated." };
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const { tokens } = await oauth2Client.getToken(parsed.data.code);

  if (!tokens.access_token || !tokens.refresh_token) {
    return { success: false as const, error: "Failed to obtain tokens." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("oauth_tokens").upsert(
    {
      user_id: user.id,
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope ?? null,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    },
    { onConflict: "user_id,provider" },
  );

  if (error) {
    return { success: false as const, error: "Failed to store tokens." };
  }

  return { success: true as const };
}

export async function getGoogleAuthStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { isConnected: false };
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("oauth_tokens")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  return { isConnected: !!data };
}

// --- Export ---

export async function exportToGoogleSheets(weddingId: number) {
  const parsed = exportSchema.safeParse({ weddingId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const auth = await getAuthAndVerifyAccess(weddingId);
  if (auth.error) {
    return { success: false as const, error: auth.error };
  }

  const adminClient = createAdminClient();

  // Get user's Google tokens
  const { data: tokenData } = await adminClient
    .from("oauth_tokens")
    .select("*")
    .eq("user_id", auth.user!.id)
    .eq("provider", "google")
    .maybeSingle();

  if (!tokenData) {
    return { success: false as const, error: "Google not connected. Please authenticate first." };
  }

  // Refresh token if expired
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    scope: tokenData.scope ?? undefined,
    expiry_date: tokenData.expires_at ? new Date(tokenData.expires_at).getTime() : undefined,
  });

  // Get RSVP data
  const rsvps = await getRsvpsWithAssignments(weddingId);

  // Create spreadsheet
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const { data: wedding } = await adminClient
    .from("weddings")
    .select("title")
    .eq("id", weddingId)
    .single();

  const spreadsheetTitle = `${wedding?.title ?? "Wedding"} - RSVP Export`;

  const { data: spreadsheet } = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: spreadsheetTitle },
    },
  });

  if (!spreadsheet?.spreadsheetId) {
    return { success: false as const, error: "Failed to create spreadsheet." };
  }

  const headers = ["Guest Name", "Status", "Vegetarian", "Dietary Notes", "Baby Chair", "Table", "Seat", "Submitted At"];
  const rows = rsvps.map((r) => [
    r.guestName,
    r.status,
    r.vegetarian ? "Yes" : "No",
    r.dietaryNotes ?? "",
    r.babyChair ? "Yes" : "No",
    r.tableName ?? "Unassigned",
    r.seatLabel ?? "Unassigned",
    r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "",
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheet.spreadsheetId,
    range: "A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [headers, ...rows],
    },
  });

  // Update stored token if refreshed
  const newCredentials = oauth2Client.credentials;
  if (newCredentials.access_token && newCredentials.access_token !== tokenData.access_token) {
    await adminClient
      .from("oauth_tokens")
      .update({
        access_token: newCredentials.access_token,
        expires_at: newCredentials.expiry_date ? new Date(newCredentials.expiry_date).toISOString() : null,
      })
      .eq("id", tokenData.id);
  }

  return {
    success: true as const,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet.spreadsheetId}`,
  };
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

  const rsvps = await getRsvpsWithAssignments(weddingId);

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

  // Style header row
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

  return {
    success: true as const,
    data: buffer,
    filename: `rsvp-export-${weddingId}.xlsx`,
  };
}
