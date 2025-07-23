"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Globe, Twitter, Github, Linkedin, Camera, Save, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { AnimatedBackground } from "@/components/ui/animated-background"
import type { User as UserType } from "@/lib/types/database"

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    website_url: "",
    twitter_handle: "",
    github_handle: "",
    linkedin_handle: "",
    is_writer: false,
  })
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        router.push("/auth/login")
        return
      }

      if (!authUser) {
        console.log("No authenticated user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      if (!profile) {
        console.error("No profile found for user ID:", authUser.id)
        toast({
          title: "Profile not found",
          description: "Your profile information could not be found",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setUser(profile)
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        website_url: profile.website_url || "",
        twitter_handle: profile.twitter_handle || "",
        github_handle: profile.github_handle || "",
        linkedin_handle: profile.linkedin_handle || "",
        is_writer: profile.is_writer || false,
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_writer: checked,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      })

      await loadUserProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated.",
      })

      await loadUserProfile()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AnimatedBackground />

      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Settings className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="glass-card">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your profile information and social links</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-4 ring-white/20">
                          <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.full_name} />
                          <AvatarFallback className="text-2xl">{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.full_name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">@{user?.username}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {user?.is_writer && <Badge className="bg-purple-500 hover:bg-purple-600">Writer</Badge>}
                          <Badge variant="secondary">{user?.posts_count} posts</Badge>
                          <Badge variant="secondary">{user?.followers_count} followers</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="pl-10 glass border-white/20 focus:border-blue-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="pl-8 glass border-white/20 focus:border-blue-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        className="glass border-white/20 focus:border-blue-400 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Social Links</h4>

                      <div className="space-y-2">
                        <Label htmlFor="website_url">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={handleInputChange}
                            placeholder="https://yourwebsite.com"
                            className="pl-10 glass border-white/20 focus:border-blue-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter_handle">Twitter</Label>
                          <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="twitter_handle"
                              name="twitter_handle"
                              value={formData.twitter_handle}
                              onChange={handleInputChange}
                              placeholder="username"
                              className="pl-10 glass border-white/20 focus:border-blue-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="github_handle">GitHub</Label>
                          <div className="relative">
                            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="github_handle"
                              name="github_handle"
                              value={formData.github_handle}
                              onChange={handleInputChange}
                              placeholder="username"
                              className="pl-10 glass border-white/20 focus:border-blue-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin_handle">LinkedIn</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="linkedin_handle"
                              name="linkedin_handle"
                              value={formData.linkedin_handle}
                              onChange={handleInputChange}
                              placeholder="username"
                              className="pl-10 glass border-white/20 focus:border-blue-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Writer Status</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Enable this to create and publish blog posts
                        </p>
                      </div>
                      <Switch checked={formData.is_writer} onCheckedChange={handleSwitchChange} />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account security and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.id || ""}
                          disabled
                          className="pl-10 glass border-white/20 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-red-600 dark:text-red-400">
                        Danger Zone
                      </h4>
                      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h5>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your experience on the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 glass rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Receive email notifications for comments and likes
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 glass rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Newsletter</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Subscribe to our weekly newsletter</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 glass rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Public Profile</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Make your profile visible to other users
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

    </div>
  )
}
