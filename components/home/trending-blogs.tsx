"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Heart, MessageCircle, TrendingUp } from "lucide-react"

const trendingPosts = [
  {
    id: 1,
    title: "The Future of Web Development: What's Coming in 2024",
    excerpt: "Exploring the latest trends and technologies that will shape web development in the coming year.",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "sarahchen",
    },
    category: "Technology",
    readTime: "8 min read",
    likes: 234,
    comments: 45,
    image: "/placeholder.svg?height=300&width=500",
    publishedAt: "2 days ago",
  },
  {
    id: 2,
    title: "Building Sustainable Design Systems at Scale",
    excerpt: "How to create and maintain design systems that grow with your organization.",
    author: {
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "marcusj",
    },
    category: "Design",
    readTime: "12 min read",
    likes: 189,
    comments: 32,
    image: "/placeholder.svg?height=300&width=500",
    publishedAt: "1 day ago",
  },
  {
    id: 3,
    title: "The Psychology Behind User Experience Design",
    excerpt: "Understanding how psychology principles can improve your UX design decisions.",
    author: {
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "emilyux",
    },
    category: "UX Design",
    readTime: "10 min read",
    likes: 156,
    comments: 28,
    image: "/placeholder.svg?height=300&width=500",
    publishedAt: "3 days ago",
  },
]

export function TrendingBlogs() {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">The most popular stories this week</p>
        </div>
        <Link
          href="/trending"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View all trending
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trendingPosts.map((post, index) => (
          <Card key={post.id} className="group glass-card hover-lift overflow-hidden border-0">
            <div className="relative">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                width={500}
                height={300}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">#{index + 1} Trending</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="glass">
                  {post.category}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <Link href={`/blog/${post.id}`}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
              </Link>

              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/author/${post.author.username}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{post.publishedAt}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
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
