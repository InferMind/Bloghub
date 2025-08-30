import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { 
  getTrendingPosts, 
  getRecentPosts, 
  getCategories, 
  getFeaturedAuthors 
} from "@/lib/services/home"

// Static import for critical above-the-fold content
import { HeroSection } from "@/components/home/hero-section"
import { AnimatedBackground } from "@/components/ui/animated-background"

// Dynamic imports for below-the-fold content
const TrendingBlogs = dynamic(() => import("@/components/home/trending-blogs").then(mod => ({ default: mod.TrendingBlogs })), { ssr: true })
const RecentBlogs = dynamic(() => import("@/components/home/recent-blogs").then(mod => ({ default: mod.RecentBlogs })), { ssr: true })
const Categories = dynamic(() => import("@/components/home/categories").then(mod => ({ default: mod.Categories })), { ssr: true })
const FeaturedAuthors = dynamic(() => import("@/components/home/featured-authors").then(mod => ({ default: mod.FeaturedAuthors })), { ssr: true })
const Newsletter = dynamic(() => import("@/components/home/newsletter").then(mod => ({ default: mod.Newsletter })), { ssr: false })

export const revalidate = 60

export default async function HomePage() {
  // Fetch data in parallel for faster TTFB
  const [trendingPosts, recentPosts, categories, featuredAuthors] = await Promise.all([
    getTrendingPosts(),
    getRecentPosts(),
    getCategories(),
    getFeaturedAuthors(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />
      <main className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-16 space-y-24">
          <Suspense fallback={<div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <TrendingBlogs posts={trendingPosts} />
          </Suspense>
          
          <Suspense fallback={<div className="h-96 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <RecentBlogs posts={recentPosts} />
          </Suspense>
          
          <Suspense fallback={<div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <Categories categories={categories} />
          </Suspense>
          
          <Suspense fallback={<div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <FeaturedAuthors authors={featuredAuthors} />
          </Suspense>
          
          <Suspense fallback={<div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <Newsletter />
          </Suspense>
        </div>
      </main>
    </div>
  )
}