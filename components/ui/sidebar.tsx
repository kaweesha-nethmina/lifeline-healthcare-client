"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/auth"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Activity,
  CreditCard,
  Shield,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Package,
  User,
  Settings,
  HeartPulse,
  Clock,
  Stethoscope,
  CheckCircle,
} from "lucide-react"

interface SidebarProps {
  role: UserRole
  isMobile?: boolean
  onClose?: () => void
}

const getNavigationForRole = (role: UserRole) => {
  const navigationMap: Record<
    UserRole,
    Array<{
      name: string
      href: string
      icon: React.ComponentType<{ className?: string }>
    }>
  > = {
    patient: [
      { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
      { name: "Doctors", href: "/patient/doctors", icon: Users },
      { name: "Appointments", href: "/patient/appointments", icon: Calendar },
      { name: "Medical Records", href: "/patient/medical-records", icon: FileText },
      // Removed Billing section as requested
      // Removed Insurance and Insurance Providers sections as requested
      { name: "Profile", href: "/patient/profile", icon: User },
    ],
    doctor: [
      { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
      { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
      { name: "Patients", href: "/doctor/patients", icon: Users },
      { name: "Medical Records", href: "/doctor/medical-records", icon: FileText },
      { name: "Profile", href: "/doctor/profile", icon: User },
    ],
    nurse: [
      { name: "Dashboard", href: "/nurse/dashboard", icon: LayoutDashboard },
      { name: "Patients", href: "/nurse/patients", icon: Users },
      { name: "Appointments", href: "/nurse/appointments", icon: Calendar },
      { name: "Vitals", href: "/nurse/vitals", icon: Activity },
      { name: "Care Records", href: "/nurse/care-records", icon: ClipboardList },
      { name: "Profile", href: "/nurse/profile", icon: User },
    ],
    staff: [
      { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
      { name: "Check-in", href: "/staff/check-in", icon: ClipboardList },
      { name: "Pending Check-ins", href: "/staff/pending-check-ins", icon: Clock },
      { name: "Checked-In Patients", href: "/staff/checked-in-patients", icon: CheckCircle },
      { name: "Payment History", href: "/staff/payments", icon: CreditCard },
      { name: "Patients", href: "/staff/patients", icon: Users },
      { name: "Doctors", href: "/staff/doctors", icon: Stethoscope },
      { name: "Profile", href: "/staff/profile", icon: User },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Appointments", href: "/admin/appointments", icon: Calendar },
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
      { name: "Profile", href: "/admin/profile", icon: User },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    healthcare_manager: [
      { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
      { name: "Staff", href: "/manager/staff", icon: Users },
      { name: "Analytics", href: "/manager/analytics", icon: BarChart3 },
      { name: "Resources", href: "/manager/resources", icon: Package },
    ],
    system_admin: [
      { name: "Dashboard", href: "/system-admin/dashboard", icon: LayoutDashboard },
      { name: "System Config", href: "/system-admin/config", icon: Settings },
      { name: "Users", href: "/system-admin/users", icon: Users },
      { name: "Logs", href: "/system-admin/logs", icon: FileText },
    ],
    emergency_services: [
      { name: "Dashboard", href: "/emergency/dashboard", icon: LayoutDashboard },
      { name: "Active Cases", href: "/emergency/cases", icon: AlertTriangle },
      { name: "Resources", href: "/emergency/resources", icon: Package },
      { name: "Triage", href: "/emergency/triage", icon: Activity },
    ],
  }

  return navigationMap[role] || []
}

export function Sidebar({ role, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const navigation = getNavigationForRole(role)

  const sidebarContent = (
    <>
      {!isMobile && (
        <div className="flex h-16 items-center border-b px-6 bg-card">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="bg-primary p-2 rounded-lg">
              <svg className="h-6 w-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="font-bold text-lg">Lifeline</span>
          </Link>
        </div>
      )}
      <nav className={cn("flex-1 overflow-y-auto py-4", isMobile ? "mt-8" : "")}>
        <div className="space-y-2 px-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-blue-600 text-blue-50"
                    : "text-foreground hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )

  if (isMobile) {
    return <div className="flex flex-col h-full">{sidebarContent}</div>
  }

  return (
    <aside className="hidden lg:block w-64 border-r bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
      <div className="flex h-full flex-col">
        {sidebarContent}
      </div>
    </aside>
  )
}