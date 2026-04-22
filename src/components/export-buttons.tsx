"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getGoogleAuthUrl,
  getGoogleAuthStatus,
  exportToGoogleSheets,
  exportToXlsx,
} from "@/app/actions/export";

interface ExportButtonsProps {
  weddingId: number;
}

export function ExportButtons({ weddingId }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGoogleExport() {
    setIsExporting(true);
    setMessage(null);

    const status = await getGoogleAuthStatus();
    if (!status.isConnected) {
      const { url } = await getGoogleAuthUrl();
      if (url) {
        window.open(url, "_blank");
        setMessage("Complete Google authentication in the new tab, then try again.");
      }
      setIsExporting(false);
      return;
    }

    const result = await exportToGoogleSheets(weddingId);
    if (result.success) {
      window.open(result.spreadsheetUrl, "_blank");
      setMessage("Spreadsheet created!");
    } else {
      setMessage(result.error);
    }
    setIsExporting(false);
  }

  async function handleXlsxExport() {
    setIsExporting(true);
    setMessage(null);

    const result = await exportToXlsx(weddingId);
    if (result.success && result.data) {
      const blob = new Blob([result.data], {
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
    setIsExporting(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGoogleExport}
        disabled={isExporting}
      >
        {isExporting ? "Exporting..." : "Export to Google Sheets"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleXlsxExport}
        disabled={isExporting}
      >
        Download as XLSX
      </Button>
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}
