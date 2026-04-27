"use client";

import React from "react";
import { GlassCard } from "@/components/glassmorphism/glass-card";
import { Monitor } from "lucide-react";

interface FloorPlanDeviceCheckProps {
  children: React.ReactNode;
  readOnlyPreview?: React.ReactNode;
}

export function FloorPlanDeviceCheck({ children, readOnlyPreview }: FloorPlanDeviceCheckProps) {
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isSmallScreen) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 p-4">
      <GlassCard variant="heavy" className="p-6 text-center space-y-4">
        <Monitor className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Floor plan editing requires a larger screen</h2>
        <p className="text-sm text-muted-foreground">
          Please use a tablet or desktop device to edit the floor plan.
        </p>
      </GlassCard>

      {readOnlyPreview && (
        <div className="opacity-70 pointer-events-none select-none">
          {readOnlyPreview}
        </div>
      )}
    </div>
  );
}
