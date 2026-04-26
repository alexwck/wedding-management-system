import React from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "sm" | "md" | "lg" | "glass";
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const radiusMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  glass: "rounded-glass",
};

export const GlassPanel = React.forwardRef<htmlElement, GlassPanelProps>(
  ({ children, className, padding = "md", radius = "glass", ...props }, ref) => {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn("glass-panel", paddingMap[padding], radiusMap[radius], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
