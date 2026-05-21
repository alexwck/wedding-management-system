"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWeddingDetails } from "@/app/actions/admin";
import { searchAddress, type GeocodingResult } from "@/lib/geocoding";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { venueFormSchema, type VenueFormData } from "@/lib/validations/venue";

interface VenueEditorProps {
  weddingId: number;
  initialVenue?: string | null;
  initialAddress?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialWelcomeMessage?: string | null;
}

export function VenueEditor({
  weddingId,
  initialVenue,
  initialAddress,
  initialLat,
  initialLng,
  initialWelcomeMessage,
}: VenueEditorProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [addressStatus, setAddressStatus] = useState<"idle" | "loading" | "no_results" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      venue: initialVenue ?? "",
      venue_address: initialAddress ?? undefined,
      venue_lat: initialLat ?? null,
      venue_lng: initialLng ?? null,
      welcome_message: initialWelcomeMessage ?? undefined,
    },
  });

  const welcomeMessage = form.watch("welcome_message");

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showSuggestions = focused && suggestions.length > 0;

  const handleAddressInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      form.setValue("venue_address", query);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.length < 3) {
        setSuggestions([]);
        setAddressStatus("idle");
        if (!query) {
          form.setValue("venue_lat", null);
          form.setValue("venue_lng", null);
        }
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setAddressStatus("loading");
        const response = await searchAddress(query);
        if (response.ok) {
          setSuggestions(response.results);
          setAddressStatus(response.results.length > 0 ? "idle" : "no_results");
        } else {
          setSuggestions([]);
          setAddressStatus("error");
        }
      }, 1000);
    },
    [form],
  );

  const handleSuggestionSelect = useCallback(
    (result: GeocodingResult) => {
      form.setValue("venue_address", result.display_name);
      form.setValue("venue_lat", parseFloat(result.lat));
      form.setValue("venue_lng", parseFloat(result.lon));
      setSuggestions([]);
      setAddressStatus("idle");
    },
    [form],
  );

  const onSubmit = async (data: VenueFormData) => {
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("weddingId", String(weddingId));
    formData.set("venue", data.venue?.trim() ?? "");
    formData.set("venue_address", data.venue_address?.trim() ?? "");
    formData.set("venue_lat", data.venue_lat != null ? String(data.venue_lat) : "");
    formData.set("venue_lng", data.venue_lng != null ? String(data.venue_lng) : "");
    formData.set("welcome_message", data.welcome_message?.trim() ?? "");

    try {
      const result = await updateWeddingDetails(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Venue details saved!" });
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-1">
          Venue Name
        </label>
        <input
          id="venue"
          type="text"
          maxLength={200}
          className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all placeholder:text-slate-400"
          placeholder="e.g., The Grand Ballroom"
          {...form.register("venue")}
        />
        {form.formState.errors.venue && (
          <p className="text-sm text-rose-600 mt-1 ml-1">{form.formState.errors.venue.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="venue_address" className="block text-sm font-medium text-slate-700 mb-1">
          Address
        </label>
        <input
          id="venue_address"
          type="text"
          maxLength={500}
          className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all placeholder:text-slate-400"
          placeholder="Start typing to search..."
          onChange={handleAddressInput}
          defaultValue={initialAddress ?? ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {addressStatus === "loading" && (
          <p className="text-xs text-slate-500 mt-1">Searching...</p>
        )}
        {addressStatus === "no_results" && !showSuggestions && (
          <p className="text-xs text-slate-500 mt-1">No results found.</p>
        )}
        {addressStatus === "error" && !showSuggestions && (
          <p className="text-xs text-rose-600 mt-1">Unable to search for addresses.</p>
        )}
        {showSuggestions && (
          <ul className="absolute z-10 w-full mt-1 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}-${i}`}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-white/50 transition-colors"
                onMouseDown={() => handleSuggestionSelect(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
        <input type="hidden" {...form.register("venue_lat")} />
        <input type="hidden" {...form.register("venue_lng")} />
      </div>

      <div>
        <label htmlFor="welcome_message" className="block text-sm font-medium text-slate-700 mb-1">
          Welcome Message
        </label>
        <textarea
          id="welcome_message"
          maxLength={500}
          rows={3}
          className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm resize-none outline-hidden focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all placeholder:text-slate-400"
          placeholder="A message for your guests..."
          {...form.register("welcome_message")}
        />
        <p className="text-xs text-slate-500 mt-1">
          {welcomeMessage?.length ?? 0}/500
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-green-600" : "text-rose-600"}`}
        >
          {message.text}
        </p>
      )}

      <GlassButton
        type="submit"
        disabled={saving}
        variant="primary"
        size="sm"
      >
        {saving ? "Saving..." : "Save Venue Details"}
      </GlassButton>
    </form>
  );
}
