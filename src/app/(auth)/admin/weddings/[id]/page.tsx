import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingRSVPs } from "@/app/actions/admin";
import { TemplateUpload } from "@/components/template-upload";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";
import { RSVPSection } from "@/components/rsvp-section";
import { EditableCoupleName } from "@/components/editable-couple-name";
import { LockToggle } from "@/components/lock-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { NewTabLink } from "@/components/new-tab-link";
import { GlassButton } from "@/components/glassmorphism/glass-button";

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
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <EditableCoupleName weddingId={wedding.id} coupleName={wedding.coupleName} isLocked={wedding.isLocked} />
          <p className="text-slate-500 text-sm mt-1">
            Public link:{" "}
            <NewTabLink href={publicUrl} className="text-slate-800 hover:underline font-medium">
              {publicUrl}
            </NewTabLink>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LockToggle weddingId={wedding.id} isLocked={wedding.isLocked} />
          <Link href={`/admin/weddings/${wedding.id}/floor-plan`}>
            <GlassButton variant="primary">
              Floor Plan
            </GlassButton>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="min-h-[44px]">Details</TabsTrigger>
          <TabsTrigger value="venue" className="min-h-[44px]">Venue</TabsTrigger>
          <TabsTrigger value="rsvps" className="min-h-[44px]">RSVPs</TabsTrigger>
          <TabsTrigger value="preview" className="min-h-[44px]">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassPanel padding="md" radius="md" className="h-full">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Template</h3>
              <TemplateUpload
                weddingId={wedding.id}
                currentImageUrl={wedding.templateImageUrl}
                focalX={wedding.templateFocalX}
                focalY={wedding.templateFocalY}
              />
            </GlassPanel>

            <GlassPanel padding="md" radius="md" className="h-full">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Wedding Date</h3>
              <WeddingDatePicker
                weddingId={wedding.id}
                currentDate={wedding.weddingDate}
                timezone={wedding.timezone}
                isAdmin={true}
              />
            </GlassPanel>
          </div>
        </TabsContent>

        <TabsContent value="venue" className="mt-4">
          <GlassPanel padding="md" radius="md">
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
        </TabsContent>

        <TabsContent value="rsvps" className="mt-4">
          <RSVPSection rsvps={rsvps} summary={summary} weddingId={wedding.id} />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <GlassPanel padding="md" radius="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Guest Preview</h3>
              <NewTabLink href={publicUrl} className="text-sm text-slate-800 hover:underline font-medium">
                Open in new tab
              </NewTabLink>
            </div>
            <div className="w-full rounded-lg overflow-hidden border">
              <iframe
                src={publicUrl}
                title="Guest preview"
                className="w-full"
                style={{ height: "600px", border: 0 }}
                loading="lazy"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              This preview renders identically to what your guests see.
            </p>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
