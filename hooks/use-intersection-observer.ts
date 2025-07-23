"use client"

import { useEffect, useState, useRef, RefObject } from "react"

interface IntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  triggerOnce?: boolean
}

export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const { root = null, rootMargin = "0px", threshold = 0, triggerOnce = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        
        if (triggerOnce && isElementIntersecting && hasTriggered.current) {
          return
        }
        
        setIsIntersecting(isElementIntersecting)
        
        if (triggerOnce && isElementIntersecting) {
          hasTriggered.current = true
        }
      },
      { root, rootMargin, threshold }
    )

    const element = ref.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [root, rootMargin, threshold, triggerOnce])

  return [ref, isIntersecting]
}