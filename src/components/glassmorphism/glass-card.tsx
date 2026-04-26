import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "heavy" | "light";
  as?: "div" | "section" | "article";
}

export const GlassCard = React.forwardRef<HTMLElement, GlassCardProps>(
  ({ children, className, variant = "default", as: Component = "div", ...props }, ref) => {
    const variantClass =
      variant === "heavy"
        ? "glass-panel--heavy"
        : variant === "light"
          ? "glass-panel--light"
          : "glass-panel";

    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(variantClass, className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
GlassCard.displayName = "GlassCard";
