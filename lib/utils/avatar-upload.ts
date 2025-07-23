"use client"

import { optimizeImage } from "./image-optimizer"
import { createClient } from "@/lib/supabase/client"

/**
 * Upload an avatar image to Supabase storage
 * @param file The image file to upload
 * @param userId The user ID
 * @returns The public URL of the uploaded image
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  
  try {
    // Try to optimize the image first
    try {
      const optimizedImage = await optimizeImage(file, 400, 0.8)
      const fileName = `${userId}.webp`
      const filePath = `avatars/${fileName}`
      
      const { error } = await supabase.storage.from("avatars").upload(filePath, optimizedImage, {
        upsert: true,
        contentType: 'image/webp'
      })
      
      if (error) throw error
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return data.publicUrl
    } catch (optimizeError) {
      // Fall back to original file if optimization fails
      console.error("Image optimization failed, uploading original", optimizeError)
      
      const fileExt = file.name.split(".").pop() || "jpg"
      const fileName = `${userId}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, { 
        upsert: true 
      })
      
      if (error) throw error
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return data.publicUrl
    }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    throw error
  }
}