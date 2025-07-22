"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Heart, MessageCircle, Calendar } from "lucide-react"

const recentPosts = [
  {
    id: 4,
    title: "Getting Started with Next.js 14: A Complete Guide",
    excerpt: "Learn how to build modern web applications with the latest features in Next.js 14.",
    author: {
      name: "Alex Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "alexdev",
    },
    category: "Development",
    readTime: "15 min read",
    likes: 98,
    comments: 23,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "5 hours ago",
  },
  {
    id: 5,
    title: "The Art of Minimalist Design in 2024",
    excerpt: "Exploring how minimalism continues to influence modern design trends.",
    author: {
      name: "Luna Park",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "lunadesign",
    },
    category: "Design",
    readTime: "7 min read",
    likes: 145,
    comments: 18,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "8 hours ago",
  },
  {
    id: 6,
    title: "Building Accessible Web Applications",
    excerpt: "Best practices for creating inclusive digital experiences for all users.",
    author: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "davidaccessible",
    },
    category: "Accessibility",
    readTime: "11 min read",
    likes: 87,
    comments: 15,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "12 hours ago",
  },
  {
    id: 7,
    title: "Machine Learning for Frontend Developers",
    excerpt: "How to integrate ML models into your web applications without a PhD.",
    author: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "priyaml",
    },
    category: "AI/ML",
    readTime: "13 min read",
    likes: 203,
    comments: 34,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "1 day ago",
  },
  {
    id: 8,
    title: "The Future of Remote Work Culture",
    excerpt: "How distributed teams are reshaping the way we think about work and collaboration.",
    author: {
      name: "Jordan Martinez",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "jordanremote",
    },
    category: "Culture",
    readTime: "9 min read",
    likes: 156,
    comments: 42,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "1 day ago",
  },
  {
    id: 9,
    title: "Sustainable Tech: Green Computing Practices",
    excerpt: "How developers can contribute to environmental sustainability through code.",
    author: {
      name: "Emma Green",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "emmagreen",
    },
    category: "Sustainability",
    readTime: "10 min read",
    likes: 124,
    comments: 27,
    image: "/placeholder.svg?height=200&width=400",
    publishedAt: "2 days ago",
  },
]

export function RecentBlogs() {
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
          href="/recent"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View all recent
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {recentPosts.map((post) => (
          <Card
            key={post.id}
            className="group glass-card hover-lift overflow-hidden border-0 flex flex-col md:flex-row"
          >
            <div className="relative md:w-1/3">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                width={400}
                height={200}
                className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="glass">
                  {post.category}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <Link href={`/blog/${post.id}`}>
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
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/author/${post.author.username}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{post.publishedAt}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments}
                    </div>
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
