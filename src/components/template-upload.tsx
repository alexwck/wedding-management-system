"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadTemplateImage } from "@/app/actions/upload";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { TemplatePreview } from "@/components/template-preview";

interface TemplateUploadProps {
  weddingId: number;
  currentImageUrl: string | null;
  focalX?: number | null;
  focalY?: number | null;
}

export function TemplateUpload({ weddingId, currentImageUrl, focalX, focalY }: TemplateUploadProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setSuccess(false);
    setHasFile(!!file);

    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Only PNG and JPG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("weddingId", String(weddingId));

    const result = await uploadTemplateImage(formData);

    if (result.success) {
      setPreview(result.imageUrl ?? null);
      setSuccess(true);
      setHasFile(false);
      router.refresh();
    } else {
      setError(result.message ?? "Upload failed");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-900/80 file:text-white hover:file:bg-slate-800/90 file:min-h-[44px]"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-400/50 bg-rose-100/20 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-100/20 p-3 text-sm text-emerald-700">
          Template uploaded successfully!
        </div>
      )}

      {preview && (
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Template preview"
            className="w-full h-full object-cover"
            style={
              focalX != null && focalY != null
                ? { objectPosition: `${focalX}% ${focalY}%` }
                : undefined
            }
          />
        </div>
      )}

      <GlassButton
        onClick={handleUpload}
        disabled={uploading || !hasFile}
        className="w-full sm:w-auto"
      >
        {uploading ? "Uploading..." : "Upload Template"}
      </GlassButton>

      {hasFile && (
        <p className="text-xs text-slate-500">
          Upload the template first before adjusting the crop.
        </p>
      )}
      {!hasFile && (preview || currentImageUrl) && (
        <TemplatePreview
          weddingId={weddingId}
          imageUrl={preview ?? currentImageUrl ?? ""}
          focalX={focalX ?? null}
          focalY={focalY ?? null}
        />
      )}
    </div>
  );
}
