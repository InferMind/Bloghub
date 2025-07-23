"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    scrollTo("body", { duration: 1.5 })
  }

  return (
    <Button
      className={`fixed bottom-8 right-8 rounded-full p-3 bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-300 z-50 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      onClick={scrollToTop}
      size="icon"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}