"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, FileText, Settings, Save, Activity, Upload, X, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { DoctorService, DoctorProfile } from "@/lib/services/doctor-service"
import { UserService, UserProfile } from "@/lib/services/user-service"
import { ApiResponse } from "@/lib/api"

export default function DoctorProfilePage() {
  const { user, refreshAuthState } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPicture, setIsEditingPicture] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    specialty: "",
    qualification: "",
    licenseNumber: "",
    experience: "",
    schedule: "",
    location: "",
    bio: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile
        const userProfileResponse: any = await UserService.getProfile()
        console.log("User profile response:", userProfileResponse)
        
        if (userProfileResponse) {
          // Handle both response formats
          const userData = userProfileResponse.data || userProfileResponse
          if (userData) {
            setUserProfile(userData)
            setProfilePicture(userData.profile_picture_url)
            
            // Update form data with user profile info
            setFormData(prev => ({
              ...prev,
              name: userData.name || prev.name,
              email: userData.email || prev.email,
            }))
          }
        }
        
        // Fetch doctor-specific profile
        const doctorProfileResponse: any = await DoctorService.getProfile()
        console.log("Doctor profile response:", doctorProfileResponse)
        
        if (doctorProfileResponse) {
          // Handle both response formats
          const doctorData = doctorProfileResponse.data || doctorProfileResponse
          
          if (doctorData) {
            setDoctorProfile(doctorData)
            // Populate form data with fetched profile
            setFormData(prev => ({
              ...prev,
              specialty: doctorData.specialty || prev.specialty,
              qualification: doctorData.qualification || prev.qualification,
              schedule: doctorData.schedule || prev.schedule,
              location: doctorData.location || prev.location,
            }))
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSaveProfile = async () => {
    if (!doctorProfile) return
    
    setIsSaving(true)
    try {
      // Update user profile (name)
      const updateUserProfileData: any = {}
      if (formData.name !== (userProfile?.name || user?.name || "")) {
        updateUserProfileData.name = formData.name
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updateUserProfileData).length > 0) {
        const userProfileResponse: any = await UserService.updateProfile(updateUserProfileData)
        console.log("User profile update response:", userProfileResponse)
        
        if (userProfileResponse) {
          // Handle both response formats
          const userData = userProfileResponse.data || userProfileResponse
          if (userData) {
            setUserProfile(userData)
            setProfilePicture(userData.profile_picture_url)
            
            // Refresh auth context to get updated profile picture
            await refreshAuthState()
          }
        }
      }
      
      // Update doctor-specific profile
      const updateDoctorData: any = {}
      if (formData.specialty !== (doctorProfile.specialty || "")) {
        updateDoctorData.specialty = formData.specialty
      }
      if (formData.qualification !== (doctorProfile.qualification || "")) {
        updateDoctorData.qualification = formData.qualification
      }
      if (formData.schedule !== (doctorProfile.schedule || "")) {
        updateDoctorData.schedule = formData.schedule
      }
      if (formData.location !== (doctorProfile.location || "")) {
        updateDoctorData.location = formData.location
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updateDoctorData).length > 0) {
        const response: any = await DoctorService.updateProfile(updateDoctorData)
        console.log("Doctor profile update response:", response)
        
        if (response) {
          // Handle both response formats
          const doctorData = response.data || response
          if (doctorData) {
            setDoctorProfile(doctorData)
          }
        }
      }
      
      setIsEditingProfile(false)
    } catch (err) {
      console.error("Error updating profile:", err)
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
            const pictureData = pictureResponse.data || pictureResponse
            if (pictureData) {
              const newPictureUrl = pictureData.fileUrl || pictureData.profile_picture_url || null
              setProfilePicture(newPictureUrl)
              setUserProfile(prev => prev ? {
                ...prev,
                profile_picture_url: newPictureUrl
              } : null)
              
              // Refresh auth context to get updated profile picture
              await refreshAuthState()
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
    } catch (err) {
      console.error("Error updating profile picture:", err)
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
          setUserProfile(prev => prev ? {
            ...prev,
            profile_picture_url: null
          } : null)
          
          // Refresh auth context to remove profile picture
          await refreshAuthState()
        }
      }
      
      setNewProfilePicture(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Error deleting profile picture:", err)
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
      <DashboardLayout role="doctor">
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
      <DashboardLayout role="doctor">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your professional information</p>
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
    <DashboardLayout role="doctor">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your professional information</p>
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
                    {user?.name ? getInitials(user.name) : "D"}
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
                <h3 className="text-xl font-semibold">{userProfile?.name || user?.name}</h3>
                <p className="text-sm text-muted-foreground">{userProfile?.email || user?.email}</p>
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
              <CardDescription>Your basic profile details</CardDescription>
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
                  if (doctorProfile) {
                    setFormData({
                      name: userProfile?.name || user?.name || "",
                      email: userProfile?.email || user?.email || "",
                      phone: "",
                      specialty: doctorProfile.specialty || "",
                      qualification: doctorProfile.qualification || "",
                      licenseNumber: "",
                      experience: "",
                      schedule: doctorProfile.schedule || "",
                      location: doctorProfile.location || "",
                      bio: "",
                    })
                  }
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditingProfile}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Your credentials and qualifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditingProfile}
                rows={4}
                placeholder="Brief professional biography..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}