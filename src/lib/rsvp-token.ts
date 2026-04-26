import { createAdminClient } from "@/lib/supabase/admin";

export async function getRsvpByToken(weddingId: number, token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rsvp_tokens")
    .select(
      "rsvp_id, expires_at, rsvps(id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair)"
    )
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

  // Supabase may return rsvps as an object (one-to-one) or array (one-to-many)
  const rsvpsRaw = data.rsvps as unknown as
    | Array<{
        id: number;
        guest_name: string;
        status: string;
        dietary_notes: string | null;
        is_vegetarian: boolean;
        needs_baby_chair: boolean;
      }>
    | {
        id: number;
        guest_name: string;
        status: string;
        dietary_notes: string | null;
        is_vegetarian: boolean;
        needs_baby_chair: boolean;
      }
    | null
    | undefined;

  let rsvp: {
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
  } | null = null;

  if (Array.isArray(rsvpsRaw)) {
    rsvp = rsvpsRaw[0] ?? null;
  } else if (rsvpsRaw && typeof rsvpsRaw === "object") {
    rsvp = rsvpsRaw;
  }

  if (!rsvp) {
    throw new Error("getRsvpByToken: no RSVP found for token");
  }

  return rsvp;
}

