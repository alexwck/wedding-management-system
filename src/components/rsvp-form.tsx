"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpSchema, type RSVPFormData } from "@/lib/validations/rsvp";
import { submitRSVP } from "@/app/actions/rsvp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface RSVPFormProps {
  slug: string;
  coupleName: string;
  isLocked?: boolean;
  initialData?: RSVPFormData;
  onSubmitSuccess?: () => void;
}

export function RSVPForm({ slug, coupleName, isLocked, initialData, onSubmitSuccess }: RSVPFormProps) {
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error" | "network";
    text: string;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: initialData ?? {
      guestName: "",
      status: "attending",
      dietaryNotes: "",
      isVegetarian: false,
      needsBabyChair: false,
    },
  });

  async function onSubmit(data: RSVPFormData) {
    setServerMessage(null);

    if (!navigator.onLine) {
      setServerMessage({
        type: "network",
        text: "You appear to be offline. Please check your connection and try again.",
      });
      return;
    }

    try {
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
        setRetryCount(0);
        onSubmitSuccess?.();
      } else {
        setServerMessage({ type: "error", text: result.message });
      }
    } catch {
      setServerMessage({
        type: "network",
        text: "Connection failed. Your response is preserved. Please try again.",
      });

      // Auto-retry once on first failure
      if (retryCount === 0) {
        setRetryCount((c) => c + 1);
        setTimeout(() => {
          onSubmit(data);
        }, 3000);
      }
    }
  }

  if (isLocked) {
    return (
      <div className="max-w-xl w-full text-center space-y-4 glass-panel rounded-xl p-8">
        <h1 className="text-2xl font-bold text-foreground">RSVP is now closed</h1>
        <p className="text-muted-foreground">
          {coupleName}&apos;s wedding is no longer accepting RSVPs.
        </p>
      </div>
    );
  }

  if (serverMessage?.type === "success") {
    return (
      <div className="max-w-xl w-full text-center space-y-4 glass-panel rounded-xl p-8">
        <h1 className="text-2xl font-bold text-foreground">Thank You!</h1>
        <p className="text-muted-foreground">{serverMessage.text}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full space-y-6 glass-panel rounded-xl p-6">
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

        {serverMessage?.type === "network" && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 space-y-2">
            <p>{serverMessage.text}</p>
            <button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              className="text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              Retry now
            </button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      id="guestName"
                      placeholder="Enter your name"
                      className="min-h-[44px] w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      id="status"
                      className="h-[44px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="attending">Attending</option>
                      <option value="declining">Declining</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      id="dietaryNotes"
                      placeholder="Any dietary requirements? (optional)"
                      className="min-h-[44px] w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVegetarian"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      id="isVegetarian"
                      type="checkbox"
                      className="size-4 rounded border border-input accent-primary"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Vegetarian</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="needsBabyChair"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      id="needsBabyChair"
                      type="checkbox"
                      className="size-4 rounded border border-input accent-primary"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Baby Chair</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full min-h-[44px]">
              {form.formState.isSubmitting ? "Submitting..." : "Submit RSVP"}
            </Button>
          </form>
        </Form>
    </div>
  );
}
