import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        getAll() {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        set(name: string, value: string, options: any) {
          // Only set cookies in a Server Action or Route Handler
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Silently handle the error when not in a Server Action or Route Handler
            console.warn('Cookie cannot be set outside Server Action or Route Handler')
          }
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch (error) {
            console.warn('Cookies cannot be set outside Server Action or Route Handler')
          }
        },
        remove(name: string, options: any) {
          // Only remove cookies in a Server Action or Route Handler
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Silently handle the error when not in a Server Action or Route Handler
            console.warn('Cookie cannot be removed outside Server Action or Route Handler')
          }
        },
      },
    }
  )
}