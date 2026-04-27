"use client";

import Link from "next/link";
import { ResponsiveTable } from "@/components/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Lock, LockOpen } from "lucide-react";

interface WeddingRow {
  id: number;
  slug: string;
  couple_name: string;
  template_image_url: string | null;
  wedding_date: string | null;
  is_locked: boolean;
  rsvpCount: number;
}

interface WeddingListTableProps {
  weddings: WeddingRow[];
}

export function WeddingListTable({ weddings }: WeddingListTableProps) {
  return (
    <ResponsiveTable<WeddingRow>
      data={weddings}
      keyExtractor={(w) => String(w.id)}
      emptyMessage="No weddings found."
      columns={[
        {
          key: "couple",
          header: "Couple Name",
          cell: (w) => (
            <Link
              href={`/admin/weddings/${w.id}`}
              className="font-medium hover:underline text-primary"
            >
              {w.couple_name}
            </Link>
          ),
        },
        {
          key: "date",
          header: "Wedding Date",
          cell: (w) =>
            w.wedding_date
              ? new Date(w.wedding_date).toLocaleDateString()
              : "Not set",
        },
        {
          key: "rsvps",
          header: "RSVPs",
          cell: (w) => (
            <Badge variant={w.rsvpCount > 0 ? "default" : "secondary"}>
              {w.rsvpCount}
            </Badge>
          ),
        },
        {
          key: "status",
          header: "Status",
          cell: (w) =>
            w.is_locked ? (
              <span className="inline-flex items-center gap-1 text-xs text-destructive">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <LockOpen className="h-3 w-3" />
                Open
              </span>
            ),
        },
        {
          key: "template",
          header: "Template",
          cell: (w) =>
            w.template_image_url ? (
              <Badge variant="default">Uploaded</Badge>
            ) : (
              <Badge variant="secondary">Missing</Badge>
            ),
        },
      ]}
    />
  );
}
