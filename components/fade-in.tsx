"use client"

import { ReactNode } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  className?: string
  threshold?: number
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  className = "",
  threshold = 0.1,
}: FadeInProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    threshold,
    triggerOnce: true,
  })

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
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: isIntersecting ? "none" : getTransform(),
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