import { notFound, redirect } from "next/navigation";
import { getFloorPlan } from "@/app/actions/floor-plan";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/auth/login");
  }

  const adminClient = createAdminClient();
  const { data: wedding } = await adminClient
    .from("weddings")
    .select("id, couple_name, is_locked")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    notFound();
  }

  const result = await getFloorPlan(weddingId);

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 min-w-0">
      <FloorPlanCanvas
        weddingId={weddingId}
        initialFloorPlan={result.floorPlan}
        isLocked={wedding.is_locked}
      />
    </div>
  );
}
