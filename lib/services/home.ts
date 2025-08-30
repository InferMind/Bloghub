import { createClient } from "@/lib/supabase/server"
import type { Post, User, Category } from "@/lib/types/database"

export async function getTrendingPosts(limit = 3) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image_url, reading_time, published_at, created_at,
      likes_count, comments_count, views_count,
      author:users(id, full_name, username, avatar_url),
      category:categories(id, name, slug, color)
    `)
    .eq("is_published", true)
    .order("views_count", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching trending posts:", error)
    return []
  }
  
  return data as Post[]
}

export async function getRecentPosts(limit = 6) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image_url, reading_time, published_at, created_at,
      likes_count, comments_count, views_count,
      author:users(id, full_name, username, avatar_url),
      category:categories(id, name, slug, color)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching recent posts:", error)
    return []
  }
  
  return data as Post[]
}

export async function getCategories(limit = 8) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, color, posts_count")
    .order("posts_count", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  
  return data as Category[]
}

export async function getFeaturedAuthors(limit = 4) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, username, avatar_url, followers_count, posts_count, is_writer")
    .eq("is_writer", true)
    .order("followers_count", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching featured authors:", error)
    return []
  }
  
  return data as User[]
}