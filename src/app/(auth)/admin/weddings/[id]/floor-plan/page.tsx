import { notFound } from "next/navigation";
import { getFloorPlan } from "@/app/actions/floor-plan";
import { createAdminClient } from "@/lib/supabase/admin";
import { FloorPlanCanvas } from "@/components/floor-plan/floor-plan-canvas";

interface AdminFloorPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFloorPlanPage({ params }: AdminFloorPlanPageProps) {
  const { id } = await params;
  const weddingId = Number(id);

  if (isNaN(weddingId)) {
    notFound();
  }

  const adminClient = createAdminClient();
  const { data: wedding } = await adminClient
    .from("weddings")
    .select("id, couple_name")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    notFound();
  }

  const result = await getFloorPlan(weddingId);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Floor Plan — {wedding.couple_name}</h2>
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Floor Plan — {wedding.couple_name}</h2>
      <FloorPlanCanvas
        weddingId={weddingId}
        initialFloorPlan={result.floorPlan}
      />
    </div>
  );
}
