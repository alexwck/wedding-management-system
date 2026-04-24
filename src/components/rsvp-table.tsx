"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface RSVPTableProps {
  rsvps: RSVPGuest[];
}

type SortKey = "guestName" | "status" | "createdAt" | "tableName";
type SortDir = "asc" | "desc";

function sortRsvps(rsvps: RSVPGuest[], key: SortKey, dir: SortDir): RSVPGuest[] {
  return [...rsvps].sort((a, b) => {
    let aVal: string = "";
    let bVal: string = "";

    switch (key) {
      case "guestName":
        aVal = a.guestName.toLowerCase();
        bVal = b.guestName.toLowerCase();
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
      case "createdAt":
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
      case "tableName":
        aVal = (a.tableName ?? "\uFFFF").toLowerCase();
        bVal = (b.tableName ?? "\uFFFF").toLowerCase();
        break;
    }

    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-muted-foreground/40">↕</span>;
  return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function RSVPTable({ rsvps }: RSVPTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => sortRsvps(rsvps, sortKey, sortDir), [rsvps, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (rsvps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No RSVPs yet. Share your wedding link with guests!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("guestName")}>
            Guest
            <SortIndicator active={sortKey === "guestName"} dir={sortDir} />
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
            Status
            <SortIndicator active={sortKey === "status"} dir={sortDir} />
          </TableHead>
          <TableHead className="hidden md:table-cell">Dietary Notes</TableHead>
          <TableHead className="hidden sm:table-cell">Vegetarian</TableHead>
          <TableHead className="hidden sm:table-cell">Baby Chair</TableHead>
          <TableHead className="hidden md:table-cell cursor-pointer select-none" onClick={() => handleSort("tableName")}>
            Table
            <SortIndicator active={sortKey === "tableName"} dir={sortDir} />
          </TableHead>
          <TableHead className="hidden md:table-cell">Seat</TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
            Submitted
            <SortIndicator active={sortKey === "createdAt"} dir={sortDir} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((rsvp) => (
          <TableRow key={rsvp.id}>
            <TableCell className="font-medium">{rsvp.guestName}</TableCell>
            <TableCell>
              {rsvp.status === "attending" ? (
                <Badge variant="default">Attending</Badge>
              ) : (
                <Badge variant="destructive">Declining</Badge>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {rsvp.dietaryNotes || "—"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {rsvp.isVegetarian ? "Yes" : "No"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {rsvp.needsBabyChair ? "Yes" : "No"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {rsvp.tableName || "—"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {rsvp.seatLabel || "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
