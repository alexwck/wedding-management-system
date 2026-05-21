"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "medium" | "light" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "sm" | "md" | "lg" | "glass";
  delay?: number;
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

const variantMap = {
  medium: "glass-medium glass-panel",
  light: "glass-light glass-panel glass-panel--light",
  dark: "glass-dark glass-panel glass-panel--dark",
};

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, variant = "medium", padding = "md", radius = "glass", delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(variantMap[variant], paddingMap[padding], radiusMap[radius], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
