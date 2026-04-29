import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingRSVPs } from "@/app/actions/admin";
import { TemplateUpload } from "@/components/template-upload";
import { VenueEditor } from "@/components/venue-editor";
import { WeddingDatePicker } from "@/components/wedding-date-picker";
import { RSVPSection } from "@/components/rsvp-section";
import { EditableCoupleName } from "@/components/editable-couple-name";
import { LockToggle } from "@/components/lock-toggle";
import { PresetSelector } from "@/components/preset-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoItem } from "@/components/bento/bento-item";

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
          <p className="text-muted-foreground text-sm mt-1">
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
        <div className="flex items-center gap-3">
          <LockToggle weddingId={wedding.id} isLocked={wedding.isLocked} />
          <Link
            href={`/admin/weddings/${wedding.id}/floor-plan`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 min-h-[44px] inline-flex items-center"
          >
            Floor Plan
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
          <BentoGrid cols={2} gap="md">
            <BentoItem colSpan={1} rowSpan={1}>
              <GlassPanel padding="md" radius="md" className="h-full">
                <h3 className="text-lg font-semibold mb-4">Template</h3>
                <TemplateUpload
                  weddingId={wedding.id}
                  currentImageUrl={wedding.templateImageUrl}
                  focalX={wedding.templateFocalX}
                  focalY={wedding.templateFocalY}
                />
              </GlassPanel>
            </BentoItem>

            <BentoItem colSpan={1} rowSpan={1}>
              <GlassPanel padding="md" radius="md" className="h-full">
                <h3 className="text-lg font-semibold mb-4">Wedding Date</h3>
                <WeddingDatePicker
                  weddingId={wedding.id}
                  currentDate={wedding.weddingDate}
                  timezone={wedding.timezone}
                  isAdmin={true}
                />
              </GlassPanel>
            </BentoItem>

            <BentoItem colSpan={2} rowSpan={1}>
              <PresetSelector
                weddingId={wedding.id}
                currentPreset={wedding.layoutPreset ?? "bento"}
                isLocked={wedding.isLocked}
              />
            </BentoItem>
          </BentoGrid>
        </TabsContent>

        <TabsContent value="venue" className="mt-4">
          <BentoGrid cols={1} gap="md">
            <BentoItem>
              <GlassPanel padding="md" radius="md">
                <h3 className="text-lg font-semibold mb-4">Venue Details</h3>
                <VenueEditor
                  weddingId={wedding.id}
                  initialVenue={wedding.venue}
                  initialAddress={wedding.venueAddress}
                  initialLat={wedding.venueLat}
                  initialLng={wedding.venueLng}
                  initialWelcomeMessage={wedding.welcomeMessage}
                />
              </GlassPanel>
            </BentoItem>
          </BentoGrid>
        </TabsContent>

        <TabsContent value="rsvps" className="mt-4">
          <BentoGrid cols={1} gap="md">
            <BentoItem>
              <RSVPSection rsvps={rsvps} summary={summary} weddingId={wedding.id} />
            </BentoItem>
          </BentoGrid>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <BentoGrid cols={1} gap="md">
            <BentoItem>
              <GlassPanel padding="md" radius="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Guest Preview</h3>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open in new tab
                  </a>
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
                <p className="text-xs text-muted-foreground mt-2">
                  This preview renders identically to what your guests see.
                </p>
              </GlassPanel>
            </BentoItem>
          </BentoGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
