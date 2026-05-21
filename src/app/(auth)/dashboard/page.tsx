import Link from "next/link";
import { getMyWeddingRSVPs } from "@/app/actions/admin";
import { RVPSummary } from "@/components/rsvp-summary";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";
import { EditableCoupleName } from "@/components/editable-couple-name";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassButton } from "@/components/glassmorphism/glass-button";

export default async function CoupleDashboard() {
  const result = await getMyWeddingRSVPs();

  if (!result.success || !result.wedding || !result.summary) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-serif text-slate-800">Dashboard</h2>
        <p className="text-rose-600">
          {result.message || "Failed to load wedding data."}
        </p>
      </div>
    );
  }

  const { wedding, summary } = result;

  return (
    <div className="space-y-6">
      {wedding.isLocked && (
        <GlassPanel variant="light" className="p-4">
          <p className="font-medium text-amber-800">This wedding has been locked by admin.</p>
          <p className="text-sm mt-1 text-amber-700">Contact your admin if you need to make changes.</p>
        </GlassPanel>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <EditableCoupleName weddingId={wedding.id} coupleName={wedding.coupleName} isLocked={wedding.isLocked} />
          <p className="text-slate-500 text-sm mt-1">
            Public link:{" "}
            <a
              href={`/w/${wedding.slug}`}
              className="text-slate-800 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              /w/{wedding.slug}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/rsvps">
            <GlassButton variant="primary">
              View All RSVPs
            </GlassButton>
          </Link>
          <a
            href={`/w/${wedding.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlassButton variant="secondary">
              Preview as Guest
            </GlassButton>
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Template */}
        <div className="lg:col-span-1">
          {wedding.templateImageUrl && (
            <GlassPanel variant="medium" className="p-4">
              <img
                src={wedding.templateImageUrl}
                alt={`${wedding.coupleName} template`}
                className="w-full rounded-2xl object-contain"
              />
            </GlassPanel>
          )}
        </div>

        {/* Right column: Date, Venue, Summary */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel variant="medium">
            <WeddingDatePicker
              weddingId={wedding.id}
              currentDate={wedding.weddingDate}
              timezone={wedding.timezone}
              isAdmin={false}
            />
          </GlassPanel>

          <GlassPanel variant="medium">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Venue Details</h3>
            <VenueEditor
              weddingId={wedding.id}
              initialVenue={wedding.venue}
              initialAddress={wedding.venueAddress}
              initialLat={wedding.venueLat}
              initialLng={wedding.venueLng}
              initialWelcomeMessage={wedding.welcomeMessage}
            />
          </GlassPanel>

          <GlassPanel variant="medium" className="p-6">
            <RVPSummary summary={summary} />
          </GlassPanel>

          {summary.total === 0 && (
            <GlassPanel variant="light" className="p-8 text-center text-slate-500">
              No RSVPs yet. Share your wedding link with guests!
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
