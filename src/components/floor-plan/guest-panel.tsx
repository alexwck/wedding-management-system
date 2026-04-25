"use client";

import { useState, useMemo } from "react";
import type { UnassignedGuest, SeatAssignmentMap } from "@/types/seat-assignment";
import type { FloorPlanItem } from "@/types/floor-plan";
import { isTableType } from "@/lib/floor-plan/constants";
import { CanvasStats } from "./canvas-stats";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GuestPanelProps {
  unassignedGuests: UnassignedGuest[];
  assignmentMap: SeatAssignmentMap;
  items: FloorPlanItem[];
  isLoading: boolean;
}

interface AssignedGuestEntry {
  guestName: string;
  tableNumber: number;
  tableLabel: string;
}

function deriveTableNumbers(items: FloorPlanItem[]): Map<string, number> {
  const tableItems = items.filter((item) => isTableType(item.type));
  const map = new Map<string, number>();
  tableItems.forEach((table, index) => {
    map.set(table.id, index + 1);
  });
  return map;
}

function getAssignedGuests(
  assignmentMap: SeatAssignmentMap,
  items: FloorPlanItem[],
): AssignedGuestEntry[] {
  const tableNumbers = deriveTableNumbers(items);
  const chairToTable = new Map<string, string>();
  for (const item of items) {
    if (item.type === "chair" && item.parentItemId) {
      chairToTable.set(item.id, item.parentItemId);
    }
  }

  const entries: AssignedGuestEntry[] = [];
  for (const [chairId, assignment] of Object.entries(assignmentMap)) {
    const tableId = chairToTable.get(chairId);
    if (tableId) {
      const tableNum = tableNumbers.get(tableId) ?? 0;
      const tableItem = items.find((i) => i.id === tableId);
      entries.push({
        guestName: assignment.guestName,
        tableNumber: tableNum,
        tableLabel: tableItem?.label ?? `Table ${tableNum}`,
      });
    }
  }

  return entries.sort((a, b) => a.tableNumber - b.tableNumber);
}

export function GuestPanel({
  unassignedGuests,
  assignmentMap,
  items,
  isLoading,
}: GuestPanelProps) {
  const [unassignedOpen, setUnassignedOpen] = useState(true);
  const [assignedOpen, setAssignedOpen] = useState(false);

  const assignedGuests = useMemo(
    () => getAssignedGuests(assignmentMap, items),
    [assignmentMap, items],
  );

  const assignedCount = Object.keys(assignmentMap).length;
  const unassignedCount = unassignedGuests.length;
  const totalGuests = assignedCount + unassignedCount;

  if (isLoading) {
    return (
      <div className="w-56 shrink-0 border-r glass-panel overflow-y-auto">
        <div className="p-3">
          <p className="text-sm text-muted-foreground">Loading guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 shrink-0 border-r glass-panel flex flex-col">
      {/* Canvas stats - always visible at top */}
      <CanvasStats items={items} assignmentMap={assignmentMap} />

      {/* Unassigned section */}
      <Collapsible open={unassignedOpen} onOpenChange={setUnassignedOpen}>
        <CollapsibleTrigger
          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors text-left"
          aria-expanded={unassignedOpen}
          aria-label={`Unassigned guests, ${unassignedCount} guests`}
        >
          <span className="text-sm font-semibold">
            Unassigned ({unassignedCount})
          </span>
          <span className="text-xs text-muted-foreground">
            {unassignedOpen ? "▾" : "▸"}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 max-h-60 overflow-y-auto">
            {unassignedCount === 0 && totalGuests > 0 && (
              <p className="text-xs text-muted-foreground">All guests are seated!</p>
            )}
            {totalGuests === 0 && (
              <p className="text-xs text-muted-foreground">No guests yet</p>
            )}
            {unassignedGuests.length > 0 && (
              <ul className="space-y-1">
                {unassignedGuests.map((guest) => (
                  <li
                    key={guest.id}
                    className="text-sm py-1 px-2 rounded hover:bg-white/20 truncate"
                  >
                    {guest.guestName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Assigned section */}
      <Collapsible open={assignedOpen} onOpenChange={setAssignedOpen}>
        <CollapsibleTrigger
          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors text-left border-t"
          aria-expanded={assignedOpen}
          aria-label={`Assigned guests, ${assignedCount} guests`}
        >
          <span className="text-sm font-semibold">
            Assigned ({assignedCount})
          </span>
          <span className="text-xs text-muted-foreground">
            {assignedOpen ? "▾" : "▸"}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 max-h-60 overflow-y-auto">
            {assignedCount === 0 && (
              <p className="text-xs text-muted-foreground">No guests assigned yet</p>
            )}
            {assignedGuests.length > 0 && (
              <ul className="space-y-1">
                {assignedGuests.map((entry) => (
                  <li
                    key={entry.guestName}
                    className="text-sm py-1 px-2 rounded hover:bg-white/20 truncate"
                  >
                    {entry.guestName} — {entry.tableLabel}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
