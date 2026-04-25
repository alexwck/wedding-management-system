import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LandingPage } from "@/components/landing-page";
import { VenueSection } from "@/components/venue-section";
import { RSVPForm } from "@/components/rsvp-form";

interface PublicLandingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, template_image_url, venue, venue_address, venue_lat, venue_lng, welcome_message, wedding_date, timezone, template_focal_x, template_focal_y, is_locked")
    .eq("slug", slug)
    .single();

  if (error || !wedding) {
    notFound();
  }

  const hasVenueData = wedding.venue || wedding.venue_address || wedding.venue_lat || wedding.venue_lng;

  return (
    <div className="scroll-smooth">
      <LandingPage
        coupleName={wedding.couple_name}
        templateImageUrl={wedding.template_image_url}
        venueName={wedding.venue}
        welcomeMessage={wedding.welcome_message}
        weddingDate={wedding.wedding_date}
        timezone={wedding.timezone}
        focalX={wedding.template_focal_x}
        focalY={wedding.template_focal_y}
      />

      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        {hasVenueData && (
          <VenueSection
            venueName={wedding.venue}
            venueAddress={wedding.venue_address}
            venueLat={wedding.venue_lat}
            venueLng={wedding.venue_lng}
            welcomeMessage={wedding.welcome_message}
          />
        )}

        <div id="rsvp">
          <RSVPForm
            slug={wedding.slug}
            coupleName={wedding.couple_name}
            isLocked={wedding.is_locked}
          />
        </div>
      </div>
    </div>
  );
}
