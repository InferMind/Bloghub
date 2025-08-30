"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Moon, Sun, Menu, X, PenTool, BookOpen, User, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions/auth"
import type { User as UserType } from "@/lib/types/database"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    loadUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await loadUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    try {
      // Get authenticated user data directly
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        setUser(null)
        setIsLoading(false)
        return
      }
      
      const authUser = userData.user

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // No profile found, create one
        const email = authUser.email || ''
        const name = authUser.user_metadata?.full_name || email.split('@')[0] || 'User'
        const username = email.split('@')[0] || `user_${Date.now().toString().slice(-6)}`
        
        const newProfile = {
          id: authUser.id,
          full_name: name,
          username: username,
          avatar_url: authUser.user_metadata?.avatar_url || '',
          is_writer: false,
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Use upsert to avoid duplicate key errors
        const { data: createdProfile, error: createError } = await supabase
          .from("users")
          .upsert(newProfile)
          .select()
          .single()
        
        if (createError) {
          setUser(null)
        } else {
          setUser(createdProfile || newProfile)
        }
      } else if (profileError) {
        setUser(null)
      } else if (profile) {
        setUser(profile)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMobileMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Use client sign out and then hard redirect to clear state fully
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      toast({ title: "Signed out", description: "You have been successfully signed out." })
      // Hard reload to ensure all server-side auth contexts/middleware are reset
      window.location.href = "/"
    } catch (error) {
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" })
    }
  }

  if (!mounted) return null

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass-card shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BlogCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/blogs"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/authors"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Authors
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-white/20 focus:border-blue-400"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover-lift"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Write Button - Only show for writers */}
            {user?.is_writer && (
              <Button
                asChild
                className="hidden md:flex hover-lift bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Link href="/write">
                  <PenTool className="w-4 h-4 mr-2" />
                  Write
                </Link>
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover-lift">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut(); }}>
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card mt-2 rounded-lg p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>
            <div className="space-y-2">
              <Link
                href="/blogs"
                className="block py-2 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/categories"
                className="block py-2 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/authors"
                className="block py-2 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Authors
              </Link>
            </div>

            {user ? (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {user.is_writer && (
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Link href="/write" onClick={() => setIsMobileMenuOpen(false)}>
                      <PenTool className="w-4 h-4 mr-2" />
                      Write
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="ghost" className="w-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}