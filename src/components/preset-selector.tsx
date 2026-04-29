"use client";

import { useState, useEffect, useCallback } from "react";
import { updateWeddingPreset } from "@/app/actions/admin";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import type { PresetName } from "@/lib/design-system/preset-loader";
import { PRESET_REGISTRY } from "@/lib/design-system/preset-loader";

const PRESET_OPTIONS = (Object.keys(PRESET_REGISTRY) as PresetName[]).map((value) => ({
  value,
  label: value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" "),
}));

interface PresetSelectorProps {
  weddingId: number;
  currentPreset: PresetName;
  isLocked?: boolean;
}

function presetLabel(name: PresetName): string {
  return PRESET_OPTIONS.find((o) => o.value === name)?.label ?? name;
}

export function PresetSelector({ weddingId, currentPreset, isLocked }: PresetSelectorProps) {
  const [selected, setSelected] = useState(currentPreset);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setSelected(currentPreset);
  }, [currentPreset]);

  const handleChange = useCallback(
    async (value: string) => {
      if (isLocked) return;
      setMessage(null);
      setSelected(value as PresetName);
      setIsPending(true);

      try {
        const result = await updateWeddingPreset(weddingId, value);
        if (result.success) {
          setMessage({ text: `Layout preset updated to ${presetLabel(result.layoutPreset)}.`, isError: false });
        } else {
          setMessage({ text: result.error || "Failed to update preset.", isError: true });
          setSelected(currentPreset);
        }
      } finally {
        setIsPending(false);
      }
    },
    [weddingId, currentPreset, isLocked]
  );

  return (
    <GlassPanel padding="md" radius="md" className="space-y-3">
      <h3 className="text-lg font-semibold">Layout Preset</h3>
      <p className="text-sm text-muted-foreground">
        Choose how your wedding page looks to guests.
      </p>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isLocked || isPending}
        className="h-[44px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {PRESET_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {message && (
        <p className={`text-sm ${message.isError ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </GlassPanel>
  );
}
