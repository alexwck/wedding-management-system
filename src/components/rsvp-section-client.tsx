"use client";

import { useState, useRef, useEffect } from "react";
import { RSVPForm } from "@/components/rsvp-form";
import { RsvpConfirmationCard } from "@/components/rsvp-confirmation-card";

interface RSVPSectionClientProps {
  slug: string;
  coupleName: string;
  isLocked?: boolean;
  existingRsvp: {
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
  } | null;
}

export function RSVPSectionClient({
  slug,
  coupleName,
  isLocked,
  existingRsvp,
}: RSVPSectionClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && formRef.current) {
      const firstInput = formRef.current.querySelector("input, select, textarea");
      if (firstInput instanceof HTMLElement) {
        firstInput.focus();
      }
    }
  }, [isEditing]);

  if (existingRsvp && !isEditing) {
    return (
      <RsvpConfirmationCard
        rsvp={existingRsvp}
        onEdit={() => setIsEditing(true)}
        isLocked={isLocked}
      />
    );
  }

  return (
    <div ref={formRef}>
      <RSVPForm
        slug={slug}
        coupleName={coupleName}
        isLocked={isLocked}
        initialData={
          existingRsvp
            ? {
                guestName: existingRsvp.guest_name,
                status: existingRsvp.status as "attending" | "declining",
                dietaryNotes: existingRsvp.dietary_notes ?? "",
                isVegetarian: existingRsvp.is_vegetarian,
                needsBabyChair: existingRsvp.needs_baby_chair,
              }
            : undefined
        }
        onSubmitSuccess={() => setIsEditing(false)}
      />
    </div>
  );
}
