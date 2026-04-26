import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/glassmorphism/glass-card";

export interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export const BentoItem = React.forwardRef<HTMLElement, BentoItemProps>(
  ({ children, className, colSpan = 1, rowSpan = 1, ...props }, ref) => {
    return (
      <GlassCard
        ref={ref}
        className={cn(
          "col-span-1 row-span-1",
          colSpan === 2 && "md:col-span-2",
          colSpan === 3 && "md:col-span-3",
          rowSpan === 2 && "md:row-span-2",
          className,
        )}
        {...props}
      >
        {children}
      </GlassCard>
    );
  },
);
BentoItem.displayName = "BentoItem";
