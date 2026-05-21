import Link from "next/link";
import { getAllWeddings } from "@/app/actions/admin";
import { WeddingListTable } from "@/components/wedding-list-table";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { Plus } from "lucide-react";

export default async function WeddingListPage() {
  const result = await getAllWeddings();

  if (!result.success) {
    return <p className="text-rose-600">Failed to load weddings.</p>;
  }

  const weddings = result.weddings ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-slate-800">Weddings Management Table</h1>
        <Link href="/admin/couples">
          <GlassButton className="flex items-center gap-2">
            <Plus size={20} />
            <span>Create Couple</span>
          </GlassButton>
        </Link>
      </div>

      {weddings.length === 0 ? (
        <GlassPanel variant="light" className="p-8 text-center text-slate-500">
          <p>No weddings yet.</p>
          <p className="text-sm mt-1">Create a couple account to get started.</p>
        </GlassPanel>
      ) : (
        <GlassPanel variant="light" className="overflow-hidden">
          <WeddingListTable weddings={weddings} />
        </GlassPanel>
      )}
    </div>
  );
}
