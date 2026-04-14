-- Storage policies for wedding-templates bucket

-- Public read: anyone can view template images
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wedding-templates');

-- Admin upload: authenticated users with admin role can upload
CREATE POLICY "Admin can upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-templates'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin can update/replace images
CREATE POLICY "Admin can update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'wedding-templates'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
