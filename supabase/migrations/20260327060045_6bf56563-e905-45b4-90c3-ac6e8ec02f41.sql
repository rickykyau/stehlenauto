INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', true);

CREATE POLICY "Public read cms-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');

CREATE POLICY "Admins can upload cms-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cms-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update cms-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cms-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete cms-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cms-images' AND public.is_admin(auth.uid()));