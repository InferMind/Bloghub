import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Authentication%20failed`)
      }
      
      // Check if user exists in the users table
      if (data?.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()
          
        // If user doesn't exist in the users table, create a new profile
        if (userError || !userData) {
          // Extract name and username from email or provider data
          const email = data.user.email || ''
          const name = data.user.user_metadata?.full_name || email.split('@')[0] || 'User'
          const username = email.split('@')[0] || `user_${Date.now().toString().slice(-6)}`
          
          // Create a new user profile
          const { error: createError } = await supabase.from("users").insert({
            id: data.user.id,
            full_name: name,
            username: username,
            avatar_url: data.user.user_metadata?.avatar_url || '',
            is_writer: false,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
          if (createError) {
            console.error("Error creating user profile:", createError)
          }
        }
      }
    } catch (error) {
      console.error("Error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Authentication%20failed`)
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(requestUrl.origin)
}
