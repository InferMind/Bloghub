import { createClient } from "@/lib/supabase/client"
import type { Post } from "@/lib/types/database"

const supabase = createClient()

export async function getPosts(
  options: {
    limit?: number
    offset?: number
    category?: string
    author?: string
    featured?: boolean
    search?: string
  } = {},
) {
  let query = supabase
    .from("posts")
    .select(`
      *,
      author:users(*),
      category:categories(*)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (options.category) {
    query = query.eq("category.slug", options.category)
  }

  if (options.author) {
    query = query.eq("author.username", options.author)
  }

  if (options.featured) {
    query = query.eq("is_featured", true)
  }

  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Post[]
}

export async function getPost(slug: string, authorUsername: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(*),
      category:categories(*)
    `)
    .eq("slug", slug)
    .eq("author.username", authorUsername)
    .eq("is_published", true)
    .single()

  if (error) throw error
  return data as Post
}

export async function createPost(post: Partial<Post>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...post,
      author_id: user.id,
      slug: generateSlug(post.title || ""),
      reading_time: calculateReadingTime(post.content || ""),
      published_at: post.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Post
}

export async function updatePost(id: string, updates: Partial<Post>) {
  // Check if the post is being published for the first time
  let publishedAt = undefined;
  if (updates.is_published) {
    const { data: existingPost } = await supabase
      .from("posts")
      .select("published_at, is_published")
      .eq("id", id)
      .single();
      
    if (existingPost && !existingPost.published_at && !existingPost.is_published) {
      publishedAt = new Date().toISOString();
    }
  }
  
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      reading_time: updates.content ? calculateReadingTime(updates.content) : undefined,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Post
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id)

  if (error) throw error
}

export async function likePost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id })

  if (error) throw error
}

export async function unlikePost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error
}

export async function bookmarkPost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id })

  if (error) throw error
}

export async function unbookmarkPost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
