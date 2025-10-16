"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StaffService } from "@/lib/services/staff-service"
import { Calendar, Users, Clock, CheckCircle, Search, UserPlus, Stethoscope, CreditCard } from "lucide-react"
import Link from "next/link"

interface CheckInStats {
  todayCheckIns: number
  pendingCheckIns: number
  completedCheckIns: number
  waitingPatients: number
}

interface PendingCheckIn {
  id: string
  patientName: string
  appointmentTime: string
  doctorName: string
  status: string
  arrivalTime: string
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<CheckInStats>({
    todayCheckIns: 0,
    pendingCheckIns: 0,
    completedCheckIns: 0,
    waitingPatients: 0,
  })
  const [pendingCheckIns, setPendingCheckIns] = useState<PendingCheckIn[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch real data using the StaffService
      const pendingResponse = await StaffService.getPendingCheckIns()
      
      // For now, we'll still use mock data for stats since there are no specific endpoints
      // In a real implementation, these would call actual API endpoints
      setStats({
        todayCheckIns: 12,
        pendingCheckIns: pendingResponse?.length || 0,
        completedCheckIns: 8,
        waitingPatients: 3,
      })

      // Transform the pending check-ins data for display
      const transformedCheckIns = pendingResponse?.slice(0, 5).map(checkIn => ({
        id: checkIn.id.toString(),
        patientName: checkIn.patients.users.name,
        appointmentTime: new Date(checkIn.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctorName: checkIn.doctors.users.name,
        status: checkIn.status,
        arrivalTime: new Date(checkIn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })) || []

      setPendingCheckIns(transformedCheckIns)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      // Fallback to mock data if API call fails
      setStats({
        todayCheckIns: 12,
        pendingCheckIns: 5,
        completedCheckIns: 8,
        waitingPatients: 3,
      })

      setPendingCheckIns([
        {
          id: "1",
          patientName: "John Doe",
          appointmentTime: "09:30 AM",
          doctorName: "Smith",
          status: "Waiting",
          arrivalTime: "09:15 AM",
        },
        {
          id: "2",
          patientName: "Jane Smith",
          appointmentTime: "10:00 AM",
          doctorName: "Johnson",
          status: "Waiting",
          arrivalTime: "09:45 AM",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (checkInId: string) => {
    try {
      // For now, we'll just simulate the check-in
      // In a real implementation, this would call an API endpoint
      console.log(`Checked in patient with check-in ID: ${checkInId}`)
      fetchDashboardData()
    } catch (error) {
      console.error("Failed to complete check-in:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // For now, we'll just log the search
      // In a real implementation, this would call an API endpoint
      console.log(`Searching for: ${searchQuery}`)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCheckIns}</div>
              <p className="text-xs text-muted-foreground">Total patients today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCheckIns}</div>
              <p className="text-xs text-muted-foreground">Awaiting check-in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCheckIns}</div>
              <p className="text-xs text-muted-foreground">Checked in today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waitingPatients}</div>
              <p className="text-xs text-muted-foreground">In waiting room</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Patient Check-in
              </CardTitle>
              <CardDescription>Check in patients for their appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/staff/check-in">Check-in Patient</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Patients
              </CardTitle>
              <CardDescription>View and manage all patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/staff/patients">View Patients</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                All Doctors
              </CardTitle>
              <CardDescription>View all doctors in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/staff/doctors">View Doctors</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Check-ins
              </CardTitle>
              <CardDescription>View pending appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/staff/pending-check-ins">View Pending</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Checked-In
              </CardTitle>
              <CardDescription>View checked-in patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/staff/checked-in-patients">View Checked-In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Check-ins</CardTitle>
            <CardDescription>Patients waiting to be checked in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingCheckIns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending check-ins</p>
              ) : (
                pendingCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{checkIn.patientName}</p>
                        <Badge variant="outline">{checkIn.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Appointment: {checkIn.appointmentTime} with Dr. {checkIn.doctorName}
                      </p>
                      <p className="text-xs text-muted-foreground">Arrived: {checkIn.arrivalTime}</p>
                    </div>
                    <Button onClick={() => handleCheckIn(checkIn.id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
