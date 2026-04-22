-- Create seat_assignments table
CREATE TABLE public.seat_assignments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  wedding_id BIGINT NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  rsvp_id BIGINT NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  chair_item_id TEXT NOT NULL,
  table_item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One seat per guest
ALTER TABLE public.seat_assignments ADD CONSTRAINT seat_assignments_rsvp_id_unique UNIQUE (rsvp_id);

-- One guest per seat (per wedding)
ALTER TABLE public.seat_assignments ADD CONSTRAINT seat_assignments_wedding_chair_unique UNIQUE (wedding_id, chair_item_id);

-- Indexes
CREATE INDEX idx_seat_assignments_wedding ON public.seat_assignments (wedding_id);
CREATE INDEX idx_seat_assignments_table ON public.seat_assignments (wedding_id, table_item_id);

-- RLS
ALTER TABLE public.seat_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can view own seat assignments"
  ON public.seat_assignments
  FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Couples can insert own seat assignments"
  ON public.seat_assignments
  FOR INSERT
  WITH CHECK (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Couples can update own seat assignments"
  ON public.seat_assignments
  FOR UPDATE
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Couples can delete own seat assignments"
  ON public.seat_assignments
  FOR DELETE
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

-- Auto-update updated_at trigger
CREATE TRIGGER set_seat_assignment_updated_at
  BEFORE UPDATE ON public.seat_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
