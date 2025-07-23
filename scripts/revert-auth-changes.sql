-- Drop the triggers that were created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Drop the functions that were created
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_oauth_user();

-- Note: This script only removes the triggers and functions.
-- It does not affect any user data that was already created.