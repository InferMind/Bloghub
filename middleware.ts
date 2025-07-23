import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    // Refresh session if expired
    const { data: sessionData } = await supabase.auth.getSession()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    const user = userData?.user
    
    // Protect profile route
    if (request.nextUrl.pathname.startsWith("/profile") && !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    
    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    
    // Protect write route
    if (request.nextUrl.pathname.startsWith("/write") && !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth") && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.error("Middleware auth error:", error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/write/:path*",
    "/auth/:path*"
  ]
}