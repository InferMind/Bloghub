"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Palette, Smartphone, Brain, Briefcase, Heart, Globe, Zap, Folder } from "lucide-react"

const categories = [
  {
    name: "Technology",
    slug: "technology",
    icon: Code,
    count: 1234,
    color: "bg-blue-500",
    description: "Latest in tech, programming, and innovation",
  },
  {
    name: "Design",
    slug: "design",
    icon: Palette,
    count: 856,
    color: "bg-purple-500",
    description: "UI/UX, graphic design, and creative inspiration",
  },
  {
    name: "Mobile",
    slug: "mobile",
    icon: Smartphone,
    count: 642,
    color: "bg-green-500",
    description: "Mobile development and app design",
  },
  {
    name: "AI & ML",
    slug: "ai-ml",
    icon: Brain,
    count: 789,
    color: "bg-pink-500",
    description: "Artificial intelligence and machine learning",
  },
  {
    name: "Business",
    slug: "business",
    icon: Briefcase,
    count: 567,
    color: "bg-orange-500",
    description: "Entrepreneurship, startups, and business strategy",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    icon: Heart,
    count: 423,
    color: "bg-red-500",
    description: "Health, wellness, and personal development",
  },
  {
    name: "Travel",
    slug: "travel",
    icon: Globe,
    count: 345,
    color: "bg-teal-500",
    description: "Travel guides, tips, and adventures",
  },
  {
    name: "Productivity",
    slug: "productivity",
    icon: Zap,
    count: 298,
    color: "bg-yellow-500",
    description: "Tools, tips, and techniques for better productivity",
  },
]

export function Categories() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <Card className="group glass-card hover-lift border-0 h-full transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{category.description}</p>

                  <Badge variant="secondary" className="glass">
                    {category.count} articles
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
