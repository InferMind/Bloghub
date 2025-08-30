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

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = createActionClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Ensure profile exists
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    if (!userProfile) {
      const meta = data.user.user_metadata || {}
      const nameFromMeta = (meta.full_name as string) || ''
      const baseFromEmail = (data.user.email || '').split('@')[0] || 'user'
      const clean = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '')
      const base = clean(nameFromMeta) || clean(baseFromEmail) || `user_${Date.now().toString().slice(-6)}`

      let username = base || `user_${Date.now().toString().slice(-6)}`
      for (let i = 0; i < 3; i++) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single()
        if (!existing) break
        username = `${base}_${Math.floor(Math.random() * 10000)}`
      }

      await supabase.from('users').insert({
        id: data.user.id,
        full_name: nameFromMeta || baseFromEmail || 'User',
        username,
        avatar_url: (meta.avatar_url as string) || '',
        is_writer: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }
  
  redirect('/profile')
}

export async function signOut() {
  const supabase = createActionClient()
  
  await supabase.auth.signOut()
  redirect('/')
}