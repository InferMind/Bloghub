import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogPost } from "@/components/blog/blog-post"
import { Comments } from "@/components/blog/comments"
import { RelatedPosts } from "@/components/blog/related-posts"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{
    username: string
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(*),
      category:categories(*)
    `)
    .eq("slug", slug)
    .eq("author.username", username)
    .eq("is_published", true)
    .single()

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    authors: [{ name: post.author?.full_name || "" }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: "article",
      publishedTime: post.created_at || undefined,
      authors: [post.author?.full_name || ""],
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(*),
      category:categories(*)
    `)
    .eq("slug", slug)
    .eq("author.username", username)
    .eq("is_published", true)
    .single()

  if (error || !post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("posts")
    .update({ views_count: post.views_count + 1 })
    .eq("id", post.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <main className="pt-16">
        <BlogPost post={post} />
        <div className="container mx-auto px-4 py-16">
          <Comments postId={post.id} />
          <div className="mt-16">
            <RelatedPosts currentPostId={post.id} categoryId={post.category_id} tags={post.tags} />
          </div>
        </div>
      </main>
    </div>
  )
}
