"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, MoreHorizontal, Reply, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/lib/types/database"
import { setReplyingTo } from "@/lib/setReplyingTo" // Declare or import the variable here

interface CommentsProps {
  postId: string
}

export function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null) // Declare the variable here
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadComments()
    loadUser()
  }, [postId])

  const loadUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser) {
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      setUser(profile)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:users(*),
          likes:likes(user_id)
        `)
        .eq("post_id", postId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select(`
              *,
              user:users(*),
              likes:likes(user_id)
            `)
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true })

          return {
            ...comment,
            replies: replies || [],
            is_liked: user ? comment.likes?.some((like: any) => like.user_id === user.id) : false,
          }
        }),
      )

      setComments(commentsWithReplies as Comment[])
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      toast({
        title: "Error",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: newComment,
        user_id: user.id,
      })

      if (error) throw error

      setNewComment("")
      await loadComments()

      // Send email notification to post author
      await sendCommentNotification(postId, user.full_name, newComment)

      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) {
      toast({
        title: "Error",
        description: "Please sign in to reply",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: replyContent,
        parent_id: parentId,
        user_id: user.id,
      })

      if (error) throw error

      setReplyContent("")
      setReplyingTo(null)
      await loadComments()

      toast({
        title: "Reply posted!",
        description: "Your reply has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to like comments",
        variant: "destructive",
      })
      return
    }

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("comment_id", commentId).eq("user_id", user.id)
      } else {
        await supabase.from("likes").insert({ comment_id: commentId, user_id: user.id })
      }
      await loadComments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const sendCommentNotification = async (postId: string, commenterName: string, commentContent: string) => {
    try {
      // Get post author
      const { data: post } = await supabase.from("posts").select("author:users(*), title").eq("id", postId).single()

      if (post?.author) {
        // Send email notification
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: post.author.email || post.author.id,
            subject: `New comment on "${post.title}"`,
            html: `
              <h2>New Comment on Your Post</h2>
              <p><strong>${commenterName}</strong> commented on your post "${post.title}":</p>
              <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #666;">
                ${commentContent}
              </blockquote>
              <p><a href="${window.location.origin}/blog/${post.author.username}/${post.slug}" style="color: #3b82f6;">View the comment</a></p>
            `,
          }),
        })
      }
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  return (
    <section className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comments ({comments.length})</h2>
      </div>

      {/* New Comment Form */}
      <Card className="glass-card border-0 mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Textarea
              placeholder={user ? "Share your thoughts..." : "Please sign in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="glass border-white/20 focus:border-blue-400 min-h-[100px]"
              disabled={!user}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isLoading || !newComment.trim() || !user}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            onLike={handleLikeComment}
            onReply={(commentId) => setReplyingTo(commentId)}
            replyingTo={replyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmitReply={handleSubmitReply}
            isLoading={isLoading}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No comments yet</h3>
          <p className="text-gray-600 dark:text-gray-300">Be the first to share your thoughts!</p>
        </div>
      )}
    </section>
  )
}

interface CommentItemProps {
  comment: Comment
  user: any
  onLike: (commentId: string, isLiked: boolean) => void
  onReply: (commentId: string) => void
  replyingTo: string | null
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: (parentId: string) => void
  isLoading: boolean
}

function CommentItem({
  comment,
  user,
  onLike,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isLoading,
}: CommentItemProps) {
  return (
    <Card className="glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.user?.avatar_url || "/placeholder.svg"} alt={comment.user?.full_name} />
            <AvatarFallback>{comment.user?.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">{comment.user?.full_name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{comment.content}</p>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id, comment.is_liked || false)}
                className={`text-gray-500 hover:text-red-500 ${comment.is_liked ? "text-red-500" : ""}`}
                disabled={!user}
              >
                <Heart className={`w-4 h-4 mr-1 ${comment.is_liked ? "fill-current" : ""}`} />
                {comment.likes_count}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="text-gray-500 hover:text-blue-500"
                disabled={!user}
              >
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card">
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="glass border-white/20 focus:border-blue-400"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={isLoading || !replyContent.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? "Posting..." : "Reply"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reply.user?.avatar_url || "/placeholder.svg"} alt={reply.user?.full_name} />
                      <AvatarFallback className="text-xs">{reply.user?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {reply.user?.full_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLike(reply.id, reply.is_liked || false)}
                        className={`text-gray-500 hover:text-red-500 ${reply.is_liked ? "text-red-500" : ""}`}
                        disabled={!user}
                      >
                        <Heart className={`w-3 h-3 mr-1 ${reply.is_liked ? "fill-current" : ""}`} />
                        {reply.likes_count}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
