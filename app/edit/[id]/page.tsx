"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

// Calculate reading time based on content length
function calculateReadTime(content: string): number {
  // Average reading speed: 200 words per minute
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200);
  return Math.max(1, readTime); // Minimum 1 minute read time
}

export default function EditPostPage() {
  const params = useParams()
  const postId = params.id as string
  
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
  const [post, setPost] = useState<any>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
    }

    async function getCategories() {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
    }

    async function getPost() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*, author:users(*)")
          .eq("id", postId)
          .single()

        if (error) throw error
        
        if (!data) {
          toast({
            title: "Post not found",
            description: "The post you're trying to edit doesn't exist.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Check if user is the author
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (data.author_id !== user?.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this post.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setPost(data)
        setTitle(data.title)
        setContent(data.content)
        setExcerpt(data.excerpt || "")
        setSlug(data.slug)
        setCategoryId(data.category_id || "")
        setCoverImage(data.cover_image_url || "")
        setIsPublished(data.is_published)
        
        if (data.cover_image_url) {
          setImagePreview(data.cover_image_url)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          title: "Error",
          description: "Failed to load the post.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
    getCategories()
    getPost()
  }, [postId, router, supabase, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    
    setIsUploading(true)
    try {
      // Create a unique filename
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `cover-images/${fileName}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, imageFile)
        
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)
        
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
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
      // Upload image if selected
      let imageUrl = coverImage
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Update post
      const { error } = await supabase
        .from("posts")
        .update({
          title,
          content,
          excerpt: excerpt || title.substring(0, 150),
          slug,
          category_id: categoryId,
          cover_image_url: imageUrl || null,
          is_published: !saveAsDraft,
          updated_at: new Date().toISOString(),
          reading_time: calculateReadTime(content)
        })
        .eq("id", postId)

      if (error) throw error

      toast({
        title: saveAsDraft ? "Draft saved!" : "Post updated!",
        description: saveAsDraft 
          ? "Your blog post has been saved as a draft." 
          : "Your blog post has been updated successfully.",
      })

      // Redirect to the post or dashboard
      if (saveAsDraft) {
        router.push("/dashboard")
      } else {
        router.push(`/blog/${post.author.username}/${slug}`)
      }
    } catch (error: any) {
      console.error("Error updating post:", error)
      toast({
        title: "Error updating post",
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
      <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
            This will be used in the URL of your post.
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
          <Label>Cover Image</Label>
          <div className="flex flex-col space-y-4">
            {/* Image preview */}
            {imagePreview && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image 
                  src={imagePreview} 
                  alt="Cover image preview" 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
            
            {/* File input with custom styling */}
            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('cover-image-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {/* Optional URL input */}
              <div className="flex-1">
                <Input
                  placeholder="Or enter image URL"
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value)
                    if (e.target.value) {
                      setImagePreview(e.target.value)
                      setImageFile(null)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor value={content} onChange={setContent} className="min-h-[400px]" />
        </div>

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting && !isPublished ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>

          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting && isPublished ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Image...
              </>
            ) : (
              "Update Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}