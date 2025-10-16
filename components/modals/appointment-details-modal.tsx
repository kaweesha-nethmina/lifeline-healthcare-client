"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Mail,
  Stethoscope,
  FileText
} from "lucide-react"
import { DoctorService, DoctorAppointment } from "@/lib/services/doctor-service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppointmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number | null
  patientId: number | null
}

export function AppointmentDetailsModal({ 
  isOpen, 
  onClose, 
  appointmentId,
  patientId
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<DoctorAppointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!isOpen || !patientId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await DoctorService.getPatientAppointments(patientId)
        console.log("Appointment details response:", response)
        
        // Handle both response formats
        let appointmentsData: DoctorAppointment[] = []
        if (response && response.data) {
          appointmentsData = response.data
        } else if (response && Array.isArray(response)) {
          // Direct response format
          appointmentsData = response
        }
        
        // Find the specific appointment
        const foundAppointment = appointmentsData.find(apt => apt.id === appointmentId)
        if (foundAppointment) {
          setAppointment(foundAppointment)
        } else {
          setError("Appointment not found")
        }
      } catch (err: any) {
        console.error("Error fetching appointment details:", err)
        setError("Failed to load appointment details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [isOpen, appointmentId, patientId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Appointment Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-destructive mb-2">Error loading appointment details</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : appointment ? (
          <div className="space-y-6">
            {/* Appointment Info */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Appointment Information</h3>
                <Badge 
                  variant={
                    appointment.status === "completed" ? "default" :
                    appointment.status === "booked" ? "secondary" :
                    appointment.status === "cancelled" ? "destructive" : "outline"
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.location || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Appointment #{appointment.id}</span>
                </div>
              </div>
            </div>
            
            {/* Patient Info */}
            {appointment.patient && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={appointment.patient.profile_picture_url || "/placeholder.svg"} 
                      alt={appointment.patient.name} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(appointment.patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-semibold">{appointment.patient.name}</p>
                      <p className="text-sm text-muted-foreground">Patient ID: {appointment.patient.id}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.patient.phone_number || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {appointment.patient.gender 
                            ? `${appointment.patient.gender}${appointment.patient.date_of_birth ? `, DOB: ${formatDate(appointment.patient.date_of_birth)}` : ''}` 
                            : "Gender not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{appointment.patient.address || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Doctor Info */}
            {appointment.doctor && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Doctor Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={appointment.doctor.profile_picture_url || "/placeholder.svg"} 
                      alt={appointment.doctor.name} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(appointment.doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-semibold">{appointment.doctor.name}</p>
                      <p className="text-sm text-muted-foreground">Doctor ID: {appointment.doctor.id}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.doctor.specialty || "Not specified"}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">
                          <span className="font-medium">Qualification:</span> {appointment.doctor.qualification || "Not specified"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">
                          <span className="font-medium">Schedule:</span> {appointment.doctor.schedule || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Dates */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Created At</p>
                  <p>{formatDate(appointment.created_at)} at {formatTime(appointment.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p>{formatDate(appointment.updated_at)} at {formatTime(appointment.updated_at)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="text-muted-foreground">No appointment details available</div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}