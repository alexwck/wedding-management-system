import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { FloorPlanCanvas } from "@/components/floor-plan/floor-plan-canvas";
import { FloorPlanDeviceCheck } from "@/components/floor-plan/device-check";
import { getFloorPlan } from "@/app/actions/floor-plan";

interface AdminFloorPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFloorPlanPage({ params }: AdminFloorPlanPageProps) {
  const { id } = await params;
  const weddingId = Number(id);

  if (isNaN(weddingId)) {
    notFound();
  }

  const supabase = createAdminClient();
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, is_locked")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    notFound();
  }

  const result = await getFloorPlan(wedding.id);

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-rose-600">{result.error}</p>
      </div>
    );
  }

  const canvas = (
    <FloorPlanCanvas
      weddingId={wedding.id}
      initialFloorPlan={result.floorPlan}
      isLocked={wedding.is_locked}
    />
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full">
      <FloorPlanDeviceCheck>
        {canvas}
      </FloorPlanDeviceCheck>
    </div>
  );
}
