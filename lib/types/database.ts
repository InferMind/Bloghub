export interface User {
  id: string
  full_name: string
  username: string
  avatar_url?: string
  bio?: string
  is_writer: boolean
  website_url?: string
  twitter_handle?: string
  github_handle?: string
  linkedin_handle?: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image_url?: string
  author_id: string
  category_id?: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  reading_time: number
  views_count: number
  likes_count: number
  comments_count: number
  bookmarks_count: number
  published_at?: string
  created_at: string
  updated_at: string
  author?: User
  category?: Category
  is_liked?: boolean
  is_bookmarked?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  likes_count: number
  replies_count: number
  created_at: string
  updated_at: string
  user?: User
  replies?: Comment[]
  is_liked?: boolean
}

export interface Like {
  id: string
  post_id?: string
  comment_id?: string
  user_id: string
  created_at: string
}

export interface Bookmark {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "comment" | "like" | "follow" | "mention"
  title: string
  message?: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
}
