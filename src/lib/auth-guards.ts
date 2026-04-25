import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuthAndVerifyAccess(weddingId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isLocked: null, error: "Not authenticated." } as const;
  }

  const isAdmin = user.app_metadata?.role === "admin";
  if (!isAdmin) {
    const { data } = await supabase
      .from("weddings")
      .select("id, is_locked")
      .eq("id", weddingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      return { user: null, isLocked: null, error: "Access denied." } as const;
    }

    return { user, isLocked: data.is_locked, error: null } as const;
  }

  const { data } = await supabase
    .from("weddings")
    .select("is_locked")
    .eq("id", weddingId)
    .maybeSingle();

  return { user, isLocked: data?.is_locked ?? false, error: null } as const;
}

export async function verifyWeddingNotLocked(weddingId: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("weddings")
    .select("is_locked")
    .eq("id", weddingId)
    .single();

  if (error || !data) {
    return { ok: false, error: "Wedding not found." };
  }

  if (data.is_locked) {
    return { ok: false, error: "This wedding has been locked. No edits are permitted." };
  }

  return { ok: true };
}
