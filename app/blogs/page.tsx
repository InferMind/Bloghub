"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Clock, Heart, MessageCircle, Eye, SortDesc } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { Post, Category } from "@/lib/types/database"

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const postsPerPage = 12

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadPosts(true)
  }, [searchQuery, selectedCategory, sortBy])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadPosts = async (reset = false) => {
    try {
      setIsLoading(true)
      const page = reset ? 1 : currentPage
      const offset = (page - 1) * postsPerPage

      let query = supabase
        .from("posts")
        .select(`
          *,
          author:users(*),
          category:categories(*)
        `)
        .eq("is_published", true)
        .range(offset, offset + postsPerPage - 1)

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        query = query.eq("category.slug", selectedCategory)
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("published_at", { ascending: false })
          break
        case "oldest":
          query = query.order("published_at", { ascending: true })
          break
        case "popular":
          query = query.order("views_count", { ascending: false })
          break
        case "liked":
          query = query.order("likes_count", { ascending: false })
          break
        default:
          query = query.order("published_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      if (reset) {
        setPosts(data || [])
        setCurrentPage(1)
      } else {
        setPosts((prev) => [...prev, ...(data || [])])
      }

      setHasMore((data || []).length === postsPerPage)
      if (!reset) {
        setCurrentPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadPosts(true)
  }

  const handleLoadMore = () => {
    loadPosts(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Explore Stories</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover amazing content from our community of writers
              </p>
            </div>

            {/* Filters */}
            <Card className="glass-card border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass border-white/20 focus:border-blue-400"
                      />
                    </div>
                  </form>

                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full lg:w-48 glass border-white/20">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48 glass border-white/20">
                      <SortDesc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="liked">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Posts Grid */}
            {isLoading && posts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {posts.map((post) => (
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
                            <Badge style={{ backgroundColor: post.category.color }}>{post.category.name}</Badge>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      variant="outline"
                      className="glass bg-transparent"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin mr-2" />
                      ) : null}
                      Load More Posts
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
