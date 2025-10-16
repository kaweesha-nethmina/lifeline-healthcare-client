"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Calendar, FileText, AlertCircle } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ManagerService } from "@/lib/services/manager-service"
import { AdminService, AdminUser } from "@/lib/services/admin-service"
import { AdminAppointmentService, AdminAppointment } from "@/lib/services/admin-appointment-service"
import { AdminReportService } from "@/lib/services/admin-report-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardStats {
  totalUsers: number
  activeAppointments: number
  medicalRecords: number
  systemAlerts: number
}

interface AppointmentData {
  name: string
  appointments: number
}

interface UserGrowthData {
  month: string
  users: number
}

interface RecentActivity {
  id: number
  action: string
  user: string
  role: string
  time: string
  profile_picture_url?: string | null
}

interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  profile_picture_url?: string | null
  created_at: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAppointments: 0,
    medicalRecords: 0,
    systemAlerts: 0
  })
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([])
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard data
        const managerDataResponse = await ManagerService.getData()
        const usersResponse = await AdminService.getAllUsers()
        const appointmentsResponse = await AdminAppointmentService.getAllAppointments()
        const medicalRecordsSummary = await AdminReportService.getMedicalRecordsSummary()
        
        // Extract user count correctly based on API response structure
        let userCount = 0;
        let usersData: AdminUser[] = [];
        if (Array.isArray(usersResponse)) {
          // Direct array response
          userCount = usersResponse.length;
          usersData = usersResponse;
        } else if (usersResponse && Array.isArray((usersResponse as any).data)) {
          // ApiResponse with data array
          userCount = (usersResponse as any).data.length;
          usersData = (usersResponse as any).data;
        }
        
        // Extract appointment count
        let appointmentCount = 0;
        let appointmentsData: AdminAppointment[] = [];
        if (Array.isArray(appointmentsResponse)) {
          // Direct array response
          appointmentCount = appointmentsResponse.length;
          appointmentsData = appointmentsResponse;
        } else if (appointmentsResponse && Array.isArray((appointmentsResponse as any).data)) {
          // ApiResponse with data array
          appointmentCount = (appointmentsResponse as any).data.length;
          appointmentsData = (appointmentsResponse as any).data;
        }
        
        // Extract medical records count
        let medicalRecordsCount = 0;
        if (medicalRecordsSummary && typeof medicalRecordsSummary === 'object' && 'total' in medicalRecordsSummary) {
          medicalRecordsCount = medicalRecordsSummary.total;
        } else if (medicalRecordsSummary && typeof medicalRecordsSummary === 'object' && (medicalRecordsSummary as any).data && 'total' in (medicalRecordsSummary as any).data) {
          medicalRecordsCount = (medicalRecordsSummary as any).data.total;
        }
        
        // Set stats
        setStats({
          totalUsers: userCount,
          activeAppointments: appointmentCount,
          medicalRecords: medicalRecordsCount,
          systemAlerts: 12
        })
        
        // Set recent users (last 5)
        setRecentUsers(usersData.slice(0, 5))
        
        setAppointmentData([
          { name: "Mon", appointments: 45 },
          { name: "Tue", appointments: 52 },
          { name: "Wed", appointments: 48 },
          { name: "Thu", appointments: 61 },
          { name: "Fri", appointments: 55 },
          { name: "Sat", appointments: 38 },
          { name: "Sun", appointments: 25 },
        ])
        
        setUserGrowthData([
          { month: "Jan", users: 850 },
          { month: "Feb", users: 920 },
          { month: "Mar", users: 1050 },
          { month: "Apr", users: 1150 },
          { month: "May", users: 1220 },
          { month: "Jun", users: userCount },
        ])
        
        // Create recent activities from recent appointments and users
        const activities: RecentActivity[] = []
        
        // Add recent user registrations
        usersData.slice(0, 3).forEach((user, index) => {
          activities.push({
            id: user.id,
            action: "New user registered",
            user: user.name,
            role: user.role,
            time: `${Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60))} hours ago`,
            profile_picture_url: user.profile_picture_url
          })
        })
        
        // Add recent appointments
        appointmentsData.slice(0, 2).forEach((appointment, index) => {
          activities.push({
            id: appointment.id,
            action: "Appointment scheduled",
            user: appointment.patients.users.name,
            role: "Patient",
            time: `${Math.floor((Date.now() - new Date(appointment.created_at).getTime()) / (1000 * 60 * 60))} hours ago`
            // Note: Basic AdminAppointment doesn't include profile_picture_url
            // profile_picture_url would only be available in AdminAppointmentDetail
          })
        })
        
        setRecentActivities(activities)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12.5%",
      icon: Users,
      description: "From last month",
    },
    {
      title: "Active Appointments",
      value: stats.activeAppointments.toString(),
      change: "+8.2%",
      icon: Calendar,
      description: "This week",
    },
    {
      title: "Medical Records",
      value: stats.medicalRecords.toString(),
      change: "+23.1%",
      icon: FileText,
      description: "Total records",
    },
    {
      title: "System Alerts",
      value: stats.systemAlerts.toString(),
      change: "-4.3%",
      icon: AlertCircle,
      description: "Pending issues",
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statItems.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-secondary" : "text-destructive"}`}
                    >
                      {stat.change}
                    </span>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Appointments Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Appointments</CardTitle>
              <CardDescription>Appointment trends for the current week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Total registered users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.profile_picture_url ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.profile_picture_url} alt={activity.user} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(activity.user)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {activity.role}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}