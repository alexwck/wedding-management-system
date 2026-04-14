"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpSchema, type RSVPFormData } from "@/lib/validations/rsvp";
import { submitRSVP } from "@/app/actions/rsvp";
import { Button } from "@/components/ui/button";

interface RSVPFormProps {
  slug: string;
  coupleName: string;
}

export function RSVPForm({ slug, coupleName }: RSVPFormProps) {
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      guestName: "",
      status: "attending",
      dietaryNotes: "",
      isVegetarian: false,
      needsBabyChair: false,
    },
  });

  async function onSubmit(data: RSVPFormData) {
    setServerMessage(null);

    const result = await submitRSVP({
      slug,
      guestName: data.guestName,
      status: data.status,
      dietaryNotes: data.dietaryNotes,
      isVegetarian: data.isVegetarian,
      needsBabyChair: data.needsBabyChair,
    });

    if (result.success) {
      setServerMessage({ type: "success", text: result.message });
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  }

  if (serverMessage?.type === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Thank You!</h1>
          <p className="text-muted-foreground">{serverMessage.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            RSVP for {coupleName}&apos;s Wedding
          </h1>
        </div>

        {serverMessage?.type === "error" && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="guestName"
              className="text-sm font-medium leading-none"
            >
              Your Name
            </label>
            <input
              id="guestName"
              type="text"
              placeholder="Enter your name"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("guestName")}
            />
            {errors.guestName && (
              <p className="text-sm text-destructive">
                {errors.guestName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium leading-none"
            >
              Status
            </label>
            <select
              id="status"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("status")}
            >
              <option value="attending">Attending</option>
              <option value="declining">Declining</option>
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dietaryNotes"
              className="text-sm font-medium leading-none"
            >
              Dietary Notes
            </label>
            <textarea
              id="dietaryNotes"
              placeholder="Any dietary requirements? (optional)"
              className="flex min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("dietaryNotes")}
            />
            {errors.dietaryNotes && (
              <p className="text-sm text-destructive">
                {errors.dietaryNotes.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isVegetarian"
              type="checkbox"
              className="size-4 rounded border border-input accent-primary"
              {...register("isVegetarian")}
            />
            <label htmlFor="isVegetarian" className="text-sm font-medium leading-none">
              Vegetarian
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="needsBabyChair"
              type="checkbox"
              className="size-4 rounded border border-input accent-primary"
              {...register("needsBabyChair")}
            />
            <label htmlFor="needsBabyChair" className="text-sm font-medium leading-none">
              Baby Chair
            </label>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
