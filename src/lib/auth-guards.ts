import { createClient } from "@/lib/supabase/server";

export async function getAuthAndVerifyAccess(weddingId: number) {
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
