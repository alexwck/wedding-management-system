import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { RSVPForm } from "@/components/rsvp-form";
import { VenueSection } from "@/components/venue-section";

interface RSVPPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RSVPPage({ params }: RSVPPageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, venue, venue_address, venue_lat, venue_lng, welcome_message")
    .eq("slug", slug)
    .single();

  if (error || !wedding) {
    notFound();
  }

  const hasVenueData = wedding.venue || wedding.venue_address || wedding.venue_lat || wedding.welcome_message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-xl w-full space-y-6">
        {hasVenueData && (
          <VenueSection
            venueName={wedding.venue}
            venueAddress={wedding.venue_address}
            venueLat={wedding.venue_lat}
            venueLng={wedding.venue_lng}
            welcomeMessage={wedding.welcome_message}
          />
        )}
        <RSVPForm slug={wedding.slug} coupleName={wedding.couple_name} />
      </div>
    </div>
  );
}
