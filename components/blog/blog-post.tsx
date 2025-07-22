"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Heart, Bookmark, Share2, Clock, Eye, Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Post } from "@/lib/types/database"

interface BlogPostProps {
  post: Post
}

export function BlogPost({ post }: BlogPostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count)
  const [readingProgress, setReadingProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadUser()
    const handleScroll = () => {
      const article = document.getElementById("article-content")
      if (!article) return

      const articleTop = article.offsetTop
      const articleHeight = article.offsetHeight
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY

      const progress = Math.min(Math.max((scrollTop - articleTop + windowHeight / 2) / articleHeight, 0), 1)
      setReadingProgress(progress * 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const loadUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()
        setUser(profile)

        // Check if user has liked/bookmarked this post
        const { data: like } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", authUser.id)
          .single()

        const { data: bookmark } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", authUser.id)
          .single()

        setIsLiked(!!like)
        setIsBookmarked(!!bookmark)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to like posts",
        variant: "destructive",
      })
      return
    }

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id)
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: user.id })
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)

        // Send email notification to post author
        await sendLikeNotification()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      })
      return
    }

    try {
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("post_id", post.id).eq("user_id", user.id)
        setIsBookmarked(false)
        setBookmarksCount((prev) => prev - 1)
        toast({
          title: "Removed from bookmarks",
          description: "Post removed from your reading list",
        })
      } else {
        await supabase.from("bookmarks").insert({ post_id: post.id, user_id: user.id })
        setIsBookmarked(true)
        setBookmarksCount((prev) => prev + 1)
        toast({
          title: "Bookmarked!",
          description: "Post saved to your reading list",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      })
    }
  }

  const sendLikeNotification = async () => {
    try {
      if (post.author && user.id !== post.author.id) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: post.author.email || post.author.id,
            subject: `${user.full_name} liked your post`,
            html: `
              <h2>Your Post Got a Like! ❤️</h2>
              <p><strong>${user.full_name}</strong> liked your post "${post.title}"</p>
              <p><a href="${window.location.href}" style="color: #3b82f6;">View your post</a></p>
            `,
          }),
        })
      }
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = post.title

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case "copy":
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <article className="relative">
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link href={`/category/${post.category.slug}`}>
                <Badge className="mb-4 hover-lift" style={{ backgroundColor: post.category.color }}>
                  {post.category.name}
                </Badge>
              </Link>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-white/20">
                  <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} alt={post.author?.full_name} />
                  <AvatarFallback>{post.author?.full_name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/author/${post.author?.username}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.author?.full_name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.reading_time} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views_count} views
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`hover-lift ${isLiked ? "text-red-500" : ""}`}
                  disabled={!user}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                  {likesCount}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`hover-lift ${isBookmarked ? "text-blue-500" : ""}`}
                  disabled={!user}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {bookmarksCount}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover-lift">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card">
                    <DropdownMenuItem onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("copy")}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl">
                <Image
                  src={post.cover_image_url || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <Separator className="mb-8" />

          {/* Content */}
          <div
            id="article-content"
            className="prose prose-lg dark:prose-invert max-w-none custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`}>
                    <Badge variant="secondary" className="hover-lift glass">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author && (
            <div className="mt-12 p-8 glass-card rounded-2xl">
              <div className="flex items-start gap-6">
                <Avatar className="w-16 h-16 ring-2 ring-white/20">
                  <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} alt={post.author.full_name} />
                  <AvatarFallback className="text-lg">{post.author.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.author.full_name}</h3>
                  {post.author.bio && <p className="text-gray-600 dark:text-gray-300 mb-4">{post.author.bio}</p>}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{post.author.posts_count} posts</span>
                    <span>{post.author.followers_count} followers</span>
                  </div>
                  <Button asChild variant="outline" className="glass bg-transparent">
                    <Link href={`/author/${post.author.username}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
