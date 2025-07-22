"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Quote,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end)

    onChange(newText)

    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const formatActions = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertText("*", "*"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertText("# ", ""),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertText("## ", ""),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertText("### ", ""),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertText("- ", ""),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertText("1. ", ""),
    },
    {
      icon: Code,
      label: "Code Block",
      action: () => insertText("```\n", "\n```"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertText("> ", ""),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => {
        const url = prompt("Enter URL:", "https://")
        if (url) insertText("[", "](" + url + ")")
      },
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: () => {
        const url = prompt("Enter image URL:", "https://")
        if (url) insertText("![Image](", url + ")")
      },
    },
  ]

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
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

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        {formatActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={action.action}
            title={action.label}
          >
            <action.icon className="h-4 w-4" />
            <span className="sr-only">{action.label}</span>
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 bg-muted/50">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="p-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[400px] p-4 font-mono text-sm resize-y focus:outline-none"
            placeholder="Write your blog post using Markdown..."
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 prose max-w-none min-h-[400px] overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} className="prose dark:prose-invert" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
