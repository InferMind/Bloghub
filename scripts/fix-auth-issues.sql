-- Create a function to handle user authentication and profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user already has a profile
  IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
    -- User already has a profile, do nothing
    RETURN NEW;
  END IF;
  
  -- Create a new user profile
  INSERT INTO users (
    id,
    full_name,
    username,
    avatar_url,
    is_writer,
    followers_count,
    following_count,
    posts_count,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || floor(random() * 1000)::text),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_writer')::boolean, false),
    0,
    0,
    0,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Create a function to handle OAuth sign-ins
CREATE OR REPLACE FUNCTION handle_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user already has a profile
  IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
    -- User already has a profile, update it with OAuth data if needed
    UPDATE users
    SET 
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', users.avatar_url),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', users.full_name),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;
  
  -- Create a new user profile for OAuth users
  INSERT INTO users (
    id,
    full_name,
    username,
    avatar_url,
    is_writer,
    followers_count,
    following_count,
    posts_count,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || floor(random() * 1000)::text),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    false, -- Default OAuth users to readers
    0,
    0,
    0,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create the trigger for OAuth updates
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION handle_oauth_user();