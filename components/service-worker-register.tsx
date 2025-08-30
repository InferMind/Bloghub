"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production to avoid dev caching/hydration issues
    if (process.env.NODE_ENV !== 'production') return
    if ('serviceWorker' in navigator) {
      const onLoad = () => {
        const register = async () => {
          try {
            const reg = await navigator.serviceWorker.register('/sw.js')
            if (reg?.waiting) {
              // force activate updated SW
              reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New content is available; will use on next load.')
                  }
                })
              }
            })
          } catch (err) {
            console.log('ServiceWorker registration failed: ', err)
          }
        }
        register()
      }
      // Defer registration until page fully loads
      if (document.readyState === 'complete') onLoad()
      else window.addEventListener('load', onLoad, { once: true })
    }
  }, [])
  
  return null
}