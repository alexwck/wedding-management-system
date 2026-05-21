"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    const variantClasses = {
      primary: "bg-slate-900/80 text-white hover:bg-slate-800/90 border border-white/10",
      secondary: "glass-light text-slate-800 hover:bg-white/30",
      ghost: "bg-transparent text-slate-700 hover:bg-white/10",
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg font-medium",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center min-w-[44px] min-h-[44px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          "rounded-2xl backdrop-blur-sm motion-hover motion-active",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
GlassButton.displayName = "GlassButton";
