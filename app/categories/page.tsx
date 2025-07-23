"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Folder, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { Category } from "@/lib/types/database"

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<any>> = {
  Code: () => <div className="text-2xl">💻</div>,
  Palette: () => <div className="text-2xl">🎨</div>,
  Smartphone: () => <div className="text-2xl">📱</div>,
  Brain: () => <div className="text-2xl">🧠</div>,
  Briefcase: () => <div className="text-2xl">💼</div>,
  Heart: () => <div className="text-2xl">❤️</div>,
  Globe: () => <div className="text-2xl">🌍</div>,
  Zap: () => <div className="text-2xl">⚡</div>,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("posts_count", { ascending: false })

      if (error) throw error
      setCategories(data || [])
      setFilteredCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPosts = categories.reduce((sum, category) => sum + category.posts_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Folder className="w-8 h-8 text-indigo-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Categories</h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Explore content organized by topics and interests
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  {categories.length} categories
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {totalPosts.toLocaleString()} total posts
                </div>
              </div>
            </div>

            {/* Search */}
            <Card className="glass-card border-0 mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-white/20 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="glass-card border-0 animate-pulse">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-4" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No categories found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const IconComponent = iconMap[category.icon || "Folder"] || (() => <div className="text-2xl">📁</div>)

                  return (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <Card className="group glass-card hover-lift border-0 h-full transition-all duration-300 hover:shadow-xl">
                        <CardContent className="p-6 text-center h-full flex flex-col">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent />
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {category.name}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
                            {category.description}
                          </p>

                          <Badge
                            variant="secondary"
                            className="glass"
                            style={{
                              backgroundColor: `${category.color}10`,
                              color: category.color,
                              borderColor: `${category.color}20`,
                            }}
                          >
                            {category.posts_count} {category.posts_count === 1 ? "article" : "articles"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}