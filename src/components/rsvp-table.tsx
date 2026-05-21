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
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

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

const PAGE_SIZE = 25;

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
        aVal = (a.tableName ?? "￿").toLowerCase();
        bVal = (b.tableName ?? "￿").toLowerCase();
        break;
    }

    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    if (a.id < b.id) return dir === "asc" ? -1 : 1;
    if (a.id > b.id) return dir === "asc" ? 1 : -1;
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return rsvps;
    const q = search.toLowerCase();
    return rsvps.filter(
      (r) =>
        r.guestName.toLowerCase().includes(q) ||
        (r.dietaryNotes ?? "").toLowerCase().includes(q) ||
        (r.tableName ?? "").toLowerCase().includes(q)
    );
  }, [rsvps, search]);

  const sorted = useMemo(() => sortRsvps(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  if (rsvps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No RSVPs yet. Share your wedding link with guests!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search guests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length} guest{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block glass-panel rounded-xl p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none min-w-[120px]" onClick={() => handleSort("guestName")}>
                Guest
                <SortIndicator active={sortKey === "guestName"} dir={sortDir} />
              </TableHead>
              <TableHead className="cursor-pointer select-none min-w-[100px]" onClick={() => handleSort("status")}>
                Status
                <SortIndicator active={sortKey === "status"} dir={sortDir} />
              </TableHead>
              <TableHead className="min-w-[120px] max-w-[300px]">Dietary Notes</TableHead>
              <TableHead className="min-w-[80px]">Vegetarian</TableHead>
              <TableHead className="min-w-[80px]">Baby Chair</TableHead>
              <TableHead className="cursor-pointer select-none min-w-[120px]" onClick={() => handleSort("tableName")}>
                Table
                <SortIndicator active={sortKey === "tableName"} dir={sortDir} />
              </TableHead>
              <TableHead className="min-w-[80px]">Seat</TableHead>
              <TableHead className="cursor-pointer select-none min-w-[100px]" onClick={() => handleSort("createdAt")}>
                Submitted
                <SortIndicator active={sortKey === "createdAt"} dir={sortDir} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((rsvp) => (
              <TableRow key={rsvp.id}>
                <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                <TableCell>
                  {rsvp.status === "attending" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/50 text-emerald-700">Attending</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/50 text-rose-700">Declining</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {rsvp.dietaryNotes || "—"}
                </TableCell>
                <TableCell>{rsvp.isVegetarian ? "Yes" : "No"}</TableCell>
                <TableCell>{rsvp.needsBabyChair ? "Yes" : "No"}</TableCell>
                <TableCell>{rsvp.tableName || "—"}</TableCell>
                <TableCell>{rsvp.seatLabel || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paged.map((rsvp) => (
          <GlassPanel key={rsvp.id} variant="medium" className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{rsvp.guestName}</p>
                <p className="text-xs text-muted-foreground">
                  {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
              {rsvp.status === "attending" ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/50 text-emerald-700">Attending</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/50 text-rose-700">Declining</span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Dietary</dt>
                <dd className="truncate">{rsvp.dietaryNotes || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Table</dt>
                <dd>{rsvp.tableName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Vegetarian</dt>
                <dd>{rsvp.isVegetarian ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Baby Chair</dt>
                <dd>{rsvp.needsBabyChair ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </GlassPanel>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </GlassButton>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </GlassButton>
        </div>
      )}
    </div>
  );
}
