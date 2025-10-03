import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/debug-login", "/test-login"]

// Role-based route access control
const roleRoutes: Record<string, string[]> = {
  patient: ["/patient"],
  doctor: ["/doctor"],
  nurse: ["/nurse"],
  staff: ["/staff"],
  admin: ["/admin"],
  healthcare_manager: ["/manager"],
  system_admin: ["/system-admin"],
  emergency_services: ["/emergency"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies
  const token = request.cookies.get("auth_token")?.value

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirected", "true")
    return NextResponse.redirect(loginUrl)
  }

  // For role-based access control, you would check the token here
  // This is a simplified version - in a real app you would decode the JWT
  // and verify the user's role against the requested route

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}