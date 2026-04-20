"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

export async function uploadTemplateImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  const weddingId = formData.get("weddingId") as string | null;

  if (!file || !weddingId) {
    return {
      success: false,
      error: "validation" as const,
      message: "File and wedding ID are required.",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "invalid_type" as const,
      message: "Only PNG and JPG images are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "file_too_large" as const,
      message: "File size must be under 5MB.",
    };
  }

  const supabase = createAdminClient();

  const ext = file.name.split(".").pop() || "png";
  const filePath = `${weddingId}/template.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("wedding-templates")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return {
      success: false,
      error: "upload_failed" as const,
      message: "Failed to upload image. Please try again.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("wedding-templates").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("weddings")
    .update({ template_image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", Number(weddingId));

  if (updateError) {
    return {
      success: false,
      error: "update_failed" as const,
      message: "Image uploaded but failed to update wedding record.",
    };
  }

  return { success: true, imageUrl: publicUrl };
}
