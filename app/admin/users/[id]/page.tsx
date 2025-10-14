"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AdminService, AdminUser } from "@/lib/services/admin-service"
import { UserService } from "@/lib/services/user-service"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
  })
  
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSavingPicture, setIsSavingPicture] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      // Unwrap the params promise
      const resolvedParams = await params;
      
      if (!resolvedParams.id) {
        router.push("/admin/users")
        return
      }
      
      try {
        setLoading(true)
        // Fetch the specific user data from the API
        const response = await AdminService.getUserById(parseInt(resolvedParams.id))
        
        // Handle both direct object and ApiResponse formats
        let userData: AdminUser | null = null;
        if (response && typeof response === 'object' && 'id' in response) {
          // Direct object response
          userData = response as AdminUser;
        } else if (response && typeof response === 'object' && response.data) {
          // ApiResponse with data property
          userData = response.data as AdminUser;
        }
        
        if (userData) {
          setFormData({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone_number: userData.phone_number || "",
            date_of_birth: userData.date_of_birth || "",
            gender: userData.gender || "",
            address: userData.address || "",
            emergency_contact: userData.emergency_contact || "",
          })
          setProfilePicture(userData.profile_picture_url || null)
        }
      } catch (err) {
        console.error("Error fetching user:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch user data")
        toast.error("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUser()
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Unwrap the params promise
    const resolvedParams = await params;
    
    if (!resolvedParams.id) {
      toast.error("User ID not found")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await AdminService.updateUser(parseInt(resolvedParams.id), {
        name: formData.name,
        role: formData.role,
        phone_number: formData.phone_number || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
      })
      
      if (response) {
        setSuccess(true)
        toast.success("User updated successfully!")
        // Redirect to users page after 2 seconds
        setTimeout(() => {
          router.push("/admin/users")
        }, 2000)
      }
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : "Failed to update user. Please try again.")
      toast.error("Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, etc.)")
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit")
        return
      }
      
      setNewProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSaveProfilePicture = async () => {
    if (!newProfilePicture) {
      toast.error("No profile picture selected")
      return
    }
    
    setIsSavingPicture(true)
    try {
      // Unwrap the params promise
      const resolvedParams = await params;
      
      if (!resolvedParams.id) {
        throw new Error("User ID not found")
      }
      
      // Upload profile picture using admin service
      const response: any = await AdminService.uploadProfilePicture(parseInt(resolvedParams.id), newProfilePicture)
      
      // Handle both direct response and ApiResponse formats
      const pictureData = response.data || response
      
      if (pictureData && pictureData.profile_picture_url) {
        setProfilePicture(pictureData.profile_picture_url)
        setPreviewUrl(null)
        setNewProfilePicture(null)
        toast.success("Profile picture updated successfully!")
      } else {
        throw new Error("Failed to update profile picture")
      }
    } catch (error) {
      console.error("Error saving profile picture:", error)
      toast.error("Failed to save profile picture")
    } finally {
      setIsSavingPicture(false)
    }
  }

  const handleRemovePicture = async () => {
    try {
      // Unwrap the params promise
      const resolvedParams = await params;
      
      if (!resolvedParams.id) {
        throw new Error("User ID not found")
      }
      
      // Delete profile picture using admin service
      const response: any = await AdminService.deleteProfilePicture(parseInt(resolvedParams.id))
      
      // Handle both direct response and ApiResponse formats
      const userData = response.data || response
      
      if (userData) {
        setProfilePicture(null)
        setPreviewUrl(null)
        setNewProfilePicture(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.success("Profile picture removed successfully!")
      } else {
        throw new Error("Failed to remove profile picture")
      }
    } catch (error) {
      console.error("Error removing profile picture:", error)
      toast.error("Failed to remove profile picture")
    }
  }

  const handleCancel = async () => {
    router.push("/admin/users")
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Edit User</h1>
          <p className="text-muted-foreground mt-1">Update user information</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">User updated successfully!</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update the user's personal and account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={previewUrl || profilePicture || "/placeholder.svg"} 
                    alt={formData.name} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {formData.name ? getInitials(formData.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
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
                {newProfilePicture && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSaveProfilePicture}
                    disabled={isSavingPicture}
                  >
                    {isSavingPicture ? "Saving..." : "Save Photo"}
                  </Button>
                )}
                {(previewUrl || profilePicture) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemovePicture}
                  >
                    Remove Photo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="staff">Hospital Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="healthcare_manager">Healthcare Manager</SelectItem>
                      <SelectItem value="system_admin">System Administrator</SelectItem>
                      <SelectItem value="emergency_services">Emergency Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update User"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}