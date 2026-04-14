import Link from "next/link";
import { getAllWeddings } from "@/app/actions/admin";

export default async function AdminDashboard() {
  const result = await getAllWeddings();

  if (!result.success) {
    return <p className="text-destructive">Failed to load weddings.</p>;
  }

  const weddings = result.weddings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <Link
          href="/admin/couples"
          className="text-sm text-primary hover:underline"
        >
          + Create Couple
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Weddings</p>
          <p className="text-2xl font-bold">{weddings.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">With Template</p>
          <p className="text-2xl font-bold">
            {weddings.filter((w) => w.template_image_url).length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Missing Template</p>
          <p className="text-2xl font-bold">
            {weddings.filter((w) => !w.template_image_url).length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent Weddings</h3>
        {weddings.length === 0 ? (
          <p className="text-muted-foreground">No weddings yet.</p>
        ) : (
          <div className="space-y-2">
            {weddings.slice(0, 5).map((wedding) => (
              <Link
                key={wedding.id}
                href={`/admin/weddings/${wedding.id}`}
                className="block rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{wedding.couple_name}</p>
                    <p className="text-sm text-muted-foreground">
                      /w/{wedding.slug}
                    </p>
                  </div>
                  <div className="text-sm">
                    {wedding.template_image_url ? (
                      <span className="text-green-600">Template uploaded</span>
                    ) : (
                      <span className="text-muted-foreground">No template</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
