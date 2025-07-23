"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Heart, MessageCircle, Calendar } from "lucide-react"
import type { Post } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

interface RecentBlogsProps {
  posts: Post[]
}

export function RecentBlogs({ posts }: RecentBlogsProps) {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Recently Published</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Fresh content from our community</p>
        </div>
        <Link
          href="/blogs?sort=newest"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View all recent
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">No recent posts available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="group glass-card hover-lift overflow-hidden border-0 flex flex-col md:flex-row"
            >
              <div className="relative md:w-1/3">
                <Image
                  src={post.cover_image_url || "/placeholder.svg?height=200&width=400"}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant="secondary" 
                      className="glass"
                      style={{ backgroundColor: `${post.category.color}30` }}
                    >
                      {post.category.name}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <Link href={`/blog/${post.author?.username}/${post.slug}`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">{post.excerpt}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
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
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}