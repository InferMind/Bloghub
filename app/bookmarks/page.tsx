"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bookmark, Clock, Heart, MessageCircle, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { Post } from "@/lib/types/database"

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        window.location.href = "/auth/login"
        return
      }

      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      setUser(profile)

      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          *,
          post:posts(
            *,
            author:users(*),
            category:categories(*)
          )
        `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBookmarkedPosts(data?.map((bookmark) => bookmark.post).filter(Boolean) || [])
    } catch (error) {
      console.error("Error loading bookmarks:", error)
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id)

      if (error) throw error

      setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId))
      toast({
        title: "Bookmark removed",
        description: "Post removed from your reading list",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Bookmark className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Reading List</h1>
            </div>

            {bookmarkedPosts.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start bookmarking posts to build your reading list
                </p>
                <Button asChild>
                  <Link href="/blogs">Explore Posts</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookmarkedPosts.map((post) => (
                  <Card key={post.id} className="glass-card border-0 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <Image
                            src={post.cover_image_url || "/placeholder.svg?height=120&width=200"}
                            alt={post.title}
                            width={200}
                            height={120}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              {post.category && (
                                <Badge className="mb-2" style={{ backgroundColor: post.category.color }}>
                                  {post.category.name}
                                </Badge>
                              )}
                              <Link href={`/blog/${post.author?.username}/${post.slug}`}>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                              </Link>
                              {post.excerpt && (
                                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{post.excerpt}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveBookmark(post.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Author */}
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={post.author?.avatar_url || "/placeholder.svg"}
                                alt={post.author?.full_name}
                              />
                              <AvatarFallback className="text-xs">
                                {post.author?.full_name?.charAt(0) || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              href={`/author/${post.author?.username}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {post.author?.full_name}
                            </Link>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                              <Clock className="w-3 h-3" />
                              {post.reading_time} min read
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments_count}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
