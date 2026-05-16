"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Grant admin role to a user by email.
 * Only callable by existing admins.
 * Updates app_metadata (required for middleware auth checks).
 */
export async function grantAdminRole(targetEmail: string) {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();

  if (!caller || caller.app_metadata?.role !== "admin") {
    return { success: false, error: "Admin access required." };
  }

  const adminClient = createAdminClient();

  // Find target user by email
  const { data: targetUser, error: fetchError } = await adminClient
    .from("users")
    .select("id")
    .eq("display_name", targetEmail)
    .single();

  if (fetchError || !targetUser) {
    return { success: false, error: "User not found." };
  }

  // Update app_metadata via Admin API
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    targetUser.id,
    { app_metadata: { role: "admin" } }
  );

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
