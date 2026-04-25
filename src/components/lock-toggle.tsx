"use client";

import { useState } from "react";
import { toggleWeddingLock } from "@/app/actions/admin";

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Locked
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          Unlocked
        </>
      )}
    </button>
  );
}
