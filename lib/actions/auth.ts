"use server"

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

// Helper function to create a Supabase client for server actions
function createActionClient() {
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
          cookieStore.set({ name, value, ...options })
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export async function signIn(prevState: any, formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(', ') }
  }

  const { email, password } = result.data
  
  const supabase = createActionClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/profile')
}

export async function signOut() {
  const supabase = createActionClient()
  
  await supabase.auth.signOut()
  redirect('/')
}