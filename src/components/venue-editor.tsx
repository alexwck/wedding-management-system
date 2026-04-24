"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateWeddingDetails } from "@/app/actions/admin";
import { searchAddress, type GeocodingResult } from "@/lib/geocoding";

interface VenueEditorProps {
  weddingId: number;
  initialVenue?: string | null;
  initialAddress?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialWelcomeMessage?: string | null;
}

interface VenueFormValues {
  venue: string;
  venue_address: string;
  venue_lat: number | null;
  venue_lng: number | null;
  welcome_message: string;
}

type AddressStatus = "idle" | "loading" | "no_results" | "error";

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
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, setValue, watch, handleSubmit } = useForm<VenueFormValues>({
    defaultValues: {
      venue: initialVenue ?? "",
      venue_address: initialAddress ?? "",
      venue_lat: initialLat ?? null,
      venue_lng: initialLng ?? null,
      welcome_message: initialWelcomeMessage ?? "",
    },
  });

  const welcomeMessage = watch("welcome_message");

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showSuggestions = focused && suggestions.length > 0;

  const handleAddressInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setValue("venue_address", query);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.length < 3) {
        setSuggestions([]);
        setAddressStatus("idle");
        if (!query) {
          setValue("venue_lat", null);
          setValue("venue_lng", null);
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
    [setValue],
  );

  const handleSuggestionSelect = useCallback(
    (result: GeocodingResult) => {
      setValue("venue_address", result.display_name);
      setValue("venue_lat", parseFloat(result.lat));
      setValue("venue_lng", parseFloat(result.lon));
      setSuggestions([]);
      setAddressStatus("idle");
    },
    [setValue],
  );

  const onSubmit = async (data: VenueFormValues) => {
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("weddingId", String(weddingId));
    formData.set("venue", data.venue.trim());
    formData.set("venue_address", data.venue_address.trim());
    if (data.venue_lat != null) formData.set("venue_lat", String(data.venue_lat));
    if (data.venue_lng != null) formData.set("venue_lng", String(data.venue_lng));
    formData.set("welcome_message", data.welcome_message.trim());

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
    <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold">Venue Details</h3>

      <div>
        <label htmlFor="venue" className="block text-sm font-medium mb-1">
          Venue Name
        </label>
        <input
          id="venue"
          type="text"
          maxLength={200}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="e.g., The Grand Ballroom"
          {...register("venue")}
        />
      </div>

      <div className="relative">
        <label htmlFor="venue_address" className="block text-sm font-medium mb-1">
          Address
        </label>
        <input
          id="venue_address"
          type="text"
          maxLength={500}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Start typing to search..."
          onChange={handleAddressInput}
          defaultValue={initialAddress ?? ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {addressStatus === "loading" && (
          <p className="text-xs text-muted-foreground mt-1">Searching...</p>
        )}
        {addressStatus === "no_results" && !showSuggestions && (
          <p className="text-xs text-muted-foreground mt-1">No results found.</p>
        )}
        {addressStatus === "error" && !showSuggestions && (
          <p className="text-xs text-destructive mt-1">Unable to search for addresses.</p>
        )}
        {showSuggestions && (
          <ul className="absolute z-10 w-full mt-1 glass-panel rounded-md border border-input max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}-${i}`}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent/50"
                onMouseDown={() => handleSuggestionSelect(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
        <input type="hidden" {...register("venue_lat")} />
        <input type="hidden" {...register("venue_lng")} />
      </div>

      <div>
        <label htmlFor="welcome_message" className="block text-sm font-medium mb-1">
          Welcome Message
        </label>
        <textarea
          id="welcome_message"
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="A message for your guests..."
          {...register("welcome_message")}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {welcomeMessage?.length ?? 0}/500
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Venue Details"}
      </button>
    </form>
  );
}
