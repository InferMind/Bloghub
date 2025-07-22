import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Simple markdown to HTML converter for preview
export function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-md">')
    // Lists
    .replace(/^\s*- (.*$)/gm, "<li>$1</li>")
    .replace(/^\s*\d+\. (.*$)/gm, "<li>$1</li>")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Blockquotes
    .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
    // Paragraphs
    .replace(/\n\s*\n/g, "</p><p>")

  // Wrap with paragraph tags if not already wrapped
  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>"
  }

  return html
}
