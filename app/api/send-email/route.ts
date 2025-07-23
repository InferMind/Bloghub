import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with API key or use a mock if not available
const resendApiKey = process.env.RESEND_API_KEY || 'test_key'
const resend = new Resend(resendApiKey)

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()
    
    // Check if we have the required fields
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
