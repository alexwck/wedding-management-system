import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { LandingPage } from "@/components/landing-page";
import { VenueSection } from "@/components/venue-section";
import { RSVPForm } from "@/components/rsvp-form";
import { RSVPSectionClient } from "@/components/rsvp-section-client";
import { ThemeProvider } from "@/lib/design-system/theme";
import { DEFAULT_THEME, mergeTheme } from "@/lib/design-system/theme-config";
import { getRsvpByToken } from "@/lib/rsvp-token";
import { PresetWrapper } from "@/components/preset-wrapper";
import type { PresetName } from "@/lib/design-system/preset-loader";
interface PublicLandingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select(
      "id, couple_name, slug, template_image_url, venue, venue_address, venue_lat, venue_lng, welcome_message, wedding_date, timezone, template_focal_x, template_focal_y, is_locked, layout_preset, theme_json"
    )
    .eq("slug", slug)
    .single();

  if (error || !wedding) {
    notFound();
  }

  const hasVenueData =
    wedding.venue || wedding.venue_address || wedding.venue_lat || wedding.venue_lng;

  const validPresets: PresetName[] = [
    "minimalist",
    "bento",
    "storytelling",
    "magazine",
    "card-stack",
    "asymmetric",
    "cinematic",
  ];
  const activePreset: PresetName = validPresets.includes(wedding.layout_preset as PresetName)
    ? (wedding.layout_preset as PresetName)
    : "bento";

  // Load theme
  const weddingTheme =
    typeof wedding.theme_json === "object" && wedding.theme_json !== null
      ? (wedding.theme_json as Record<string, unknown>)
      : null;

  const theme = mergeTheme(DEFAULT_THEME, weddingTheme as Parameters<typeof mergeTheme>[1]);

  // Check for returning guest token
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(`rsvp_token_${wedding.id}`);
  let existingRsvp = null;
  if (tokenCookie?.value) {
    try {
      existingRsvp = await getRsvpByToken(wedding.id, tokenCookie.value);
    } catch {
      // Token invalid or expired — show form
      existingRsvp = null;
    }
  }

  return (
    <ThemeProvider globalTheme={DEFAULT_THEME} weddingTheme={weddingTheme}>
      <PresetWrapper preset={activePreset}>
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
            <RSVPSectionClient
              slug={wedding.slug}
              coupleName={wedding.couple_name}
              isLocked={wedding.is_locked}
              existingRsvp={existingRsvp}
            />
          </div>
        </div>
      </div>
      </PresetWrapper>
    </ThemeProvider>
  );
}
