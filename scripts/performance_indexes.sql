-- Recommended indexes to speed up common queries

-- Posts filtering and sorting
create index if not exists idx_posts_is_published_created_at on posts (is_published, created_at desc);
create index if not exists idx_posts_is_published_views on posts (is_published, views_count desc);
create index if not exists idx_posts_is_published_likes on posts (is_published, likes_count desc);
create index if not exists idx_posts_author_id_created on posts (author_id, created_at desc);
create index if not exists idx_posts_slug on posts (slug);
create index if not exists idx_posts_category on posts (category_id);

-- Categories by slug
create index if not exists idx_categories_slug on categories (slug);

-- Users by username
create index if not exists idx_users_username on users (username);

-- Bookmarks by user and created_at
create index if not exists idx_bookmarks_user_created on bookmarks (user_id, created_at desc);

-- Follows by follower
create index if not exists idx_follows_follower on follows (follower_id, created_at desc);