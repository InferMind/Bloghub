import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1, { message: "Subject is required" }),
  html: z.string().min(1, { message: "HTML content is required" }),
})

// Initialize Resend with API key or use a mock if not available
const resendApiKey = process.env.RESEND_API_KEY || 'test_key'
const resend = new Resend(resendApiKey)

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const result = emailSchema.safeParse(json)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { to, subject, html } = result.data

    // Check if we're in development mode without a real API key
    if (resendApiKey === 'test_key') {
      console.log('Development mode: Email would be sent to', to)
      console.log('Subject:', subject)
      console.log('Content:', html)
      return NextResponse.json({ success: true, data: { id: 'mock_email_id' } })
    }

    // Send the actual email
    try {
      const { data, error } = await resend.emails.send({
        from: "BlogCraft <noreply@blogcraft.com>",
        to: [to],
        subject,
        html,
      })

      if (error) {
        console.error("Email error:", error)
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
