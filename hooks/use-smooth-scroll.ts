"use client"

import { useEffect, useRef } from "react"
import Lenis from "@studio-freight/lenis"

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      })
    }

    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time)
      }
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  const scrollTo = (target: string | HTMLElement, options?: { offset?: number; duration?: number }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options)
    }
  }

  return { scrollTo }
}