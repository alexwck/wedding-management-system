"use client";

import { useState, useEffect, useCallback } from "react";
import {
  assignSeat,
  unassignSeat,
  getSeatAssignments,
  getUnassignedGuests,
} from "@/app/actions/seat-assignment";
import type { SeatAssignmentMap } from "@/types/seat-assignment";

interface UnassignedGuest {
  id: number;
  guestName: string;
}

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
      void fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

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

  return {
    assignmentMap,
    unassignedGuests,
    isLoading,
    assignGuest: handleAssign,
    unassignGuest: handleUnassign,
    refresh: fetchAssignments,
  };
}
