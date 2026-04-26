import React from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center min-w-[44px] min-h-[44px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && "glass-button--primary",
          variant === "secondary" && "glass-button--secondary",
          variant === "ghost" && "glass-button--ghost",
          size === "sm" && "text-sm px-3 py-2",
          size === "md" && "text-base px-4 py-2",
          size === "lg" && "text-lg px-6 py-3",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
GlassButton.displayName = "GlassButton";
