"use client";

import { cn } from "@/lib/utils";

interface GradientBackdropProps {
  className?: string;
  variant?: "default" | "landing";
}

export function GradientBackdrop({
  className,
  variant = "default",
}: GradientBackdropProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden",
        "bg-gradient-to-br from-rose-50 via-white to-violet-50",
        className,
      )}
      aria-hidden="true"
    >
      {variant === "default" && (
        <>
          <div
            className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl animate-blob"
          />
          <div
            className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl animate-blob-reverse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl animate-blob"
            style={{ animationDelay: "4s" }}
          />
        </>
      )}
    </div>
  );
}
