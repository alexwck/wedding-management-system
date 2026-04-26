import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloorPlanCanvas } from "@/components/floor-plan/floor-plan-canvas";
import { getFloorPlan } from "@/app/actions/floor-plan";

export default async function CoupleFloorPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, is_locked")
    .eq("user_id", user.id)
    .single();

  if (!wedding) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No wedding found for your account.</p>
      </div>
    );
  }

  const result = await getFloorPlan(wedding.id);

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
        weddingId={wedding.id}
        initialFloorPlan={result.floorPlan}
        isLocked={wedding.is_locked}
      />
    </div>
  );
}
