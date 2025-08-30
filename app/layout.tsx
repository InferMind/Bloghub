import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./dropdown-fix.css"
import "./performance.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { LenisProvider } from "@/components/lenis-provider"
import { PreloadResources } from "@/components/preload-resources"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BlogCraft - Modern Blog Platform",
  description: "A beautiful, modern blog platform for writers and readers",
  keywords: ["blog", "writing", "publishing", "content"],
  authors: [{ name: "BlogCraft Team" }],
  openGraph: {
    title: "BlogCraft - Modern Blog Platform",
    description: "A beautiful, modern blog platform for writers and readers",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  generator: 'v0.dev',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-tap-highlight': 'no',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PreloadResources />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegister />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LenisProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow pt-16">{children}</main>
              <Footer />
              <ScrollToTop />
            </div>
            <Toaster />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
