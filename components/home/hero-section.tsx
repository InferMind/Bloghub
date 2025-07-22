"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          }}
        />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-8 hover-lift">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-sm font-medium">Welcome to the future of blogging</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Share Your Story
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">With the World</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            A modern, beautiful platform where writers create amazing content and readers discover stories that matter.
            Join our community of passionate storytellers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="hover-lift bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6"
            >
              <Link href="/signup">
                Start Writing Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="hover-lift glass-card text-lg px-8 py-6 bg-transparent"
            >
              <Link href="/blogs">Explore Stories</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">Stories Published</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">5K+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Writers</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-300">Monthly Readers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
