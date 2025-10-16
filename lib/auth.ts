// Authentication utilities and types
export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "staff"
  | "admin"
  | "healthcare_manager"
  | "system_admin"
  | "emergency_services"

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  profile_picture_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const AUTH_STORAGE_KEY = "auth_token"
export const USER_STORAGE_KEY = "user_data"

export function saveAuthData(token: string, user: User): void {
  console.log("[v0] Saving auth data to localStorage");
  console.log("[v0] Token:", token);
  console.log("[v0] User:", user);
  
  if (typeof window === "undefined") {
    console.log("[v0] Window is undefined, skipping localStorage save");
    return
  }
  
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    
    // Also set as cookie for middleware access with proper attributes
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure=false`
    
    console.log("[v0] Auth data saved successfully");
  } catch (error) {
    console.error("[v0] Error saving auth data:", error);
  }
}

export function getAuthData(): AuthState {
  console.log("[v0] Getting auth data from localStorage");
  
  if (typeof window === "undefined") {
    console.log("[v0] Window is undefined, returning default auth state");
    return { user: null, token: null, isAuthenticated: false }
  }

  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEY)
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    
    console.log("[v0] Retrieved token:", token);
    console.log("[v0] Retrieved user string:", userStr);

    if (!token || !userStr) {
      console.log("[v0] No auth data found in localStorage");
      return { user: null, token: null, isAuthenticated: false }
    }

    const user = JSON.parse(userStr) as User
    console.log("[v0] Parsed user:", user);
    return { user, token, isAuthenticated: true }
  } catch (error) {
    console.error("[v0] Error getting auth data:", error);
    return { user: null, token: null, isAuthenticated: false }
  }
}

export function clearAuthData(): void {
  console.log("[v0] Clearing auth data from localStorage");
  
  if (typeof window === "undefined") {
    console.log("[v0] Window is undefined, skipping localStorage clear");
    return
  }
  
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    
    // Also clear the cookie with proper path and domain
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    console.log("[v0] Auth data cleared successfully");
  } catch (error) {
    console.error("[v0] Error clearing auth data:", error);
  }
}

export function getRoleDashboardPath(role: UserRole): string {
  const dashboardPaths: Record<UserRole, string> = {
    patient: "/patient/dashboard",
    doctor: "/doctor/dashboard",
    nurse: "/nurse/dashboard",
    staff: "/staff/dashboard",
    admin: "/admin/dashboard",
    healthcare_manager: "/manager/dashboard",
    system_admin: "/system-admin/dashboard",
    emergency_services: "/emergency/dashboard",
  }

  const path = dashboardPaths[role] || "/"
  console.log("[v0] Dashboard path for role", role, "is", path);
  return path
}