"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Settings, Clock, User, Activity } from "lucide-react"
import Link from "next/link"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location: string | null
  created_at: string
  updated_at: string
  patients?: {
    user_id: number
  }
}

interface Patient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string
  phone_number: string
  address: string
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string
  preferred_location: string | null
  created_at: string
  updated_at: string
  users: {
    name: string
    email: string
  }
  profile_picture_url?: string | null
}

interface DoctorProfile {
  id: number
  user_id: number
  specialty: string
  qualification: string
  schedule: string
  location: string
  created_at: string
  updated_at: string
}

const stats = [
  {
    title: "Today's Appointments",
    value: "0",
    icon: Calendar,
    description: "Loading...",
  },
  {
    title: "Total Patients",
    value: "0",
    icon: Users,
    description: "Loading...",
  },
  {
    title: "Pending Records",
    value: "0",
    icon: FileText,
    description: "Loading...",
  },
  {
    title: "Avg. Wait Time",
    value: "--",
    icon: Clock,
    description: "Loading...",
  },
]

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DoctorProfile | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch doctor profile
        const profileResponse = await DoctorService.getProfile()
        console.log("Profile response:", profileResponse)
        
        // Handle both response formats
        let profileData: DoctorProfile | null = null
        if (profileResponse && profileResponse.data) {
          profileData = profileResponse.data
        } else if (profileResponse && typeof profileResponse === 'object' && 'id' in profileResponse) {
          // Direct response format
          profileData = profileResponse as DoctorProfile
        }
        
        if (profileData) {
          setProfile(profileData)
        }
        
        // Fetch appointments
        const appointmentResponse = await DoctorService.getAppointmentSchedule()
        console.log("Appointment response:", appointmentResponse)
        
        // Handle both response formats
        let appointmentsData: Appointment[] = []
        if (Array.isArray(appointmentResponse)) {
          appointmentsData = appointmentResponse
        } else if (appointmentResponse && Array.isArray(appointmentResponse.data)) {
          appointmentsData = appointmentResponse.data
        }
        
        if (Array.isArray(appointmentsData)) {
          // Filter for today's appointments using robust date comparison
          const today = new Date()
          // Format as YYYY-MM-DD in local timezone
          const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0]
          
          const todaysAppointments = appointmentsData
            .filter((apt: any) => {
              if (!apt.appointment_date) return false
              try {
                const aptDate = new Date(apt.appointment_date)
                // Format appointment date as YYYY-MM-DD in local timezone
                const aptDateStr = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate()).toISOString().split('T')[0]
                return aptDateStr === todayStr
              } catch (e) {
                return false
              }
            })
            .slice(0, 4) // Limit to 4 for display
          setTodayAppointments(todaysAppointments)
        }

        // Fetch patients to get their names
        const patientResponse = await DoctorService.getAllPatients()
        console.log("Patient response:", patientResponse)
        
        // Handle both response formats
        let patientsData: Patient[] = []
        if (Array.isArray(patientResponse)) {
          patientsData = patientResponse
        } else if (patientResponse && Array.isArray(patientResponse.data)) {
          patientsData = patientResponse.data
        }
        
        if (Array.isArray(patientsData)) {
          // For each patient, fetch detailed information to get profile picture
          const patientsWithDetails = await Promise.all(
            patientsData.map(async (patient) => {
              try {
                const detailResponse = await DoctorService.getPatientDetails(patient.id)
                console.log(`Patient ${patient.id} details:`, detailResponse)
                
                // Handle both response formats
                let patientDetails = null
                if (detailResponse && detailResponse.data) {
                  patientDetails = detailResponse.data
                } else if (detailResponse && typeof detailResponse === 'object' && 'id' in detailResponse) {
                  patientDetails = detailResponse as any
                }
                
                if (patientDetails) {
                  return {
                    ...patient,
                    profile_picture_url: patientDetails.profile_picture_url
                  }
                }
                return patient
              } catch (err) {
                console.error(`Error fetching details for patient ${patient.id}:`, err)
                return patient
              }
            })
          )
          
          setPatients(patientsWithDetails)
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Get patient name by ID
  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.users.name : "Unknown Patient"
  }

  // Get patient profile picture URL
  const getPatientProfilePicture = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    return patient?.profile_picture_url || null
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return "Invalid Time"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      case "booked":
        return "default"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome, Doctor</h1>
            <p className="text-muted-foreground mt-1">Loading your dashboard...</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              )
            })}
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
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome, Doctor</h1>
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

  // The todayAppointments state is already filtered for today's appointments in the useEffect
  // So we can use it directly
  const todaysAppointments = todayAppointments

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Welcome, {user?.name || "Doctor"}</h1>
          <p className="text-muted-foreground mt-1">Here's your schedule and patient overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysAppointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {todaysAppointments.filter(a => a.status === 'confirmed' || a.status === 'booked').length} confirmed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active patients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/doctor/appointments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getPatientProfilePicture(appointment.patient_id) || "/placeholder.svg"} 
                          alt={getPatientName(appointment.patient_id)} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(getPatientName(appointment.patient_id))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{getPatientName(appointment.patient_id)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.appointment_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTime(appointment.appointment_date)}</p>
                      <Badge variant={appointment.status === "confirmed" || appointment.status === "booked" ? "default" : "secondary"} className="mt-1">
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Recently treated patients</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/doctor/patients">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.length > 0 ? (
                patients.slice(0, 4).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={patient.profile_picture_url || "/placeholder.svg"} 
                          alt={patient.users.name} 
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {getInitials(patient.users.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.users.name}</p>
                        <p className="text-sm text-muted-foreground">Patient</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No patient data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
                <Link href="/doctor/patients/new-record" className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Create Medical Record</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
                <Link href="/doctor/prescriptions/new" className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Write Prescription</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
                <Link href="/doctor/appointments" className="flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Schedule</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}