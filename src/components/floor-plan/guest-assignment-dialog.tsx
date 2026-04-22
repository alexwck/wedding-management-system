"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface GuestAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chairItemId: string;
  currentGuestName: string | null;
  unassignedGuests: Array<{ id: number; guestName: string }>;
  onAssign: (rsvpId: number, chairItemId: string, tableItemId: string, guestName: string) => Promise<{ success: boolean; error?: string }>;
  onUnassign: (chairItemId: string) => Promise<{ success: boolean; error?: string }>;
  tableItemId: string;
}

export function GuestAssignmentDialog({
  open,
  onOpenChange,
  chairItemId,
  currentGuestName,
  unassignedGuests,
  onAssign,
  onUnassign,
  tableItemId,
}: GuestAssignmentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const isOccupied = !!currentGuestName;

  async function handleAssign(rsvpId: number, guestName: string) {
    setIsProcessing(true);
    const result = await onAssign(rsvpId, chairItemId, tableItemId, guestName);
    setIsProcessing(false);
    if (result.success) {
      onOpenChange(false);
    }
  }

  async function handleUnassign() {
    setIsProcessing(true);
    const result = await onUnassign(chairItemId);
    setIsProcessing(false);
    if (result.success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isOccupied ? "Seat Assignment" : "Assign Guest"}
          </DialogTitle>
        </DialogHeader>

        {isOccupied && (
          <div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3">
            <div>
              <p className="text-sm text-muted-foreground">Currently seated</p>
              <p className="font-medium">{currentGuestName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnassign}
              disabled={isProcessing}
            >
              Unassign
            </Button>
          </div>
        )}

        <Command className="rounded-lg border border-white/20">
          <CommandInput placeholder="Search guests..." />
          <CommandList>
            <CommandEmpty>
              {unassignedGuests.length === 0
                ? isOccupied
                  ? "All other guests are seated."
                  : "All guests are seated."
                : "No matching guests."}
            </CommandEmpty>
            {unassignedGuests.map((guest) => (
              <CommandItem
                key={guest.id}
                value={guest.guestName}
                onSelect={() => handleAssign(guest.id, guest.guestName)}
                disabled={isProcessing}
              >
                {guest.guestName}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
