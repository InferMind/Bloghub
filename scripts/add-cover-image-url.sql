-- Add cover_image_url column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Copy data from cover_image column to cover_image_url if it exists
UPDATE posts
SET cover_image_url = cover_image
WHERE cover_image IS NOT NULL AND cover_image_url IS NULL;

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';