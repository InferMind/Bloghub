"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubscribed(true)
    setIsLoading(false)

    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our weekly newsletter with the best stories.",
    })
  }

  if (isSubscribed) {
    return (
      <section className="py-16">
        <Card className="glass-card border-0 max-w-2xl mx-auto text-center">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to our community!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for subscribing. You'll receive our weekly newsletter with hand-picked stories, writing tips,
              and community highlights.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="py-16">
      <Card className="glass-card border-0 max-w-4xl mx-auto overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Content */}
            <div className="p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Stay Updated</h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                Get the best stories, writing tips, and community highlights delivered to your inbox every week. Join
                over 10,000 readers who never miss our updates.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 glass border-white/20 focus:border-blue-400"
                    required
                    suppressHydrationWarning
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </form>
            </div>

            {/* Right side - Visual */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-12 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Mail className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
