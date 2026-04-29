"use client";

import { useState, useTransition } from "react";
import { updateWeddingPreset } from "@/app/actions/admin";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

const PRESET_OPTIONS = [
  { value: "minimalist", label: "Minimalist" },
  { value: "bento", label: "Bento Box" },
  { value: "storytelling", label: "Storytelling" },
  { value: "magazine", label: "Magazine" },
  { value: "card-stack", label: "Card Stack" },
  { value: "asymmetric", label: "Asymmetric" },
  { value: "cinematic", label: "Cinematic" },
];

interface PresetSelectorProps {
  weddingId: number;
  currentPreset: string;
  isLocked?: boolean;
}

export function PresetSelector({ weddingId, currentPreset, isLocked }: PresetSelectorProps) {
  const [selected, setSelected] = useState(currentPreset);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleChange(value: string) {
    if (isLocked) return;
    setMessage(null);
    setSelected(value);

    startTransition(async () => {
      const result = await updateWeddingPreset(weddingId, value);
      if (result.success) {
        setMessage("Layout preset updated.");
      } else {
        setMessage(result.error || "Failed to update preset.");
        setSelected(currentPreset);
      }
    });
  }

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
        <p className={`text-sm ${message.includes("Failed") || message.includes("locked") || message.includes("Not authenticated") ? "text-destructive" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </GlassPanel>
  );
}
