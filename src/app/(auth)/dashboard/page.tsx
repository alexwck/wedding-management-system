import Link from "next/link";
import { getMyWeddingRSVPs } from "@/app/actions/admin";
import { RVPSummary } from "@/components/rsvp-summary";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";
import { EditableCoupleName } from "@/components/editable-couple-name";

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
    <div className="space-y-6">
      {wedding.isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="font-medium">This wedding has been locked by admin.</p>
          <p className="text-sm mt-1">Contact your admin if you need to make changes.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <EditableCoupleName weddingId={wedding.id} coupleName={wedding.coupleName} isLocked={wedding.isLocked} />
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Template */}
        <div className="lg:col-span-1">
          {wedding.templateImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wedding.templateImageUrl}
              alt={`${wedding.coupleName} template`}
              className="w-full rounded-lg object-contain"
            />
          )}
        </div>

        {/* Right column: Date, Venue, Summary */}
        <div className="lg:col-span-2 space-y-6">
          <WeddingDatePicker
            weddingId={wedding.id}
            currentDate={wedding.weddingDate}
            timezone={wedding.timezone}
            isAdmin={false}
          />

          <VenueEditor
            weddingId={wedding.id}
            initialVenue={wedding.venue}
            initialAddress={wedding.venueAddress}
            initialLat={wedding.venueLat}
            initialLng={wedding.venueLng}
            initialWelcomeMessage={wedding.welcomeMessage}
          />

          <div className="glass-panel rounded-xl p-6">
            <RVPSummary summary={summary} />
          </div>

          {summary.total === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No RSVPs yet. Share your wedding link with guests!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
