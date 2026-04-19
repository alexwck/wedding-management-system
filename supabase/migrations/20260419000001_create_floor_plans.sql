-- Create floor_plans table
CREATE TABLE public.floor_plans (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  wedding_id BIGINT UNIQUE NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  width DECIMAL(8,2) NOT NULL CHECK (width > 0 AND width <= 300),
  height DECIMAL(8,2) NOT NULL CHECK (height > 0 AND height <= 300),
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on wedding_id for fast lookups
CREATE UNIQUE INDEX idx_floor_plans_wedding_id ON public.floor_plans(wedding_id);

-- GIN index on items for future JSON queries
CREATE INDEX idx_floor_plans_items ON public.floor_plans USING GIN (items);

-- RLS
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Couples can view/update their own wedding's floor plan
CREATE POLICY "Couples can view own floor plan"
  ON public.floor_plans
  FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Couples can update own floor plan"
  ON public.floor_plans
  FOR UPDATE
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Couples can insert own floor plan"
  ON public.floor_plans
  FOR INSERT
  WITH CHECK (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

-- Auto-update updated_at trigger (reuses existing handle_updated_at function)
CREATE TRIGGER set_floor_plan_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
