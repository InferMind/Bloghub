import { createClient } from "@/lib/supabase/server"
import type { Post, User, Category } from "@/lib/types/database"

export async function getTrendingPosts(limit = 3) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(*),
      category:categories(*)
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
      *,
      author:users(*),
      category:categories(*)
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
    .select("*")
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
    .select("*")
    .eq("is_writer", true)
    .order("followers_count", { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error("Error fetching featured authors:", error)
    return []
  }
  
  return data as User[]
}