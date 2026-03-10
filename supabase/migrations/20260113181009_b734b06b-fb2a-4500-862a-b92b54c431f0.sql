-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view tour images (public bucket)
CREATE POLICY "Tour images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tour-images');

-- Allow admins to upload tour images
CREATE POLICY "Admins can upload tour images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tour-images' 
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  )
);

-- Allow admins to update tour images
CREATE POLICY "Admins can update tour images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'tour-images' 
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  )
);

-- Allow admins to delete tour images
CREATE POLICY "Admins can delete tour images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'tour-images' 
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  )
);