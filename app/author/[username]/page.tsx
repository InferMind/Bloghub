"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Clock, Heart, MessageCircle, Eye, Users, Globe, Twitter, Github, Linkedin } from "lucide-react"
import type { User, Post } from "@/lib/types/database"

export default function AuthorProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [author, setAuthor] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadAuthorProfile()
    loadCurrentUser()
  }, [username])

  const loadAuthorProfile = async () => {
    try {
      setIsLoading(true)
      
      // Get author profile - make sure we're only getting writers
      const { data: authorData, error: authorError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("is_writer", true)
        .single()

      if (authorError) {
        console.error("Error loading author profile:", authorError)
        setAuthor(null)
        setIsLoading(false)
        return
      }
      
      // Get post count for this author
      const { count: postsCount, error: countError } = await supabase
        .from("posts")
        .select("id", { count: 'exact' })
        .eq("author_id", authorData.id)
        .eq("is_published", true)
      
      // Update author with accurate post count
      authorData.posts_count = postsCount || 0
      
      setAuthor(authorData)
      setFollowersCount(authorData.followers_count || 0)

      // Get author's posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("author_id", authorData.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (postsError) throw postsError
      setPosts(postsData || [])
    } catch (error) {
      console.error("Error loading author profile:", error)
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
        
        // Check if following
        if (profile && author) {
          const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", profile.id)
            .eq("following_id", author.id)
            .maybeSingle()
          
          setIsFollowing(!!followData)
        }
      }
    } catch (error) {
      console.error("Error loading current user:", error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow authors",
        variant: "destructive",
      })
      return
    }

    if (!author) return

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", author.id)
        
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
        
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${author.full_name}`,
        })
      } else {
        // Follow
        await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: author.id
          })
        
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        
        toast({
          title: "Following",
          description: `You are now following ${author.full_name}`,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card border-0 animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Author not found</h1>
          <p className="mb-6">The author you're looking for doesn't exist or is not a writer.</p>
          <Link href="/authors" className="text-blue-600 hover:underline">
            Browse all authors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Author Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
          <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
            <AvatarImage src={author.avatar_url || "/placeholder.svg"} alt={author.full_name} />
            <AvatarFallback className="text-2xl">{author.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{author.full_name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{author.bio || "No bio available"}</p>
            
            <div className="flex flex-wrap items-center gap-4 mb-4 justify-center md:justify-start">
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                <span>{followersCount} followers</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                <span>{author.posts_count} posts</span>
              </div>
              
              {author.website_url && (
                <Link href={author.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-blue-600">
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </Link>
              )}
              
              {author.twitter_handle && (
                <Link href={`https://twitter.com/${author.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-blue-400">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </Link>
              )}
              
              {author.github_handle && (
                <Link href={`https://github.com/${author.github_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-gray-800 dark:hover:text-gray-200">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </Link>
              )}
              
              {author.linkedin_handle && (
                <Link href={`https://linkedin.com/in/${author.linkedin_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-blue-700">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </Link>
              )}
            </div>
            
            {currentUser && currentUser.id !== author.id && (
              <Button 
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "border-blue-500 text-blue-500" : "bg-blue-500 hover:bg-blue-600"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Author's Posts */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="glass-card mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This author hasn't published any posts yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${author.username}/${post.slug}`}>
                    <Card className="group glass-card hover-lift border-0 overflow-hidden h-full">
                      {post.cover_image_url && (
                        <div className="relative h-48">
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.reading_time} min
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
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">About {author.full_name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {author.bio || "This author hasn't added a bio yet."}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Followers:</span> {followersCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Posts:</span> {author.posts_count}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Joined:</span> {new Date(author.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}