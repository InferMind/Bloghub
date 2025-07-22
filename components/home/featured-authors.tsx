"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, Calendar, Star } from "lucide-react"

const featuredAuthors = [
  {
    id: 1,
    name: "Sarah Chen",
    username: "sarahchen",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Senior Frontend Developer at Google. Passionate about React, TypeScript, and building accessible web experiences.",
    location: "San Francisco, CA",
    joinDate: "2022",
    followers: 12500,
    posts: 89,
    specialties: ["React", "TypeScript", "Accessibility"],
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    username: "marcusj",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Design Systems Lead at Figma. Helping teams build consistent and scalable design systems.",
    location: "New York, NY",
    joinDate: "2021",
    followers: 8900,
    posts: 67,
    specialties: ["Design Systems", "Figma", "UI Design"],
    verified: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    username: "emilyux",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "UX Research Director. Advocating for user-centered design and inclusive digital experiences.",
    location: "Austin, TX",
    joinDate: "2020",
    followers: 15200,
    posts: 124,
    specialties: ["UX Research", "Psychology", "Inclusive Design"],
    verified: true,
  },
  {
    id: 4,
    name: "Alex Thompson",
    username: "alexdev",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Full-stack developer and technical writer. Love sharing knowledge about modern web development.",
    location: "London, UK",
    joinDate: "2023",
    followers: 6700,
    posts: 45,
    specialties: ["Next.js", "Node.js", "DevOps"],
    verified: false,
  },
]

export function FeaturedAuthors() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredAuthors.map((author) => (
          <Card key={author.id} className="group glass-card hover-lift border-0 overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20 mx-auto ring-4 ring-white/20 group-hover:ring-blue-400/50 transition-all duration-300">
                  <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                  <AvatarFallback className="text-lg font-bold">
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {author.verified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>

              <Link href={`/author/${author.username}`}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {author.name}
                </h3>
              </Link>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{author.bio}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  {author.location}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {author.followers.toLocaleString()} followers
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {author.posts} posts
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {author.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs glass">
                      {specialty}
                    </Badge>
                  ))}
                  {author.specialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs glass">
                      +{author.specialties.length - 2}
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
        ))}
      </div>
    </section>
  )
}
