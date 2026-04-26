import React from "react";
import { cn } from "@/lib/utils";

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

const colsMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const gapMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export const BentoGrid = React.forwardRef<htmlElement, BentoGridProps>(
  ({ children, className, cols = 2, gap = "md", ...props }, ref) => {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn("grid grid-cols-1", colsMap[cols], gapMap[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
BentoGrid.displayName = "BentoGrid";
