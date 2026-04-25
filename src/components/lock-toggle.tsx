"use client";

import { useState } from "react";
import { toggleWeddingLock } from "@/app/actions/admin";
import { Lock, Unlock } from "lucide-react";

interface LockToggleProps {
  weddingId: number;
  isLocked: boolean;
}

export function LockToggle({ weddingId, isLocked: initialLocked }: LockToggleProps) {
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleWeddingLock(weddingId);
    if (result.success) {
      setIsLocked(result.isLocked);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isLocked ? "Unlock wedding" : "Lock wedding"}
      aria-pressed={isLocked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isLocked
          ? "bg-red-500/20 text-red-700 hover:bg-red-500/30 border border-red-200"
          : "bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLocked ? (
        <>
          <Lock className="h-4 w-4" />
          Locked
        </>
      ) : (
        <>
          <Unlock className="h-4 w-4" />
          Unlocked
        </>
      )}
    </button>
  );
}
