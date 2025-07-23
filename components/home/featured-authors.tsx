"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, Calendar, Star } from "lucide-react"
import type { User } from "@/lib/types/database"
import { format } from "date-fns"

interface FeaturedAuthorsProps {
  authors: User[]
}

export function FeaturedAuthors({ authors }: FeaturedAuthorsProps) {
  // Extract specialties from bio (as a simple example)
  const getSpecialties = (bio?: string): string[] => {
    if (!bio) return ["Writing"]
    
    // Extract keywords from bio
    const keywords = ["React", "Design", "UX", "UI", "JavaScript", "TypeScript", "Node", "Python", 
                     "Writing", "Content", "Research", "Development", "Frontend", "Backend"]
    
    const found = keywords.filter(keyword => bio.toLowerCase().includes(keyword.toLowerCase()))
    return found.length > 0 ? found.slice(0, 3) : ["Writing"]
  }

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Featured Authors</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Meet the talented writers in our community</p>
        </div>
        <Link
          href="/authors"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View all authors
        </Link>
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">No featured authors available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author) => {
            const specialties = getSpecialties(author.bio)
            return (
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
                    {author.followers_count > 100 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <Link href={`/author/${author.username}`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {author.full_name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{author.bio || "Writer at BlogCraft"}</p>

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

                    <div className="flex flex-wrap gap-1 justify-center">
                      {specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs glass">
                          {specialty}
                        </Badge>
                      ))}
                      {specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs glass">
                          +{specialties.length - 2}
                        </Badge>
                      )}
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
            )
          })}
        </div>
      )}
    </section>
  )
}