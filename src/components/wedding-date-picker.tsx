"use client";

import { useState } from "react";
import { updateWeddingDate, updateWeddingTimezone } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimezoneCombobox } from "@/components/timezone-combobox";

interface WeddingDatePickerProps {
  weddingId: number;
  currentDate: string | null;
  timezone: string | null;
  isAdmin: boolean;
}

export function WeddingDatePicker({
  weddingId,
  currentDate,
  timezone,
  isAdmin,
}: WeddingDatePickerProps) {
  const [date, setDate] = useState(currentDate ? new Date(currentDate).toISOString().slice(0, 16) : "");
  const [tz, setTz] = useState(timezone ?? "Asia/Kuala_Lumpur");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDateSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateWeddingDate(weddingId, date || null);
    setSaving(false);
    setMessage(result.success ? "Date saved!" : result.error);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleTimezoneSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateWeddingTimezone(weddingId, tz);
    setSaving(false);
    setMessage(result.success ? "Timezone saved!" : result.error);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="glass-panel rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium">Wedding Date & Time</h3>

      <div className="flex items-center gap-2">
        <Input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleDateSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <TimezoneCombobox value={tz} onChange={setTz} />
          <Button size="sm" onClick={handleTimezoneSave} disabled={saving}>
            Save
          </Button>
        </div>
      )}

      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
