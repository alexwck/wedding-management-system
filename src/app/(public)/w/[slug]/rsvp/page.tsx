import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { RSVPForm } from "@/components/rsvp-form";

interface RSVPPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RSVPPage({ params }: RSVPPageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, couple_name, slug")
    .eq("slug", slug)
    .single();

  if (error || !wedding) {
    notFound();
  }

  return <RSVPForm slug={wedding.slug} coupleName={wedding.couple_name} />;
}
