"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

export function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
      {isError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-sm text-gray-500">Image not available</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          {...props}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          className={`${props.className || ""} transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  )
}