"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RSVPTable } from "@/components/rsvp-table";

interface RSVPGuest {
  id: number;
  guestName: string;
  status: "attending" | "declining";
  dietaryNotes: string | null;
  isVegetarian: boolean;
  needsBabyChair: boolean;
  createdAt: string;
  tableName?: string | null;
  seatLabel?: string | null;
}

interface RSVPSectionProps {
  rsvps: RSVPGuest[];
  title?: string;
  summary?: {
    total: number;
    attending: number;
    declining: number;
    vegetarian: number;
    babyChairs: number;
  };
}

const SUMMARY_CARDS = [
  { key: "total" as const, label: "Total", color: "" },
  { key: "attending" as const, label: "Attending", color: "text-green-600" },
  { key: "declining" as const, label: "Declining", color: "text-red-600" },
  { key: "vegetarian" as const, label: "Vegetarian", color: "" },
  { key: "babyChairs" as const, label: "Baby Chairs", color: "" },
];

export function RSVPSection({ rsvps, title = "RSVP Responses", summary }: RSVPSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <h3 className="text-lg font-semibold">
          {title} ({rsvps.length})
        </h3>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {summary && (
        <div className="px-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SUMMARY_CARDS.map(({ key, label, color }) => (
              <div key={key} className="glass-panel rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{summary[key]}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-4 max-h-[600px] overflow-y-auto">
          {rsvps.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No RSVP responses yet
            </p>
          ) : (
            <RSVPTable rsvps={rsvps} />
          )}
        </div>
      )}
    </div>
  );
}
