-- Update category post counts to reflect the actual number of published posts
UPDATE categories
SET posts_count = (
  SELECT COUNT(*)
  FROM posts
  WHERE posts.category_id = categories.id
  AND posts.is_published = true
);

-- Create a trigger to automatically update category post counts when posts are added, updated, or deleted
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For inserts and updates
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_published = true THEN
    -- If category changed or new post
    IF (TG_OP = 'INSERT' OR OLD.category_id != NEW.category_id OR OLD.is_published != NEW.is_published) THEN
      -- Increment the new category's count
      UPDATE categories SET posts_count = posts_count + 1 WHERE id = NEW.category_id;
      
      -- If update and category changed or post was unpublished, decrement old category's count
      IF TG_OP = 'UPDATE' AND OLD.is_published = true AND OLD.category_id IS NOT NULL THEN
        UPDATE categories SET posts_count = posts_count - 1 WHERE id = OLD.category_id;
      END IF;
    END IF;
  -- For deletes or unpublishing
  ELSIF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.is_published = true AND NEW.is_published = false)) AND OLD.category_id IS NOT NULL THEN
    -- Decrement the category's count
    UPDATE categories SET posts_count = posts_count - 1 WHERE id = OLD.category_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS posts_category_count_trigger ON posts;

-- Create the trigger
CREATE TRIGGER posts_category_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_category_post_count();