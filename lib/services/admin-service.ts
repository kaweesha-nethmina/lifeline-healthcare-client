// Admin service for handling admin-related API calls
import { api, ApiResponse } from "@/lib/api"
import { User } from "@/lib/auth"

// Extended user interface with additional fields
export interface AdminUser extends User {
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

// User creation interface
export interface CreateUserRequest {
  email: string
  name: string
  role: string
  password: string
}

// User update interface
export interface UpdateUserRequest {
  name?: string
  role?: string
  profile_picture_url?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  emergency_contact?: string | null
}

// Profile picture response interface
export interface ProfilePictureResponse {
  profile_picture_url: string | null
}

export class AdminService {
  // Create user
  static async createUser(data: CreateUserRequest): Promise<User | ApiResponse<User>> {
    const response = await api.post<User>("/admin/create-user", data)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Configure system
  static async configureSystem(data: any): Promise<any | ApiResponse<any>> {
    const response = await api.post<any>("/admin/configure-system", data)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Get all users
  static async getAllUsers(): Promise<AdminUser[] | ApiResponse<AdminUser[]>> {
    const response = await api.get<AdminUser[]>("/admin/users")
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Get user by ID
  static async getUserById(id: number): Promise<AdminUser | ApiResponse<AdminUser>> {
    // Since there's no specific endpoint, we fetch all users and filter
    // In a real implementation, there would be a dedicated endpoint
    const response = await this.getAllUsers()
    
    // Handle both direct array response and ApiResponse with data array
    let users: AdminUser[] = []
    if (Array.isArray(response)) {
      // Direct array response
      users = response
    } else if (response && Array.isArray((response as any).data)) {
      // ApiResponse with data array
      users = (response as any).data
    }
    
    const user = users.find(u => u.id === id)
    if (user) {
      return user
    }
    throw new Error("User not found")
  }

  // Update user
  static async updateUser(id: number, data: UpdateUserRequest): Promise<User | ApiResponse<User>> {
    const response = await api.put<User>(`/admin/users/${id}`, data)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Delete user
  static async deleteUser(id: number): Promise<User | ApiResponse<User>> {
    const response = await api.delete<User>(`/admin/users/${id}`)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Upload profile picture for a user
  static async uploadProfilePicture(userId: number, file: File): Promise<ProfilePictureResponse | ApiResponse<ProfilePictureResponse>> {
    const formData = new FormData()
    formData.append("profilePicture", file)
    
    const response = await api.putFormData<ProfilePictureResponse>(`/users/profile/picture/${userId}`, formData)
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Delete profile picture for a user
  static async deleteProfilePicture(userId: number): Promise<User | ApiResponse<User>> {
    const response = await api.delete<User>(`/users/profile/picture/${userId}`)
    // Handle both direct response and ApiResponse formats
    return response
  }
}