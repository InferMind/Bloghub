"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Heart, MessageCircle, Sparkles } from "lucide-react"
import { getPosts } from "@/lib/services/posts"
import type { Post } from "@/lib/types/database"

interface RelatedPostsProps {
  currentPostId: string
  categoryId?: string
  tags: string[]
}

export function RelatedPosts({ currentPostId, categoryId, tags }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRelatedPosts()
  }, [currentPostId, categoryId, tags])

  const loadRelatedPosts = async () => {
    try {
      // First try to get posts from the same category
      let posts: Post[] = []

      if (categoryId) {
        posts = await getPosts({
          limit: 6,
          category: categoryId,
        })
        // Filter out current post
        posts = posts.filter((post) => post.id !== currentPostId)
      }

      // If we don't have enough posts, get more from other categories
      if (posts.length < 3) {
        const morePosts = await getPosts({
          limit: 6 - posts.length,
        })
        const filteredMorePosts = morePosts.filter(
          (post) => post.id !== currentPostId && !posts.some((p) => p.id === post.id),
        )
        posts = [...posts, ...filteredMorePosts]
      }

      setRelatedPosts(posts.slice(0, 3))
    } catch (error) {
      console.error("Error loading related posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass-card border-0 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="group glass-card hover-lift border-0 overflow-hidden">
            <div className="relative">
              <Image
                src={post.cover_image_url || "/placeholder.svg?height=200&width=400"}
                alt={post.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {post.category && (
                <div className="absolute top-4 left-4">
                  <Badge className="text-white" style={{ backgroundColor: post.category.color }}>
                    {post.category.name}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <Link href={`/blog/${post.author?.username}/${post.slug}`}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
              </Link>

              {post.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">{post.excerpt}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} alt={post.author?.full_name} />
                    <AvatarFallback className="text-xs">{post.author?.full_name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/author/${post.author?.username}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {post.author?.full_name}
                  </Link>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {post.reading_time} min
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
