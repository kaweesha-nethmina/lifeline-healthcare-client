"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Search, 
  User, 
  Stethoscope, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"

// Interface matching actual API response structure
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

// Type guard to check if object has required properties
function isNurseAppointment(obj: any): obj is ActualNurseAppointment {
  return obj && typeof obj === 'object' && 'id' in obj && 'appointment_date' in obj
}

export default function NurseAppointmentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState<ActualNurseAppointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<ActualNurseAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await NurseService.getAllAppointments()
        const appointmentsData = isApiResponse(response) ? response.data : response
        if (appointmentsData && Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData)
          setFilteredAppointments(appointmentsData)
          
          // Log unique status values for debugging
          const statuses = [...new Set(appointmentsData.map(a => a.status))];
          console.log("Available appointment statuses:", statuses);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  useEffect(() => {
    // Filter appointments based on search query
    const filtered = appointments.filter(
      (appointment) =>
        (appointment.patient?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(appointment.patient_id).includes(searchQuery)) ||
        (appointment.doctor?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(appointment.doctor_id).includes(searchQuery)) ||
        appointment.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredAppointments(filtered)
  }, [searchQuery, appointments])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return "default"
      case "confirmed":
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${status}`);
      const response = await NurseService.updateAppointmentStatus(appointmentId, status)
      console.log("Appointment update response:", response);
      
      // Check if response has data property
      const responseData = isApiResponse(response) ? response.data : response;
      
      if (responseData) {
        console.log("Successfully updated appointment:", responseData);
        // Update the appointment in the state
        setAppointments(prev => 
          prev.map(app => 
            app.id === appointmentId ? { ...app, status } : app
          )
        )
        setFilteredAppointments(prev => 
          prev.map(app => 
            app.id === appointmentId ? { ...app, status } : app
          )
        )
      } else {
        console.warn("Failed to update appointment - no data in response");
        setError("Failed to update appointment. No data in response.");
      }
    } catch (err: any) {
      console.error("Error updating appointment status:", err);
      // Try to get more detailed error information
      if (err.response) {
        console.error("Error response:", err.response);
        if (err.response.data) {
          console.error("Error response data:", err.response.data);
          setError(`Failed to update appointment status: ${err.response.data.message || err.response.data.detail || JSON.stringify(err.response.data)}`);
        } else {
          setError(`Failed to update appointment status: ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError("Failed to update appointment status: No response from server. Please check your connection.");
      } else {
        console.error("Error message:", err.message);
        setError(`Failed to update appointment status: ${err.message || 'Unknown error'}`);
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Appointment Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all appointments</p>
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
            <h1 className="text-3xl font-bold text-balance">Appointment Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all appointments</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Appointments</h3>
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
          <h1 className="text-3xl font-bold text-balance">Appointment Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all appointments</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, doctor or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={async () => {
              // Refresh appointments
              try {
                setLoading(true);
                const response = await NurseService.getAllAppointments();
                const appointmentsData = isApiResponse(response) ? response.data : response;
                if (appointmentsData && Array.isArray(appointmentsData)) {
                  setAppointments(appointmentsData);
                  setFilteredAppointments(appointmentsData);
                }
              } catch (err) {
                console.error("Error refreshing appointments:", err);
                setError("Failed to refresh appointments. Please try again later.");
              } finally {
                setLoading(false);
              }
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {appointment.patient?.user?.name || `Patient ID: ${appointment.patient_id}`}
                      </CardTitle>
                      <CardDescription>
                        {appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : `Doctor ID: ${appointment.doctor_id}`} • {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_date)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(appointment.status)} className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Patient ID: {appointment.patient_id}</span>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                      disabled={appointment.status === "confirmed" || appointment.status === "completed" || appointment.status === "cancelled"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                      disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                      disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search criteria" : "No appointments available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}