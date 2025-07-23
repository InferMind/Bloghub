-- Add is_writer field to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_writer BOOLEAN DEFAULT false;

-- Create triggers to update followers_count and following_count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- For inserts
  IF (TG_OP = 'INSERT') THEN
    -- Increment followers_count for the user being followed
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    -- Increment following_count for the follower
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  -- For deletes
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement followers_count for the user being unfollowed
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    -- Decrement following_count for the follower
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS follow_count_trigger ON follows;

-- Create the trigger
CREATE TRIGGER follow_count_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();

-- Create a policy to allow only writers to create posts
CREATE POLICY "Only writers can create posts" 
ON posts FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_writer = true
  )
);

-- Create a policy to allow writers to update their own posts
CREATE POLICY "Writers can update their own posts" 
ON posts FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = author_id AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_writer = true
  )
);

-- Create a policy to allow writers to delete their own posts
CREATE POLICY "Writers can delete their own posts" 
ON posts FOR DELETE 
TO authenticated 
USING (
  auth.uid() = author_id AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_writer = true
  )
);