"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PenTool,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  FileText,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { User, Post } from "@/lib/types/database"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalBookmarks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Load user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
      }

      // Load user's posts
      const { data: userPosts } = await supabase
        .from("posts")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("author_id", authUser.id)
        .order("created_at", { ascending: false })

      if (userPosts) {
        setPosts(userPosts)

        // Calculate stats
        const totalViews = userPosts.reduce((sum, post) => sum + post.views_count, 0)
        const totalLikes = userPosts.reduce((sum, post) => sum + post.likes_count, 0)
        const totalComments = userPosts.reduce((sum, post) => sum + post.comments_count, 0)
        const totalBookmarks = userPosts.reduce((sum, post) => sum + post.bookmarks_count, 0)

        setStats({
          totalViews,
          totalLikes,
          totalComments,
          totalBookmarks,
        })
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })

      await loadDashboardData()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  const publishedPosts = posts.filter((post) => post.is_published)
  const draftPosts = posts.filter((post) => !post.is_published)

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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.full_name}!</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Here's what's happening with your content</p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Link href="/write">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Eye className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Likes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalLikes.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Comments</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalComments.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bookmarks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalBookmarks.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <Bookmark className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Management */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Posts
                </CardTitle>
                <CardDescription>Manage your published posts and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="published" className="space-y-6">
                  <TabsList className="glass-card">
                    <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="published" className="space-y-4">
                    {publishedPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No published posts</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Start writing your first blog post!</p>
                        <Button asChild>
                          <Link href="/write">
                            <PenTool className="w-4 h-4 mr-2" />
                            Write Your First Post
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {publishedPosts.map((post) => (
                          <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="drafts" className="space-y-4">
                    {draftPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No drafts</h3>
                        <p className="text-gray-600 dark:text-gray-300">All your posts are published!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {draftPosts.map((post) => (
                          <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface PostCardProps {
  post: Post
  onDelete: (postId: string) => void
}

function PostCard({ post, onDelete }: PostCardProps) {
  return (
    <Card className="glass-card border-0 hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{post.title}</h3>
              {!post.is_published && <Badge variant="secondary">Draft</Badge>}
              {post.category && <Badge style={{ backgroundColor: post.category.color }}>{post.category.name}</Badge>}
            </div>

            {post.excerpt && <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>}

            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views_count}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {post.likes_count}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.comments_count}
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                {post.bookmarks_count}
              </div>
              <span>
                {post.is_published ? "Published" : "Created"} {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover-lift">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card" align="end">
              <DropdownMenuItem asChild>
                <Link href={`/write/${post.id}`} className="flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {post.is_published && (
                <DropdownMenuItem asChild>
                  <Link href={`/blog/${post.author?.username}/${post.slug}`} className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(post.id)}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
