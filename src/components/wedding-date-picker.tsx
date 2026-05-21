"use client";

import { useState } from "react";
import { updateWeddingDate, updateWeddingTimezone } from "@/app/actions/admin";
import { GlassInput } from "@/components/glassmorphism/glass-input";
import { GlassButton } from "@/components/glassmorphism/glass-button";
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
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-800">Wedding Date & Time</h3>

      <div className="flex items-center gap-2">
        <GlassInput
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1"
        />
        <GlassButton size="sm" onClick={handleDateSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </GlassButton>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <TimezoneCombobox value={tz} onChange={setTz} />
          <GlassButton size="sm" onClick={handleTimezoneSave} disabled={saving}>
            Save
          </GlassButton>
        </div>
      )}

      {message && (
        <p className="text-xs text-slate-500">{message}</p>
      )}
    </div>
  );
}
