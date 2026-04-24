import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LandingPage } from "@/components/landing-page";

interface PublicLandingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, couple_name, slug, template_image_url, venue, welcome_message, wedding_date")
    .eq("slug", slug)
    .single();

  if (error || !wedding || !wedding.template_image_url) {
    notFound();
  }

  return (
    <LandingPage
      coupleName={wedding.couple_name}
      templateImageUrl={wedding.template_image_url}
      slug={wedding.slug}
      venueName={wedding.venue}
      welcomeMessage={wedding.welcome_message}
      weddingDate={wedding.wedding_date}
    />
  );
}
