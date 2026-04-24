import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingRSVPs } from "@/app/actions/admin";
import { TemplateUpload } from "@/components/template-upload";
import { ExportButtons } from "@/components/export-buttons";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";

interface ManageWeddingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageWeddingPage({ params }: ManageWeddingPageProps) {
  const { id } = await params;
  const weddingId = Number(id);

  if (isNaN(weddingId)) {
    notFound();
  }

  const result = await getWeddingRSVPs(weddingId);

  if (!result.success || !result.wedding || !result.rsvps || !result.summary) {
    notFound();
  }

  const wedding = result.wedding;
  const rsvps = result.rsvps;
  const summary = result.summary;
  const publicUrl = `/w/${wedding.slug}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{wedding.coupleName}</h2>
          <p className="text-muted-foreground">
            Public link:{" "}
            <a
              href={publicUrl}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {publicUrl}
            </a>
          </p>
        </div>
        <Link
          href={`/admin/weddings/${wedding.id}/floor-plan`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Floor Plan
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Template */}
        <div className="lg:col-span-1 space-y-4">
          <TemplateUpload
            weddingId={wedding.id}
            currentImageUrl={wedding.templateImageUrl}
          />
        </div>

        {/* Right column: Date, Venue, Summary, RSVPs */}
        <div className="lg:col-span-2 space-y-6">
          <WeddingDatePicker
            weddingId={wedding.id}
            currentDate={wedding.weddingDate}
            timezone={wedding.timezone}
            isAdmin={true}
          />

          <VenueEditor
            weddingId={wedding.id}
            initialVenue={wedding.venue}
            initialAddress={wedding.venueAddress}
            initialLat={wedding.venueLat}
            initialLng={wedding.venueLng}
            initialWelcomeMessage={wedding.welcomeMessage}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">RSVP Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{summary.attending}</p>
                <p className="text-sm text-muted-foreground">Attending</p>
              </div>
              <div className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{summary.declining}</p>
                <p className="text-sm text-muted-foreground">Declining</p>
              </div>
              <div className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{summary.vegetarian}</p>
                <p className="text-sm text-muted-foreground">Vegetarian</p>
              </div>
              <div className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{summary.babyChairs}</p>
                <p className="text-sm text-muted-foreground">Baby Chairs</p>
              </div>
            </div>
          </div>

          {rsvps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">RSVP Responses</h3>
                <ExportButtons weddingId={wedding.id} />
              </div>
              <div className="space-y-2">
                {rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between glass-panel rounded-lg p-3">
                    <div>
                      <p className="font-medium">{rsvp.guestName}</p>
                      <p className="text-sm text-muted-foreground">
                        {rsvp.dietaryNotes || "No dietary notes"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {rsvp.status === "attending" ? (
                        <span className="text-sm text-green-600">Attending</span>
                      ) : (
                        <span className="text-sm text-red-600">Declining</span>
                      )}
                      {rsvp.isVegetarian && (
                        <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">Veg</span>
                      )}
                      {rsvp.needsBabyChair && (
                        <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">Baby Chair</span>
                      )}
                      {"tableName" in rsvp && rsvp.tableName && (
                        <span className="text-xs bg-teal-100 text-teal-800 rounded px-2 py-0.5">
                          {rsvp.tableName} — {rsvp.seatLabel}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
