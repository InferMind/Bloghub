-- Add published_at column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;

-- Update existing published posts to have a published_at date
UPDATE posts 
SET published_at = created_at 
WHERE is_published = true AND published_at IS NULL;

-- Create a trigger to automatically set published_at when a post is published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_published_at_trigger ON posts;

-- Create the trigger
CREATE TRIGGER set_published_at_trigger
BEFORE UPDATE ON posts
FOR EACH ROW
WHEN (NEW.is_published IS DISTINCT FROM OLD.is_published)
EXECUTE FUNCTION set_published_at();