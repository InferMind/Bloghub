"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OptimizedAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
}

export function OptimizedAvatar({ src, alt, fallback = "U", className = "w-24 h-24" }: OptimizedAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative">
      {!isLoaded && !hasError && (
        <div className={`${className} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse absolute inset-0`} />
      )}
      <Avatar className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ring-4 ring-white/20`}>
        <AvatarImage 
          src={src || "/placeholder.svg"} 
          alt={alt || fallback} 
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
        />
        <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
      </Avatar>
    </div>
  )
}