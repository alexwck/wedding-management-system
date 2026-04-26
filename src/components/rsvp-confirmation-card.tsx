"use client";

import { GlassCard } from "@/components/glassmorphism/glass-card";
import { GlassButton } from "@/components/glassmorphism/glass-button";

export interface RsvpConfirmationCardProps {
  rsvp: {
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
  };
  onEdit: () => void;
  isLocked?: boolean;
}

export function RsvpConfirmationCard({ rsvp, onEdit, isLocked }: RsvpConfirmationCardProps) {
  return (
    <GlassCard className="max-w-xl w-full p-8 space-y-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">Your RSVP</h2>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground">Name:</span> {rsvp.guest_name}</p>
        <p><span className="font-medium text-foreground">Status:</span> {rsvp.status === "attending" ? "Attending" : "Declining"}</p>
        {rsvp.dietary_notes && <p><span className="font-medium text-foreground">Dietary:</span> {rsvp.dietary_notes}</p>}
        {rsvp.is_vegetarian && <p>Vegetarian</p>}
        {rsvp.needs_baby_chair && <p>Baby chair requested</p>}
      </div>
      {!isLocked && (
        <GlassButton variant="secondary" onClick={onEdit} className="w-full">
          Edit RSVP
        </GlassButton>
      )}
    </GlassCard>
  );
}
