import Link from "next/link";
import { getMyWeddingRSVPs } from "@/app/actions/admin";
import { RSVPTable } from "@/components/rsvp-table";

export default async function RSVPListPage() {
  const result = await getMyWeddingRSVPs();

  if (!result.success || !result.wedding || !result.rsvps || !result.summary) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">RSVPs</h2>
        <p className="text-destructive">
          {result.message || "Failed to load RSVP data."}
        </p>
      </div>
    );
  }

  const { wedding, rsvps, summary } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          RSVPs — {wedding.coupleName}
        </h2>
        <div className="text-sm text-muted-foreground">
          {summary.total} response{summary.total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <RSVPTable rsvps={rsvps} />
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
