"use client";

import { motion } from "motion/react";

interface LandingPageProps {
  coupleName: string;
  templateImageUrl?: string | null;
  venueName?: string | null;
  welcomeMessage?: string | null;
  weddingDate?: string | null;
  timezone?: string | null;
  focalX?: number | null;
  focalY?: number | null;
}

function formatWeddingDateOnly(date: string | null | undefined, tz?: string | null): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (tz) opts.timeZone = tz;
    return d.toLocaleDateString("en-US", opts);
  } catch {
    return null;
  }
}

function formatWeddingTimeOnly(date: string | null | undefined, tz?: string | null): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const opts: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "shortOffset",
    };
    if (tz) opts.timeZone = tz;
    return d.toLocaleTimeString("en-US", opts);
  } catch {
    return null;
  }
}

export function LandingPage({ coupleName, templateImageUrl, weddingDate, timezone, focalX, focalY }: LandingPageProps) {
  const hasImage = !!templateImageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full max-w-2xl aspect-[3/2] rounded-[40px] overflow-hidden glass relative shadow-2xl">
        {hasImage ? (
          <img
            src={templateImageUrl!}
            alt={`${coupleName} wedding invitation`}
            className="w-full h-full object-cover"
            style={focalX != null && focalY != null ? { objectPosition: `${focalX}% ${focalY}%` } : undefined}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-200/50 via-purple-200/50 to-emerald-200/50" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif mb-4 text-glow">{coupleName}</h1>
          {weddingDate && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-base sm:text-lg font-medium opacity-90 tracking-wide uppercase">
                {formatWeddingDateOnly(weddingDate, timezone)}
              </p>
              <p className="text-sm sm:text-base font-medium opacity-80 tracking-wide uppercase">
                {formatWeddingTimeOnly(weddingDate, timezone)}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
