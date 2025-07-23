"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types/database"

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<User[]>([])
  const [filteredAuthors, setFilteredAuthors] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadAuthors()
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = authors.filter(
        (author) =>
          author.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAuthors(filtered)
    } else {
      setFilteredAuthors(authors)
    }
  }, [searchQuery, authors])

  const loadAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_writer", true)
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

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
        
        setCurrentUser(profile)
        
        // Get who the user is following
        const { data: following } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
        
        if (following) {
          const followingMap: Record<string, boolean> = {}
          following.forEach(f => {
            followingMap[f.following_id] = true
          })
          setFollowingMap(followingMap)
        }
      }
    } catch (error) {
      console.error("Error loading current user:", error)
    }
  }

  const handleFollow = async (authorId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow authors",
        variant: "destructive",
      })
      return
    }

    try {
      const isFollowing = followingMap[authorId]
      
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", authorId)
        
        setFollowingMap(prev => ({
          ...prev,
          [authorId]: false
        }))
        
        // Update UI optimistically
        setAuthors(prev => 
          prev.map(author => 
            author.id === authorId 
              ? { ...author, followers_count: Math.max(0, author.followers_count - 1) }
              : author
          )
        )
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this author",
        })
      } else {
        // Follow
        await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: authorId
          })
        
        setFollowingMap(prev => ({
          ...prev,
          [authorId]: true
        }))
        
        // Update UI optimistically
        setAuthors(prev => 
          prev.map(author => 
            author.id === authorId 
              ? { ...author, followers_count: author.followers_count + 1 }
              : author
          )
        )
        
        toast({
          title: "Following",
          description: "You are now following this author",
        })
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-8 h-8 text-indigo-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Authors</h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Discover talented writers and follow their work
              </p>
            </div>

            {/* Search */}
            <Card className="glass-card border-0 mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-white/20 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Authors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="glass-card border-0 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No authors found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuthors.map((author) => (
                  <Card key={author.id} className="glass-card border-0 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={author.avatar_url || "/placeholder.svg"} alt={author.full_name} />
                          <AvatarFallback className="text-lg">{author.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{author.full_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">@{author.username}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {author.bio || "No bio available"}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{author.posts_count || 0} posts</span>
                        <span>{author.followers_count || 0} followers</span>
                      </div>

                      <div className="flex justify-between">
                        <Button asChild variant="outline">
                          <Link href={`/author/${author.username}`}>View Profile</Link>
                        </Button>
                        
                        {currentUser && currentUser.id !== author.id && (
                          <Button 
                            onClick={() => handleFollow(author.id)}
                            variant={followingMap[author.id] ? "outline" : "default"}
                            className={followingMap[author.id] ? "border-blue-500 text-blue-500" : ""}
                          >
                            {followingMap[author.id] ? "Following" : "Follow"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}