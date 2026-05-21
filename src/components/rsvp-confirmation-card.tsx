"use client";

import { GlassPanel } from "@/components/glassmorphism/glass-panel";
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
    <GlassPanel className="p-8 md:p-10 space-y-4 text-center" variant="strong">
      <h2 className="text-2xl font-serif text-slate-800">Your RSVP</h2>
      <div className="space-y-2 text-sm text-slate-500">
        <p><span className="font-medium text-slate-800">Name:</span> {rsvp.guest_name}</p>
        <p><span className="font-medium text-slate-800">Status:</span> {rsvp.status === "attending" ? "Attending" : "Declining"}</p>
        {rsvp.dietary_notes && <p><span className="font-medium text-slate-800">Dietary:</span> {rsvp.dietary_notes}</p>}
        {rsvp.is_vegetarian && <p className="text-emerald-600">Vegetarian</p>}
        {rsvp.needs_baby_chair && <p className="text-blue-600">Baby chair requested</p>}
      </div>
      {!isLocked && (
        <GlassButton variant="secondary" onClick={onEdit} className="w-full mt-4">
          Edit RSVP
        </GlassButton>
      )}
    </GlassPanel>
  );
}
