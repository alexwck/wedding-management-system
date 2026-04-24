import Link from "next/link";
import { getMyWeddingRSVPs } from "@/app/actions/admin";
import { RSVPSection } from "@/components/rsvp-section";
import { ExportButtons } from "@/components/export-buttons";

export default async function RSVPListPage() {
  const result = await getMyWeddingRSVPs();

  if (!result.success || !result.wedding || !result.rsvps || !result.summary) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">RSVPs</h2>
        <p className="text-destructive">
          {result.message || "Failed to load RSVP data."}
        </p>
      </div>
    );
  }

  const { wedding, rsvps, summary } = result;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          RSVPs — {wedding.coupleName}
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {summary.total} response{summary.total !== 1 ? "s" : ""}
          </div>
          <ExportButtons weddingId={wedding.id} />
        </div>
      </div>

      <RSVPSection rsvps={rsvps} title="All RSVP Responses" />

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
