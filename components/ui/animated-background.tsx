"use client"

import { useEffect, useState } from "react"

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

  useEffect(() => {
    // Initialize blobs
    const initialBlobs: Blob[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 300 + 200,
      color: ["bg-purple-300/20", "bg-blue-300/20", "bg-pink-300/20", "bg-indigo-300/20", "bg-cyan-300/20"][i % 5],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    }))

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
          if (newX <= 0 || newX >= window.innerWidth - blob.size) {
            newSpeedX = -blob.speedX
            newX = Math.max(0, Math.min(window.innerWidth - blob.size, newX))
          }
          if (newY <= 0 || newY >= window.innerHeight - blob.size) {
            newSpeedY = -blob.speedY
            newY = Math.max(0, Math.min(window.innerHeight - blob.size, newY))
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
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className={`absolute rounded-full mix-blend-multiply filter blur-xl ${blob.color} transition-all duration-1000 ease-linear`}
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            opacity: blob.opacity,
            transform: "translate3d(0, 0, 0)", // Hardware acceleration
          }}
        />
      ))}
    </div>
  )
}
