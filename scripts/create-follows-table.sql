-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Add followers_count and following_count columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows table
CREATE POLICY "Users can see who they follow and who follows them" 
ON follows FOR SELECT 
TO authenticated 
USING (
  follower_id = auth.uid() OR 
  following_id = auth.uid()
);

CREATE POLICY "Users can follow others" 
ON follows FOR INSERT 
TO authenticated 
WITH CHECK (
  follower_id = auth.uid()
);

CREATE POLICY "Users can unfollow others" 
ON follows FOR DELETE 
TO authenticated 
USING (
  follower_id = auth.uid()
);