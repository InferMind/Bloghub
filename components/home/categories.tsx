"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Palette, Smartphone, Brain, Briefcase, Heart, Globe, Zap, Folder } from "lucide-react"
import type { Category } from "@/lib/types/database"

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<any>> = {
  Code: () => <Code className="w-8 h-8 text-white" />,
  Palette: () => <Palette className="w-8 h-8 text-white" />,
  Smartphone: () => <Smartphone className="w-8 h-8 text-white" />,
  Brain: () => <Brain className="w-8 h-8 text-white" />,
  Briefcase: () => <Briefcase className="w-8 h-8 text-white" />,
  Heart: () => <Heart className="w-8 h-8 text-white" />,
  Globe: () => <Globe className="w-8 h-8 text-white" />,
  Zap: () => <Zap className="w-8 h-8 text-white" />,
}

interface CategoriesProps {
  categories: Category[]
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Folder className="w-8 h-8 text-indigo-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Explore Categories</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Discover content that matches your interests</p>
        </div>
        <Link
          href="/categories"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View all categories
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">No categories available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon && iconMap[category.icon] ? iconMap[category.icon] : () => <Folder className="w-8 h-8 text-white" />
            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="group glass-card hover-lift border-0 h-full transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: category.color || "#6366f1" }}
                    >
                      <IconComponent />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{category.description}</p>

                    <Badge variant="secondary" className="glass">
                      {category.posts_count} {category.posts_count === 1 ? "article" : "articles"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}