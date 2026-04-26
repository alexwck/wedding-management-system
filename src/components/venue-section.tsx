"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassButton } from "@/components/glassmorphism/glass-button";

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
    <GlassPanel padding="md" radius="glass" className="space-y-4">
      {venueName && (
        <h3 className="text-lg font-semibold text-foreground">{venueName}</h3>
      )}

      {venueAddress && (
        <p className="text-sm text-muted-foreground">{venueAddress}</p>
      )}

      {hasCoordinates && !mapFailed && (() => {
        const lat = venueLat as number;
        const lng = venueLng as number;
        return (
          <>
            <iframe
              key={retryCount}
              title="Venue map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
              className="w-full rounded-lg border-0"
              style={{ minHeight: "200px" }}
              loading="lazy"
              onError={handleMapTimeout}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              {navLinks.map(({ label, buildUrl }) => (
                <a
                  key={label}
                  href={buildUrl(lat, lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground text-center hover:bg-primary/90"
                >
                  {label}
                </a>
              ))}
            </div>
          </>
        );
      })()}

      {hasCoordinates && mapFailed && (
        <div className="space-y-3 rounded-lg border border-muted bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">Map is currently unavailable.</p>
          <GlassButton variant="secondary" size="sm" onClick={handleRetry}>
            Retry
          </GlassButton>
        </div>
      )}

      {welcomeMessage && (
        <p className="text-sm text-foreground">{welcomeMessage}</p>
      )}
    </GlassPanel>
  );
}
