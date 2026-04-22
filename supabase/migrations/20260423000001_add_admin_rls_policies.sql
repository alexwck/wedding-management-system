-- Admin RLS policies for seat_assignments (defense-in-depth)
-- Server actions use adminClient (service role) which bypasses RLS,
-- but these policies allow admin access if regular client is ever used.

CREATE POLICY "Admins can view all seat assignments"
  ON public.seat_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert all seat assignments"
  ON public.seat_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all seat assignments"
  ON public.seat_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all seat assignments"
  ON public.seat_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
