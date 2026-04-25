import { GradientBackdrop } from "@/components/gradient-backdrop";

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

function formatWeddingDate(date: string | null | undefined, tz?: string | null): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "shortOffset",
    };
    if (tz) opts.timeZone = tz;
    return d.toLocaleDateString("en-US", opts);
  } catch {
    return null;
  }
}

export function LandingPage({ coupleName, templateImageUrl, venueName, welcomeMessage, weddingDate, timezone, focalX, focalY }: LandingPageProps) {
  const hasImage = !!templateImageUrl;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black">
      <GradientBackdrop variant="landing" className="opacity-30" />

      {hasImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={templateImageUrl}
          alt={`${coupleName} wedding invitation`}
          className="w-full h-full object-cover max-w-3xl"
          style={focalX != null && focalY != null ? { objectPosition: `${focalX}% ${focalY}%` } : undefined}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-panel rounded-2xl p-12 text-center text-white max-w-lg space-y-4">
            <h1 className="text-4xl font-bold">{coupleName}</h1>
            {weddingDate && (
              <p className="text-lg opacity-90">{formatWeddingDate(weddingDate, timezone)}</p>
            )}
            {venueName && (
              <p className="text-base opacity-80">{venueName}</p>
            )}
            {welcomeMessage && (
              <p className="text-sm opacity-70">{welcomeMessage}</p>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
        {hasImage && (venueName || welcomeMessage || weddingDate) && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="glass-panel rounded-xl p-4 text-center text-white space-y-2">
              <h2 className="text-xl font-bold">{coupleName}</h2>
              {weddingDate && (
                <p className="text-sm opacity-90">{formatWeddingDate(weddingDate, timezone)}</p>
              )}
              {venueName && (
                <p className="text-sm opacity-90">{venueName}</p>
              )}
              {welcomeMessage && (
                <p className="text-sm opacity-80">{welcomeMessage}</p>
              )}
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex justify-center">
          <a
            href="#rsvp"
            className="glass-panel inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg px-10 py-4 font-medium hover:bg-primary/80 transition-colors"
          >
            RSVP Now
          </a>
        </div>
      </div>
    </div>
  );
}
