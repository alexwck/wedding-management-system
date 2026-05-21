"use client";

import { GlassButton } from "@/components/glassmorphism/glass-button";
import React from "react";

export function RetryButton({ className }: { className?: string }) {
  const handleClick = React.useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <GlassButton variant="secondary" size="sm" onClick={handleClick} className={className}>
      Retry
    </GlassButton>
  );
}

export default RetryButton;
