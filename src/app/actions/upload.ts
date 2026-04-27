"use server";

import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWeddingNotLocked } from "@/lib/auth-guards";
import { MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/validations/upload";

const MAX_WIDTH = 1200;
const QUALITY = 80;

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

  const lockCheck = await verifyWeddingNotLocked(Number(weddingId));
  if (!lockCheck.ok) {
    return { success: false, error: "locked" as const, message: lockCheck.error };
  }

  let optimizedBuffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    optimizedBuffer = await sharp(buffer)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
  } catch {
    return {
      success: false,
      error: "processing_failed" as const,
      message: "Failed to process image. Please try a different file.",
    };
  }

  const supabase = createAdminClient();
  const filePath = `${weddingId}/template.webp`;

  const { error: uploadError } = await supabase.storage
    .from("wedding-templates")
    .upload(filePath, optimizedBuffer, {
      upsert: true,
      contentType: "image/webp",
    });

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

  const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("weddings")
    .update({ template_image_url: cacheBustedUrl, updated_at: new Date().toISOString(), template_focal_x: null, template_focal_y: null })
    .eq("id", Number(weddingId));

  if (updateError) {
    return {
      success: false,
      error: "update_failed" as const,
      message: "Image uploaded but failed to update wedding record.",
    };
  }

  return { success: true, imageUrl: cacheBustedUrl };
}
