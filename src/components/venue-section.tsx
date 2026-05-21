"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { MapPin, Navigation } from "lucide-react";

interface VenueSectionProps {
  venueName?: string | null;
  venueAddress?: string | null;
  venueLat?: number | null;
  venueLng?: number | null;
  welcomeMessage?: string | null;
}

const navLinks = [
  { label: "Open in Maps", buildUrl: (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
  { label: "Navigate with Waze", buildUrl: (lat: number, lng: number) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
];

export function VenueSection({
  venueName,
  venueAddress,
  venueLat,
  venueLng,
  welcomeMessage,
}: VenueSectionProps) {
  const hasCoordinates = venueLat != null && venueLng != null && (venueLat !== 0 || venueLng !== 0);
  const hasAnyDetails = !!venueName || !!venueAddress || !!welcomeMessage || hasCoordinates;
  const [mapFailed, setMapFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleMapTimeout = useCallback(() => {
    setMapFailed(true);
  }, []);

  useEffect(() => {
    if (!hasCoordinates || mapFailed) return;

    const timer = setTimeout(() => {
      setMapFailed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasCoordinates, mapFailed, retryCount]);

  const handleRetry = () => {
    setMapFailed(false);
    setRetryCount((c) => c + 1);
  };

  return (
    <GlassPanel variant="strong" className="p-8 md:p-10 flex flex-col items-center text-center gap-6 h-full" delay={0.2}>
      <h2 className="text-2xl font-serif text-slate-800 self-start">Venue Details</h2>

      <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center">
        <MapPin size={40} className="text-rose-400" />
      </div>

      <div className="space-y-4 flex-1">
        {venueName && <h3 className="text-xl font-bold text-slate-800">{venueName}</h3>}
        {venueAddress && <p className="text-slate-500">{venueAddress}</p>}
        {welcomeMessage && <p className="italic text-slate-400">{welcomeMessage}</p>}
        {!hasAnyDetails && (
          <div className="text-center space-y-2 py-6">
            <p className="text-slate-500">No venue details set yet.</p>
          </div>
        )}
      </div>

      {hasCoordinates && !mapFailed && (() => {
        const lat = venueLat as number;
        const lng = venueLng as number;
        return (
          <>
            <motion.iframe
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              key={retryCount}
              title="Venue map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
              className="w-full rounded-2xl border-0"
              style={{ minHeight: "200px" }}
              loading="lazy"
              onError={handleMapTimeout}
            />
            <div className="w-full grid grid-cols-2 gap-4">
              {navLinks.map(({ label, buildUrl }) => (
                <GlassButton
                  key={label}
                  variant="secondary"
                  className="flex items-center justify-center gap-2"
                  onClick={() => window.open(buildUrl(lat, lng), "_blank", "noopener,noreferrer")}
                >
                  {label === "Open in Maps" ? <MapPin size={18} /> : <Navigation size={18} />}
                  <span>{label}</span>
                </GlassButton>
              ))}
            </div>
          </>
        );
      })()}

      {hasCoordinates && mapFailed && (
        <div className="space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-center" aria-live="polite">
          <p className="text-sm text-slate-500">Map is currently unavailable.</p>
          <GlassButton variant="secondary" size="sm" onClick={handleRetry}>
            Retry
          </GlassButton>
        </div>
      )}
    </GlassPanel>
  );
}
