"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { exportToXlsx } from "@/app/actions/export";

interface ExportButtonsProps {
  weddingId: number;
}

export function ExportButtons({ weddingId }: ExportButtonsProps) {
  const [isXlsxExporting, setIsXlsxExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleXlsxExport() {
    setIsXlsxExporting(true);
    setMessage(null);

    const result = await exportToXlsx(weddingId);
    if (result.success && result.data) {
      const binary = atob(result.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Download started!");
    } else if (!result.success) {
      setMessage(result.error);
    }
    setIsXlsxExporting(false);
  }

  return (
    <div className="flex items-center gap-2">
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={handleXlsxExport}
        disabled={isXlsxExporting}
      >
        {isXlsxExporting ? "Downloading..." : "Download as XLSX"}
      </GlassButton>
      {message && (
        <span className="text-sm text-slate-500">{message}</span>
      )}
    </div>
  );
}
