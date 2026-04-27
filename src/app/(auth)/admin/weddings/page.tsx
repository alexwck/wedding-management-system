import Link from "next/link";
import { getAllWeddings } from "@/app/actions/admin";
import { WeddingListTable } from "@/components/wedding-list-table";

export default async function WeddingListPage() {
  const result = await getAllWeddings();

  if (!result.success) {
    return <p className="text-destructive">Failed to load weddings.</p>;
  }

  const weddings = result.weddings ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Weddings</h2>
        <Link
          href="/admin/weddings/create"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Couple
        </Link>
      </div>

      {weddings.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center text-muted-foreground">
          <p>No weddings yet.</p>
          <p className="text-sm mt-1">Create a couple account to get started.</p>
        </div>
      ) : (
        <WeddingListTable weddings={weddings} />
      )}
    </div>
  );
}
