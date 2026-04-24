interface VenueSectionProps {
  venueName?: string | null;
  venueAddress?: string | null;
  venueLat?: number | null;
  venueLng?: number | null;
  welcomeMessage?: string | null;
}

export function VenueSection({
  venueName,
  venueAddress,
  venueLat,
  venueLng,
  welcomeMessage,
}: VenueSectionProps) {
  const hasCoordinates = venueLat != null && venueLng != null;

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      {venueName && (
        <h3 className="text-lg font-semibold text-foreground">{venueName}</h3>
      )}

      {venueAddress && (
        <p className="text-sm text-muted-foreground">{venueAddress}</p>
      )}

      {hasCoordinates && (
        <>
          <iframe
            title="Venue map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${venueLng! - 0.005},${venueLat! - 0.005},${venueLng! + 0.005},${venueLat! + 0.005}&layer=mapnik&marker=${venueLat},${venueLng}`}
            className="w-full rounded-lg border-0"
            style={{ minHeight: "200px" }}
            loading="lazy"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${venueLat},${venueLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground text-center hover:bg-primary/90"
            >
              Open in Maps
            </a>
            <a
              href={`https://waze.com/ul?ll=${venueLat},${venueLng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground text-center hover:bg-primary/90"
            >
              Navigate with Waze
            </a>
          </div>
        </>
      )}

      {welcomeMessage && (
        <p className="text-sm text-foreground">{welcomeMessage}</p>
      )}
    </div>
  );
}
