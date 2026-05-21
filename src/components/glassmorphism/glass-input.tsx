"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-600 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-white/40 border border-white/40 rounded-2xl px-4 py-3 outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all duration-300 placeholder:text-slate-400",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
GlassInput.displayName = "GlassInput";
