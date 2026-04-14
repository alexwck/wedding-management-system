-- Create rsvps table
CREATE TABLE public.rsvps (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  wedding_id BIGINT NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('attending', 'declining')),
  dietary_notes TEXT CHECK (length(dietary_notes) <= 500),
  is_vegetarian BOOLEAN NOT NULL DEFAULT false,
  needs_baby_chair BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on wedding_id for RSVP lookups
CREATE INDEX idx_rsvps_wedding_id ON public.rsvps(wedding_id);

-- Unique constraint: one RSVP per guest name per wedding (case-insensitive)
CREATE UNIQUE INDEX rsvps_wedding_guest_name_uniq
  ON public.rsvps(wedding_id, LOWER(guest_name));

-- RLS policies
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Couples can read RSVPs for their own wedding
CREATE POLICY "Couples can read own wedding RSVPs"
  ON public.rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = rsvps.wedding_id
      AND weddings.user_id = (select auth.uid())
    )
  );

-- Public can INSERT RSVPs (guests submitting without auth)
CREATE POLICY "Public can submit RSVPs"
  ON public.rsvps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = rsvps.wedding_id
    )
  );
