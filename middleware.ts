import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    },
  )

  try {
    // Get authenticated user data
    const { data: { user }, error } = await supabase.auth.getUser()
    
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

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/write/:path*",
    "/auth/:path*"
  ]
}