-- Add missing columns to posts table if they don't exist
DO $$
BEGIN
    -- Add views_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count') THEN
        ALTER TABLE posts ADD COLUMN views_count integer DEFAULT 0;
    END IF;

    -- Add likes_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE posts ADD COLUMN likes_count integer DEFAULT 0;
    END IF;

    -- Add bookmarks_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'bookmarks_count') THEN
        ALTER TABLE posts ADD COLUMN bookmarks_count integer DEFAULT 0;
    END IF;

    -- Add comments_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE posts ADD COLUMN comments_count integer DEFAULT 0;
    END IF;

    -- Add read_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'read_time') THEN
        ALTER TABLE posts ADD COLUMN read_time integer DEFAULT 1;
    END IF;
END $$;

-- Update read_time for existing posts based on content length
UPDATE posts
SET read_time = GREATEST(1, CEIL(LENGTH(content)::float / 1000))
WHERE read_time IS NULL OR read_time = 0;