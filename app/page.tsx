import { HeroSection } from "@/components/home/hero-section"
import { TrendingBlogs } from "@/components/home/trending-blogs"
import { RecentBlogs } from "@/components/home/recent-blogs"
import { Categories } from "@/components/home/categories"
import { FeaturedAuthors } from "@/components/home/featured-authors"
import { Newsletter } from "@/components/home/newsletter"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { 
  getTrendingPosts, 
  getRecentPosts, 
  getCategories, 
  getFeaturedAuthors 
} from "@/lib/services/home"

export default async function HomePage() {
  // Fetch data for the home page
  const trendingPosts = await getTrendingPosts()
  const recentPosts = await getRecentPosts()
  const categories = await getCategories()
  const featuredAuthors = await getFeaturedAuthors()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />
      <main className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-16 space-y-24">
          <TrendingBlogs posts={trendingPosts} />
          <RecentBlogs posts={recentPosts} />
          <Categories categories={categories} />
          <FeaturedAuthors authors={featuredAuthors} />
          <Newsletter />
        </div>
      </main>
    </div>
  )
}