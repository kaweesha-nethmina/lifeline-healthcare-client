"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Calendar, Save, Activity, Upload, X, Edit } from "lucide-react"
import { UserService, UserProfile } from "@/lib/services/user-service"

export default function StaffProfilePage() {
  const { user } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPicture, setIsEditingPicture] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: any = await UserService.getProfile()
      if (response) {
        // Handle both response formats
        const userData = response.data || response
        if (userData) {
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone_number || "",
            address: userData.address || "",
            dateOfBirth: userData.date_of_birth || "",
          });
          // Set profile picture if available
          if (userData.profile_picture_url) {
            setProfilePicture(userData.profile_picture_url);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      setError("Failed to load profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      // Convert profile data to the expected API format
      const profileData: any = {
        name: profile.name,
        phone_number: profile.phone || null,
        address: profile.address || null,
        date_of_birth: profile.dateOfBirth || null,
      };
      await UserService.updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePicture = async () => {
    setIsSaving(true)
    try {
      // Upload new profile picture if selected
      if (newProfilePicture) {
        try {
          // If user already has a profile picture, update it; otherwise upload new
          const pictureResponse = profilePicture 
            ? await UserService.updateProfilePicture(newProfilePicture)
            : await UserService.uploadProfilePicture(newProfilePicture)
          
          console.log("Picture upload response:", pictureResponse)
          
          if (pictureResponse) {
            // Handle both response formats
            const pictureData = (pictureResponse as any).data || pictureResponse
            if (pictureData) {
              const newPictureUrl = pictureData.fileUrl || pictureData.profile_picture_url || null
              setProfilePicture(newPictureUrl)
            }
          }
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError)
          setError("Failed to upload profile picture. Please try again.")
        }
      }
      
      setIsEditingPicture(false)
      setNewProfilePicture(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error("Error updating profile picture:", error)
      setError("Failed to update profile picture. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG, PNG, etc.)")
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit")
        return
      }
      
      setNewProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemovePicture = async () => {
    try {
      const response: any = await UserService.deleteProfilePicture()
      console.log("Delete picture response:", response)
      
      if (response) {
        // Handle both response formats
        const userData = response.data || response
        if (userData) {
          setProfilePicture(null)
        }
      }
      
      setNewProfilePicture(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error)
      setError("Failed to delete profile picture. Please try again.")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Profile</h1>
              <p className="text-muted-foreground mt-1">Loading your profile information...</p>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="staff">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="staff">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information</p>
          </div>
        </div>

        {/* Profile Picture */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your profile image</CardDescription>
            </div>
            {!isEditingPicture ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingPicture(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSavePicture} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditingPicture(false)
                  setNewProfilePicture(null)
                  setPreviewUrl(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }} size="sm" disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={previewUrl || profilePicture || "/placeholder.svg"} 
                    alt={user?.name} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile.name ? getInitials(profile.name) : "S"}
                  </AvatarFallback>
                </Avatar>
                {isEditingPicture && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 rounded-full border-2 border-background"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    {(previewUrl || profilePicture) && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 rounded-full border-2 border-background"
                        onClick={handleRemovePicture}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {isEditingPicture && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
            {!isEditingProfile ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => {
                  // Reset form data to original values
                  fetchProfile()
                  setIsEditingProfile(false)
                }} size="sm" disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditingProfile}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Other details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Employment information is managed by the system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
