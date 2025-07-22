import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/lib/types/database"

const supabase = createClient()

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      user:users(*)
    `)
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  if (error) throw error

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    data.map(async (comment) => {
      const { data: replies } = await supabase
        .from("comments")
        .select(`
          *,
          user:users(*)
        `)
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true })

      return { ...comment, replies: replies || [] }
    }),
  )

  return commentsWithReplies as Comment[]
}

export async function createComment(comment: {
  post_id: string
  content: string
  parent_id?: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("comments")
    .insert({
      ...comment,
      user_id: user.id,
    })
    .select(`
      *,
      user:users(*)
    `)
    .single()

  if (error) throw error
  return data as Comment
}

export async function updateComment(id: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      *,
      user:users(*)
    `)
    .single()

  if (error) throw error
  return data as Comment
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id)

  if (error) throw error
}

export async function likeComment(commentId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("likes").insert({ comment_id: commentId, user_id: user.id })

  if (error) throw error
}

export async function unlikeComment(commentId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("likes").delete().eq("comment_id", commentId).eq("user_id", user.id)

  if (error) throw error
}
