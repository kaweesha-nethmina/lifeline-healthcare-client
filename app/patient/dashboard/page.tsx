"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Heart, Activity, Clock, MapPin, User, Plus } from "lucide-react"
import Link from "next/link"
import { PatientService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"

// Types for our data
interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location?: string
  created_at: string
  updated_at: string
  doctors?: {
    users: {
      name: string
    }
    user_id: number
    specialty: string
  }
  doctor_name?: string
  doctor_location?: string
}

interface MedicalRecordDoctor {
  user_id: number
  users?: {
    name: string
  }
}

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
  doctors?: MedicalRecordDoctor
}

interface VitalSign {
  id: number
  patient_id: number
  nurse_id: number
  vital_signs: string
  recorded_at: string
  created_at: string
  updated_at: string
  users?: {
    name: string
  }
}

// Type guard to check if response has data property
function isApiResponse<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch appointments
        const appointmentResponse = await PatientService.getAppointmentHistory()
        const appointmentsData = isApiResponse(appointmentResponse) ? appointmentResponse.data : appointmentResponse
        if (appointmentsData && Array.isArray(appointmentsData)) {
          // Filter for upcoming appointments (you might want to adjust this logic)
          const upcoming = appointmentsData
            .filter((apt: Appointment) => new Date(apt.appointment_date) > new Date())
            .slice(0, 2) // Limit to 2 for display
          setUpcomingAppointments(upcoming)
        }
        
        // Fetch medical records
        const recordResponse = await PatientService.getMedicalRecords()
        const recordsData = isApiResponse(recordResponse) ? recordResponse.data : recordResponse
        if (recordsData && Array.isArray(recordsData)) {
          // Get most recent records
          const recent = recordsData.slice(0, 2) // Limit to 2 for display
          setRecentRecords(recent)
        }
        
        // Fetch vital signs with error handling
        try {
          // Check if the method exists before calling it
          if (typeof PatientService.getVitalSigns === 'function') {
            const vitalResponse = await PatientService.getVitalSigns()
            const vitalsData = isApiResponse(vitalResponse) ? vitalResponse.data : vitalResponse
            if (vitalsData && Array.isArray(vitalsData)) {
              // Get most recent vital signs
              const recentVitals = vitalsData.slice(0, 3) // Limit to 3 for display
              setVitalSigns(recentVitals)
            }
          }
        } catch (vitalError) {
          console.warn("Could not fetch vital signs:", vitalError)
          // Continue without vital signs data
        }
      } catch (err) {
        console.error("Error fetching data:", err)
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

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Parse vital signs data
  const parseVitalSigns = (vitalSigns: string) => {
    // Simple parser for vital signs like "BP: 120/80, HR: 72, Temp: 98.6°F"
    const pairs = vitalSigns.split(',').map(pair => pair.trim())
    const parsed: Record<string, string> = {}
    
    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(part => part.trim())
      if (key && value) {
        parsed[key] = value
      }
    })
    
    return parsed
  }

  // Extract specific vital values
  const getVitalValue = (vitalSigns: string, key: string) => {
    const parsed = parseVitalSigns(vitalSigns)
    return parsed[key] || '--'
  }

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome Back!</h1>
            <p className="text-muted-foreground mt-1">Loading your health information...</p>
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
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome Back!</h1>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Welcome Back!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your health information</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Link href="/patient/doctors">
                <Button variant="link" className="p-0 h-auto text-primary">
                  Schedule Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Link href="/patient/medical-records">
                <Button variant="link" className="p-0 h-auto text-primary">
                  View Records
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Find Doctors</CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Link href="/patient/doctors">
                <Button variant="link" className="p-0 h-auto text-primary">
                  Browse
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency</CardTitle>
              <Activity className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto text-destructive">
                Call 911
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Health Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Health Statistics</CardTitle>
            <CardDescription>Your latest vital signs</CardDescription>
          </CardHeader>
          <CardContent>
            {vitalSigns.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {getVitalValue(vitalSigns[0].vital_signs, 'BP')}<span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Latest reading
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {getVitalValue(vitalSigns[0].vital_signs, 'HR')}<span className="text-sm font-normal text-muted-foreground ml-1">bpm</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Latest reading
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {getVitalValue(vitalSigns[0].vital_signs, 'Temp')}<span className="text-sm font-normal text-muted-foreground ml-1">°F</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Latest reading
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recorded By</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold">
                      {vitalSigns[0].users?.name || "Nurse"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    {formatDate(vitalSigns[0].recorded_at)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      --<span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Not recorded
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      --<span className="text-sm font-normal text-muted-foreground ml-1">bpm</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Not recorded
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      --<span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Not recorded
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      --<span className="text-sm font-normal text-muted-foreground ml-1">°F</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    Not recorded
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/patient/doctors">
                  <Plus className="h-4 w-4 mr-2" />
                  Book
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {appointment.doctors?.users?.name || appointment.doctor_name || "Doctor"}
                      </p>
                      <Badge variant={appointment.status === "booked" ? "default" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctors?.specialty || "Specialty"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(appointment.appointment_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(appointment.appointment_date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {appointment.location || appointment.doctor_location || "Location not specified"}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming appointments</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/patient/doctors">Book an appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Medical Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest health records</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/patient/medical-records">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{record.diagnosis || "Medical Record"}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.doctors?.users?.name || "Doctor"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{formatDate(record.record_date)}</span>
                      <Badge variant="outline">Record</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {recentRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No medical records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}