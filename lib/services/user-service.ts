// User service for handling user profile and profile picture API calls
import { api, ApiResponse } from "@/lib/api"

// User profile interface
export interface UserProfile {
  id: number
  email: string
  name: string
  role: string
  profile_picture_url: string | null
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

// Profile picture response interface
export interface ProfilePictureResponse {
  profile_picture_url: string | null
}

// Update profile request interface
export interface UpdateProfileRequest {
  name?: string
  phone_number?: string | null
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  emergency_contact?: string | null
}

export class UserService {
  // Get user profile
  static async getProfile(): Promise<UserProfile | ApiResponse<UserProfile>> {
    const response = await api.get<UserProfile>("/users/profile")
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<UserProfile | ApiResponse<UserProfile>> {
    const response = await api.put<UserProfile>("/users/profile", data)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Upload profile picture
  static async uploadProfilePicture(file: File): Promise<UserProfile & { fileUrl: string } | ApiResponse<UserProfile & { fileUrl: string }>> {
    const formData = new FormData()
    formData.append("profilePicture", file)
    
    const response = await api.postFormData<UserProfile & { fileUrl: string }>("/users/profile/picture", formData)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Update profile picture
  static async updateProfilePicture(file: File): Promise<UserProfile & { fileUrl: string } | ApiResponse<UserProfile & { fileUrl: string }>> {
    const formData = new FormData()
    formData.append("profilePicture", file)
    
    const response = await api.putFormData<UserProfile & { fileUrl: string }>("/users/profile/picture", formData)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Get own profile picture
  static async getProfilePicture(): Promise<ProfilePictureResponse | ApiResponse<ProfilePictureResponse>> {
    const response = await api.get<ProfilePictureResponse>("/users/profile/picture")
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Delete own profile picture
  static async deleteProfilePicture(): Promise<UserProfile | ApiResponse<UserProfile>> {
    const response = await api.delete<UserProfile>("/users/profile/picture")
    // Handle both direct response and ApiResponse formats
    return response
  }
}