import Link from "next/link";
import { getMyWeddingRSVPs } from "@/app/actions/admin";
import { RVPSummary } from "@/components/rsvp-summary";
import { VenueEditor } from "@/components/venue-editor";

export default async function CoupleDashboard() {
  const result = await getMyWeddingRSVPs();

  if (!result.success || !result.wedding || !result.summary) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-destructive">
          {result.message || "Failed to load wedding data."}
        </p>
      </div>
    );
  }

  const { wedding, summary } = result;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{wedding.coupleName}</h2>
          <p className="text-muted-foreground">
            Public link:{" "}
            <a
              href={`/w/${wedding.slug}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /w/{wedding.slug}
            </a>
          </p>
        </div>
        <Link
          href="/dashboard/rsvps"
          className="text-sm text-primary hover:underline"
        >
          View All RSVPs
        </Link>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <RVPSummary summary={summary} />
      </div>

      <VenueEditor
        weddingId={wedding.id}
        initialVenue={wedding.venue}
        initialAddress={wedding.venueAddress}
        initialLat={wedding.venueLat}
        initialLng={wedding.venueLng}
        initialWelcomeMessage={wedding.welcomeMessage}
      />

      {summary.total === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No RSVPs yet. Share your wedding link with guests!
        </div>
      )}
    </div>
  );
}
