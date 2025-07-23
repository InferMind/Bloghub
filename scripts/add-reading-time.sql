-- Add reading_time column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reading_time integer DEFAULT 1;

-- Copy data from read_time column to reading_time if it exists
UPDATE posts
SET reading_time = read_time
WHERE read_time IS NOT NULL AND reading_time IS NULL;

-- Calculate reading time for posts that don't have it set
-- Assuming 200 words per minute reading speed
UPDATE posts
SET reading_time = GREATEST(1, CEIL((LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1) / 200))
WHERE reading_time IS NULL OR reading_time = 1;

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';