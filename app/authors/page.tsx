"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Calendar, TrendingUp, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { User } from "@/lib/types/database"

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<User[]>([])
  const [filteredAuthors, setFilteredAuthors] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("followers")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAuthors()
  }, [])

  useEffect(() => {
    let filtered = authors

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (author) =>
          author.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "followers":
          return b.followers_count - a.followers_count
        case "posts":
          return b.posts_count - a.posts_count
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "name":
          return a.full_name.localeCompare(b.full_name)
        default:
          return b.followers_count - a.followers_count
      }
    })

    setFilteredAuthors(filtered)
  }, [searchQuery, sortBy, authors])

  const loadAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_writer", true)
        .gt("posts_count", 0)
        .order("followers_count", { ascending: false })

      if (error) throw error
      setAuthors(data || [])
      setFilteredAuthors(data || [])
    } catch (error) {
      console.error("Error loading authors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalAuthors = authors.length
  const totalFollowers = authors.reduce((sum, author) => sum + author.followers_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-8 h-8 text-purple-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Authors</h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Meet the talented writers sharing their knowledge and stories
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {totalAuthors} writers
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {totalFollowers.toLocaleString()} total followers
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card className="glass-card border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass border-white/20 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48 glass border-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="followers">Most Followers</SelectItem>
                      <SelectItem value="posts">Most Posts</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Authors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="glass-card border-0 animate-pulse">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-4" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No authors found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthors.map((author) => (
                  <Card key={author.id} className="group glass-card hover-lift border-0 overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto ring-4 ring-white/20 group-hover:ring-blue-400/50 transition-all duration-300">
                          <AvatarImage src={author.avatar_url || "/placeholder.svg"} alt={author.full_name} />
                          <AvatarFallback className="text-lg font-bold">
                            {author.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <Link href={`/author/${author.username}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {author.full_name}
                        </h3>
                      </Link>

                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">@{author.username}</p>

                      {author.bio && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{author.bio}</p>
                      )}

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {author.followers_count.toLocaleString()} followers
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {author.posts_count} posts
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(author.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full glass hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
                      >
                        <Link href={`/author/${author.username}`}>View Profile</Link>
                      </Button>
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
