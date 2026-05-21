import { getAllWeddings } from "@/app/actions/admin";
import { AdminDashboardView } from "@/components/admin-dashboard-view";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import RetryButton from "@/components/retry-button";

export default async function AdminDashboard() {
  const result = await getAllWeddings();

  if (!result.success) {
    return (
      <GlassPanel variant="light" className="p-8 text-center space-y-4">
        <p className="text-rose-600">Failed to load weddings.</p>
        <RetryButton />
      </GlassPanel>
    );
  }

  return <AdminDashboardView weddings={result.weddings ?? []} />;
}
