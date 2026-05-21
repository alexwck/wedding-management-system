"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpSchema, type RSVPFormData } from "@/lib/validations/rsvp";
import { submitRSVP } from "@/app/actions/rsvp";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassInput } from "@/components/glassmorphism/glass-input";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { motion } from "motion/react";
import { Leaf, Baby } from "lucide-react";

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
      <GlassPanel className="p-8 md:p-10 text-center" variant="medium">
        <h1 className="text-2xl font-serif text-slate-800">RSVP is now closed</h1>
        <p className="text-slate-500 mt-2">
          {coupleName}&apos;s wedding is no longer accepting RSVPs.
        </p>
      </GlassPanel>
    );
  }

  if (serverMessage?.type === "success") {
    return (
      <GlassPanel className="p-8 md:p-10 text-center" variant="medium">
        <h1 className="text-2xl font-serif text-slate-800">Thank You!</h1>
        <p className="text-slate-500 mt-2">{serverMessage.text}</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="medium" className="p-8 md:p-10 flex flex-col gap-6" delay={0.3}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-2xl font-serif text-slate-800 mb-6">
          RSVP for {coupleName}&apos;s Wedding
        </h1>

        {serverMessage?.type === "error" && (
          <div className="rounded-2xl border border-rose-400/50 bg-rose-100/20 p-3 text-sm text-rose-600">
            {serverMessage.text}
          </div>
        )}

        {serverMessage?.type === "network" && (
          <div className="rounded-2xl border border-amber-400/50 bg-amber-100/20 p-3 text-sm text-amber-700 space-y-2">
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <GlassInput
                label="Your Name"
                placeholder="Your Name"
                id="guestName"
                {...form.register("guestName")}
              />
              {form.formState.errors.guestName && (
                <p className="text-sm text-rose-600 mt-1 ml-1">{form.formState.errors.guestName.message}</p>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label htmlFor="status" className="text-sm font-medium text-slate-600 ml-1">Status</label>
              <select
                id="status"
                className="w-full bg-white/40 border border-white/40 rounded-2xl px-4 py-3 outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all duration-300"
                {...form.register("status")}
              >
                <option value="attending">Attending</option>
                <option value="declining">Declining</option>
              </select>
              {form.formState.errors.status && (
                <p className="text-sm text-rose-600 mt-1 ml-1">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dietaryNotes" className="text-sm font-medium text-slate-600 ml-1">Dietary Notes</label>
            <textarea
              id="dietaryNotes"
              className="w-full bg-white/40 border border-white/40 rounded-2xl px-4 py-3 outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all duration-300 placeholder:text-slate-400 min-h-[100px]"
              placeholder="Allergies? Preferences?"
              {...form.register("dietaryNotes")}
            />
          </div>

          <div className="flex gap-6">
            <Controller
              name="isVegetarian"
              control={form.control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border border-white/40 flex items-center justify-center transition-all active:scale-95 ${field.value ? 'bg-emerald-400' : 'bg-white/20'}`}>
                    {field.value && <Leaf size={12} className="text-white" />}
                  </div>
                  <input
                    id="isVegetarian"
                    type="checkbox"
                    className="hidden"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Vegetarian</span>
                </label>
              )}
            />

            <Controller
              name="needsBabyChair"
              control={form.control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border border-white/40 flex items-center justify-center transition-all active:scale-95 ${field.value ? 'bg-blue-400' : 'bg-white/20'}`}>
                    {field.value && <Baby size={12} className="text-white" />}
                  </div>
                  <input
                    id="needsBabyChair"
                    type="checkbox"
                    className="hidden"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Baby Chair</span>
                </label>
              )}
            />
          </div>

          <GlassButton
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full mt-4 h-14 text-lg"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit RSVP"}
          </GlassButton>
        </form>
      </motion.div>
    </GlassPanel>
  );
}
