"use client"

import { ReactNode, useEffect, useState } from "react"

interface FadeInOnceProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  className?: string
}

export function FadeInOnce({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  className = "",
}: FadeInOnceProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the element after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const getTransform = () => {
    switch (direction) {
      case "up":
        return `translateY(${distance}px)`
      case "down":
        return `translateY(-${distance}px)`
      case "left":
        return `translateX(${distance}px)`
      case "right":
        return `translateX(-${distance}px)`
      default:
        return "none"
    }
  }

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  )
}