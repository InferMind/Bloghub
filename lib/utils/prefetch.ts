"use client"

/**
 * Prefetch critical resources
 * @param urls Array of URLs to prefetch
 */
export function prefetchResources(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  // Wait for the page to load
  window.addEventListener('load', () => {
    // Wait a bit to not block the main thread during initial load
    setTimeout(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }, 2000);
  });
}

/**
 * Preconnect to critical domains
 * @param domains Array of domains to preconnect to
 * @param crossOrigin Whether to use crossorigin attribute
 */
export function preconnectToDomains(domains: string[], crossOrigin: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}