"use client";

import React from "react";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { Monitor } from "lucide-react";

interface FloorPlanDeviceCheckProps {
  children: React.ReactNode;
}

export function FloorPlanDeviceCheck({ children }: FloorPlanDeviceCheckProps) {
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Always render children - the canvas itself handles mobile layout
  // Show a soft warning banner on small screens
  return (
    <>
      {isSmallScreen && (
        <div className="shrink-0 z-40">
          <GlassPanel variant="dark" className="p-3 text-center space-y-2 rounded-none">
            <div className="flex items-center justify-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Floor plan editing works best on a larger screen</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For the best experience, please use a tablet or desktop device.
            </p>
          </GlassPanel>
        </div>
      )}
      {children}
    </>
  );
}
