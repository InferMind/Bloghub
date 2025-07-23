-- Create a storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the blog-images bucket
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow users to update and delete their own uploads
CREATE POLICY "Users Can Update Their Own Uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND auth.uid() = owner);

CREATE POLICY "Users Can Delete Their Own Uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND auth.uid() = owner);