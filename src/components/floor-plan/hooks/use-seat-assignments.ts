"use client";

import { useState, useEffect, useCallback } from "react";
import {
  assignSeat,
  unassignSeat,
  getSeatAssignments,
  getUnassignedGuests,
} from "@/app/actions/seat-assignment";
import type { SeatAssignmentMap, UnassignedGuest } from "@/types/seat-assignment";
import type { FloorPlanItem } from "@/types/floor-plan";

export function useSeatAssignments(weddingId: number) {
  const [assignmentMap, setAssignmentMap] = useState<SeatAssignmentMap>({});
  const [unassignedGuests, setUnassignedGuests] = useState<UnassignedGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    const [assignmentsResult, guestsResult] = await Promise.all([
      getSeatAssignments(weddingId),
      getUnassignedGuests(weddingId),
    ]);

    if (assignmentsResult.success) {
      const map: SeatAssignmentMap = {};
      for (const a of assignmentsResult.assignments) {
        map[a.chairItemId] = { guestName: a.guestName, rsvpId: a.rsvpId };
      }
      setAssignmentMap(map);
    }

    if (guestsResult.success) {
      setUnassignedGuests(guestsResult.guests);
    }

    setIsLoading(false);
  }, [weddingId]);

  useEffect(() => {
    if (weddingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect, not derived state
      void fetchAssignments();
    }
  }, [weddingId, fetchAssignments]);

  const handleAssign = useCallback(
    async (rsvpId: number, chairItemId: string, tableItemId: string, guestName: string) => {
      setAssignmentMap((prev) => ({ ...prev, [chairItemId]: { guestName, rsvpId } }));
      setUnassignedGuests((prev) => prev.filter((g) => g.id !== rsvpId));

      const result = await assignSeat({ weddingId, rsvpId, chairItemId, tableItemId });

      if (!result.success) {
        await fetchAssignments();
      }

      return result;
    },
    [weddingId, fetchAssignments],
  );

  const handleUnassign = useCallback(
    async (chairItemId: string) => {
      const assignment = assignmentMap[chairItemId];
      if (!assignment) return { success: false as const, error: "No assignment found." };

      setAssignmentMap((prev) => {
        const next = { ...prev };
        delete next[chairItemId];
        return next;
      });
      setUnassignedGuests((prev) => [...prev, { id: assignment.rsvpId, guestName: assignment.guestName }]);

      const result = await unassignSeat({ weddingId, chairItemId });

      if (!result.success) {
        await fetchAssignments();
      }

      return result;
    },
    [weddingId, assignmentMap, fetchAssignments],
  );

  const restoreAssignments = useCallback(
    async (newMap: SeatAssignmentMap, newGuests: UnassignedGuest[], items: FloorPlanItem[]) => {
      const oldMap = structuredClone(assignmentMap);

      setAssignmentMap(newMap);
      setUnassignedGuests(newGuests);

      const oldKeys = new Set(Object.keys(oldMap));
      const newKeys = new Set(Object.keys(newMap));

      const unassignPromises: Promise<void>[] = [];
      const assignPromises: Promise<void>[] = [];

      for (const chairId of oldKeys) {
        if (!newKeys.has(chairId)) {
          unassignPromises.push(
            unassignSeat({ weddingId, chairItemId: chairId }).then((r) => { if (!r.success) throw new Error(); }).catch(() => {}),
          );
        }
      }

      for (const chairId of newKeys) {
        const newEntry = newMap[chairId];
        const oldEntry = oldMap[chairId];
        if (!oldKeys.has(chairId) || (oldEntry && oldEntry.rsvpId !== newEntry.rsvpId)) {
          const chair = items.find((i) => i.id === chairId);
          const tableItemId = chair?.parentItemId ?? "";
          if (oldEntry) {
            unassignPromises.push(
              unassignSeat({ weddingId, chairItemId: chairId }).then((r) => { if (!r.success) throw new Error(); }).catch(() => {}),
            );
          }
          assignPromises.push(
            assignSeat({ weddingId, rsvpId: newEntry.rsvpId, chairItemId: chairId, tableItemId }).then((r) => { if (!r.success) throw new Error(); }).catch(() => {}),
          );
        }
      }

      await Promise.all(unassignPromises);
      await Promise.all(assignPromises);
    },
    [weddingId, assignmentMap, fetchAssignments],
  );

  return {
    assignmentMap,
    unassignedGuests,
    isLoading,
    assignGuest: handleAssign,
    unassignGuest: handleUnassign,
    restoreAssignments,
    refresh: fetchAssignments,
  };
}
