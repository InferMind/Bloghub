-- Update likes table to support comment likes
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key;

-- Add comment_id column if it doesn't exist
ALTER TABLE likes ADD COLUMN IF NOT EXISTS comment_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- Add foreign key constraint for post_id
ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Update unique constraint to handle both post and comment likes
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_pkey;
ALTER TABLE likes ADD PRIMARY KEY (id);

-- Create partial unique indexes instead of constraints with WHERE clauses
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_post_unique 
  ON likes (user_id, post_id) 
  WHERE post_id IS NOT NULL;
  
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_comment_unique 
  ON likes (user_id, comment_id) 
  WHERE comment_id IS NOT NULL;

-- Add check constraint to ensure either post_id or comment_id is provided, but not both
-- First drop the constraint if it exists
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_target_check;

-- Then add it
ALTER TABLE likes ADD CONSTRAINT likes_target_check 
  CHECK ((post_id IS NULL) != (comment_id IS NULL));