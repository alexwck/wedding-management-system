"use client";

import { useEffect } from "react";
import { GlassButton } from "@/components/glassmorphism/glass-button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="glass-panel rounded-glass p-8 max-w-md">
        <h1 className="text-4xl font-serif font-bold text-slate-800">Something went wrong</h1>
        <p className="mt-4 text-slate-500">
          An unexpected error occurred. Please try again.
        </p>
        <GlassButton onClick={reset} className="mt-6" variant="primary">
          Try Again
        </GlassButton>
      </div>
    </div>
  );
}
