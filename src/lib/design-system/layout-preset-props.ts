export interface LayoutPresetProps {
  wedding: {
    id: number;
    slug: string;
    couple_name: string;
    template_image_url: string | null;
    wedding_date: string | null;
    timezone: string | null;
    venue_name: string | null;
    venue_address: string | null;
    venue_lat: number | null;
    venue_lng: number | null;
    welcome_message: string | null;
    layout_preset: string;
    theme_json: Record<string, unknown> | null;
    is_locked: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    glassBlurRadius: number;
    borderOpacity: number;
    borderRadius: string;
    fontFamily: "sans" | "serif";
  };
  rsvpState?: {
    id: number;
    guest_name: string;
    status: string;
    dietary_notes: string | null;
    is_vegetarian: boolean;
    needs_baby_chair: boolean;
  } | null;
}

export type { PresetName } from "./preset-loader";
