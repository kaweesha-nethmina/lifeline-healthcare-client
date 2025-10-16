"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, FileText, Settings, Clock, User, Activity, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { AppointmentDetailsModal } from "@/components/modals/appointment-details-modal"
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
  patient?: {
    id: number
    user_id: number
    name: string
    email: string
    date_of_birth: string | null
    gender: string
    phone_number: string
    address: string
    insurance_details: string | null
    medical_history: string | null
    emergency_contact: string
    profile_picture_url: string | null
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
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("today")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<{id: number, patientId: number} | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchAppointmentsAndPatients = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch appointments with patient details
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
          setAppointments(appointmentsData)
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
          setPatients(patientsData)
        }
      } catch (err: any) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentsAndPatients()
  }, [user])

  // Get patient name by ID
  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.users.name : "Unknown Patient"
  }

  // Get patient profile picture URL
  const getPatientProfilePicture = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? null : null // Patients data doesn't include profile pictures
  }

  // Get patient profile picture from appointment data
  const getPatientProfilePictureFromAppointment = (appointment: Appointment) => {
    return appointment.patient?.profile_picture_url || null
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

  const handleViewDetails = (appointmentId: number, patientId: number) => {
    setSelectedAppointment({ id: appointmentId, patientId })
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Appointments</h1>
            <p className="text-muted-foreground mt-1">Loading your appointments...</p>
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
          <div>
            <h1 className="text-3xl font-bold text-balance">Appointments</h1>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Appointments</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Categorize appointments - using a more robust date comparison
  // Get today's date in local timezone, not UTC
  const today = new Date()
  // Format as YYYY-MM-DD in local timezone
  const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0]
  
  const todayAppointments = appointments.filter(apt => {
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
  
  const upcomingAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false
    try {
      const aptDate = new Date(apt.appointment_date)
      // Format appointment date as YYYY-MM-DD in local timezone
      const aptDateStr = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate()).toISOString().split('T')[0]
      return aptDateStr > todayStr
    } catch (e) {
      return false
    }
  })

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your patient appointments and schedule</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-6">
            {todayAppointments.length > 0 ? (
              <div className="grid gap-4">
                {todayAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={getPatientProfilePictureFromAppointment(appointment) || "/placeholder.svg"} 
                              alt={getPatientName(appointment.patient_id)} 
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {getInitials(getPatientName(appointment.patient_id))}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{getPatientName(appointment.patient_id)}</h3>
                              <p className="text-sm text-muted-foreground">Patient ID: {appointment.patient_id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Patient Record</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatTime(appointment.appointment_date)}</span>
                              <span className="text-muted-foreground">•</span>
                              <Badge variant="outline">Appointment</Badge>
                            </div>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Location:</span> {appointment.location || "Not specified"}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(appointment.id, appointment.patient_id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments Today</h3>
                  <p className="text-muted-foreground text-center">You have no scheduled appointments for today</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={getPatientProfilePictureFromAppointment(appointment) || "/placeholder.svg"} 
                              alt={getPatientName(appointment.patient_id)} 
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {getInitials(getPatientName(appointment.patient_id))}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{getPatientName(appointment.patient_id)}</h3>
                              <p className="text-sm text-muted-foreground">Patient ID: {appointment.patient_id}</p>
                            </div>
                            <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                              <span className="text-muted-foreground">at</span>
                              <span className="font-medium">{formatTime(appointment.appointment_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Appointment</Badge>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                Location: {appointment.location || "Not specified"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(appointment.id, appointment.patient_id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground text-center">You have no scheduled appointments coming up</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <AppointmentDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointmentId={selectedAppointment?.id || null}
        patientId={selectedAppointment?.patientId || null}
      />
    </DashboardLayout>
  )
}