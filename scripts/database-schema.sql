-- ✅ Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- ✅ Enum types
create type notification_type as enum ('comment', 'like', 'follow', 'mention');

-- ✅ Users table (extends Supabase auth.users)
create table users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  is_writer boolean default false,
  website_url text,
  twitter_handle text,
  github_handle text,
  linkedin_handle text,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ✅ Categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  color text default '#6366f1',
  icon text,
  posts_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ✅ Posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_image text,
  is_published boolean default false,
  is_featured boolean default false,
  category_id uuid references categories(id),
  read_time integer default 1,
  likes_count integer default 0,
  bookmarks_count integer default 0,
  comments_count integer default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ✅ Likes table
create table likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- ✅ Bookmarks table
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- ✅ Comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ✅ Follows table
create table follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- ✅ Notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id) on delete cascade,
  sender_id uuid references users(id),
  post_id uuid references posts(id),
  comment_id uuid references comments(id),
  type notification_type not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ✅ Tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ✅ Post-Tag pivot (many-to-many)
create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
