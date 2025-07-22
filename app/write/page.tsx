"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { generateSlug } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [slug, setSlug] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [coverImage, setCoverImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoading(false)
    }

    async function getCategories() {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
    }

    getUser()
    getCategories()

    // Check for draft in localStorage
    const savedDraft = localStorage.getItem("blog_draft")
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setTitle(draft.title || "")
        setContent(draft.content || "")
        setExcerpt(draft.excerpt || "")
        setSlug(draft.slug || "")
        setCategoryId(draft.categoryId || "")
        setCoverImage(draft.coverImage || "")
      } catch (error) {
        console.error("Error parsing saved draft:", error)
      }
    }
  }, [router, supabase])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [title, content, excerpt, slug, categoryId, coverImage])

  // Update slug when title changes
  useEffect(() => {
    if (title) {
      setSlug(generateSlug(title))
    }
  }, [title])

  const saveDraft = () => {
    const draft = {
      title,
      content,
      excerpt,
      slug,
      categoryId,
      coverImage,
      lastSaved: new Date().toISOString(),
    }

    localStorage.setItem("blog_draft", JSON.stringify(draft))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content || !categoryId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get user profile
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .single()

      if (profileError || !profiles) {
        throw new Error("Could not find user profile")
      }

      // Create post
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          excerpt: excerpt || title.substring(0, 150),
          slug,
          author_id: profiles.id,
          category_id: categoryId,
          cover_image: coverImage || null,
        })
        .select()

      if (error) throw error

      // Clear draft from localStorage
      localStorage.removeItem("blog_draft")

      toast({
        title: "Post published!",
        description: "Your blog post has been published successfully.",
      })

      // Redirect to the published post
      router.push(`/blog/${profiles.username}/${slug}`)
    } catch (error: any) {
      console.error("Error publishing post:", error)
      toast({
        title: "Error publishing post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Write a New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-friendly-slug" />
          <p className="text-sm text-muted-foreground">
            This will be used in the URL of your post. Leave empty to generate from title.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of your post (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image URL</Label>
          <Input
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor value={content} onChange={setContent} className="min-h-[400px]" />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={saveDraft}>
            Save Draft
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
