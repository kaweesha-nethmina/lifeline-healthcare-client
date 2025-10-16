"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Activity, 
  HeartPulse,
  FileText,
  Stethoscope
} from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"

// Interfaces matching actual API response structure
interface ActualNursePatient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  address: string | null
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    email: string
    name: string
    role: string
    profile_picture_url: string | null
    created_at: string
    updated_at: string
  }
  users?: {
    name: string
    email: string
  }
}

interface ActualNurseAppointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location: string | null
  created_at: string
  updated_at: string
  patient?: {
    user: {
      name: string
    }
  }
  patients?: {
    user_id: number
  }
  doctor?: {
    user: {
      name: string
    }
  }
  doctors?: {
    user_id: number
  }
}

// Type guard to check if response has data property
function isApiResponse<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

export default function NurseDashboardPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<ActualNursePatient[]>([])
  const [appointments, setAppointments] = useState<ActualNurseAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch patients
        const patientsResponse = await NurseService.getAllPatients()
        const patientsData = isApiResponse(patientsResponse) ? patientsResponse.data : patientsResponse
        if (patientsData && Array.isArray(patientsData)) {
          setPatients(patientsData.slice(0, 5)) // Show only first 5 patients
        }
        
        // Fetch appointments
        const appointmentsResponse = await NurseService.getAllAppointments()
        const appointmentsData = isApiResponse(appointmentsResponse) ? appointmentsResponse.data : appointmentsResponse
        if (appointmentsData && Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData.slice(0, 5)) // Show only first 5 appointments
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "rescheduled":
        return "outline"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Nurse Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your patients and appointments</p>
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
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Nurse Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your patients and appointments</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="nurse">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Nurse Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your patients and appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Care Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Patients and Appointments Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Patients you're currently caring for</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length > 0 ? (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {patient.user?.name || patient.users?.name || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-muted-foreground">Patient ID: {patient.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No patients found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Appointments scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-4 w-4 text-primary" />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Patient ID: {appointment.patient_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Doctor ID: {appointment.doctor_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(appointment.appointment_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}