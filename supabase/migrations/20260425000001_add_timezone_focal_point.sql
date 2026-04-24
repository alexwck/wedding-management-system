ALTER TABLE public.weddings
  ADD COLUMN timezone TEXT DEFAULT 'Asia/Kuala_Lumpur',
  ADD COLUMN template_focal_x DECIMAL(5,2),
  ADD COLUMN template_focal_y DECIMAL(5,2);

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_focal_x_range CHECK (template_focal_x IS NULL OR (template_focal_x >= 0 AND template_focal_x <= 100)),
  ADD CONSTRAINT weddings_focal_y_range CHECK (template_focal_y IS NULL OR (template_focal_y >= 0 AND template_focal_y <= 100));
