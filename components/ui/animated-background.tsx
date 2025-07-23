"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface Blob {
  id: number
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  opacity: number
}

export function AnimatedBackground() {
  const [blobs, setBlobs] = useState<Blob[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    // Initialize blobs - mix of large and small blobs
    const largeBlobs: Blob[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 300 + 200,
      color: [
        "bg-purple-300/10 dark:bg-purple-500/5", 
        "bg-blue-300/10 dark:bg-blue-500/5", 
        "bg-pink-300/10 dark:bg-pink-500/5", 
        "bg-indigo-300/10 dark:bg-indigo-500/5", 
        "bg-cyan-300/10 dark:bg-cyan-500/5"
      ][i % 5],
      speedX: (Math.random() - 0.5) * 0.2, // Slower movement
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.08 + 0.02, // Very subtle opacity
    }))
    
    const smallBlobs: Blob[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 5,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 100 + 50, // Smaller size
      color: [
        "bg-purple-300/10 dark:bg-purple-500/5", 
        "bg-blue-300/10 dark:bg-blue-500/5", 
        "bg-pink-300/10 dark:bg-pink-500/5", 
        "bg-indigo-300/10 dark:bg-indigo-500/5", 
        "bg-cyan-300/10 dark:bg-cyan-500/5"
      ][i % 5],
      speedX: (Math.random() - 0.5) * 0.3, // Slightly faster for small blobs
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.05 + 0.01, // Extremely subtle
    }))
    
    const initialBlobs = [...largeBlobs, ...smallBlobs]
    setBlobs(initialBlobs)

    // Animation loop
    const animate = () => {
      setBlobs((prevBlobs) =>
        prevBlobs.map((blob) => {
          let newX = blob.x + blob.speedX
          let newY = blob.y + blob.speedY
          let newSpeedX = blob.speedX
          let newSpeedY = blob.speedY

          // Bounce off edges
          if (newX <= -blob.size/2 || newX >= window.innerWidth - blob.size/2) {
            newSpeedX = -blob.speedX
            newX = Math.max(-blob.size/2, Math.min(window.innerWidth - blob.size/2, newX))
          }
          if (newY <= -blob.size/2 || newY >= window.innerHeight - blob.size/2) {
            newSpeedY = -blob.speedY
            newY = Math.max(-blob.size/2, Math.min(window.innerHeight - blob.size/2, newY))
          }

          return {
            ...blob,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY,
          }
        }),
      )
    }

    const interval = setInterval(animate, 50)
    
    // Handle window resize
    const handleResize = () => {
      setBlobs(prevBlobs => 
        prevBlobs.map(blob => ({
          ...blob,
          x: Math.min(blob.x, window.innerWidth - blob.size/2),
          y: Math.min(blob.y, window.innerHeight - blob.size/2),
        }))
      )
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className={`absolute rounded-full mix-blend-multiply filter blur-xl ${blob.color}`}
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            opacity: blob.opacity,
            transform: "translate3d(0, 0, 0)", // Hardware acceleration
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      ))}
    </div>
  )
}