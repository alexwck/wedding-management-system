"use client";

import { useState, useRef } from "react";
import { uploadTemplateImage } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";

interface TemplateUploadProps {
  weddingId: number;
  currentImageUrl: string | null;
}

export function TemplateUpload({ weddingId, currentImageUrl }: TemplateUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
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
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Template uploaded successfully!</p>}

      {preview && (
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Template preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <Button onClick={handleUpload} disabled={uploading || !hasFile}>
        {uploading ? "Uploading..." : "Upload Template"}
      </Button>
    </div>
  );
}
