import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      // Redirect to login page with error
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Authentication%20failed`)
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(requestUrl.origin)
}
