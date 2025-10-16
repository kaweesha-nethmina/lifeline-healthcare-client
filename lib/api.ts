// API client configuration and helper functions
// Use direct backend URL
const API_BASE_URL = "http://localhost:5000"

// Updated interface to match actual backend response structure
export interface ApiResponse<T = any> extends Record<string, any> {
  data?: T
  message?: string
  error?: string
}

export class ApiClient {
  private static getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    
    // First try to get from localStorage
    const localStorageToken = localStorage.getItem("auth_token")
    if (localStorageToken) return localStorageToken
    
    // Fallback to cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'auth_token') {
        return value
      }
    }
    
    return null
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken()
    const headers: HeadersInit = {
      // Don't set Content-Type for FormData requests
      ...options.headers,
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    // Add mode and cache options to handle CORS
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Include cookies in requests
      mode: "cors", // Enable CORS
      cache: "no-cache", // Disable caching for auth requests
    }

    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      console.log("Request options:", fetchOptions);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        
        console.log("Response data:", data);

        if (!response.ok) {
          throw new Error(data.error || "An error occurred")
        }

        // For successful responses, return the data directly without wrapping
        // This matches the backend API structure
        return data as unknown as ApiResponse<T>
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text()
        console.log("Non-JSON response:", text);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text || "An error occurred"}`)
        }
        // Return text response as message
        return { message: text } as ApiResponse<T>
      }
    } catch (error) {
      console.error("[v0] API request failed:", error)
      // Provide more detailed error information
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.")
      }
      throw error
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  static async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    })
  }

  static async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: formData,
    })
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const api = ApiClient