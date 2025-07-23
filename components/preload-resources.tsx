"use client"

import { useEffect } from "react"
import { prefetchResources, preconnectToDomains } from "@/lib/utils/prefetch"

export function PreloadResources() {
  useEffect(() => {
    // Prefetch critical resources
    prefetchResources([
      '/auth/login',
      '/auth/signup',
      '/blogs',
      '/placeholder.svg'
    ])
    
    // Preconnect to critical domains
    preconnectToDomains([
      'https://images.unsplash.com',
      'https://avatars.githubusercontent.com'
    ])
  }, [])
  
  return (
    <>
      {/* Preload critical images */}
      <link
        rel="preload"
        href="/placeholder.svg"
        as="image"
        type="image/svg+xml"
      />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  )
}