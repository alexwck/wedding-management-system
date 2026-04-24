import Link from "next/link";
import { GradientBackdrop } from "@/components/gradient-backdrop";

interface LandingPageProps {
  coupleName: string;
  templateImageUrl: string;
  slug: string;
  venueName?: string | null;
  welcomeMessage?: string | null;
  weddingDate?: string | null;
  timezone?: string | null;
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

export function LandingPage({ coupleName, templateImageUrl, slug, venueName, welcomeMessage, weddingDate, timezone }: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black">
      <GradientBackdrop variant="landing" className="opacity-30" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={templateImageUrl}
        alt={`${coupleName} wedding invitation`}
        className="w-full h-full object-contain max-w-3xl"
      />
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
        {(venueName || welcomeMessage || weddingDate) && (
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
          <Link
            href={`/w/${slug}/rsvp`}
            className="glass-panel inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg px-10 py-4 font-medium hover:bg-primary/80 transition-colors"
          >
            RSVP Now
          </Link>
        </div>
      </div>
    </div>
  );
}
