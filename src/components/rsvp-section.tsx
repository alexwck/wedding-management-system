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
}

export function RSVPSection({ rsvps, title = "RSVP Responses" }: RSVPSectionProps) {
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
