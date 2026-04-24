import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingRSVPs } from "@/app/actions/admin";
import { TemplateUpload } from "@/components/template-upload";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";
import { RSVPSection } from "@/components/rsvp-section";

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
    <div className="space-y-6">
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
            focalX={wedding.templateFocalX}
            focalY={wedding.templateFocalY}
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

          <RSVPSection rsvps={rsvps} summary={summary} weddingId={wedding.id} />
        </div>
      </div>
    </div>
  );
}
